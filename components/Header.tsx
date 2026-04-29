'use client';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../app/contexts/LanguageContext';
import { useState } from 'react';

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 md:py-5 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img 
            src="/logo-gsa.png" 
            alt="Global Score Agent - Certificación y Confianza para Agentes IA"
            className="w-20 h-20 md:w-20 md:h-20 object-contain drop-shadow-md"
          />
          <div>
            <h1 className="font-semibold text-xl md:text-2xl tracking-tight text-zinc-900">Global Score Agent</h1>
            <p className="hidden md:block text-xs text-zinc-500 -mt-0.5">
              {language === 'es' ? 'Infraestructura de Confianza para Agentes IA' : 'Trust Infrastructure for AI Agents'}
            </p>
          </div>
        </div>

        {/* Desktop Menu - Nuevo orden */}
        <nav className="hidden md:flex items-center gap-8 text-base font-medium text-zinc-700">
          <Link href="/" className="hover:text-gold transition-colors">
            {language === 'es' ? 'Inicio' : 'Home'}
          </Link>

          <Link href="/about" className="hover:text-gold transition-colors">
            {language === 'es' ? 'Quiénes Somos' : 'About Us'}
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-gold transition-colors">
              {language === 'es' ? 'Productos' : 'Products'}
              <ChevronDown size={16} />
            </button>

            <div className="absolute hidden group-hover:block pt-3 z-50">
              <div className="bg-white shadow-xl border border-zinc-100 rounded-3xl py-4 px-5 w-64 text-sm">
                <Link href="/humi" className="block px-4 py-3 hover:bg-zinc-50 rounded-2xl">
                  {language === 'es' ? 'Índice HUMI' : 'HUMI Index'}
                </Link>
                <Link href="/certificaciones" className="block px-4 py-3 hover:bg-zinc-50 rounded-2xl">
                  {language === 'es' ? 'Próximas Certificaciones' : 'Upcoming Certifications'}
                </Link>
              </div>
            </div>
          </div> 

          <Link href="/legal" className="hover:text-gold transition-colors">
            {language === 'es' ? 'Legal' : 'Legal'}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4">
            {/* Botón de idioma */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-2xl border border-zinc-300 hover:bg-zinc-100 transition-colors text-xs md:text-sm font-medium text-zinc-700"
            >
              <Globe size={18} />
              <span className="font-semibold">{language.toUpperCase()}</span>
            </button>

            {/* Botón dorado */}
            <Link 
              href="/waitlist"
              className="px-5 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-semibold rounded-2xl text-sm md:text-base transition-all active:scale-95 shadow-lg shadow-amber-500/30 flex items-center gap-2 whitespace-nowrap"
            >
              {language === 'es' ? (
                <>
                  <span className="md:hidden">Únete</span>
                  <span className="hidden md:inline">Únete a la Lista de Espera</span>
                </>
              ) : (
                <>
                  <span className="md:hidden">Join</span>
                  <span className="hidden md:inline">Join Waitlist</span>
                </>
              )}
              <span className="text-lg">→</span>
            </Link>
          </div>
          
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-zinc-700"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU - Nuevo orden */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t py-6 px-6 shadow-lg">
          <div className="flex flex-col gap-6 text-base font-medium text-zinc-900">
            <Link href="/" className="hover:text-gold" onClick={() => setMobileOpen(false)}>
              {language === 'es' ? 'Inicio' : 'Home'}
            </Link>
            
            <Link href="/about" className="hover:text-gold" onClick={() => setMobileOpen(false)}>
              {language === 'es' ? 'Quiénes Somos' : 'About Us'}
            </Link>

            <Link href="/humi" className="hover:text-gold" onClick={() => setMobileOpen(false)}>
              {language === 'es' ? 'Índice HUMI' : 'HUMI Index'}
            </Link>
            
            <Link href="/certificaciones" className="hover:text-gold" onClick={() => setMobileOpen(false)}>
              {language === 'es' ? 'Próximas Certificaciones' : 'Upcoming Certifications'}
            </Link> 

            <Link href="/legal" className="hover:text-gold" onClick={() => setMobileOpen(false)}>
              {language === 'es' ? 'Legal' : 'Legal'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}