'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Clock, Activity, BarChart3, FileText, X, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function HumiPage() {
  const { language } = useLanguage();
  // Estados para flip cards y modal
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [modalPillar, setModalPillar] = useState<string | null>(null);

  // Estados para datos reales del gráfico
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    // Fetch de datos
  useEffect(() => {
    const fetchMarketIndex = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/humi/market-index');
        const result = await res.json();

        if (result.success && result.data && result.data.length > 0) {
          // Ordenar de más antigua a más reciente
          const sortedData = [...result.data].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          setHistoricalData(sortedData);

          // Mapeo correcto con la nueva tabla
          const dist: any = {};
          sortedData.forEach((item: any) => {
            dist[item.date] = {
              '1-star-count': item['1-star-count'] || 0,
              '1-star-avg': item['1-star-avg'] || 0,
              '2-star-count': item['2-star-count'] || 0,
              '2-star-avg': item['2-star-avg'] || 0,
              '3-star-count': item['3-star-count'] || 0,
              '3-star-avg': item['3-star-avg'] || 0,
              '4-star-count': item['4-star-count'] || 0,
              '4-star-avg': item['4-star-avg'] || 0,
              '5-star-count': item['5-star-count'] || 0,
              '5-star-avg': item['5-star-avg'] || 0,
            };
          });

          setDistributionData(dist);

          // Fecha más reciente por defecto
          setSelectedDate(sortedData[sortedData.length - 1].date);
        } else {
          setError('No se recibieron datos');
        }
      } catch (err: any) {
        console.error('Error fetching HUMI data:', err);
        setError('Error al cargar los datos del servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketIndex();
  }, []);

  const currentDistribution = distributionData[selectedDate] || {};

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleDateClick = (date: string) => {
    console.log('✅ Fecha seleccionada manualmente:', date);
    setSelectedDate(date);
  };

  // ==================== LOS 4 PILARES ====================
  const pillars = [
    {
      id: 1,
      icon: Clock,
      titleEs: 'Historia (H)',
      titleEn: 'History (H)',
      points: '25',
      descriptionEs: 'Evaluación de la antigüedad, portafolio y estabilidad del owner.',
      descriptionEn: 'Evaluation of the owner’s antiquity, portfolio and stability.',
      video: '/history-video.mp4',
      tableTitleEs: 'Historia (H)',
      tableTitleEn: 'History (H)',
      tableData: [
        { blockEs: 'Análisis Wallet Owner', blockEn: 'Wallet Owner Analysis' },
        { itemEs: 'Antigüedad', descEs: 'Cantidad de días desde primera transacción', itemEn: 'Antiquity', descEn: 'Days since first transaction' },
        { itemEs: 'Estado', descEs: 'Tipo de Wallet (Holder/Active) / Total Nonce / Balance Actual', itemEn: 'Status', descEn: 'Wallet type (Holder/Active) / Total Nonce / Current Balance' },
        { itemEs: 'Multi-red', descEs: 'Red donde está desplegada la wallet del Owner', itemEn: 'Multi-chain', descEn: 'Network where the owner wallet is deployed' },
        { blockEs: 'Análisis Portafolio Owner', blockEn: 'Owner Portfolio Analysis' },
        { itemEs: 'Número Agentes', descEs: 'Cantidad de agentes desplegados', itemEn: 'Number of Agents', descEn: 'Number of deployed agents' },
        { itemEs: 'Riqueza Metadata', descEs: 'Calidad de la metadata declarada por los agentes', itemEn: 'Metadata Richness', descEn: 'Quality of metadata declared by the agents' },
        { itemEs: 'Análisis Identidad', descEs: 'Cantidad y calidad de los análisis de identidad efectuados', itemEn: 'Identity Analysis', descEn: 'Quantity and quality of identity analyses' },
        { itemEs: 'Verificación Existencia', descEs: 'Cantidad y calidad de la verificación de existencia', itemEn: 'Existence Verification', descEn: 'Quantity and quality of existence verification' },
        { itemEs: 'Auditorías Externas', descEs: 'Cantidad y calidad de auditorías externas', itemEn: 'External Audits', descEn: 'Quantity and quality of external audits' },
        { itemEs: 'Alertas', descEs: 'Cantidad de agentes con alertas', itemEn: 'Alerts', descEn: 'Number of agents with alerts' },
        { itemEs: 'Actividad', descEs: 'Cantidad y calidad de actividad registrada', itemEn: 'Activity', descEn: 'Quantity and quality of activity' },
        { blockEs: 'Análisis Agente', blockEn: 'Agent Analysis' },
        { itemEs: 'Antigüedad', descEs: 'Cuánto tiempo es el owner del agente', itemEn: 'Antiquity', descEn: 'How long the owner has owned the agent' },
        { itemEs: 'Cambios', descEs: 'Cuántos cambios de owner ha tenido el agente', itemEn: 'Changes', descEn: 'How many owner changes the agent has had' }
      ]
    },
    {
      id: 2,
      icon: Activity,
      titleEs: 'Uso (U)',
      titleEn: 'Usage (U)',
      points: '25',
      descriptionEs: 'Actividad real en los últimos 30 días.',
      descriptionEn: 'Real activity in the last 30 days.',
      video: '/usage-video.mp4',
      tableTitleEs: 'Uso (U)',
      tableTitleEn: 'Usage (U)',
      tableData: [
        { itemEs: 'Actividad Wallet', descEs: 'Análisis basado en nonce/balance últimos 30 días', itemEn: 'Wallet Activity', descEn: 'Analysis based on nonce/balance last 30 days' },
        { itemEs: 'Atestaciones', descEs: 'Cuántas atestaciones declaradas', itemEn: 'Attestations', descEn: 'How many attestations declared' },
        { itemEs: 'Ejecución On-Chain', descEs: 'Cuántas ejecuciones declaradas', itemEn: 'On-Chain Execution', descEn: 'How many executions declared' },
        { itemEs: 'Retroalimentaciones On-Chain', descEs: 'Cuántas retroalimentaciones', itemEn: 'On-Chain Feedbacks', descEn: 'How many feedbacks' },
        { itemEs: 'Actividad Protocolo', descEs: 'Cuántas actividades de protocolo', itemEn: 'Protocol Activity', descEn: 'How many protocol activities' },
        { itemEs: 'Comentarios', descEs: 'Cuántos comentarios declarados', itemEn: 'Comments', descEn: 'How many comments declared' }
      ]
    },
    {
      id: 3,
      icon: BarChart3,
      titleEs: 'Medidas (M)',
      titleEn: 'Measures (M)',
      points: '25',
      descriptionEs: 'Medición real de la calidad y efectividad según fuentes internas y externas.',
      descriptionEn: 'Real measurement of quality and effectiveness.',
      video: '/measures-video.mp4',
      tableTitleEs: 'Medidas (M)',
      tableTitleEn: 'Measures (M)',
      tableData: [
        { itemEs: 'Análisis de Identidad', descEs: 'Análisis externo de identidad', itemEn: 'Identity Analysis', descEn: 'External identity analysis' },
        { itemEs: 'Análisis de Duplicidad', descEs: 'Análisis sobre registros duplicados', itemEn: 'Duplication Analysis', descEn: 'Duplicate record analysis' },
        { itemEs: 'Riqueza de Metadata', descEs: 'Análisis de metadata declarada', itemEn: 'Metadata Richness', descEn: 'Metadata richness analysis' },
        { itemEs: 'Auditorías Externas', descEs: 'Análisis de auditorías externas', itemEn: 'External Audits', descEn: 'External audits analysis' },
        { itemEs: 'Actividad Protocolo', descEs: 'Análisis de actividades de protocolos', itemEn: 'Protocol Activity', descEn: 'Protocol activity analysis' }
      ]
    },
    {
      id: 4,
      icon: FileText,
      titleEs: 'Información (I)',
      titleEn: 'Information (I)',
      points: '25',
      descriptionEs: 'Riqueza de metadata, endpoints y profesionalismo declarado.',
      descriptionEn: 'Richness of metadata, endpoints and declared professionalism.',
      video: '/information-video.mp4',
      tableTitleEs: 'Información (I)',
      tableTitleEn: 'Information (I)',
      tableData: [
        { blockEs: 'Identidad Declarada', blockEn: 'Declared Identity' },
        { itemEs: 'Nombre', descEs: 'Análisis de longitud, formato y validez', itemEn: 'Name', descEn: 'Name analysis' },
        { itemEs: 'Descripción', descEs: 'Análisis de longitud, formato y validez', itemEn: 'Description', descEn: 'Description analysis' },
        { itemEs: 'Imagen', descEs: 'Análisis del formato y validez', itemEn: 'Image', descEn: 'Image analysis' },
        { blockEs: 'Fuentes de Información', blockEn: 'Information Sources' },
        { blockEs: 'Contacto', blockEn: 'Contact' },
        { blockEs: 'Profesionalismo', blockEn: 'Professionalism' }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">HUMI Index</h1>
          {/* JSON-LD específico para HUMI Index */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "HUMI Index",
                "description": "Índice objetivo de confianza y madurez para agentes autónomos en ERC-8004. Evalúa cuatro pilares: Historia, Uso, Medidas e Información.",
                "provider": {
                  "@type": "Organization",
                  "name": "Global Score Agent",
                  "url": "https://globalscoreagent.com"
                }
              })
            }}
          />
          <p className="text-3xl text-zinc-400 max-w-3xl mx-auto">
            {language === 'es' ? 'El estándar de confianza más completo para agentes ERC-8004' : 'The most complete trust standard for ERC-8004 agents'}
          </p>
        </div>
      </section>

      {/* ¿Qué es? */}
      <section className="py-20 bg-white text-zinc-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-semibold mb-8 text-center">
            {language === 'es' ? '¿Qué es?' : 'What is it?'}
          </h2>
          <p className="text-xl text-zinc-600 leading-relaxed mb-12">
            {language === 'es' 
              ? 'Es un índice compuesto de 0 a 100 puntos que evalúa de forma objetiva la confiabilidad, madurez y valor real de un agente autónomo en el ecosistema ERC-8004.'
              : 'It is a composite index from 0 to 100 points that objectively evaluates the reliability, maturity and real value of an autonomous agent in the ERC-8004 ecosystem.'}
          </p>

          <h3 className="text-4xl font-semibold mb-6 text-center">
            {language === 'es' ? '¿Cada cuánto se calcula?' : 'How often is it calculated?'}
          </h3>
          <p className="text-xl text-zinc-600 leading-relaxed mb-12">
            {language === 'es' 
              ? 'El índice se calcula diariamente, permitiendo tener una evaluación actualizada y que refleja el estado actual de cada agente.'
              : 'The index is calculated daily, allowing an updated evaluation that reflects the current state of each agent.'}
          </p>

          <h3 className="text-4xl font-semibold mb-6 text-center">
            {language === 'es' ? '¿Cómo se consulta?' : 'How can it be consulted?'}
          </h3>
          <p className="text-xl text-zinc-600 leading-relaxed">
            {language === 'es' 
              ? 'Puedes acceder por medio de nuestro portal o hacer consultas automatizadas por medio de nuestra API.'
              : 'You can access through our portal or make automated queries through our API.'}
          </p>
        </div>
      </section>

      {/* Los 4 Pilares */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center mb-8">
            {language === 'es' ? 'Los 4 Pilares del HUMI' : 'The 4 Pillars of HUMI'}
          </h2>

          {/* Explicación de los pilares */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-zinc-400 leading-relaxed">
              {language === 'es' 
                ? 'Dividimos el Índice HUMI en cuatro pilares para evaluar de forma multidimensional cada agente autónomo, con énfasis en las dimensiones fundamentales de cualquier agente de IA. Cada pilar está estructurado en tres niveles de madurez — Básico, Intermedio y Avanzado — que reflejan el grado de desarrollo, profesionalismo y robustez del agente.' 
                : 'We divide the HUMI Index into four pillars to evaluate each autonomous agent in a multidimensional way, with emphasis on the fundamental dimensions of any AI agent. Each pillar is structured in three maturity levels — Basic, Intermediate and Advanced — that reflect the agent’s degree of development, professionalism and robustness.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => (
              <PremiumFlipCard
                key={pillar.id}
                pillar={pillar}
                language={language}
                isFlipped={flippedCards.has(pillar.id)}
                onFlip={() => toggleFlip(pillar.id)}
                onShowDetails={() => setModalPillar(pillar)}   // ← Cambiado a pasar el objeto completo
              />
            ))}
          </div>
        </div>1
      </section>

      {/* DISTRIBUCIÓN HISTÓRICA DEL HUMI - Mejores 100 Agentes */}
      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
        >
          <source src="/humi-background.mp4" type="video/mp4" />
        </video>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-semibold text-center mb-16 text-white">
            {language === 'es' ? 'Distribución Histórica del HUMI' : 'HUMI Historical Distribution'}
          </h2>

          <div className="grid md:grid-cols-12 gap-10">
            {/* Gráfico - Mejores 100 Agentes */}
            <div className="md:col-span-8">
              <h3 className="text-xl font-medium text-white mb-6">
                {language === 'es' 
                  ? 'Score Promedio Diario de los Mejores 100 Agentes' 
                  : 'Daily Average Score - Top 100 Agents'}
              </h3>
              <div className="bg-black/30 backdrop-blur-2xl rounded-3xl p-6 border border-gold/10 min-h-[440px]">
                {loading ? (
                  <div className="h-[440px] flex items-center justify-center text-zinc-400">Cargando datos...</div>
                ) : error ? (
                  <div className="h-[440px] flex items-center justify-center text-red-400">{error}</div>
                ) : historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={440}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                      <YAxis 
                        domain={[0, 100]} 
                        stroke="#a1a1aa" 
                        tick={{ fill: '#a1a1aa' }} 
                        label={{ 
                          value: language === 'es' ? 'Índice HUMI' : 'HUMI Index', 
                          angle: -90, 
                          position: 'insideLeft', 
                          fill: '#D4AF37' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#D4AF37" 
                        strokeWidth={3.5} 
                        dot={{ fill: '#D4AF37', r: 5 }}
                        activeDot={{ r: 8, fill: '#D4AF37' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[440px] flex items-center justify-center text-zinc-400">No hay datos disponibles</div>
                )}
              </div>
            </div>

                        {/* Tabla - Distribución por Calidad */}
            <div className="md:col-span-4">
              <h3 className="text-xl font-medium text-white mb-6">
                {language === 'es' ? 'Distribución por Calidad' : 'Quality Distribution'}
              </h3>
              <div className="bg-black/30 backdrop-blur-2xl border border-gold/20 rounded-3xl p-8">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-gold/30 rounded-2xl px-5 py-3 text-white text-base focus:outline-none focus:border-gold mb-8"
                >
                  {historicalData.map((item) => (
                    <option key={item.date} value={item.date}>
                      {item.date}
                    </option>
                  ))}
                </select>

                <div className="space-y-6">
                  {[
                    { stars: 5, color: 'text-amber-300', countKey: '5-star-count', avgKey: '5-star-avg' },
                    { stars: 4, color: 'text-yellow-400', countKey: '4-star-count', avgKey: '4-star-avg' },
                    { stars: 3, color: 'text-amber-400', countKey: '3-star-count', avgKey: '3-star-avg' },
                    { stars: 2, color: 'text-orange-400', countKey: '2-star-count', avgKey: '2-star-avg' },
                    { stars: 1, color: 'text-red-400',   countKey: '1-star-count', avgKey: '1-star-avg' }
                  ].map((item) => {
                    const count = Number(currentDistribution[item.countKey]) || 0;
                    const avg   = Number(currentDistribution[item.avgKey]) || 0;

                    return (
                      <div key={item.stars} className="flex justify-between items-center">
                        <span className={item.color + " text-3xl tracking-widest"}>
                          {'★'.repeat(item.stars)}
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-semibold text-white text-xl">{count.toLocaleString()}</span>
                          <span className="text-xs text-zinc-500 block">({avg.toFixed(1)} avg)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ==================== BANNER PRÓXIMAMENTE ==================== */}
      <section className="py-16 bg-black border-t border-gold/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-r from-zinc-900 to-black border border-gold/30 rounded-3xl p-10 md:p-14 text-center">
            <div className="inline-flex items-center gap-3 bg-amber-400/10 text-amber-300 text-sm font-medium px-6 py-2 rounded-3xl mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
              {language === 'es' ? 'PRÓXIMAMENTE' : 'COMING SOON'}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              {language === 'es' 
                ? 'Dashboard + API Completa' 
                : 'Full Dashboard + API'}
            </h2>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {language === 'es' 
                ? 'En las próximas 2 semanas podrás buscar cualquier agente, ver su análisis completo de los 4 pilares y consultar el HUMI Score en tiempo real mediante API.' 
                : 'In the next 2 weeks you will be able to search any agent, view its full 4-pillar analysis and query the HUMI Score in real time via API.'}
            </p>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                {language === 'es' ? 'Búsqueda avanzada de agentes' : 'Advanced agent search'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                {language === 'es' ? 'Análisis detallado por pilar' : 'Detailed pillar analysis'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                {language === 'es' ? 'API con tu propia clave' : 'API with your own key'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                {language === 'es' ? 'Dashboard personal' : 'Personal dashboard'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EJEMPLO DE ANÁLISIS DE AGENTE - FICHA COMPLETA CON 4 PILARES */}
      <section className="py-24 bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center mb-4 text-white">
            {language === 'es' ? 'Ejemplo de Análisis de Agente' : 'Example Agent Analysis'}
          </h2>
          <p className="text-center text-zinc-400 mb-16 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Así se vería el informe detallado de un agente autónomo con HUMI Score' 
              : 'This is how a detailed report for an autonomous agent with HUMI Score would look'}
          </p>

          {/* Ficha Completa */}
          <div className="bg-black/70 backdrop-blur-3xl border border-gold/30 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-950 to-black p-10 border-b border-gold/20">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-white mb-2">Astro Merkat</h3>
                  <p className="text-amber-300 font-medium text-xl mb-6">(mainnet-22693)</p>
                  
                  <div className="text-zinc-300 leading-relaxed text-[15px] mb-8">
                    {language === 'es' 
                      ? 'A professional astrologer interprets natal charts and planetary alignments to provide personalized guidance, counseling, and predictions about life events to clients. They utilize specialized software to calculate positions, offering insights into personality, relationships, and career, while often acting as a counselor to help clients navigate life challenges.' 
                      : 'A professional astrologer interprets natal charts and planetary alignments to provide personalized guidance, counseling, and predictions about life events to clients. They utilize specialized software to calculate positions, offering insights into personality, relationships, and career, while often acting as a counselor to help clients navigate life challenges.'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                    <div>
                      <span className="text-gold text-xs block mb-1.5">RED</span>
                      <span className="text-white">Ethereum Mainnet</span>
                    </div>
                    <div>
                      <span className="text-gold text-xs block mb-1.5">OWNER</span>
                      <span className="text-white font-mono text-xs break-all">0x0cde4fa309c7143cd35a131b74f08909ee8143df</span>
                    </div>
                    <div>
                      <span className="text-gold text-xs block mb-1.5">WALLET TX</span>
                      <span className="text-white font-mono text-xs break-all">0x0cde4fa309c7143cd35a131b74f08909ee8143df</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-center">
                  <div className="inline-flex flex-col items-center bg-black/60 px-10 py-8 rounded-3xl border border-gold/40">
                    <span className="text-7xl font-bold text-amber-300 tracking-tighter">77</span>
                    <div className="text-xs tracking-[3px] text-amber-300 mt-1">HUMI SCORE</div>
                    <div className="text-[10px] text-zinc-400 mt-5">Actualizado: 21 Abril 2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PILARES */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historia */}
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl p-6 group hover:border-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xl font-semibold text-white">Historia (H)</span>
                      <span className="ml-3 text-amber-300 font-semibold">20/25</span>
                    </div>
                    <button 
                      onClick={() => setModalPillar('historia')}
                      className="text-gold hover:text-amber-400 text-sm font-medium flex items-center gap-1"
                    >
                      {language === 'es' ? 'Más información' : 'More info'} →
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {language === 'es' 
                      ? 'El agente presenta una historia sólida sin cambios de owner desde su despliegue. El propietario tiene un excelente track record y su portafolio muestra buena calidad.' 
                      : 'The agent shows a solid history with no owner changes since deployment. The owner has an excellent track record and its portfolio demonstrates good quality.'}
                  </p>
                </div>

                {/* Uso */}
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl p-6 group hover:border-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xl font-semibold text-white">Uso (U)</span>
                      <span className="ml-3 text-amber-300 font-semibold">17/25</span>
                    </div>
                    <button 
                      onClick={() => setModalPillar('uso')}
                      className="text-gold hover:text-amber-400 text-sm font-medium flex items-center gap-1"
                    >
                      {language === 'es' ? 'Más información' : 'More info'} →
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {language === 'es' 
                      ? 'El agente muestra especialización en su wallet transaccional con actividad positiva en los últimos 30 días. Sin embargo, no registra actividades on-chain significativas.' 
                      : 'The agent shows specialization in its transactional wallet with positive activity in the last 30 days. However, it does not register significant on-chain activities.'}
                  </p>
                </div>

                {/* Medidas */}
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl p-6 group hover:border-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xl font-semibold text-white">Medidas (M)</span>
                      <span className="ml-3 text-amber-300 font-semibold">22/25</span>
                    </div>
                    <button 
                      onClick={() => setModalPillar('medidas')}
                      className="text-gold hover:text-amber-400 text-sm font-medium flex items-center gap-1"
                    >
                      {language === 'es' ? 'Más información' : 'More info'} →
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {language === 'es' 
                      ? 'El agente presenta buenos análisis externos de identidad, duplicación y riqueza de metadata, obteniendo un score promedio favorable.' 
                      : 'The agent presents good external analyses of identity, duplication and metadata richness, achieving a favorable average score.'}
                  </p>
                </div>

                {/* Información */}
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl p-6 group hover:border-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xl font-semibold text-white">Información (I)</span>
                      <span className="ml-3 text-amber-300 font-semibold">23/25</span>
                    </div>
                    <button 
                      onClick={() => setModalPillar('informacion')}
                      className="text-gold hover:text-amber-400 text-sm font-medium flex items-center gap-1"
                    >
                      {language === 'es' ? 'Más información' : 'More info'} →
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {language === 'es' 
                      ? 'El agente cuenta con una información básica excelente, perfiles completos, excelente información de contacto y un registro de madurez bastante robusto.' 
                      : 'The agent has excellent basic information, complete profiles, excellent contact information and a fairly robust maturity record.'}
                  </p>
                </div>
              </div>

            {/* Footer */}
            <div className="bg-black/60 px-10 py-7 flex flex-col md:flex-row items-center justify-between border-t border-gold/20 gap-4">
              <div className="text-xs text-zinc-400">
                {language === 'es' ? 'Certificado por Global Score Agent • ERC-8004 Trust Infrastructure' : 'Certified by Global Score Agent • ERC-8004 Trust Infrastructure'}
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* SECCIÓN FINAL - BENEFICIOS Y CTA */}
      <section className="py-24 bg-black border-t border-gold/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-semibold text-white mb-6">
            {language === 'es' ? '¿Por qué usar el Índice HUMI?' : 'Why use the HUMI Index?'}
          </h2>
          <p className="text-xl text-zinc-400 mb-16 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'El HUMI Index es la herramienta más completa y actualizada para evaluar la confiabilidad real de agentes autónomos en ERC-8004.' 
              : 'The HUMI Index is the most complete and up-to-date tool to evaluate the real reliability of autonomous agents in ERC-8004.'}
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-zinc-950/70 border border-gold/10 rounded-3xl p-8">
              <div className="text-4xl mb-4">🔍</div>
              <h4 className="font-semibold text-xl mb-3 text-white">
                {language === 'es' ? 'Transparencia Total' : 'Full Transparency'}
              </h4>
              <p className="text-zinc-400 text-sm">
                {language === 'es' 
                  ? 'Todos los cálculos son públicos, auditables y se actualizan diariamente.' 
                  : 'All calculations are public, auditable and updated daily.'}
              </p>
            </div>
            <div className="bg-zinc-950/70 border border-gold/10 rounded-3xl p-8">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="font-semibold text-xl mb-3 text-white">
                {language === 'es' ? 'Confianza Verificable' : 'Verifiable Trust'}
              </h4>
              <p className="text-zinc-400 text-sm">
                {language === 'es' 
                  ? 'Reduce el riesgo al interactuar con otros agentes en el ecosistema.' 
                  : 'Reduces risk when interacting with other agents in the ecosystem.'}
              </p>
            </div>
            <div className="bg-zinc-950/70 border border-gold/10 rounded-3xl p-8">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="font-semibold text-xl mb-3 text-white">
                {language === 'es' ? 'Decisiones Inteligentes' : 'Smart Decisions'}
              </h4>
              <p className="text-zinc-400 text-sm">
                {language === 'es' 
                  ? 'Tu agente puede consultar el HUMI Score en tiempo real antes de interactuar.' 
                  : 'Your agent can check the HUMI Score in real time before interacting.'}
              </p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-amber-400/10 to-transparent border border-gold/30 rounded-3xl p-12">
            <h3 className="text-3xl font-semibold text-white mb-4">
              {language === 'es' ? '¿Listo para evaluar tu agente?' : 'Ready to evaluate your agent?'}
            </h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              {language === 'es' 
                ? 'Obtén tu HUMI Score completo y comienza a generar confianza en el ecosistema ERC-8004.' 
                : 'Get your full HUMI Score and start building trust in the ERC-8004 ecosystem.'}
            </p>
            <a 
              href="/waitlist"
              className="inline-block px-10 py-4 bg-gold hover:bg-amber-400 text-black font-semibold rounded-2xl text-lg transition-all active:scale-95"
            >
              {language === 'es' ? 'Únete a la Lista de Espera' : 'Join the Waitlist'}
            </a>
          </div>
        </div>
      </section>

      {/* ==================== MODAL UNIFICADO (Flip Cards + Ficha Ejemplo) ==================== */}
      {modalPillar && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setModalPillar(null)}
        >
          <div 
            className="bg-zinc-900 border border-gold/30 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold/20 px-8 py-6">
              <h3 className="text-3xl font-semibold text-white">
                {modalPillar.tableTitleEs 
                  ? (language === 'es' ? modalPillar.tableTitleEs : modalPillar.tableTitleEn) 
                  : modalPillar === 'historia' ? (language === 'es' ? 'Historia (H)' : 'History (H)') 
                  : modalPillar === 'uso' ? (language === 'es' ? 'Uso (U)' : 'Usage (U)') 
                  : modalPillar === 'medidas' ? (language === 'es' ? 'Medidas (M)' : 'Measures (M)') 
                  : (language === 'es' ? 'Información (I)' : 'Information (I)')}
              </h3>
              <button 
                onClick={() => setModalPillar(null)}
                className="text-4xl text-zinc-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-auto p-8">
              
              {/* === CASO 1: Flip Cards (usa tableData del array pillars) === */}
              {modalPillar.tableData && (
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-900 border-b border-gold/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-gold font-medium w-1/2">Item Analizado</th>
                        <th className="text-left py-4 px-6 text-gold font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {modalPillar.tableData.map((row: any, i: number) => (
                        row.blockEs ? (
                          <tr key={i}>
                            <td colSpan={2} className="py-6 px-6 font-semibold text-lg border-b bg-zinc-900/50">
                              {language === 'es' ? row.blockEs : row.blockEn}
                            </td>
                          </tr>
                        ) : (
                          <tr key={i}>
                            <td className="py-4 px-6 font-medium text-zinc-300">
                              {language === 'es' ? row.itemEs : row.itemEn}
                            </td>
                            <td className="py-4 px-6 text-zinc-400">
                              {language === 'es' ? row.descEs : row.descEn}
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* === CASO 2: Ficha de Ejemplo de Agente (tablas hardcoded) === */}
              {!modalPillar.tableData && modalPillar === 'historia' && (<div className="bg-zinc-950/70 border border-gold/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-900 border-b border-gold/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-gold font-medium w-1/2">Item Analizado</th>
                        <th className="text-left py-4 px-6 text-gold font-medium">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Wallet Owner: Antigüedad' : 'Wallet Owner: Antiquity'}</td><td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Madura → 986 días desde la primera transacción' : 'Mature → 986 days since first transaction'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Wallet Owner: Estado' : 'Wallet Owner: Status'}</td><td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Wallet activa con 500 nonces y balance positivo' : 'Excellent → Active wallet with 500 nonces and positive balance'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Wallet Owner: Multichain' : 'Wallet Owner: Multichain'}</td><td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Sí → Redes: BNB, Ethereum Mainnet' : 'Yes → Networks: BNB, Ethereum Mainnet'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Agentes Desplegados' : 'Owner Portfolio: Deployed Agents'}</td><td className="py-4 px-6 text-white">2</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Riqueza Metadata' : 'Owner Portfolio: Metadata Richness'}</td><td className="py-4 px-6 text-amber-400">{language === 'es' ? 'Promedio → 60.5' : 'Average → 60.5'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Análisis de Identidad' : 'Owner Portfolio: Identity Analysis'}</td><td className="py-4 px-6 text-amber-400">{language === 'es' ? '1 Agente con análisis / Score 70.5' : '1 Agent with analysis / Score 70.5'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Verificación Existencia' : 'Owner Portfolio: Existence Verification'}</td><td className="py-4 px-6 text-amber-400">{language === 'es' ? '2 Agentes verificables / Promedio 50' : '2 Verifiable agents / Average 50'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Auditorías Externas' : 'Owner Portfolio: External Audits'}</td><td className="py-4 px-6 text-amber-400">{language === 'es' ? '1 Agente con auditoría / Score 70%' : '1 Agent with audit / Score 70%'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Warnings' : 'Owner Portfolio: Warnings'}</td><td className="py-4 px-6 text-emerald-400">{language === 'es' ? '0 alertas de spam / 0 bots / 0 auditorías externas' : '0 spam alerts / 0 bots / 0 external audit alerts'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Portafolio Owner: Actividad Protocolo' : 'Owner Portfolio: Protocol Activity'}</td><td className="py-4 px-6 text-amber-400">{language === 'es' ? '3 Agentes con actividad / Promedio 65%' : '3 Agents with activity / Average 65%'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Owner del Agente: Antigüedad' : 'Agent Owner: Antiquity'}</td><td className="py-4 px-6 text-white">{language === 'es' ? '3 Meses' : '3 Months'}</td></tr>
                      <tr><td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Owner del Agente: Cambios' : 'Agent Owner: Changes'}</td><td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Estable → 0 cambios' : 'Stable → 0 changes'}</td></tr>
                    </tbody>
                  </table>
                </div>/* tabla de historia del agente */ )}
              {!modalPillar.tableData && modalPillar === 'uso' && (
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-900 border-b border-gold/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-gold font-medium w-1/2">Item Analizado</th>
                        <th className="text-left py-4 px-6 text-gold font-medium">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">Actividad Wallet Tx</td>
                        <td className="py-4 px-6 text-emerald-400">
                          {language === 'es' 
                            ? 'Excelente → Actividad Nonce: 30 días - 580 / 15 días - 515 / Ayer: 300. Mantiene una actividad positiva general en los últimos 30 días, además mostrando actividad en los deltas 30, 15 y ayer. Además a la fecha actual mantiene un balance positivo.' 
                            : 'Excellent → Nonce Activity: 30 days - 580 / 15 days - 515 / Yesterday: 300. Maintains positive general activity...'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">Actividad On-Chain</td>
                        <td className="py-4 px-6 text-red-400">
                          {language === 'es' 
                            ? 'Mala → No tiene attestations, feedbacks ni actividades. Solo 5 comentarios en 30 días.' 
                            : 'Bad → No attestations, feedbacks or activities. Only 5 comments in 30 days.'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div> /* tabla de uso del agente */ )}
              {!modalPillar.tableData && modalPillar === 'medidas' && (
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-900 border-b border-gold/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-gold font-medium w-1/2">Item Analizado</th>
                        <th className="text-left py-4 px-6 text-gold font-medium">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Análisis de Identidad' : 'Identity Analysis'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Análisis ejecutado por Ensoul. Complejidad de prompt: Elite. Score: 78. Estado Identidad: Madura' : 'Excellent → Analysis executed by Ensoul. Prompt complexity: Elite. Score: 78. Identity Status: Mature'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Análisis de Duplicación' : 'Duplication Analysis'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Buena → No se encontraron agentes duplicados registrados en el entorno ERC-8004.' : 'Good → No duplicate agents found in the ERC-8004 environment.'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Riqueza Metadata' : 'Metadata Richness'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Score 80. Capa Básica de Presencia: Completa / Profundidad de Arquitectura: Excelente / Capa Operacional: Activa' : 'Excellent → Score 80. Basic Presence Layer: Complete / Architecture Depth: Excellent / Operational Layer: Active'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Auditorías Externas' : 'External Audits'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Dos entidades diferentes realizaron auditorías externas y entregaron un score promedio de 70. Sin warnings.' : 'Excellent → Two different entities performed external audits with average score of 70. No warnings.'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Actividad Protocolo' : 'Protocol Activity'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → El agente tiene 15 protocol activities con un score promedio de 70' : 'Excellent → The agent has 15 protocol activities with an average score of 70'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div> /* tabla de medidas del agente */ )}
              {!modalPillar.tableData && modalPillar === 'informacion' && (
                <div className="bg-zinc-950/70 border border-gold/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-900 border-b border-gold/20">
                      <tr>
                        <th className="text-left py-4 px-6 text-gold font-medium w-1/2">Item Analizado</th>
                        <th className="text-left py-4 px-6 text-gold font-medium">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Nombre' : 'Name'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Nombre con buena longitud y validez correcta' : 'Excellent → Name with good length and correct validity'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Descripción' : 'Description'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Descripción con buena longitud y validez correcta' : 'Excellent → Description with good length and correct validity'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Imagen' : 'Image'}</td>
                        <td className="py-4 px-6 text-red-400">{language === 'es' ? 'Mala → Existe pero tiene un tipo de archivo no válido' : 'Bad → Exists but has invalid file type'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Perfiles Información' : 'Information Profiles'}</td>
                        <td className="py-4 px-6 text-amber-400">{language === 'es' ? 'Buena → Tiene perfil on-chain, uri on-chain y perfil externo' : 'Good → Has on-chain profile, uri profile and external profile'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Información Contacto' : 'Contact Information'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Tiene a2a, email y mpc / Falta programmatic' : 'Excellent → Has a2a, email and mpc / Missing programmatic'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-zinc-300">{language === 'es' ? 'Madurez' : 'Maturity'}</td>
                        <td className="py-4 px-6 text-emerald-400">{language === 'es' ? 'Excelente → Tiene declarados skill / oask skills, domains, x402 y capabilities' : 'Excellent → Has declared skill / oask skills, domains, x402 and capabilities'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div> /* tabla de información del agente */ )}

            </div>

            {/* Footer */}
            <div className="border-t border-gold/20 p-6 flex justify-end">
              <button 
                onClick={() => setModalPillar(null)}
                className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-sm transition-colors"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
                   
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

// ==================== PREMIUM FLIP CARD ====================
function PremiumFlipCard({ pillar, language, isFlipped, onFlip, onShowDetails }: any) {
  const Icon = pillar.icon;

  return (
    <div onClick={onFlip} className="relative h-80 cursor-pointer group" style={{ perspective: '1500px' }}>
      <div 
        className="relative w-full h-full transition-transform duration-700 ease-out" 
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
        }}
      >
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover rounded-3xl z-0">
          <source src={pillar.video} type="video/mp4" />
        </video>

        <div className="absolute inset-0 z-10 backface-hidden rounded-3xl flex items-center justify-center border border-gold/30 shadow-2xl" 
             style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 100%)' }}>
          <h3 className="text-4xl font-semibold text-white text-center leading-none px-6">
            {language === 'es' ? pillar.titleEs : pillar.titleEn}
          </h3>
        </div>

        <div className="absolute inset-0 z-10 backface-hidden rounded-3xl p-6 flex flex-col border border-gold/50 shadow-2xl" 
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 100%)' }}>
          <div className="flex justify-between items-start mb-6">
            <Icon className="w-9 h-9 text-gold" />
            <span className="bg-amber-400 text-black font-bold text-2xl px-4 py-1 rounded-2xl leading-none flex items-center">{pillar.points}</span>
          </div>
          <p className="text-zinc-200 text-base leading-relaxed text-center flex-1">
            {language === 'es' ? pillar.descriptionEs : pillar.descriptionEn}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onShowDetails(); }}
            className="mt-auto w-full bg-gold hover:bg-amber-500 text-black font-medium py-3 rounded-3xl text-sm transition-all"
          >
            {language === 'es' ? 'Más información' : 'More details'}
          </button>
        </div>
      </div>
    </div>
  );
}