// app/(dashboard)/dashboard/humi/components/CertificationsReel.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CERTS = [
  { title: "AI Integrity Expert", level: "Lvl 5", color: "#fef08a", icon: "💎" },
  { title: "ERC-8004 Auditor", level: "Lvl 4", color: "#facc15", icon: "🛡️" },
  { title: "Neural Reputation", level: "Lvl 3", color: "#eab308", icon: "🧠" },
  { title: "Agentic Logic", level: "Lvl 5", color: "#f97316", icon: "🤖" },
  { title: "Blockchain Oracle", level: "Lvl 4", color: "#ef4444", icon: "🔗" },
];

// Duplicamos los items para crear el efecto de bucle infinito perfecto
const REEL_ITEMS = [...CERTS, ...CERTS];

export default function CertificationsReel() {
  return (
    <div className="w-full py-10 bg-[#09090b] overflow-hidden group">
      <div className="mb-6 px-8 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Próximos Lanzamientos</h3>
          <p className="text-zinc-500 text-sm font-medium">Certificaciones de Reputación 2026</p>
        </div>
        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 font-bold tracking-widest uppercase">
          Coming Soon
        </span>
      </div>

      {/* Contenedor del Carrete */}
      <div className="relative flex">
        <motion.div 
          className="flex gap-6 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            ease: "linear", 
            duration: 25, 
            repeat: Infinity 
          }}
          // Pausa la animación al pasar el mouse
          whileHover={{ transition: { duration: 60 } }} 
        >
          {REEL_ITEMS.map((cert, index) => (
            <div 
              key={index}
              className="w-72 h-44 flex-shrink-0 relative rounded-3xl p-6 bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden group/card hover:border-white/20 transition-all duration-500"
            >
              {/* Resplandor de fondo según el color de la cert */}
              <div 
                className="absolute -right-10 -top-10 w-32 h-32 blur-[60px] opacity-20 transition-opacity group-hover/card:opacity-40"
                style={{ backgroundColor: cert.color }}
              />

              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-3xl">{cert.icon}</span>
                  <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
                    {cert.level}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-zinc-100 group-hover/card:text-white transition-colors">
                    {cert.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-700 w-1/3" />
                    </div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Draft</span>
                  </div>
                </div>
              </div>

              {/* Efecto de cristal reflectante */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Sombreado lateral para suavizar la entrada y salida de las tarjetas */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#09090b] to-transparent pointer-events-none z-20" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#09090b] to-transparent pointer-events-none z-20" />
    </div>
  );
}