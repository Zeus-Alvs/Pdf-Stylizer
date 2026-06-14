import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import FlipbookWrapper from "@/components/FlipbookWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id; // Ex: minha-revista_a1b2c3d4

  // Validação básica de segurança contra Directory Traversal (LFI)
  if (!/^[a-z0-9-_]+$/i.test(id)) {
    notFound();
  }

  const isLocal = process.env.NODE_ENV === "development";
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  let blobUrl = null;

  try {
    if (isLocal && !hasBlobToken) {
      // --- LÓGICA DE BUSCA LOCAL ---
      const localFilePath = path.join(process.cwd(), "public", "uploads", `${id}.pdf`);
      try {
        await fs.access(localFilePath);
        blobUrl = `/uploads/${id}.pdf`;
      } catch (e) {
        // Arquivo não existe
      }
    } else {
      // --- LÓGICA DE BUSCA NA NUVEM (VERCEL BLOB) ---
      // O ID contém a exata chave que usamos para salvar o arquivo (sem o .pdf)
      const { blobs } = await list({
        prefix: `pdfs/${id}.pdf`,
        limit: 1,
      });

      if (blobs.length > 0) {
        blobUrl = blobs[0].url; // Sucesso! Encontramos o PDF sem usar Banco de Dados!
      }
    }
  } catch (error) {
    console.error("Erro ao buscar o documento:", error);
  }

  if (!blobUrl) {
    notFound(); // Se chegou aqui e a URL está vazia, o arquivo não existe!
  }

  return (
    <main className="h-screen w-full bg-transparent flex flex-col items-center justify-center overflow-hidden relative">
      <FlipbookWrapper blobUrl={blobUrl} />
    </main>
  );
}
