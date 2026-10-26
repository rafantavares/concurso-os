import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { FocusProvider } from "@/context/FocusContext";
import { FocusController } from "@/components/focus/FocusController";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConcursoOS - Plataforma de Estudo Inteligente",
  description: "Plataforma adaptativa e inteligente para aprovação em concursos públicos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full w-full overflow-x-hidden flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-indigo-500/15 selection:text-indigo-950">
        <FocusProvider>
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden">{children}</main>
          <FocusController />
        </FocusProvider>
      </body>
    </html>
  );
}
