// app/layout.tsx
// Layout raíz de toda la aplicación

import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import HeaderWrapper from "./components/HeaderWrapper";

export const metadata: Metadata = {
  title: {
    default: "Global Score Agent - Certificación y Confianza para Agentes IA",
    template: "%s | Global Score Agent",
  },
  description: "HUMI Index: El primer índice de confianza objetivo y diario para agentes autónomos en ERC-8004.",
  keywords: ["ERC-8004", "HUMI Index", "agentes IA", "certificación IA"],
  icons: {
    icon: '/favicon.ico?v=3',
    shortcut: '/favicon.ico?v=3',
    apple: '/favicon.ico?v=3',
  },
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
          <HeaderWrapper>
            {children}
          </HeaderWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}