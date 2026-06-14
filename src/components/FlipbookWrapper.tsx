"use client";

import dynamic from "next/dynamic";

// Como o react-pdf utiliza APIs do navegador (ex: DOMMatrix) no momento da importação do módulo, 
// precisamos desativar o SSR (Server-Side Rendering) dele a partir de um Client Component.
const FlipbookViewer = dynamic(() => import("@/components/FlipbookViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 border-4 border-zinc-700 border-t-zinc-300 rounded-full animate-spin mb-4"></div>
      <p className="text-zinc-400 font-medium">Iniciando motor do leitor...</p>
    </div>
  ),
});

interface FlipbookWrapperProps {
  blobUrl: string;
}

export default function FlipbookWrapper({ blobUrl }: FlipbookWrapperProps) {
  return <FlipbookViewer blobUrl={blobUrl} />;
}
