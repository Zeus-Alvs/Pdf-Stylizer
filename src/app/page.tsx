import UploadForm from "@/components/UploadForm";
import PasswordGate from "@/components/PasswordGate";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-zinc-100 font-sans">
      <PasswordGate>
        {/* Container Principal com Glassmorphism (efeito vidro escuro) */}
        <div className="w-full max-w-2xl bg-zinc-800/80 backdrop-blur-md p-10 rounded-2xl border border-zinc-700 shadow-2xl">
          
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">PdfStylizer</h1>
            <p className="text-zinc-400 text-lg">
              Faça upload do seu PDF e transforme-o instantaneamente. Simples, minimalista e rápido.
            </p>
          </div>

          {/* Componente Client-side do Formulário e Drag & Drop */}
          <UploadForm />
          
        </div>
      </PasswordGate>
    </main>
  );
}
