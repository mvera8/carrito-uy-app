import { defineConfig } from "cypress";
import fs from 'fs';
import path from 'path';  
import puppeteer from "puppeteer";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Guardamos los datos temporales en memoria del Node backend
      let allProducts = [];

      on('task', {
        log(message) {
          console.log(message);
          return null;
        },

        saveProductData(product) {
          allProducts.push(product);
          return null;
        },

        writeFinalJson() {
          const outputPath = path.resolve('./cypress-prices.json');
          fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
          return null;
        },



        async puppeteerScrape({ url, selector }) {
          const browser = await puppeteer.launch({
            headless: "new"
          });
          const page = await browser.newPage();

          await page.goto(url, { waitUntil: "networkidle2" });

          // ⬇ ESTA ES LA CLAVE: comprobar si existe
          const elementHandle = await page.$(selector);

          if (!elementHandle) {
            await browser.close();
            return null; // ← no existe el selector, devolvemos null
          }

          const value = await page.$eval(selector, el => el.getAttribute("data-value"));
          await browser.close();
          return value;
        }
      });

      return config;
    },
    // Configuración para scraping
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    requestTimeout: 30000,
    responseTimeout: 30000,

    // Deshabilitar video y screenshots para mejor rendimiento
    video: false,
    screenshotOnRunFailure: true,

    // Viewport
    viewportWidth: 1920,
    viewportHeight: 1080,

    // Evitar problemas con CORS
    chromeWebSecurity: false,

    // Configuración de reintentos
    retries: {
      runMode: 1,
      openMode: 0
    }
  },
  // Evita que cree la carpeta screenshots
  screenshotsFolder: false,
});
