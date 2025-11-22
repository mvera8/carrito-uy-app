// lib/getProducts.js

// Importar productos una sola vez
import { products } from '../data/products.js';

/**
 * Obtener todos los productos
 */
export async function getLatestProducts() {
  return products;
}

/**
 * Obtener un producto por ID
 */
export function getProductById(id) {
  return products.find(p => p.id === id) || null;
}

/**
 * Obtener un producto por nombre (búsqueda flexible)
 */
export function getProductByName(name) {
  if (!name) return null;

  const searchTerm = name.toLowerCase();

  // Búsqueda exacta
  let product = products.find(p =>
    p.name.toLowerCase() === searchTerm
  );

  // Si no encuentra, búsqueda parcial
  if (!product) {
    product = products.find(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(p.name.toLowerCase())
    );
  }

  return product || null;
}

/**
 * Buscar producto de forma inteligente (por id, nombre o slug)
 */
export function findProduct(query) {
  if (!query) return null;

  // Si query es un objeto con propiedades
  if (typeof query === 'object') {
    // Intentar por ID
    if (query.id) {
      const byId = getProductById(query.id);
      if (byId) return byId;
    }

    // Intentar por nombre
    if (query.name) {
      const byName = getProductByName(query.name);
      if (byName) return byName;
    }

    return null;
  }

  // Si query es un string, intentar como ID primero
  if (typeof query === 'string') {
    const byId = getProductById(query);
    if (byId) return byId;

    // Luego intentar como nombre
    return getProductByName(query);
  }

  return null;
}

/**
 * Obtener todos los supermercados disponibles
 */
export function getAllMarkets() {
  const marketsSet = new Set();

  products.forEach(product => {
    if (product.prices) {
      Object.keys(product.prices).forEach(market => {
        marketsSet.add(market);
      });
    }
  });

  return Array.from(marketsSet);
}

/**
 * Calcular el precio de un producto en un supermercado específico
 */
export function getProductPrice(productId, market) {
  const product = getProductById(productId);
  if (!product || !product.prices || !product.prices[market]) {
    return null;
  }

  const priceData = product.prices[market];
  return priceData.price ? Number(priceData.price) : null;
}