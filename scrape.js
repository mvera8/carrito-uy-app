import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const products = JSON.parse(fs.readFileSync("./data/products.json", "utf8"));

/** HEADERS "navegador" para axios */
const defaultHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9",
  Referer: "https://www.google.com/",
  Origin: "https://www.tiendainglesa.com.uy",
  "sec-ch-ua":
    '"Not_A Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
};

async function scrapeMetaPrice(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    let metaPrice;
    const host = new URL(url).hostname;

    if (host.includes("elclon")) {
      // El Clon usa itemprop="price"
      metaPrice = $('meta[itemprop="price"]').attr("content");
    } else {
      // La mayoría usa property="product:price:amount"
      metaPrice = $('meta[property="product:price:amount"]').attr("content");
    }

    if (metaPrice) return Number(metaPrice);

    // 3️⃣ Si no encontró nada
    return null;
  } catch (err) {
    console.error(`❌ Error en ${url}: ${err.message}`);
    return null;
  }
}

/** Fallback: usar Puppeteer para renderizar la página y sacar el precio */
async function scrapeWithPuppeteer(pageUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Headers y viewport para parecer un navegador real
    await page.setUserAgent(defaultHeaders["User-Agent"]);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "es-ES,es;q=0.9",
    });
    await page.setViewport({ width: 1280, height: 800 });

    // Ir a la página y esperar que cargue
    await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // 1) Intentar leer window.dataLayer (si existe)
    const priceFromDL = await page.evaluate(() => {
      try {
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
          // Buscar objetos que contengan ecommerce.detail.products
          for (let i = window.dataLayer.length - 1; i >= 0; i--) {
            const item = window.dataLayer[i];
            if (item && item.ecommerce && item.ecommerce.detail && Array.isArray(item.ecommerce.detail.products)) {
              const p = item.ecommerce.detail.products[0];
              if (p && (p.price || p.price === 0)) return p.price;
            }
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    });

    if (priceFromDL) {
      await browser.close();
      return Number(priceFromDL);
    }

    // 2) Intentar meta tag product:price:amount
    const metaPrice = await page.$eval(
      'meta[property="product:price:amount"]',
      (el) => el.getAttribute("content")
    ).catch(() => null);

    if (metaPrice) {
      await browser.close();
      return Number(metaPrice);
    }

    // 3) Intentar JSON-LD
    const jsonLd = await page.$$eval('script[type="application/ld+json"]', (els) =>
      els.map((el) => el.innerText)
    );

    if (jsonLd && jsonLd.length) {
      for (const txt of jsonLd) {
        try {
          const parsed = JSON.parse(txt);
          // Si es un Product o contiene offers
          const offers = parsed?.offers ?? parsed?.aggregateOffer ?? null;
          if (offers) {
            if (Array.isArray(offers)) {
              if (offers[0]?.price) return Number(offers[0].price);
            } else {
              if (offers.price) return Number(offers.price);
              if (offers.lowPrice) return Number(offers.lowPrice);
            }
          }
          // aggregateOffer.lowPrice
          if (parsed?.offers?.lowPrice) return Number(parsed.offers.lowPrice);
        } catch (e) {
          // ignore invalid json
        }
      }
    }

    // 4) Fallback: buscar número en body (menos confiable)
    const bodyText = await page.evaluate(() => document.body.innerText);
    const m = bodyText.match(/"price"\s*:\s*([\d.]+)/) || bodyText.match(/([\d]{2,4}[.,]\d{2})/);
    if (m && m[1]) {
      const raw = m[1].replace(",", ".");
      await browser.close();
      return Number(raw);
    }

    await browser.close();
    return null;
  } catch (err) {
    if (browser) await browser.close();
    return null;
  }
}

(async () => {
  const results = {};

  for (const product of products) {
    const item = { name: product.name, prices: {} };

    for (const url of product.urls) {
      const host = new URL(url).hostname.replace("www.", "").split(".")[0];
      let price = null;

      try {
        if (host === "tiendainglesa") {
          price = await scrapeWithPuppeteer(url);
        } else {
          price = await scrapeMetaPrice(url);
        }

        item.prices[host] = price;
        console.log(`${product.name} | ${host}: ${price ?? "N/A"}`);
      } catch (err) {
        console.error(`❌ Error en ${url}: ${err.message}`);
        item.prices[host] = null;
      }
    }

    results[product.id] = item;
    console.log('-');
  }
  

  fs.writeFileSync(
    "./data/prices.json",
    JSON.stringify({ timestamp: new Date().toISOString(), data: results }, null, 2)
  );

  console.log("✅ prices.json generado correctamente");
})();
