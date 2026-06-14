import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-zinc-900 font-sans">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl border border-zinc-200 text-center shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Página não encontrada</h1>
        <p className="text-zinc-500 mb-8">
          Ops! Não conseguimos localizar o PDF que você está procurando. Ele pode ter sido apagado ou o link está incorreto.
        </p>

        <Link
          href="/"
          className="inline-block w-full bg-zinc-900 text-white font-medium py-3 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
