import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pdf Stylizer",
  description: "Visualizador de PDFs em formato flipbook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-900 text-zinc-100">
        {children}
      </body>
    </html>
  );
}
