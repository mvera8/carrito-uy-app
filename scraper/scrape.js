import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

const products = JSON.parse(fs.readFileSync("./products.json", "utf8"));

// --- Helpers ---
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function getVTEXPrice(url) {
  try {
    const slug = url.split("/").find((s) => s.includes("coca") || s.includes("repelente") || s.includes("yerba")) || "";
    const base = url.split("/")[2];
    const apiUrl = `https://${base}/api/catalog_system/pub/products/search/${slug}`;

    const { data } = await axios.get(apiUrl, { timeout: 8000 });
    const price = data?.[0]?.items?.[0]?.sellers?.[0]?.commertialOffer?.Price;
    return price || null;
  } catch {
    return null;
  }
}

async function getHTMLPrice(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });
    const $ = cheerio.load(data);

    // Selectores comunes
    const candidates = [
      '[class*="price"]',
      '[class*="Price"]',
      '[id*="price"]',
      ".precio",
      ".product-price",
    ];

    for (const sel of candidates) {
      const text = $(sel).first().text();
      const num = parseFloat(text.replace(/[^0-9.,]/g, "").replace(",", "."));
      if (!isNaN(num)) return num;
    }

    return null;
  } catch {
    return null;
  }
}

function detectStore(url) {
  const domain = new URL(url).hostname;
  return (
    domain.match(/tata|eldorado|devoto|tiendainglesa|geant|disco|elclon/)?.[0] || "unknown"
  );
}

// --- Main ---
const results = {};

for (const product of products) {
  const item = { name: product.name, prices: {} };

  for (const url of product.urls) {
    const store = detectStore(url);
    let price = null;

    // Intentar VTEX primero
    price = await getVTEXPrice(url);
    if (!price) price = await getHTMLPrice(url);

    item.prices[store] = price;
    console.log(`${product.name} | ${store}: ${price}`);

    await delay(1500); // respetar sitios
  }

  results[product.id] = item;
}

// Guardar resultados
fs.writeFileSync(
  "./prices.json",
  JSON.stringify({ timestamp: new Date().toISOString(), data: results }, null, 2)
);

console.log("✅ prices.json generado");
