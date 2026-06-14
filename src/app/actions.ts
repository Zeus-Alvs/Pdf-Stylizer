"use server";

import { put } from "@vercel/blob";
import { getDbPool } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function uploadPdfAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("Nenhum arquivo enviado.");
    }
    
    if (file.type !== "application/pdf") {
      throw new Error("O arquivo deve ser um documento PDF.");
    }

    let finalUrl = "";
    
    // Verifica se estamos em localhost E se NÃO temos o token do Vercel Blob
    const isLocal = process.env.NODE_ENV === "development";
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (isLocal && !hasBlobToken) {
      // --- LÓGICA DE UPLOAD LOCAL (Sem precisar da Vercel) ---
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Gera um nome único para não sobrescrever arquivos
      const uniqueName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
      
      // O Next.js serve arquivos estáticos de dentro da pasta "public"
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Cria a pasta "public/uploads" se ela não existir
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, uniqueName);
      
      // Salva fisicamente o arquivo no seu computador
      await fs.writeFile(filePath, buffer);
      
      // A URL de acesso será a rota relativa
      finalUrl = `/uploads/${uniqueName}`;
      console.log("PDF salvo localmente em:", filePath);
      
    } else {
      // --- LÓGICA DE UPLOAD NUVEM (Vercel Blob) ---
      const blob = await put(`pdfs/${file.name}`, file, {
        access: 'public',
      });
      finalUrl = blob.url;
    }

    // 2. Registro no Banco de Dados Postgres (Local ou Vercel)
    const pool = getDbPool();
    const result = await pool.query(
      "INSERT INTO documents (title, blob_url) VALUES ($1, $2) RETURNING id",
      [file.name, finalUrl]
    );

    const newDocId = result.rows[0].id;

    // 3. Retorna o ID
    return { success: true, id: newDocId };
    
  } catch (error: any) {
    console.error("Erro na Server Action uploadPdfAction:", error);
    return { 
      success: false, 
      error: error.message || "Ocorreu um erro desconhecido durante o upload." 
    };
  }
}
