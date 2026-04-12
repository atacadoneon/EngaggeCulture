import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Engagge Culture — Sistema de Cultura e Engajamento",
  description: "Plataforma de cultura organizacional, gamificacao e fulfillment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
