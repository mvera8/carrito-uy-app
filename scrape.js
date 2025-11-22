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

/** Helper: calcular promo (false si price o listPrice null, o price >= listPrice) */
function computePromo(price, listPrice) {
  if (price == null || listPrice == null) return false;
  const p = Number(price);
  const lp = Number(listPrice);
  if (Number.isNaN(p) || Number.isNaN(lp)) return false;
  return p < lp;
}

/**
 * Genera un ID slug desde el nombre del producto
 */
function generateId(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/[^a-z0-9\s]/g, "") // Solo letras, números y espacios
    .trim()
    .replace(/\s+/g, "-"); // Espacios a guiones
}

/**
 * scrapeMetaPrice
 * - Devuelve { price, listPrice, promo }
 */
async function scrapeMetaPrice(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": defaultHeaders["User-Agent"] },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const host = new URL(url).hostname;

    // 1) meta itemprop="price"
    if (host.includes("elclon")) {
      const p = $('meta[itemprop="price"]').attr("content");
      if (p) return { price: Number(p), listPrice: null, promo: false };
    }

    // 2) meta property="product:price:amount"
    const metaPrice = $('meta[property="product:price:amount"]').attr("content");
    if (metaPrice) return { price: Number(metaPrice), listPrice: null, promo: false };

    // 3) JSON-LD
    const jsonLdEls = $('script[type="application/ld+json"]');
    if (jsonLdEls.length) {
      for (let i = 0; i < jsonLdEls.length; i++) {
        const txt = $(jsonLdEls[i]).text().trim();
        if (!txt) continue;
        try {
          const parsed = JSON.parse(txt);
          const agg = parsed?.offers ?? null;
          if (agg) {
            if (Array.isArray(agg.offers) && agg.offers.length > 0) {
              const first = agg.offers[0];
              const price = first?.price ?? null;
              const listPrice = first?.listPrice ?? null;
              const lowPrice = agg?.lowPrice ?? agg?.price ?? null;
              if (price != null || lowPrice != null) {
                const finalPrice = price != null ? Number(price) : Number(lowPrice);
                const lp = listPrice != null ? Number(listPrice) : null;
                return { price: finalPrice, listPrice: lp, promo: computePromo(finalPrice, lp) };
              }
            }

            if (!Array.isArray(agg) && typeof agg === "object") {
              const price = agg.price ?? agg.lowPrice ?? null;
              const listPrice = agg.listPrice ?? null;
              if (price != null) {
                const p = Number(price);
                const lp = listPrice != null ? Number(listPrice) : null;
                return { price: p, listPrice: lp, promo: computePromo(p, lp) };
              }
            }
          }

          const offers = parsed?.offers ?? null;
          if (offers) {
            if (Array.isArray(offers) && offers.length > 0) {
              const o = offers[0];
              if (o?.price != null) {
                const p = Number(o.price);
                const lp = o?.listPrice != null ? Number(o.listPrice) : null;
                return { price: p, listPrice: lp, promo: computePromo(p, lp) };
              }
            } else if (typeof offers === "object") {
              const p = offers.price ?? offers.lowPrice ?? null;
              const lp = offers.listPrice ?? null;
              if (p != null) {
                return { price: Number(p), listPrice: lp != null ? Number(lp) : null, promo: computePromo(p, lp) };
              }
            }
          }
        } catch (e) {
          // ignore invalid json
        }
      }
    }

    // 4) not found
    return { price: null, listPrice: null, promo: false };
  } catch (err) {
    console.error(`❌ Error en ${url}: ${err.message}`);
    return { price: null, listPrice: null, promo: false };
  }
}

/**
 * scrapeWithPuppeteer - versión reforzada
 * - Devuelve { price, listPrice, promo }
 */
async function scrapeWithPuppeteer(pageUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setUserAgent(defaultHeaders["User-Agent"]);
    await page.setExtraHTTPHeaders({ "Accept-Language": "es-ES,es;q=0.9" });
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 30000 });

    // 0) revisar globals conocidos de VTEX y otros
    const fromGlobals = await page.evaluate(() => {
      try {
        const possibles = [
          window.__RUNTIME__,
          window.__PRELOADED_STATE__,
          window.__INITIAL_STATE__,
          window.__STORE__,
          window.__PRELOADED__,
          window.__STATE__,
          window.vtex,
          window.__GLOBAL__,
        ];

        for (const g of possibles) {
          if (!g || typeof g !== "object") continue;
          const items = g?.items ?? g?.product ?? g?.products ?? g?.catalog ?? null;
          if (items && Array.isArray(items) && items.length) {
            const it = items[0];
            const seller = it?.sellers?.[0] ?? it?.sellers ?? null;
            const comm = seller?.commertialOffer ?? it?.commertialOffer ?? null;
            if (comm) {
              const price = comm.Price ?? comm.price ?? comm.Preco ?? null;
              let listPrice = comm.ListPrice ?? comm.listPrice ?? null;
              if (Array.isArray(comm.PriceTags)) {
                const antes = comm.PriceTags.find(t => t?.Label && /ante|anterior|antes|original/i.test(String(t.Label)));
                if (antes && (antes.Price !== undefined && antes.Price !== null)) listPrice = antes.Price;
              }
              if (price != null) return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: null };
            }
          }
          const offers = g?.offers ?? null;
          if (offers) {
            if (Array.isArray(offers) && offers.length) {
              const o = offers[0];
              if (o?.price != null) return { price: Number(o.price), listPrice: o?.listPrice != null ? Number(o.listPrice) : null, promo: null };
            } else if (typeof offers === "object" && (offers.price || offers.lowPrice)) {
              const p = offers.price ?? offers.lowPrice ?? null;
              const lp = offers.listPrice ?? null;
              if (p != null) return { price: Number(p), listPrice: lp != null ? Number(lp) : null, promo: null };
            }
          }
        }
      } catch (e) { }
      return null;
    });

    if (fromGlobals) {
      await browser.close();
      return {
        price: fromGlobals.price,
        listPrice: fromGlobals.listPrice,
        promo: computePromo(fromGlobals.price, fromGlobals.listPrice),
      };
    }

    const stateJson = await page.evaluate(() => {
      try {
        const script = [...document.scripts].find((s) =>
          s.innerText.includes("window.__STATE__")
        );

        if (script) {
          const raw = script.innerText
            .replace("window.__STATE__ = ", "")
            .trim();

          const json = raw.endsWith(";") ? raw.slice(0, -1) : raw;
          return JSON.parse(json);
        }

        if (typeof window.__STATE__ === "object") {
          return window.__STATE__;
        }

        return null;
      } catch {
        return null;
      }
    });

    if (stateJson) {
      for (const key of Object.keys(stateJson)) {
        const node = stateJson[key];
        if (!node || typeof node !== "object") continue;

        const price = node.Price ?? node.price;
        const listPrice = node.ListPrice ?? node.listPrice;

        if (price != null || listPrice != null) {
          await browser.close();
          return {
            price: Number(price ?? listPrice),
            listPrice: Number(listPrice ?? price),
            promo: computePromo(
              Number(price ?? listPrice),
              Number(listPrice ?? price)
            ),
          };
        }
      }
    }

    // 1) dataLayer
    const fromDataLayer = await page.evaluate(() => {
      try {
        if (window.dataLayer && Array.isArray(window.dataLayer)) {
          for (let i = window.dataLayer.length - 1; i >= 0; i--) {
            const item = window.dataLayer[i];
            const products = item?.ecommerce?.detail?.products ?? item?.ecommerce?.products ?? null;
            if (Array.isArray(products) && products[0]) {
              const p = products[0];
              const price = (p.price !== undefined) ? p.price : (p.offerPrice ?? null);
              const listPrice = (p.listPrice !== undefined) ? p.listPrice : (p.originalPrice ?? null);
              if (price !== undefined && price !== null) {
                return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: null };
              }
            }
          }
        }
      } catch (e) { }
      return null;
    });

    if (fromDataLayer) {
      await browser.close();
      return {
        price: fromDataLayer.price,
        listPrice: fromDataLayer.listPrice,
        promo: computePromo(fromDataLayer.price, fromDataLayer.listPrice),
      };
    }

    // 2) parsear scripts JSON
    const fromScripts = await page.evaluate(() => {
      try {
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const s of scripts) {
          const txt = s.innerText.trim();
          if (!txt) continue;

          if ((txt.startsWith("{") || txt.startsWith("[")) && txt.length < 500000) {
            try {
              const json = JSON.parse(txt);
              const offer = json?.items?.[0]?.sellers?.[0]?.commertialOffer ?? json?.items?.[0]?.commertialOffer ?? null;
              if (offer) {
                const price = offer.Price ?? offer.price ?? offer.Preco ?? null;
                let listPrice = offer.ListPrice ?? offer.listPrice ?? null;
                if (Array.isArray(offer.PriceTags)) {
                  const antes = offer.PriceTags.find(t => t?.Label && /ante|anterior|antes|original/i.test(String(t.Label)));
                  if (antes && (antes.Price !== undefined && antes.Price !== null)) listPrice = antes.Price;
                }
                if (price != null) return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: null };
              }

              const agg = json?.offers ?? null;
              if (agg) {
                if (Array.isArray(agg.offers) && agg.offers.length > 0) {
                  const first = agg.offers[0];
                  const price = first?.price ?? null;
                  const listPrice = first?.listPrice ?? null;
                  const lowPrice = agg?.lowPrice ?? agg?.price ?? null;
                  if (price != null || lowPrice != null) {
                    const finalPrice = price != null ? Number(price) : Number(lowPrice);
                    return { price: finalPrice, listPrice: listPrice != null ? Number(listPrice) : null, promo: null };
                  }
                } else if (typeof agg === "object") {
                  const price = agg.price ?? agg.lowPrice ?? null;
                  const listPrice = agg.listPrice ?? null;
                  if (price != null) return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: null };
                }
              }

              const possible = json?.product ?? json?.productInfo ?? json?.item ?? null;
              if (possible) {
                const price = possible?.offers?.price ?? possible?.offers?.lowPrice ?? possible?.price ?? null;
                const listPrice = possible?.offers?.listPrice ?? possible?.listPrice ?? null;
                if (price != null) return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: null };
              }
            } catch (e) { }
          }

          try {
            const lower = txt.toLowerCase();
            if (lower.includes("pricetags") || lower.includes('"label":"antes"') || /"label"\s*:\s*"antes"/i.test(txt)) {
              const m = txt.match(/"PriceTags"\s*:\s*(\[[\s\S]*?\])/i) || txt.match(/"pricetags"\s*:\s*(\[[\s\S]*?\])/i);
              if (m && m[1]) {
                const arrText = m[1];
                const re = /{[\s\S]*?"label"\s*:\s*"([^"]+)"[\s\S]*?"price"\s*:\s*([\d.]+)/ig;
                let mm;
                let foundList = null;
                while ((mm = re.exec(arrText)) !== null) {
                  const label = mm[1];
                  const priceVal = mm[2];
                  if (/ante|anterior|antes|original/i.test(label)) {
                    foundList = Number(priceVal);
                    break;
                  }
                }
                if (foundList != null) {
                  const mPrice = txt.match(/"Price"\s*:\s*([\d.]+)/i) || txt.match(/"price"\s*:\s*([\d.]+)/i);
                  const current = mPrice ? Number(mPrice[1]) : null;
                  if (current != null) return { price: current, listPrice: Number(foundList), promo: null };
                  const low = txt.match(/"lowPrice"\s*:\s*([\d.]+)/i) || txt.match(/"price"\s*:\s*([\d.]+)/i);
                  if (low) return { price: Number(low[1]), listPrice: Number(foundList), promo: null };
                }
              }

              const re2 = /"label"\s*:\s*"([^"]+)"[\s\S]{0,120}?"price"\s*:\s*([\d.]+)/ig;
              let m2;
              while ((m2 = re2.exec(txt)) !== null) {
                const label = m2[1];
                const val = Number(m2[2]);
                if (/ante|anterior|antes|original/i.test(label)) {
                  const context = txt.slice(Math.max(0, m2.index - 200), Math.min(txt.length, m2.index + 400));
                  const nowMatch = context.match(/"label"\s*:\s*"([^"]+)"[\s\S]{0,120}?"price"\s*:\s*([\d.]+)/ig);
                  if (nowMatch && nowMatch.length) {
                    for (const nm of nowMatch) {
                      const m3 = /"label"\s*:\s*"([^"]+)"[\s\S]{0,120}?"price"\s*:\s*([\d.]+)/i.exec(nm);
                      if (m3 && !/ante|anterior|antes|original/i.test(m3[1])) {
                        return { price: Number(m3[2]), listPrice: val, promo: null };
                      }
                    }
                  }
                  const anyPrice = txt.match(/"price"\s*:\s*([\d.]+)/i);
                  if (anyPrice) return { price: Number(anyPrice[1]), listPrice: val, promo: null };
                }
              }
            }
          } catch (e) { }
        }
      } catch (e) { }
      return null;
    });

    if (fromScripts) {
      await browser.close();
      return {
        price: fromScripts.price,
        listPrice: fromScripts.listPrice,
        promo: computePromo(fromScripts.price, fromScripts.listPrice),
      };
    }

    const metaPrice = await page.$eval(
      'meta[property="product:price:amount"]',
      (el) => el.getAttribute("content")
    ).catch(() => null);

    if (metaPrice) {
      await browser.close();
      return { price: Number(metaPrice), listPrice: null, promo: false };
    }

    const jsonLd = await page.$$eval('script[type="application/ld+json"]', (els) =>
      els.map((el) => el.innerText)
    );

    if (jsonLd && jsonLd.length) {
      for (const txt of jsonLd) {
        try {
          const parsed = JSON.parse(txt);
          const agg = parsed?.offers ?? null;
          if (agg) {
            if (Array.isArray(agg.offers) && agg.offers.length > 0) {
              const first = agg.offers[0];
              const price = first?.price ?? null;
              const listPrice = first?.listPrice ?? null;
              const lowPrice = agg?.lowPrice ?? agg?.price ?? null;
              if (price != null || lowPrice != null) {
                const finalPrice = price != null ? Number(price) : Number(lowPrice);
                await browser.close();
                return { price: finalPrice, listPrice: listPrice != null ? Number(listPrice) : null, promo: computePromo(finalPrice, listPrice) };
              }
            } else if (typeof agg === "object") {
              const price = agg.price ?? agg.lowPrice ?? null;
              const listPrice = agg.listPrice ?? null;
              if (price != null) {
                await browser.close();
                return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: computePromo(price, listPrice) };
              }
            }
          }

          const offers = parsed?.offers ?? null;
          if (offers) {
            if (Array.isArray(offers) && offers.length > 0) {
              const o = offers[0];
              if (o?.price != null) {
                await browser.close();
                return { price: Number(o.price), listPrice: o?.listPrice != null ? Number(o.listPrice) : null, promo: computePromo(o.price, o.listPrice) };
              }
            } else if (typeof offers === "object") {
              const price = offers.price ?? offers.lowPrice ?? null;
              const listPrice = offers.listPrice ?? null;
              if (price != null) {
                await browser.close();
                return { price: Number(price), listPrice: listPrice != null ? Number(listPrice) : null, promo: computePromo(price, listPrice) };
              }
            }
          }
        } catch (e) { }
      }
    }

    const bodyText = await page.evaluate(() => document.body.innerText);
    const m = bodyText.match(/"price"\s*:\s*([\d.]+)/) || bodyText.match(/([\d]{2,4}[.,]\d{2})/);
    if (m && m[1]) {
      const raw = m[1].replace(",", ".");
      await browser.close();
      return { price: Number(raw), listPrice: null, promo: false };
    }

    await browser.close();
    return { price: null, listPrice: null, promo: false };
  } catch (err) {
    if (browser) await browser.close();
    return { price: null, listPrice: null, promo: false };
  }
}

(async () => {
  const results = [];

  for (const product of products) {
    const productId = generateId(product.name);

    const item = {
      id: productId,
      name: product.name,
      image: product.image || null,
      ean13: product.ean13 || null,
      prices: {}
    };

    // Filtrar URLs válidas
    const validUrls = (product.urls || []).filter(url => url && url.trim().length > 0);

    if (validUrls.length === 0) {
      console.log(`⚠️  ${product.name}: No tiene URLs válidas, saltando...`);
      results.push(item);
      console.log("-");
      continue;
    }

    for (const url of validUrls) {
      let host;
      try {
        host = new URL(url).hostname.replace("www.", "").split(".")[0];
      } catch (err) {
        console.error(`❌ URL inválida en ${product.name}: ${url}`);
        continue;
      }
      let scraped = { price: null, listPrice: null, promo: false };

      try {
        if (host === "tiendainglesa" || host.includes("tata") || host.includes("vtexassets") || host.includes("tatauy") || host.includes("tata")) {
          scraped = await scrapeWithPuppeteer(url);
        } else {
          scraped = await scrapeMetaPrice(url);
        }

        scraped = {
          price: scraped.price != null ? Number(scraped.price) : null,
          listPrice: scraped.listPrice != null ? Number(scraped.listPrice) : null,
          promo: computePromo(scraped.price, scraped.listPrice),
        };

        item.prices[host] = scraped;

        const label = scraped.price == null
          ? "N/A"
          : scraped.listPrice != null && scraped.promo
            ? `${scraped.listPrice}, promo: ${scraped.price}`
            : scraped.listPrice != null && !scraped.promo
              ? `${scraped.listPrice}`
              : `${scraped.price}`;

        console.log(`${product.name} | ${host}: ${label}`);
      } catch (err) {
        console.error(`❌ Error en ${url}: ${err.message}`);
        item.prices[host] = { price: null, listPrice: null, promo: false };
      }
    }

    results.push(item);
    console.log("-");
  }

  // Generar prices.json (formato antiguo)
  const pricesJson = {};
  results.forEach(item => {
    pricesJson[item.id] = {
      name: item.name,
      prices: item.prices
    };
  });

  fs.writeFileSync(
    "./data/prices.json",
    JSON.stringify({ timestamp: new Date().toISOString(), data: pricesJson }, null, 2)
  );

  // ✅ NUEVO: Generar products.js
  let productsJsContent = `// Auto-generated by scrape.js
// Last updated: ${new Date().toISOString()}

export const products = [\n`;

  results.forEach((item, index) => {
    const imagePath = item.image
      ? `require('../assets/products/${item.image}')`
      : `require('../assets/products/image_cart.png')`;

    productsJsContent += `  {\n`;
    productsJsContent += `    id: "${item.id}",\n`;
    productsJsContent += `    name: "${item.name}",\n`;
    productsJsContent += `    image: ${imagePath},\n`;
    if (item.ean13) {
      productsJsContent += `    ean13: "${item.ean13}",\n`;
    }
    productsJsContent += `    prices: ${JSON.stringify(item.prices, null, 6).replace(/\n/g, '\n    ')}\n`;
    productsJsContent += `  }${index < results.length - 1 ? ',' : ''}\n`;
  });

  productsJsContent += `];\n`;

  fs.writeFileSync("./data/products.js", productsJsContent);

  console.log("✅ products.js generado correctamente en ./lib/products.js");
})();