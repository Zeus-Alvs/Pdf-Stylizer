import { createPool as createVercelPool } from '@vercel/postgres';
import { Pool as PgPool } from 'pg';

export interface DocumentRecord {
  id: string; // UUID
  title: string;
  blob_url: string;
  created_at: Date;
}

// Variável global para cache da conexão em desenvolvimento (evita "too many connections")
let cachedPool: any = null;

export function getDbPool() {
  if (cachedPool) return cachedPool;

  const isLocal = process.env.NODE_ENV === 'development';
  
  if (isLocal) {
    const connectionString = process.env.LOCAL_POSTGRES_URL || 'postgres://postgres:1234@localhost:5432/pdfstylizer';
    
    if (!connectionString) {
      throw new Error('Configure LOCAL_POSTGRES_URL no seu arquivo .env.local');
    }

    // Usa o pool padrão da biblioteca pg para evitar conflitos de SSL da Vercel localmente
    cachedPool = new PgPool({
      connectionString,
    });
    return cachedPool;
  }

  // Em produção (Vercel)
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('A variável de ambiente de conexão do banco de dados não foi configurada (POSTGRES_URL).');
  }

  cachedPool = createVercelPool({
    connectionString,
  });
  return cachedPool;
}
