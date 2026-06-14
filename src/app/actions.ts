"use server";

import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Função auxiliar para criar um slug bonito baseado no nome do arquivo
function createSlug(filename: string) {
  const nameWithoutExt = filename.replace(/\.pdf$/i, "");
  return nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, ""); // Remove hífens sobrando no começo e fim
}

export async function uploadPdfAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("Nenhum arquivo enviado.");
    }
    
    if (file.type !== "application/pdf") {
      throw new Error("O arquivo deve ser um documento PDF.");
    }
    
    const isLocal = process.env.NODE_ENV === "development";
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    // Gerar a nossa "Primary Key" baseada no nome do arquivo (Sem Banco de Dados!)
    const slug = createSlug(file.name) || "documento";
    const shortUuid = crypto.randomUUID().split("-")[0]; // Apenas 8 caracteres de UUID para garantir unicidade
    const documentId = `${slug}_${shortUuid}`;
    const targetFilename = `${documentId}.pdf`;

    let finalUrl = "";

    if (isLocal && !hasBlobToken) {
      // --- LÓGICA DE UPLOAD LOCAL ---
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, targetFilename);
      await fs.writeFile(filePath, buffer);
      
      finalUrl = `/uploads/${targetFilename}`;
      console.log("PDF salvo localmente em:", filePath);
      
    } else {
      // --- LÓGICA DE UPLOAD NUVEM (Vercel Blob) ---
      const blob = await put(`pdfs/${targetFilename}`, file, {
        access: 'public',
        addRandomSuffix: false // Nós mesmos já garantimos a unicidade com o shortUuid
      });
      finalUrl = blob.url;
    }

    // Sucesso Total. Não precisamos mais do Postgres! O ID gerado carrega a identidade do arquivo.
    return { success: true, id: documentId };
    
  } catch (error: any) {
    console.error("Erro na Server Action uploadPdfAction:", error);
    return { 
      success: false, 
      error: error.message || "Ocorreu um erro desconhecido durante o upload." 
    };
  }
}
