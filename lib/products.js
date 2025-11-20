// lib/products.js
export async function getLatestProducts() {
  // import dinámico para simular un fetch
  const jsonModule = await import('../data/prices.json');
  const raw = jsonModule.default ?? jsonModule; // por si el bundler lo devuelve en default

  // Si hay un wrapper { timestamp, data }, cogemos data; si no, usamos raw directamente.
  const productsObject = raw.data ?? raw;

  // Filtramos claves vacías y creamos array { id, ...info }
  const products = Object.entries(productsObject)
    .filter(([key, value]) => key && typeof value === 'object') // descarta '' y valores raros
    .map(([id, info]) => ({
      id,
      ...info
    }));

  return products;
}
