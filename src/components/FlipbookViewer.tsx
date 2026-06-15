"use client";

import React, { useState, forwardRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";

// Worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FlipbookViewerProps {
  blobUrl: string;
}

// O componente de página precisa do forwardRef para o react-pageflip manipular no DOM
const PageWrapper = forwardRef<HTMLDivElement, { pageNumber: number; pageWidth?: number }>(
  ({ pageNumber, pageWidth = 450 }, ref) => {
    return (
      <div 
        ref={ref} 
        className="page bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] flex flex-col"
        data-density="soft"
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
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    // Configura os tamanhos logo que o componente é montado no navegador
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
      // Usa a proporção da tela:
      // Tela em pé (9:16) = 1 página | Tela deitada (16:9) = 2 páginas
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    handleResize(); // Chamada inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detecta se é um dispositivo com tela pequena (celular/tablet), independente da orientação
  const isSmallDevice = Math.min(windowWidth, windowHeight) < 900;

  // --- MATEMÁTICA PARA MÁXIMA OCUPAÇÃO DE TELA (FULLSCREEN) ---
  const A4_RATIO = 1.414;
  let pageWidth = 450;
  let pageHeight = 636;

  if (windowWidth > 0 && windowHeight > 0) {
    if (isPortrait) {
      // === MODO RETRATO (1 página) ===
      const marginHeight = 220; // Espaço para rodapé + modal
      const marginWidth = 40;   // Respiro lateral mínimo
      const availableHeight = windowHeight - marginHeight;
      const availableWidth = windowWidth - marginWidth;

      pageWidth = availableWidth;
      pageHeight = pageWidth * A4_RATIO;
      
      if (pageHeight > availableHeight) {
        pageHeight = availableHeight;
        pageWidth = pageHeight / A4_RATIO;
      }
    } else {
      // === MODO PAISAGEM (2 páginas) ===
      // Celular deitado: fullscreen absoluto, zero margem
      // Desktop: margem confortável para o modal e texto
      const marginHeight = isSmallDevice ? 10 : 100;
      const marginWidth = isSmallDevice ? 10 : 100;
      const availableHeight = windowHeight - marginHeight;
      const availableWidth = windowWidth - marginWidth;

      // Maximiza pela altura primeiro
      pageHeight = availableHeight;
      pageWidth = pageHeight / A4_RATIO;

      // Se estourar a largura (2 páginas), recalcula pela largura
      if ((pageWidth * 2) > availableWidth) {
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
    <div className={`w-full h-full flex flex-col items-center overflow-hidden ${
      isPortrait ? 'justify-start pt-4' : 'justify-center'
    }`}>
      {isLoading && !errorMsg && (
        <div className="flex flex-col items-center justify-center animate-pulse mt-20">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-600 font-medium">Preparando o Flipbook...</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mt-20">
          <p className="font-bold">Falha ao carregar o documento.</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* O componente Document processa o arquivo em background */}
      <div className={`transition-opacity duration-700 ease-in-out w-full flex justify-center ${isLoading || errorMsg ? 'opacity-0 absolute -z-10' : 'opacity-100 flex items-center justify-center z-10'}`}>
        <Document
          file={blobUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          {numPages > 0 && (
            // @ts-ignore - Tipagens do react-pageflip as vezes falham
            <HTMLFlipBook
              key={isPortrait ? "portrait" : "landscape"} // Força recriação ao rotacionar
              width={pageWidth} 
              height={pageHeight} 
              size="fixed"
              usePortrait={isPortrait} // Retrato = 1 página. Paisagem = 2 páginas.
              showCover={false}
              mobileScrollSupport={isPortrait} // Desativa scroll no modo paisagem para não bugar
              swipeDistance={30}
              flippingTime={800}
              maxShadowOpacity={0.5}
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
      
      {/* Rodapé: Instrução + Modal (apenas no modo retrato / em pé) */}
      {!isLoading && numPages > 0 && isPortrait && (
        <div className="mt-6 flex flex-col items-center justify-center z-10 w-full px-4">
          <p className="text-zinc-400 text-sm text-center mb-4">
            Arraste pelas pontas ou clique nas bordas para virar a página.
          </p>

          {/* Modal / Assinatura (Versão Retrato - Embaixo do aviso) */}
          <div className="flex flex-col items-center justify-center bg-zinc-900/80 p-4 rounded-xl backdrop-blur-md shadow-lg border border-zinc-800 w-full max-w-sm">
            <div className="bg-white rounded-lg mb-2 w-full flex justify-center items-center overflow-hidden" style={{ height: '70px' }}>
              <img src="/belasartes.png" alt="Belas Artes" className="h-full object-contain scale-[2.2]" />
            </div>
            <p className="text-zinc-300 text-xs text-center font-medium">Elaborado por: Ludmyla Azevedo Rocha</p>
          </div>
        </div>
      )}

      {/* Instrução + Modal Desktop (paisagem em tela grande - NÃO aparece em celular deitado) */}
      {!isLoading && numPages > 0 && !isPortrait && !isSmallDevice && (
        <div className="mt-4 text-center z-10">
          <p className="text-zinc-400 text-sm">
            Arraste pelas pontas ou clique nas bordas para virar a página.
          </p>
        </div>
      )}

      {/* Modal / Assinatura (Apenas Desktop - Canto Esquerdo) */}
      {!isLoading && numPages > 0 && !isPortrait && !isSmallDevice && (() => {
        const bookTotalWidth = pageWidth * 2;
        const gapLeft = (windowWidth - bookTotalWidth) / 2;
        const modalScale = Math.min(1, Math.max(0.5, (gapLeft - 20) / 280));
        if (gapLeft < 80) return null;
        return (
          <div
            className="absolute bottom-8 left-4 flex flex-col items-center z-50 pointer-events-none bg-zinc-900/80 p-5 rounded-2xl backdrop-blur-md shadow-2xl border border-zinc-700/50"
            style={{
              transformOrigin: 'bottom left',
              transform: `scale(${modalScale})`,
              maxWidth: `${gapLeft - 30}px`,
            }}
          >
            <div className="bg-white rounded-xl mb-3 flex justify-center items-center overflow-hidden" style={{ width: '260px', height: '100px' }}>
              <img src="/belasartes.png" alt="Belas Artes" className="h-full object-contain scale-[2.5]" />
            </div>
            <p className="text-zinc-300 text-sm font-medium">
              Elaborado por: Ludmyla Azevedo Rocha
            </p>
          </div>
        );
      })()}
    </div>
  );
}
