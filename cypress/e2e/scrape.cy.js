// cypress/e2e/scrape.cy.js

import { getProducts } from '../support/utils';

describe('Scraper de Productos', function() {
  const resultados = [];

  getProducts().forEach((product) => {
    const productName = product.name;
    const productImage = product.image ?? 'image_cart.png';
    const productCode = product.ean13 ?? '';
    const productUrls = product.urls ?? [];

    const productData = {
      name: productName,
      image: productImage,
      ean13: productCode,
      prices: []
    };

    context(`Producto: ${productName}`, function () {
      productUrls.forEach(function (url) {
        it(url, function () {
          cy.request({
            url: url,
            failOnStatusCode: false,
            timeout: 10000
          }).then(function (response) {
            // Parsear el HTML con regex (DOMParser no existe en Node.js)
            const html = response.body;
            // Obtener el hostname de la tienda
            const tienda = new URL(url).hostname.replace('www.', '');

            let metaMatch = "";
            // let priceMatch = "";

            if (tienda === "tiendainglesa.com.uy") {
              cy.task('log', `  Tienda: ${tienda} - No buscadoooo`);
            } else if (tienda === "elclon.com.uy") {
              metaMatch = html.match(/<meta[^>]*itemprop="price"[^>]*content="([^"]+)"/);

            } else if (tienda === "tata.com.uy") {
              metaMatch = html.match(/<meta[^>]*property="product:price:amount"[^>]*content="([^"]+)"/);

              cy.task("puppeteerScrape", {
                url,
                selector: 'span[data-testid="list-price"]'
              }).then(value => {
                cy.task("log", "List Price: " + value);
              });

              cy.task("puppeteerScrape", {
                url,
                selector: 'span[data-testid="price"]'
              }).then(value => {
                cy.task("log", "Price: " + value);
              });
              
            } else {
              metaMatch = html.match(/<meta[^>]*property="product:price:amount"[^>]*content="([^"]+)"/);

              
              
            }

            const precio = metaMatch ? metaMatch[1] : null;
            cy.task('log', `  Tienda: ${tienda} - Precio: ${precio || 'No encontrado'}`);

            productData.prices.push({
              tienda: tienda.replace('.com.uy', ''),
              url: url,
              precio: precio ? parseFloat(precio) : null,
            });
          }); // then
        });  // it
      }); // forEach productUrls      
    }); // context

    after(function () {
      cy.task('saveProductData', productData);
    });
  }); // forEach

  after(() => {
    cy.task('writeFinalJson');
  });
}); // describe