'use client';
import { useLanguage } from '../contexts/LanguageContext';

export default function CertificacionesPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-20">
      <div className="max-w-6xl mx-auto px-6 py-24">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">
            {language === 'es' ? 'Próximas Certificaciones' : 'Upcoming Certifications'}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Ampliamos el ecosistema de confianza para agentes ERC-8004 con nuevas certificaciones especializadas.' 
              : 'We are expanding the trust ecosystem for ERC-8004 agents with new specialized certifications.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          
          {/* CEREX */}
          <div className="group bg-zinc-900/70 border border-gold/30 rounded-3xl overflow-hidden hover:border-gold/50 transition-all">
            <div className="relative h-64 bg-gradient-to-br from-amber-400/10 to-transparent flex items-center justify-center">
              <img 
                src="/certificate-cerex.png" 
                alt="CEREX Seal" 
                className="w-52 h-52 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <div className="inline-block bg-amber-400/10 text-amber-300 text-xs font-medium tracking-widest px-4 py-1.5 rounded-3xl mb-4">
                Q3 2026
              </div>
              <h3 className="text-3xl font-semibold mb-3">CEREX</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                {language === 'es' 
                  ? 'Certificado de Existencia – Validación profunda de que el agente realmente existe y está operativo en la red ERC-8004.' 
                  : 'Certificate of Existence – Deep validation that the agent truly exists and is operational on the ERC-8004 network.'}
              </p>
            </div>
          </div>

          {/* CEROW */}
          <div className="group bg-zinc-900/70 border border-gold/30 rounded-3xl overflow-hidden hover:border-gold/50 transition-all">
            <div className="relative h-64 bg-gradient-to-br from-amber-400/10 to-transparent flex items-center justify-center">
              <img 
                src="/certificate-cerow.png" 
                alt="CEROW Seal" 
                className="w-52 h-52 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-8">
              <div className="inline-block bg-amber-400/10 text-amber-300 text-xs font-medium tracking-widest px-4 py-1.5 rounded-3xl mb-4">
                Q3 2026
              </div>
              <h3 className="text-3xl font-semibold mb-3">CEROW</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                {language === 'es' 
                  ? 'Certificado de Owner – Evaluación detallada del historial, estabilidad y reputación del propietario del agente.' 
                  : 'Certificate of Ownership – Detailed evaluation of the owner’s history, stability and reputation.'}
              </p>
            </div>
          </div>

        </div>

        <div className="text-center mt-16 text-zinc-500 text-sm">
          {language === 'es' 
            ? 'Estas certificaciones estarán disponibles junto con el lanzamiento del Dashboard y la API completa.' 
            : 'These certifications will be available together with the full Dashboard and API launch.'}
        </div>
      </div>

      {/* FOOTER - Actualizado con todas las páginas */}
      <footer className="bg-black text-zinc-400 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Logo + Texto */}
            <div className="flex items-center gap-0">
              <img src="/logo-gsa.png" alt="GSA" className="w-25 h-20" />
              <div>
                <span className="font-semibold text-white text-2xl">Global Score Agent</span>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {language === 'es' 
                    ? 'Infraestructura de Confianza para Agentes IA' 
                    : 'Trust Infrastructure for AI Agents'}
                </p>
              </div>
            </div>

            {/* Navigation - Todas las páginas */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
              <a href="/" className="hover:text-white transition-colors">
                {language === 'es' ? 'Inicio' : 'Home'}
              </a>
              <a href="/about" className="hover:text-white transition-colors">
                {language === 'es' ? 'Quiénes Somos' : 'About Us'}
              </a>
              <a href="/humi" className="hover:text-white transition-colors">
                {language === 'es' ? 'Índice HUMI' : 'HUMI Index'}
              </a>
              <a href="/certificaciones" className="hover:text-white transition-colors">
                {language === 'es' ? 'Productos' : 'Products'}
              </a>
              <a href="/legal" className="hover:text-white transition-colors">
                {language === 'es' ? 'Legal' : 'Legal'}
              </a>
            </div>

            {/* Contacto */}
            <div className="text-right">
              <p className="text-sm mb-2">
                {language === 'es' ? 'Contáctanos' : 'Contact Us'}
              </p>
              <a href="mailto:hello@globalscoreagent.com" className="hover:text-white block">hello@globalscoreagent.com</a>
              <a href="https://x.com/ScoreIAAgent" target="_blank" className="hover:text-white block mt-1">X @ScoreIAAgent</a>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-12 pt-8 text-center text-xs text-zinc-500">
            © 2026 Global Score Agent.{' '}
            {language === 'es' 
              ? 'Todos los derechos reservados.' 
              : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </main>
  );
}