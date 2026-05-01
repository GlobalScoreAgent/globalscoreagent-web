// app/components/HeaderWrapper.tsx
// Componente cliente para mostrar/ocultar el Header según la ruta

'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";

export default function HeaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // No mostrar el Header en ninguna ruta del dashboard
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <>
      {!isDashboard && <Header />}
      {children}
    </>
  );
}