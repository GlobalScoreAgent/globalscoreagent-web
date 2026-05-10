// app/(dashboard)/dashboard/components/RoadMapCards.tsx
// Componente RoadMapNavigator - Inspirado en StatsNavigator del dashboard principal
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageContext';

export default function RoadMapCards() {
  const { t, theme, lang } = useLanguage();
  const isDark = theme === 'dark';
  const [currentItem, setCurrentItem] = useState(0);

  const ROADMAP_ITEMS = [
    {
      title: 'CEROW',
      date: 'Q3 2026',
      description: 'Certificación otorgada a cada owner de un agente y valida la confianza y profesionalismo de todo su portafolio',
      descriptionEn: 'Certification granted to each agent owner and validates the trust and professionalism of their entire portfolio',
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
      glowColor: 'rgba(168, 85, 247, 0.6)'
    },
    {
      title: 'CEREX',
      date: 'Q4 2026',
      description: 'Certificación otorgada a cada agente y valida la existencia dentro del ecosistema ERC-8004',
      descriptionEn: 'Certification granted to each agent and validates existence within the ERC-8004 ecosystem',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
      glowColor: 'rgba(59, 130, 246, 0.6)'
    },
  ];

  const current = ROADMAP_ITEMS[currentItem];

  return (
    <div className="flex flex-col h-full">
      {/* Card principal */}
      <motion.div
        key={currentItem}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`flex-1 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm ${
          isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'
        }`}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${current.color}15 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, ${current.color}10 100%)`
            : `linear-gradient(135deg, ${current.color}20 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, ${current.color}15 100%)`,
          boxShadow: isDark
            ? `0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${current.color}35, inset 0 1px 0 rgba(255,255,255,0.1)`
            : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px ${current.color}40, inset 0 1px 0 rgba(255,255,255,0.6)`
        }}
      >
        {/* Elemento decorativo sutil */}
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full"
          style={{
            background: `radial-gradient(circle, ${current.color} 0%, transparent 70%)`,
            transform: 'translate(16px, -16px)'
          }}
        />

        {/* Patrón de puntos sutil */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle, ${current.color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        {/* Líneas decorativas horizontales */}
        <div className="absolute top-4 left-4 right-4 h-px opacity-10" style={{
          background: `linear-gradient(90deg, transparent 0%, ${current.color}30 20%, ${current.color}50 50%, ${current.color}30 80%, transparent 100%)`
        }} />
        <div className="absolute bottom-4 left-4 right-4 h-px opacity-5" style={{
          background: `linear-gradient(90deg, transparent 0%, ${current.color}20 30%, ${current.color}10 70%, transparent 100%)`
        }} />

        {/* Contenido de la card */}
        <div className="flex flex-col h-full justify-center items-center text-center relative z-10">
          {/* Título grande */}
          <h2 className={`text-3xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            {current.title}
          </h2>

          {/* Badge de fecha */}
          <div className="mb-6">
            <span className="text-sm bg-amber-400 text-zinc-950 px-4 py-2 rounded-2xl font-bold tracking-wider">
              {current.date}
            </span>
          </div>

          {/* Descripción completa */}
          <p className={`text-sm leading-relaxed max-w-xs ${
            isDark ? 'text-zinc-300' : 'text-zinc-600'
          }`}>
            {lang === 'es' ? current.description : current.descriptionEn}
          </p>
        </div>
      </motion.div>

      {/* Controles de navegación */}
      <div className="flex justify-center gap-4 mt-4">
        {ROADMAP_ITEMS.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentItem(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentItem === index
                ? 'bg-amber-400 scale-125 shadow-lg'
                : `bg-zinc-600 hover:bg-zinc-500 ${isDark ? 'hover:bg-zinc-400' : 'hover:bg-zinc-500'}`
            }`}
            style={{
              backgroundColor: currentItem === index ? item.color : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
}
