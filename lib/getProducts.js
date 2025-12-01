// lib/getProducts.js
import { neon } from '@neondatabase/serverless';

// Helper para obtener la conexión SQL
function getSQL() {
  return neon(process.env.EXPO_PUBLIC_DATABASE_URL);
}

/**
 * Obtener todos los productos
 */
export async function getProducts() {
  try {
    const sql = getSQL();
    const response = await sql`SELECT * FROM productos`;
    return response;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return [];
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProductById(id) {
  try {
    const sql = getSQL();
    const result = await sql`
      SELECT * FROM productos 
      WHERE id = ${id}
      LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error al buscar producto por ID:', error);
    return null;
  }
}

/**
 * Obtener un producto por EAN13
 */
export async function getProductByEan(ean13) {
  try {
    const sql = getSQL();
    const result = await sql`
      SELECT * FROM productos 
      WHERE ean13 = ${ean13}
      LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error al buscar producto por EAN:', error);
    return null;
  }
}

/**
 * Obtener un producto por nombre (búsqueda flexible)
 */
export async function getProductByName(name) {
  if (!name) return null;

  try {
    const sql = getSQL();
    const searchTerm = `%${name}%`;

    // Búsqueda con ILIKE (case-insensitive)
    const result = await sql`
      SELECT * FROM productos 
      WHERE name ILIKE ${searchTerm}
      ORDER BY 
        CASE 
          WHEN LOWER(name) = LOWER(${name}) THEN 1
          WHEN LOWER(name) LIKE LOWER(${name} || '%') THEN 2
          ELSE 3
        END
      LIMIT 1
    `;

    return result[0] || null;
  } catch (error) {
    console.error('Error al buscar producto por nombre:', error);
    return null;
  }
}

/**
 * Buscar producto de forma inteligente (por id, nombre o ean13)
 */
export async function findProduct(query) {
  if (!query) return null;

  try {
    // Si query es un objeto con propiedades
    if (typeof query === 'object') {
      // Intentar por ID
      if (query.id) {
        const byId = await getProductById(query.id);
        if (byId) return byId;
      }

      // Intentar por EAN13
      if (query.ean13) {
        const byEan = await getProductByEan(query.ean13);
        if (byEan) return byEan;
      }

      // Intentar por nombre
      if (query.name) {
        const byName = await getProductByName(query.name);
        if (byName) return byName;
      }

      return null;
    }

    // Si query es un string o número
    if (typeof query === 'string' || typeof query === 'number') {
      // Intentar como ID (si es número)
      if (!isNaN(query)) {
        const byId = await getProductById(Number(query));
        if (byId) return byId;
      }

      // Si tiene 13 dígitos, intentar como EAN13
      if (String(query).length === 13 && !isNaN(query)) {
        const byEan = await getProductByEan(String(query));
        if (byEan) return byEan;
      }

      // Luego intentar como nombre
      return await getProductByName(String(query));
    }

    return null;
  } catch (error) {
    console.error('Error en findProduct:', error);
    return null;
  }
}

/**
 * Buscar productos (múltiples resultados)
 */
export async function searchProducts(searchTerm, limit = 20) {
  if (!searchTerm) return [];

  try {
    const sql = getSQL();
    const term = `%${searchTerm}%`;

    const results = await sql`
      SELECT * FROM productos 
      WHERE name ILIKE ${term}
      ORDER BY 
        CASE 
          WHEN LOWER(name) = LOWER(${searchTerm}) THEN 1
          WHEN LOWER(name) LIKE LOWER(${searchTerm} || '%') THEN 2
          ELSE 3
        END,
        name
      LIMIT ${limit}
    `;

    return results;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
}

/**
 * Calcular el precio de un producto en un supermercado específico
 */
export function getProductPrice(product, marketId) {
  if (!product || !Array.isArray(product.prices)) return null;

  const entry = product.prices.find(p => p.tienda === marketId);

  if (!entry) return null;

  const precio = Number(entry.precio);

  return isNaN(precio) ? null : precio;
}

/**
 * Obtener productos más baratos por supermercado
 */
export async function getCheapestProducts(market, limit = 10) {
  try {
    const sql = getSQL();

    const results = await sql`
      SELECT 
        *,
        (prices->${market}->>'price')::numeric as current_price
      FROM productos
      WHERE prices ? ${market}
        AND (prices->${market}->>'price') IS NOT NULL
      ORDER BY current_price ASC
      LIMIT ${limit}
    `;

    return results;
  } catch (error) {
    console.error('Error al obtener productos más baratos:', error);
    return [];
  }
}

/**
 * Comparar precios de un producto en todos los supermercados
 */
export async function compareProductPrices(productId) {
  try {
    const product = await getProductById(productId);

    if (!product || !product.prices) {
      return null;
    }

    const comparison = Object.entries(product.prices).map(([market, data]) => ({
      market,
      price: data.price ? Number(data.price) : null,
      available: data.available !== false,
      url: data.url || null
    }))
      .filter(item => item.price !== null)
      .sort((a, b) => a.price - b.price);

    return {
      product,
      comparison,
      cheapest: comparison[0] || null,
      mostExpensive: comparison[comparison.length - 1] || null
    };
  } catch (error) {
    console.error('Error al comparar precios:', error);
    return null;
  }
}

/**
 * Obtener estadísticas de precios
 */
export async function getPriceStats() {
  try {
    const sql = getSQL();

    const result = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(DISTINCT jsonb_object_keys(prices)) as total_markets
      FROM productos
    `;

    return result[0];
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { total_products: 0, total_markets: 0 };
  }
}