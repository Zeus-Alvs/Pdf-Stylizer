import { getDbPool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = getDbPool();

    // Habilita a extensão para geração automática de UUIDs
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Cria a tabela com a estrutura solicitada
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        blob_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json(
      { message: 'Tabela documents criada com sucesso!', result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database connection/query error:", error);
    return NextResponse.json(
      { error: 'Erro ao criar tabela', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
