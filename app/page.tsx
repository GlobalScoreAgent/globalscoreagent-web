'use client';
import { useLanguage } from './contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Clock, Activity, BarChart3, FileText, X, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Home() {  
  const { language } = useLanguage();
  // Estados para el gráfico de crecimiento de agentes
  const [ercData, setErcData] = useState<any[]>([]);
  const [ercLoading, setErcLoading] = useState(true);
  const [ercError, setErcError] = useState<string | null>(null);
    // Estado para el contador total de agentes
  const [ercTotal, setErcTotal] = useState(0);
  const [ercChains, setErcChains] = useState<any[]>([]);
  

  // Fetch de crecimiento de agentes ERC-8004
  useEffect(() => {
    const fetchAgentStats = async () => {
      try {
        const res = await fetch('/api/erc8004/stats');
        const result = await res.json();

        if (result.success && result.data) {
          setErcData(result.data);
        } else {
          setErcError('No se recibieron datos');
        }
      } catch (err) {
        console.error(err);
        setErcError('Error al cargar estadísticas');
      } finally {
        setErcLoading(false);
      }
    };

    fetchAgentStats();
  }, []);

  // Fetch del total de agentes registrados (para el contador animado)
  useEffect(() => {
    const fetchTotalAgents = async () => {
      try {
        const res = await fetch('/api/erc8004/total-agents');
        const result = await res.json();

        if (result.success) {
          setErcTotal(result.total);
        }
      } catch (err) {
        console.error('Error fetching total agents:', err);
      }
    };

    fetchTotalAgents();
  }, []);

    // Fetch de distribución por cadena
  useEffect(() => {
    const fetchChains = async () => {
      try {
        const res = await fetch('/api/erc8004/chains');
        const result = await res.json();
        if (result.success) {
          setErcChains(result.data);
        }
      } catch (err) {
        console.error('Error fetching chains:', err);
      }
    };

    fetchChains();
  }, []);

  // Componente de contador animado con efecto "cayendo"
  function AnimatedCounter({ target, className = "" }: { target: number; className?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 1800; // 1.8 segundos
      const increment = Math.ceil(target / (duration / 16)); // ~60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }, [target]);

    return (
      <span className={className}>
        {count.toLocaleString('es-ES')}
      </span>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* HERO BANNER */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none text-white mb-8">
            {language === 'es' 
              ? <>Certificación y confianza<br />para Agentes IA</> 
              : <>Certification and Trust<br />for AI Agents</>}
          </h1>
          {/* JSON-LD para la página principal */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Global Score Agent",
                "url": "https://globalscoreagent.com",
                "description": "Plataforma de certificación y confianza para agentes autónomos en ERC-8004. HUMI Index es el primer índice objetivo y diario de madurez y confiabilidad.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://globalscoreagent.com/humi?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
          <p className="text-2xl text-zinc-300 max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Monitorizamos, evaluamos, puntuamos y certificamos los agentes autónomos desplegados en la red'
              : 'We monitor, evaluate, score and certify the autonomous agents deployed on the network'}
          </p>
        </div>
      </section>

      {/* CÓMO TRABAJAMOS - Título más grande */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-semibold text-center mb-4 text-zinc-900">
            {language === 'es' ? 'Cómo trabajamos' : 'How we work'}
          </h2>
          <p className="text-center text-xl text-zinc-600 mb-16 max-w-2xl mx-auto">
            {language === 'es' ? 'Nuestra plataforma está diseñada para entregar confianza real y verificable' : 'Our platform is designed to deliver real and verifiable trust'}
          </p>

          <div className="space-y-8">

            {/* Tarjeta 1 - Escaneo en Tiempo Real */}
            <div className="relative rounded-3xl overflow-hidden h-[560px] group">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/scanning-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                <h3 className="text-3xl font-semibold mb-3">
                  {language === 'es' ? 'Escaneo en Tiempo Real' : 'Real-Time Scanning'}
                </h3>
                {/* Texto corto en móvil */}
                <p className="text-base leading-relaxed mb-6 md:hidden">
                  {language === 'es' 
                    ? 'Escaneamos diariamente las principales redes blockchain para capturar en tiempo real el registro, actividad y ejecución de cada agente ERC-8004.'
                    : 'We scan the main blockchain networks daily to capture real-time registration, activity and execution of every ERC-8004 agent.'}
                </p>
                {/* Texto completo en desktop */}
                <p className="text-lg leading-relaxed mb-6 hidden md:block">
                  {language === 'es' 
                    ? 'Escaneamos diariamente las principales redes blockchain (ETH, Base, Polygon, BNB y más) para capturar en tiempo real el registro, actividad y ejecución de cada agente ERC-8004.'
                    : 'We scan the main blockchain networks (ETH, Base, Polygon, BNB and more) daily to capture real-time registration, activity and execution of every ERC-8004 agent.'}
                </p>
              </div>
            </div>

            {/* Tarjeta 2 - Análisis Profundo */}
            <div className="relative rounded-3xl overflow-hidden h-[560px] group">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/deep-analysis-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                <h3 className="text-3xl font-semibold mb-3">
                  {language === 'es' ? 'Análisis Profundo' : 'Deep Analysis'}
                </h3>
                {/* Texto corto en móvil */}
                <p className="text-base leading-relaxed mb-6 md:hidden">
                  {language === 'es' 
                    ? 'Complementamos la información on-chain con datos externos (auditorías, identidad Ensoul, wallets) para crear un perfil completo de cada agente.'
                    : 'We complement on-chain data with external sources (audits, Ensoul identity, wallets) to create a complete profile of each agent.'}
                </p>
                {/* Texto completo en desktop */}
                <p className="text-lg leading-relaxed mb-6 hidden md:block">
                  {language === 'es' 
                    ? 'Complementamos la información on-chain con datos de fuentes externas (auditorías, identidad Ensoul, transacciones de wallets y más) para crear un perfil completo y actualizado de cada agente.'
                    : 'We complement on-chain information with data from external sources (audits, Ensoul identity, wallet transactions and more) to create a complete and updated profile of each agent.'}
                </p>
              </div>
            </div>

            {/* Tarjeta 3 - Evaluación Multidimensional */}
            <div className="relative rounded-3xl overflow-hidden h-[560px] group">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/evaluation-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                <h3 className="text-3xl font-semibold mb-3">
                  {language === 'es' ? 'Evaluación Multidimensional' : 'Multi-Dimensional Evaluation'}
                </h3>
                {/* Texto corto en móvil */}
                <p className="text-base leading-relaxed mb-6 md:hidden">
                  {language === 'es' 
                    ? 'Evaluamos cada agente analizando información declarada, uso frecuente, historial del owner y auditorías internas o externas.'
                    : 'We evaluate each agent analyzing declared information, usage statistics, owner history and internal or external audits.'}
                </p>
                {/* Texto completo en desktop */}
                <p className="text-lg leading-relaxed mb-6 hidden md:block">
                  {language === 'es' 
                    ? 'Evaluamos con un enfoque múltiple a cada agente, analizando la información declarada, estadísticas de uso frecuente, historial del owner y auditorías internas o externas.'
                    : 'We evaluate each agent with a multi-dimensional approach, analyzing declared information, frequent usage statistics, owner history and internal or external audits.'}
                </p>
              </div>
            </div>

            {/* Tarjeta 4 - Certificación (nueva) */}
            <div className="relative rounded-3xl overflow-hidden h-[560px] group">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/certification-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                <h3 className="text-3xl font-semibold mb-3">
                  {language === 'es' ? 'Certificación' : 'Certification'}
                </h3>
                {/* Texto corto en móvil */}
                <p className="text-base leading-relaxed mb-6 md:hidden">
                  {language === 'es' 
                    ? 'Ofrecemos certificados e índices analíticos verificables para entregar información clara y confiable al ecosistema de agentes IA.'
                    : 'We provide verifiable certificates and analytical indexes to deliver clear and reliable information to the AI agents ecosystem.'}
                </p>
                {/* Texto completo en desktop */}
                <p className="text-lg leading-relaxed mb-6 hidden md:block">
                  {language === 'es' 
                    ? 'Ofrecemos certificados e índices analíticos verificables que entregan al ecosistema de agentes IA información clara, confiable y exhaustiva para tomar decisiones y operar con total transparencia.'
                    : 'We provide verifiable certificates and analytical indexes that deliver clear, reliable and exhaustive information to the AI agents ecosystem for decision-making and operations with full transparency.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

            {/* ==================== CONTADOR + CRECIMIENTO DE AGENTES ERC-8004 ==================== */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
        >
          <source src="/erc8004-stats-video.mp4" type="video/mp4" />
        </video>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Contador Animado */}
          <div className="text-center mb-12">
            <p className="text-amber-300 text-sm font-medium tracking-widest mb-3">
              {language === 'es' ? 'AGENTES REGISTRADOS EN ERC-8004' : 'REGISTERED AGENTS IN ERC-8004'}
            </p>
            <AnimatedCounter 
              target={ercTotal} 
              className="text-7xl md:text-8xl font-bold text-white tracking-tighter font-mono"
            />
          </div>

          {/* Gráfico de Crecimiento */}
          <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-8 border border-gold/10 mb-16">
            <h3 className="text-xl font-medium text-white mb-8 text-center">
              {language === 'es' ? 'Agentes Registrados Diariamente' : 'Daily Registered Agents'}
            </h3>

            {ercLoading ? (
              <div className="h-96 flex items-center justify-center text-zinc-400">Cargando datos...</div>
            ) : ercError ? (
              <div className="h-96 flex items-center justify-center text-red-400">{ercError}</div>
            ) : ercData.length > 0 ? (
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={ercData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                  <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#D4AF37" 
                    strokeWidth={1.5} 
                    dot={false}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-96 flex items-center justify-center text-zinc-400">No hay datos disponibles</div>
            )}
          </div>

          {/* Tabla de Distribución por Cadena */}
          <div>
            <h3 className="text-xl font-medium text-white mb-8 text-center">
              {language === 'es' ? 'Distribución Actual por Cadena' : 'Current Distribution by Chain'}
            </h3>
            <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-8 border border-gold/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="text-left py-5 px-6 text-gold font-medium">
                      {language === 'es' ? 'Cadena' : 'Chain'}
                    </th>
                    <th className="text-right py-5 px-6 text-gold font-medium">
                      {language === 'es' ? 'Total Owners' : 'Total Owners'}
                    </th>
                    <th className="text-right py-5 px-6 text-gold font-medium">
                      {language === 'es' ? 'Total Agentes' : 'Total Agents'}
                    </th>
                    <th className="text-right py-5 px-6 text-gold font-medium">
                      {language === 'es' ? 'Agentes Activos' : 'Active Agents'}
                    </th>
                    <th className="text-right py-5 px-6 text-gold font-medium">
                      {language === 'es' ? 'Con Feedbacks' : 'With Feedbacks'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {ercChains.map((chain: any) => (
                    <tr key={chain.chain_name} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-5 px-6 font-medium text-white">{chain.chain_name}</td>
                      <td className="py-5 px-6 text-right font-mono text-amber-300">{chain.owner_total_count.toLocaleString()}</td>
                      <td className="py-5 px-6 text-right font-mono text-white">{chain.agent_total_count.toLocaleString()}</td>
                      <td className="py-5 px-6 text-right font-mono text-emerald-400">{chain.agent_active_count.toLocaleString()}</td>
                      <td className="py-5 px-6 text-right font-mono text-emerald-400">{chain.agent_active_with_feedbacks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
      
      {/* CALL TO ACTION */}
      <section className="py-20 bg-zinc-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-6">
            {language === 'es' ? '¿Listo para certificar tu agente?' : 'Ready to certify your agent?'}
          </h2>
          <a 
            href="/waitlist"
            className="inline-block px-10 py-4 bg-gold hover:bg-amber-400 text-black font-semibold rounded-2xl text-lg transition-all active:scale-95"
          >
            {language === 'es' ? 'Únete a la Lista de Espera' : 'Join the Waitlist'}
          </a>
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
    </main>
  );
}