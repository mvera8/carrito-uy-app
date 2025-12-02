// lib/getProducts.js
import { neon } from '@neondatabase/serverless';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuración del caché
const CACHE_KEYS = {
  PRODUCTS: 'products_cache',
  PRODUCTS_TIMESTAMP: 'products_cache_timestamp',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Helper para obtener la conexión SQL
function getSQL() {
  return neon(process.env.EXPO_PUBLIC_DATABASE_URL);
}

/**
 * Verificar si el caché es válido
 */
async function isCacheValid(key) {
  try {
    const timestamp = await AsyncStorage.getItem(`${key}_timestamp`);
    if (!timestamp) return false;

    const now = Date.now();
    const cacheAge = now - parseInt(timestamp, 10);

    return cacheAge < CACHE_DURATION;
  } catch (error) {
    console.error('Error verificando caché:', error);
    return false;
  }
}

/**
 * Guardar datos en caché
 */
async function saveToCache(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    await AsyncStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error('Error guardando en caché:', error);
  }
}

/**
 * Obtener datos del caché
 */
async function getFromCache(key) {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error obteniendo del caché:', error);
    return null;
  }
}

/**
 * Obtener todos los productos (con caché)
 */
export async function getProducts(forceRefresh = false) {
  try {
    // Si no forzamos refresh, intentar usar caché
    if (!forceRefresh) {
      const isValid = await isCacheValid(CACHE_KEYS.PRODUCTS);

      if (isValid) {
        const cachedData = await getFromCache(CACHE_KEYS.PRODUCTS);
        if (cachedData) {
          console.log('Productos cargados desde caché');
          return cachedData;
        }
      }
    }

    // Si no hay caché válido, hacer fetch
    console.log('Obteniendo productos desde la base de datos...');
    const sql = getSQL();
    const response = await sql`SELECT * FROM productos`;

    // Guardar en caché
    await saveToCache(CACHE_KEYS.PRODUCTS, response);
    console.log('Productos guardados en caché');

    return response;
  } catch (error) {
    console.error('Error al cargar productos:', error);

    // En caso de error, intentar devolver datos del caché aunque estén viejos
    const cachedData = await getFromCache(CACHE_KEYS.PRODUCTS);
    if (cachedData) {
      console.log('Usando caché antiguo debido a error de red');
      return cachedData;
    }

    return [];
  }
}

/**
 * Obtener un producto por ID (con caché de lista completa)
 */
export async function getProductById(id) {
  try {
    // Primero intentar buscar en la lista cacheada
    const cachedProducts = await getFromCache(CACHE_KEYS.PRODUCTS);
    if (cachedProducts) {
      const product = cachedProducts.find(p => p.id === id);
      if (product) {
        console.log('Producto encontrado en caché');
        return product;
      }
    }

    // Si no está en caché, buscar en BD
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
    // Intentar buscar en caché primero
    const cachedProducts = await getFromCache(CACHE_KEYS.PRODUCTS);
    if (cachedProducts) {
      const product = cachedProducts.find(p => p.ean13 === ean13);
      if (product) return product;
    }

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
    if (typeof query === 'object') {
      if (query.id) {
        const byId = await getProductById(query.id);
        if (byId) return byId;
      }

      if (query.ean13) {
        const byEan = await getProductByEan(query.ean13);
        if (byEan) return byEan;
      }

      if (query.name) {
        const byName = await getProductByName(query.name);
        if (byName) return byName;
      }

      return null;
    }

    if (typeof query === 'string' || typeof query === 'number') {
      if (!isNaN(query)) {
        const byId = await getProductById(Number(query));
        if (byId) return byId;
      }

      if (String(query).length === 13 && !isNaN(query)) {
        const byEan = await getProductByEan(String(query));
        if (byEan) return byEan;
      }

      return await getProductByName(String(query));
    }

    return null;
  } catch (error) {
    console.error('Error en findProduct:', error);
    return null;
  }
}

/**
 * Buscar productos (múltiples resultados) - con búsqueda local primero
 */
export async function searchProducts(searchTerm, limit = 20) {
  if (!searchTerm) return [];

  try {
    // Intentar búsqueda local en caché primero
    const cachedProducts = await getFromCache(CACHE_KEYS.PRODUCTS);
    if (cachedProducts && cachedProducts.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = cachedProducts
        .filter(p => p.name.toLowerCase().includes(lowerSearch))
        .sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          // Coincidencia exacta primero
          if (aName === lowerSearch) return -1;
          if (bName === lowerSearch) return 1;

          // Comienza con el término
          if (aName.startsWith(lowerSearch) && !bName.startsWith(lowerSearch)) return -1;
          if (bName.startsWith(lowerSearch) && !aName.startsWith(lowerSearch)) return 1;

          // Orden alfabético
          return aName.localeCompare(bName);
        })
        .slice(0, limit);

      if (filtered.length > 0) {
        console.log('Búsqueda realizada en caché local');
        return filtered;
      }
    }

    // Si no hay resultados en caché, buscar en BD
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