export function getProducts() {
  let PRODUCTS = require('../fixtures/products.json');
  let arrayProducts = [];

  PRODUCTS.forEach((obj) => {
    arrayProducts.push(obj);
  });

  return arrayProducts;
}
