import { defineConfig } from "cypress";
import { neon } from '@neondatabase/serverless';
import fs from "fs";
import path from "path";
import puppeteerExtra from "puppeteer-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import dotenv from "dotenv";

// ✅ Cargar variables de entorno
dotenv.config();

puppeteerExtra.use(stealth());

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

export default defineConfig({
  e2e: {
    env: {
      // Pasar la variable al entorno de Cypress
      DATABASE_URL: process.env.EXPO_PUBLIC_DATABASE_URL,
    },
    setupNodeEvents(on, config) {
      let allProducts = [];

      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        saveProductData(product) {
          allProducts.push(product);
          return null;
        },
        writeFinalJson() {
          const outputPath = path.resolve("./cypress-prices.json");
          fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
          return null;
        },
        async writeNeonTable() {
          try {
            // ✅ Leer desde múltiples fuentes
            const dbUrl =
              process.env.EXPO_PUBLIC_DATABASE_URL ||
              process.env.DATABASE_URL ||
              config.env.DATABASE_URL;

            if (!dbUrl) {
              console.error("Variables disponibles:", Object.keys(process.env).filter(k => k.includes('DATABASE')));
              throw new Error("No se encontró DATABASE_URL en ninguna fuente");
            }

            if (allProducts.length === 0) {
              console.warn("⚠️ No hay productos para insertar");
              return null;
            }

            console.log(`📦 Procesando ${allProducts.length} productos...`);

            const sql = neon(dbUrl);

            // ✅ Vaciar tabla
            await sql`TRUNCATE TABLE productos`;
            console.log("✓ Tabla vaciada");

            // ✅ Insertar en lote (más eficiente)
            let inserted = 0;
            for (const p of allProducts) {
              try {
                // Asegurarse de que prices sea un string JSON válido
                const pricesJson = typeof p.prices === 'string'
                  ? p.prices
                  : JSON.stringify(p.prices);

                await sql`
                  INSERT INTO productos (name, image, ean13, prices)
                  VALUES (
                    ${p.name || null}, 
                    ${p.image || null}, 
                    ${p.ean13 || null}, 
                    ${pricesJson}::jsonb
                  )
                `;
                inserted++;

                if (inserted % 10 === 0) {
                  console.log(`  → ${inserted}/${allProducts.length} insertados...`);
                }
              } catch (err) {
                console.error(`❌ Error insertando producto ${p.name}:`, err.message);
                // Continuar con el siguiente producto
              }
            }

            console.log(`✅ Insertados ${inserted} productos en Neon`);
            return { success: true, inserted };

          } catch (err) {
            console.error("❌ Error en writeNeonTable:", err);
            throw err; // Cypress necesita que se lance el error para detectar fallos
          }
        },
        async puppeteerScrape({ url, selector }) {
          const browser = await puppeteerExtra.launch({
            headless: true,
            args: ["--no-sandbox"],
          });

          const page = await browser.newPage();
          await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

          const exists = await page.$(selector);
          if (!exists) {
            await browser.close();
            return null;
          }

          const value = await page.$eval(selector, (el) => {
            let v = el.getAttribute("data-value");
            if (v) return v;

            v = el.textContent || el.innerText;
            if (!v) return null;

            return v.replace(/[^\d.,]/g, "").trim() || null;
          });

          await browser.close();
          return value;
        },
        async puppeteerScrapeTI({ url }) {
          const browser = await puppeteerExtra.launch({
            headless: true,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-blink-features=AutomationControlled",
            ],
          });

          try {
            const page = await browser.newPage();

            await page.setUserAgent(defaultHeaders["User-Agent"]);
            await page.setExtraHTTPHeaders(defaultHeaders);
            await page.setViewport({ width: 1280, height: 900 });

            // 🔥 Bloquear scripts para evitar errores __name
            await page.setRequestInterception(true);
            page.on("request", (req) => {
              if (req.resourceType() === "script") req.abort();
              else req.continue();
            });

            await page.goto(url, {
              waitUntil: "domcontentloaded",
              timeout: 45000,
            });

            // leer HTML final sin scripts ejecutados
            const html = await page.content();

            // extraer precios desde el JSON embebido
            const data = await page.evaluate(() => {
              const scripts = [...document.querySelectorAll("script[type='application/ld+json']")];
              for (const s of scripts) {
                try {
                  const json = JSON.parse(s.innerText);

                  if (json?.offers?.price) {
                    return {
                      price: json.offers.price,
                      listPrice: json.offers.listPrice || null,
                    };
                  }

                  if (Array.isArray(json?.offers?.offers)) {
                    const offer = json.offers.offers[0];
                    return {
                      price: offer?.price || null,
                      listPrice: offer?.listPrice || null,
                    };
                  }
                } catch (e) { }
              }
              return { price: null, listPrice: null };
            });

            return data;

          } catch (err) {
            return { error: err.message };
          } finally {
            await browser.close();
          }
        },

      });

      return config;
    },

    // timeouts
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,

    // evitar screenshots automáticos
    screenshotOnRunFailure: false,
    screenshotsFolder: "cypress/_disabled_screenshots",

    video: false,
    chromeWebSecurity: false,

    retries: {
      runMode: 1,
      openMode: 0,
    },

    viewportWidth: 1920,
    viewportHeight: 1080,
  },
});