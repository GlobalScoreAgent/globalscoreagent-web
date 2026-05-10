// app/(dashboard)/dashboard/components/DataCube.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataCube() {
  const [face, setFace] = useState(0);

  const dataFaces = [
    { label: "Global Score", value: "85.4", detail: "Top 5% Agentes", color: "#facc15" },
    { label: "Seguridad", value: "AAA", detail: "ERC-8004 Verified", color: "#22c55e" },
    { label: "Uptime", value: "99.9%", detail: "Sync en tiempo real", color: "#3b82f6" },
    { label: "Identidad", value: "Verified", detail: "Owner Certificado", color: "#a855f7" }
  ];

  return (
    <div className="flex flex-col items-center gap-6 p-10 bg-zinc-900/50 rounded-[3rem] border border-white/5 backdrop-blur-xl">
      
      {/* El "Dado" (Contenedor de información) */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={face}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl"
            style={{ 
              background: `radial-gradient(circle at top right, ${dataFaces[face].color}20, transparent)`,
              border: `1px solid ${dataFaces[face].color}30`
            }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
              {dataFaces[face].label}
            </span>
            <span className="text-6xl font-black text-white mb-2">
              {dataFaces[face].value}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {dataFaces[face].detail}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles del Dado (4 botones que representan las caras) */}
      <div className="flex gap-3">
        {dataFaces.map((_, i) => (
          <button
            key={i}
            onClick={() => setFace(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              face === i 
              ? 'w-8 bg-white' 
              : 'bg-zinc-700 hover:bg-zinc-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}