import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synapse - Sistema RAG Corporativo",
  description: "Sistema inteligente de consulta a documentos corporativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark h-full">
      <body suppressHydrationWarning={true} className={`${inter.className} h-full overflow-hidden`} >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
