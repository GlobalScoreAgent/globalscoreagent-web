// app/(dashboard)/dashboard/components/CertificationsReel.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageContext';

export default function CertificationsReel() {
  const { t, theme, lang } = useLanguage();
  const isDark = theme === 'dark';

  const CERTS = [
    {
      image: '/certificate-cerow.png',
      title: 'CEROW',
      date: 'Q3 2026',
      description: 'Certificación otorgada a cada owner de un agente y valida la confianza y profesionalismo de todo su portafolio',
      descriptionEn: 'Certification granted to each agent owner and validates the trust and professionalism of their entire portfolio'
    },
    {
      image: '/certificate-cerex.png',
      title: 'CEREX',
      date: 'Q4 2026',
      description: 'Certificación otorgada a cada agente y valida la existencia dentro del ecosistema ERC-8004',
      descriptionEn: 'Certification granted to each agent and validates existence within the ERC-8004 ecosystem'
    },
  ];

  const REEL_ITEMS = [...CERTS, ...CERTS, ...CERTS];

  return (
    <div className={`w-full p-6 overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
      <div className="flex justify-end items-end mb-4">
        <span className="text-xs bg-amber-400 text-zinc-950 px-3 py-1.5 rounded-3xl font-bold tracking-widest">
          COMING SOON
        </span>
      </div>

        <div className="relative">
          <motion.div 
            className="flex gap-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              ease: "linear", 
              duration: 35, 
              repeat: Infinity 
            }}
          >
            {REEL_ITEMS.map((cert, index) => (
              <div
                key={index}
                className={`w-80 flex-shrink-0 relative rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-105 group
                  ${isDark
                    ? 'bg-zinc-900/80 border border-zinc-700 backdrop-blur-xl'
                    : 'bg-white/70 border border-zinc-200 backdrop-blur-xl'}`}
              >
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-auto object-contain"
                />

                <div className="absolute top-6 right-6 bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-1.5 rounded-3xl shadow-lg">
                  {cert.date}
                </div>

                {/* Tooltip que aparece en hover */}
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6`}>
                  <p className="text-white text-sm text-center leading-relaxed">
                    {lang === 'es' ? cert.description : cert.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
    </div>
  );
}
