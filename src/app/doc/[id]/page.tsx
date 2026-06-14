import { notFound } from "next/navigation";
import { getDbPool } from "@/lib/db";
import Link from "next/link";
import FlipbookWrapper from "@/components/FlipbookWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  // O Next.js moderno exige que aguardemos os parâmetros
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Validar se é um UUID válido para não quebrar a query do Postgres
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const pool = getDbPool();
  let documentRecord;

  try {
    // Busca o PDF no banco de dados local ou de produção
    const { rows } = await pool.query(
      "SELECT title, blob_url FROM documents WHERE id = $1",
      [id]
    );

    if (rows.length > 0) {
      documentRecord = rows[0];
    }
  } catch (error) {
    console.error("Erro ao buscar documento no banco:", error);
  }

  // Se o documento não existir no banco (ou deu erro), aciona a página de erro limpa (not-found.tsx)
  if (!documentRecord) {
    notFound();
  }

  return (
    <main className="h-screen w-full bg-transparent flex flex-col items-center justify-center overflow-hidden relative">
      <FlipbookWrapper blobUrl={documentRecord.blob_url} />
    </main>
  );
}
