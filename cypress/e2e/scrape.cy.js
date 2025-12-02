// cypress/e2e/scrape.cy.js

import { getProducts } from '../support/utils';

describe('Scraper de Productos', function() {
  const resultados = [];

  getProducts().forEach((product) => {
    const productName = product.name;
    const productImage = product.image ?? 'image_cart';
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
          if (url === '') {
            this.skip();
          }

          cy.request({
            url: url,
            failOnStatusCode: false,
            timeout: 10000
          }).then(function (response) {
            // Parsear el HTML con regex (DOMParser no existe en Node.js)
            const html = response.body;
            // Obtener el hostname de la tienda
            const tienda = new URL(url).hostname.replace('www.', '');

            if (tienda === 'tiendainglesa.com.uy') {
              return cy.task("puppeteerScrapeTI", { url, waitFor: 6000, debug: true })
                .then((res) => {
                  // if (res.error) cy.task("log", `TI Error: ${res.error}`);
                  // if (res.html) cy.writeFile("debug-ti.html", res.html);

                  cy.task('log', `  Tienda: ${tienda} - Precio: ${res.price || 'No encontrado'}`);
                  cy.task('log', `  Tienda: ${tienda} - Promo: ${res.listPrice || 'No tiene promo'}`);

                  productData.prices.push({
                    tienda: "tiendainglesa",
                    url,
                    precio: res.price,
                    promo: res.listPrice
                  });
                });
            } else {
              
              cy.task("puppeteerScrape", {
                url,
                // elclon, geant, devoto, tata
                selector: 'div.precios del.precio.lista span.monto, span.wTxtProductPriceBefore, span.devotouy-products-components-0-x-listPriceValue, span[data-testid="list-price"]'
              }).then((promo) => {

                return cy.task("puppeteerScrape", {
                  url,
                  selector: 'div.precios strong.precio.venta span.monto, span.wProductPrimaryPrice, .devotouy-products-components-0-x-sellingPriceWithUnitMultiplier span:last-child, span[data-testid="price"]'
                }).then((precio) => {

                  cy.task('log', `  Tienda: ${tienda} - Precio: ${precio || 'No encontrado'}`);
                  cy.task('log', `  Tienda: ${tienda} - Promo: ${promo || 'No tiene promo'}`);

                  productData.prices.push({
                    tienda: tienda.replace('.com.uy', ''),
                    url: url,
                    precio: precio ? parseFloat(precio) : null,
                    promo: promo ? parseFloat(promo) : null,
                  });

                });
              });


            }

            

          }); // then
        });  // it
      }); // forEach productUrls      
    }); // context

    after(function () {
      cy.task('saveProductData', productData);
    });
  }); // forEach

  after(() => {
    cy.task('writeNeonTable');
  });
}); // describe