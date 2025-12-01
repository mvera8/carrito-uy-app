// lib/getProducts.js
import { neon } from '@neondatabase/serverless';

export async function getProducts() {
  try {
    const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);
    const response = await sql`SELECT * FROM productos`;
    return response;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return []; // Retorna array vacío si hay error
  }
}