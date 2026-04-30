'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { Clock, Activity, BarChart3, FileText, Monitor, Database } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();
  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

// ==================== ORIGEN DE DATOS ====================
  const origenCard = {
    id: 0,
    icon: Database,
    titleEs: 'Origen de Datos',
    titleEn: 'Data Origin',
    descriptionEs: 'Procesos diarios que monitorizan las principales blockchains, complementando datos on-chain con fuentes externas, validaciones internas de wallets y oráculos de terceros para lograr una visibilidad completa y única de cada agente ERC-8004.',
    descriptionEn: 'Daily processes that monitor major blockchains, complementing on-chain data with external sources, internal wallet validations and third-party oracles to achieve complete and unique visibility of every ERC-8004 agent.',
    stats: [
      { labelEs: 'Cadenas monitoreadas', labelEn: 'Chains monitored', value: 'Ethereum, Base, Polygon, BNB Chain, Arbitrum' },
      { labelEs: 'Agentes monitoreados', labelEn: 'Agents monitored', value: '+150.000' },
      { labelEs: 'Apuntadores externos monitoreados', labelEn: 'External pointers monitored', value: '+260.000' },
      { labelEs: 'Wallets monitoreadas', labelEn: 'Wallets monitored', value: '+170.000' }
    ],
    video: '/humi-background.mp4'
  };

  // ==================== PRODUCTOS Y SERVICIOS ====================
  const productCards = [
    { id: 1, icon: Clock, titleEs: 'Índices', titleEn: 'Indices', descriptionEs: 'Ofrecemos índices que evalúan diariamente de forma multi-dimensional los agentes del ecosistema ERC-8004.', descriptionEn: 'We offer indices that evaluate daily in a multi-dimensional way the agents of the ERC-8004 ecosystem.', video: '/humi-background.mp4' },
    { id: 2, icon: Monitor, titleEs: 'Dashboard', titleEn: 'Dashboard', descriptionEs: 'Accede a un panel completo donde podrás buscar cualquier agente, ver su análisis detallado de los diferentes índices y certificaciones.', descriptionEn: 'Access a complete panel where you can search any agent, view its detailed analysis of the different indices and certifications.', video: '/humi-background.mp4' },
    { id: 3, icon: Activity, titleEs: 'API', titleEn: 'API', descriptionEs: 'Consulta en tiempo real la confiabilidad de cualquier agente antes de interactuar integrando cualquiera de nuestros índices y certificaciones.', descriptionEn: 'Check in real time the reliability of any agent before interacting by integrating any of our indices and certifications.', video: '/humi-background.mp4' },
    { id: 4, icon: FileText, titleEs: 'Certificaciones', titleEn: 'Certifications', descriptionEs: 'Próximamente ofreceremos certificaciones oficiales especializadas para el ecosistema ERC-8004.', descriptionEn: 'Coming soon we will offer official specialized certifications for the ERC-8004 ecosystem.', video: '/humi-background.mp4' }
  ];

  return (
    <>
      {/* HERO - Simplificado y más potente */}
      <section className="relative py-24 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4">
            Global Score Agent
          </h1>
          <p className="text-2xl text-zinc-400 max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Confianza verificable para el ecosistema de agentes autónomos en ERC-8004' 
              : 'Verifiable trust for the autonomous agent ecosystem in ERC-8004'}
          </p>
        </div>
      </section>

      {/* SECCIÓN BLANCA PRINCIPAL */}
      <section className="py-20 bg-white text-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Quiénes somos + Origen de Datos */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl font-semibold mb-6">
                {language === 'es' ? '¿Quiénes somos?' : 'Who we are?'}
              </h2>
              <p className="text-lg text-zinc-700 leading-relaxed">
                {language === 'es' 
                  ? 'Global Score Agent es una plataforma independiente especializada en evaluar y certificar la confiabilidad de agentes autónomos bajo el estándar ERC-8004. Nacimos para resolver un problema real del ecosistema: la falta de una fuente objetiva, transparente y actualizada que permita a agentes, desarrolladores y usuarios interactuar con confianza.' 
                  : 'Global Score Agent is an independent platform specialized in evaluating and certifying the reliability of autonomous agents under the ERC-8004 standard. We were born to solve a real problem in the ecosystem: the lack of an objective, transparent and up-to-date source that allows agents, developers and users to interact with confidence.'}
              </p>
            </div>

            <PremiumFlipCard card={origenCard} language={language} isFlipped={flippedCards.has(0)} onFlip={() => toggleFlip(0)} />
          </div>

          {/* Productos y Servicios */}
          <h2 className="text-4xl font-semibold text-center mb-12 text-zinc-900">
            {language === 'es' ? 'Productos y Servicios' : 'Products & Services'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {productCards.map((card) => (
              <PremiumFlipCard key={card.id} card={card} language={language} isFlipped={flippedCards.has(card.id)} onFlip={() => toggleFlip(card.id)} />
            ))}
          </div>

          {/* ==================== SUSCRIPCIONES ==================== */}
          <h2 className="text-4xl font-semibold text-center mb-12 text-zinc-900">
            {language === 'es' ? 'Suscripciones' : 'Subscriptions'}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Free */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col h-full">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="text-zinc-500 mb-8">{language === 'es' ? 'Para exploración inicial' : 'For initial exploration'}</p>
              <div className="space-y-5 text-left flex-1 pb-12">
                <div className="flex justify-between"><span className="text-zinc-600">{language === 'es' ? 'Llamadas por minuto' : 'Calls per minute'}</span><span className="font-medium">5</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">{language === 'es' ? 'Llamadas mensuales' : 'Monthly calls'}</span><span className="font-medium">1.000</span></div>
                <div><span className="text-emerald-500 font-medium">✓</span> {language === 'es' ? 'Dashboard Básico' : 'Basic Dashboard'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Búsqueda básica (Agente, Chain, Índice HUMI)' : 'Basic search (Agent, Chain, HUMI Index)'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Reporte básico de agente' : 'Basic agent report'}</div>
                <div><span className="text-emerald-500 font-medium">✓</span> {language === 'es' ? 'Índice HUMI' : 'HUMI Index'}</div>
              </div>
              <a href="/waitlist" className="mt-12 block w-full py-3 border border-zinc-300 rounded-2xl text-center text-sm font-medium hover:bg-zinc-50">
                {language === 'es' ? 'Lista de Espera' : 'Join Waitlist'}
              </a>
            </div>

            {/* Bronze */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col h-full relative">
              <h3 className="text-2xl font-semibold mb-2">Bronze</h3>
              <p className="text-zinc-500 mb-8">{language === 'es' ? 'Para desarrolladores individuales' : 'For individual developers'}</p>
              <div className="space-y-5 text-left flex-1 pb-12">
                <div className="flex justify-between"><span className="text-zinc-600">{language === 'es' ? 'Llamadas por minuto' : 'Calls per minute'}</span><span className="font-medium">30</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">{language === 'es' ? 'Llamadas mensuales' : 'Monthly calls'}</span><span className="font-medium">5.000</span></div>
                <div><span className="text-emerald-500 font-medium">✓</span> {language === 'es' ? 'Dashboard Avanzado' : 'Advanced Dashboard'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Búsqueda avanzada (Metadata, Tipos de agente)' : 'Advanced search (Metadata, Agent types)'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Reporte avanzado de agente' : 'Advanced agent report'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Agentes favoritos' : 'Favorite agents'}</div>
                <div><span className="text-emerald-500 font-medium">✓</span> {language === 'es' ? 'Índice HUMI + Próximas Certificaciones' : 'HUMI Index + Upcoming Certifications'}</div>
              </div>
              <a href="/waitlist" className="mt-12 block w-full py-3 bg-zinc-900 text-white rounded-2xl text-center text-sm font-medium">
                {language === 'es' ? 'Lista de Espera' : 'Join Waitlist'}
              </a>
            </div>

            {/* Silver */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col h-full">
              <h3 className="text-2xl font-semibold mb-2">Silver</h3>
              <p className="text-zinc-500 mb-8">{language === 'es' ? 'Para equipos y proyectos medianos' : 'For teams and medium projects'}</p>
              <div className="space-y-5 text-left flex-1 pb-12">
                <div className="flex justify-between"><span className="text-zinc-600">{language === 'es' ? 'Llamadas por minuto' : 'Calls per minute'}</span><span className="font-medium">120</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">{language === 'es' ? 'Llamadas mensuales' : 'Monthly calls'}</span><span className="font-medium">10.000</span></div>
                <div><span className="text-emerald-500 font-medium">✓</span> {language === 'es' ? 'Dashboard Avanzado' : 'Advanced Dashboard'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Búsqueda avanzada completa' : 'Full advanced search'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Reporte avanzado + feedback' : 'Advanced report + feedback'}</div>
                <div className="pl-6 text-sm text-zinc-500">• {language === 'es' ? 'Agentes favoritos' : 'Favorite agents'}</div>
                <div><span className="text-emerald-500 font-medium">✓</span> {language === 'es' ? 'Índice HUMI + Próximas Certificaciones' : 'HUMI Index + Upcoming Certifications'}</div>
              </div>
              <a href="/waitlist" className="mt-12 block w-full py-3 border border-zinc-300 rounded-2xl text-center text-sm font-medium hover:bg-zinc-50">
                {language === 'es' ? 'Lista de Espera' : 'Join Waitlist'}
              </a>
            </div>

            {/* Gold */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 flex flex-col h-full">
              <h3 className="text-2xl font-semibold mb-2">Gold</h3>
              <p className="text-zinc-500 mb-8">{language === 'es' ? 'Para empresas y uso intensivo' : 'For enterprises and heavy usage'}</p>
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-zinc-600 leading-relaxed">
                  {language === 'es' 
                    ? 'Contacta nuestro equipo de ventas para ofrecerte la solución personalizada que mejor se adapte a tus necesidades.' 
                    : 'Contact our sales team for a custom solution tailored to your specific needs.'}
                </p>
              </div>
              <a href="/waitlist" className="mt-12 block w-full py-3 border border-zinc-300 rounded-2xl text-center text-sm font-medium hover:bg-zinc-50">
                {language === 'es' ? 'Lista de Espera' : 'Join Waitlist'}
              </a>
            </div>
          </div>

          {/* ==================== DISCLAIMER DE SUSCRIPCIONES ==================== */}
          <div className="text-center mt-8 mb-16">
            <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
              {language === 'es' 
                ? 'Nota: Los límites de uso y costos de los planes están sujetos a cambios y se definirán antes del lanzamiento oficial.' 
                : 'Note: Usage limits and plan pricing are subject to change and will be finalized before official launch.'}
            </p>
          </div>
 
          {/* ==================== ¿POR QUÉ ELEGIRNOS? ==================== */}
          <h2 className="text-4xl font-semibold text-center mb-12 text-zinc-900 mt-24">
            {language === 'es' ? '¿Por qué elegirnos?' : 'Why choose us?'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Tarjeta 1 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h4 className="font-semibold text-xl mb-3">
                {language === 'es' ? 'Transparencia Total' : 'Full Transparency'}
              </h4>
              <p className="text-zinc-600">
                {language === 'es' 
                  ? 'Todos nuestros cálculos, metodologías y datos son públicos, auditables y se actualizan diariamente.' 
                  : 'All our calculations, methodologies and data are public, auditable and updated daily.'}
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h4 className="font-semibold text-xl mb-3">
                {language === 'es' ? 'Confianza Verificable' : 'Verifiable Trust'}
              </h4>
              <p className="text-zinc-600">
                {language === 'es' 
                  ? 'Reducimos drásticamente el riesgo al permitir que agentes y usuarios tomen decisiones basadas en información objetiva y actualizada.' 
                  : 'We dramatically reduce risk by enabling agents and users to make decisions based on objective and up-to-date information.'}
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h4 className="font-semibold text-xl mb-3">
                {language === 'es' ? 'Decisiones Inteligentes' : 'Smart Decisions'}
              </h4>
              <p className="text-zinc-600">
                {language === 'es' 
                  ? 'Tu agente puede consultar en tiempo real el HUMI Score y certificaciones antes de cualquier interacción crítica.' 
                  : 'Your agent can check the HUMI Score and certifications in real time before any critical interaction.'}
              </p>
            </div>
          </div>

          {/* CTA - Con más espacio y texto destacado */}
          <div className="text-center mt-20">
            <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-zinc-900">
              {language === 'es' ? '¿Listo para construir confianza?' : 'Ready to build trust?'}
            </h3>
            <p className="text-xl md:text-2xl font-medium text-zinc-700 max-w-2xl mx-auto leading-tight">
              {language === 'es' 
                ? 'Únete a la lista de espera y sé de los primeros en probar el Dashboard y la API.' 
                : 'Join the waitlist and be among the first to try the Dashboard and API.'}
            </p>
          </div>
        </div>
      </section>
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
    </>
  );
}

// ==================== TARJETA FLIP 3D (CORREGIDA PARA MÓVIL) ====================
function PremiumFlipCard({ card, language, isFlipped, onFlip }: any) {
  return (
    <div 
      onClick={onFlip} 
      className="relative h-[380px] sm:h-80 md:h-96 cursor-pointer group" 
      style={{ perspective: '1500px' }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700 ease-out" 
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
        }}
      >
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover rounded-3xl z-0">
          <source src={card.video} type="video/mp4" />
        </video>

        {/* Frente */}
        <div className="absolute inset-0 z-10 backface-hidden rounded-3xl flex items-center justify-center border border-gold/30 shadow-2xl" 
             style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 100%)' }}>
          <h3 className="text-4xl font-semibold text-white text-center leading-none px-6">
            {language === 'es' ? card.titleEs : card.titleEn}
          </h3>
        </div>

        {/* Reverso - CORREGIDO PARA MÓVIL */}
        <div className="absolute inset-0 z-10 backface-hidden rounded-3xl p-5 sm:p-8 flex flex-col border border-gold/50 shadow-2xl overflow-hidden" 
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 100%)' }}>
          
          <p className="text-zinc-200 text-sm sm:text-base leading-tight sm:leading-relaxed text-center flex-1 overflow-auto">
            {language === 'es' ? card.descriptionEs : card.descriptionEn}
          </p>

          {/* Estadísticas (solo Origen de Datos) */}
          {card.stats && (
            <div className="mt-6 pt-6 border-t border-gold/30 text-xs sm:text-sm">
              <div className="grid grid-cols-1 gap-3">
                {card.stats.map((stat: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-zinc-400">
                      {language === 'es' ? stat.labelEs : stat.labelEn}
                    </span>
                    <span className="font-medium text-amber-300">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}