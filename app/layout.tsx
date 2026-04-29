import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { LanguageProvider } from "./contexts/LanguageContext";

export const metadata: Metadata = {
  title: {
    default: "Global Score Agent - Certificación y Confianza para Agentes IA",
    template: "%s | Global Score Agent",
  },
  description: "HUMI Index: El primer índice de confianza objetivo y diario para agentes autónomos en ERC-8004. Evaluamos, puntuamos y certificamos con estándares transparentes.",
  keywords: ["ERC-8004", "HUMI Index", "agentes IA", "certificación IA", "trust infrastructure", "AI agents", "Global Score Agent"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-white antialiased">
        <LanguageProvider>
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}