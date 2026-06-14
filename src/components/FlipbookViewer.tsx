"use client";

import React, { useState, forwardRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";

// Configura o Web Worker do PDF.js (essencial para não travar o navegador)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Importa os estilos CSS fundamentais para que as camadas do PDF não quebrem
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface FlipbookViewerProps {
  blobUrl: string;
}

// O componente de página precisa do forwardRef para o react-pageflip manipular no DOM
const PageWrapper = forwardRef<HTMLDivElement, { pageNumber: number; pageWidth?: number }>(
  ({ pageNumber, pageWidth = 450 }, ref) => {
    return (
      <div 
        ref={ref} 
        className="page bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
      >
        {/* Usamos o canvas puro do PDF por desempenho e visual clean */}
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          width={pageWidth} // Largura perfeitamente calculada para a tela
          className="pointer-events-none" 
        />
      </div>
    );
  }
);
PageWrapper.displayName = "PageWrapper";

export default function FlipbookViewer({ blobUrl }: FlipbookViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Estado para controlar o tamanho da tela e definir Single/Double page
  const [windowWidth, setWindowWidth] = useState<number>(1024);
  const [windowHeight, setWindowHeight] = useState<number>(800);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Configura os tamanhos logo que o componente é montado no navegador
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Chamada inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- MATEMÁTICA PARA MÁXIMA OCUPAÇÃO DE TELA (FULLSCREEN) ---
  const A4_RATIO = 1.414;
  let pageWidth = 450;
  let pageHeight = 636;

  if (windowWidth > 0 && windowHeight > 0) {
    const margin = isMobile ? 0 : 60; // Margem de segurança para o desktop não colar nas bordas
    const availableHeight = windowHeight - margin;
    const availableWidth = windowWidth - margin;

    if (isMobile) {
      // Mobile (1 página): a largura dita a altura
      pageWidth = availableWidth;
      pageHeight = pageWidth * A4_RATIO;
    } else {
      // Desktop (2 páginas abertas): Tenta maximizar a altura até bater no teto
      pageHeight = availableHeight;
      pageWidth = pageHeight / A4_RATIO;

      // Mas se o resultado da largura (x2 páginas) for estourar o monitor nas laterais...
      if ((pageWidth * 2) > availableWidth) {
        // ...nós invertemos e usamos a largura máxima permitida como base
        pageWidth = availableWidth / 2;
        pageHeight = pageWidth * A4_RATIO;
      }
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Erro ao carregar PDF:", error);
    setErrorMsg(error.message);
    setIsLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[700px] overflow-hidden">
      {isLoading && !errorMsg && (
        <div className="flex flex-col items-center justify-center animate-pulse">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-600 font-medium">Preparando o Flipbook...</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <p className="font-bold">Falha ao carregar o documento.</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* O componente Document processa o arquivo em background */}
      <div className={`transition-opacity duration-700 ease-in-out ${isLoading || errorMsg ? 'opacity-0 absolute -z-10' : 'opacity-100 py-10 z-10'}`}>
        <Document
          file={blobUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          {numPages > 0 && (
            // @ts-ignore - Tipagens do react-pageflip as vezes falham
            <HTMLFlipBook
              key={isMobile ? "mobile" : "desktop"} // Força o react-pageflip a recriar o livro ao mudar de desktop pra mobile
              width={pageWidth} 
              height={pageHeight} 
              size="fixed"
              usePortrait={isMobile ? true : false} // Mobile = 1 página por vez. Desktop = sempre 2 páginas lado a lado.
              showCover={false} // Remove a física de capa e sobrecapa (o livro já começa aberto)
              mobileScrollSupport={true}
              className="shadow-2xl mx-auto"
              style={{ margin: "0 auto" }}
            >
              {Array.from(new Array(numPages), (el, index) => index + 1).map(pageNum => (
                <PageWrapper 
                  key={`page_${pageNum}`} 
                  pageNumber={pageNum} 
                  pageWidth={pageWidth}
                />
              ))}
            </HTMLFlipBook>
          )}
        </Document>
      </div>
      
      {!isLoading && numPages > 0 && (
        <p className="text-zinc-400 text-sm mt-4">
          Arraste pelas pontas ou clique nas bordas para virar a página.
        </p>
      )}
    </div>
  );
}
