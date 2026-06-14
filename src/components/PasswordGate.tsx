"use client";

import { useState } from "react";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Layze_gatinhaS2") {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-sm bg-zinc-800/80 backdrop-blur-md p-8 rounded-2xl border border-zinc-700 shadow-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-zinc-700 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Acesso Restrito</h2>
        <p className="text-zinc-400 text-sm">Digite a senha para acessar a área de upload.</p>
      </div>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Senha"
            className={`w-full px-4 py-3 rounded-lg bg-zinc-900/80 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-700 focus:border-zinc-500'} text-zinc-100 focus:outline-none transition-colors placeholder:text-zinc-600`}
          />
          {error && <p className="text-red-400 text-xs mt-2 text-center">Senha incorreta. Tente novamente.</p>}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-zinc-100 text-zinc-900 font-bold rounded-lg hover:bg-white transition-colors mt-2"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
