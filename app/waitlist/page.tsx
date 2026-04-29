'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

export default function WaitlistPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Algo salió mal');
      }
    } catch {
      setStatus('error');
      setMessage(language === 'es' ? 'Error de conexión' : 'Connection error');
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-20">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tighter mb-4">
            {language === 'es' ? 'Únete a la Lista de Espera' : 'Join the Waitlist'}
          </h1>
          <p className="text-xl text-zinc-400 max-w-md mx-auto">
            {language === 'es' 
              ? 'Sé de los primeros en acceder al Dashboard y la API completa del HUMI Index.' 
              : 'Be among the first to access the full HUMI Index Dashboard and API.'}
          </p>
        </div>

        <div className="bg-zinc-900/70 border border-gold/30 rounded-3xl p-10 backdrop-blur-xl">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-semibold text-amber-300 mb-3">
                {language === 'es' ? '¡Gracias!' : 'Thank you!'}
              </h2>
              <p className="text-zinc-300 text-lg mb-8">{message}</p>
              
              {/* Botón corregido con navegación real */}
              <a
                href="/"
                className="inline-block px-10 py-4 bg-gold hover:bg-amber-400 text-black font-semibold rounded-2xl text-lg transition-all active:scale-95"
              >
                {language === 'es' ? 'Volver al inicio' : 'Back to home'}
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  {language === 'es' ? 'Tu correo electrónico' : 'Your email address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-gold/30 focus:border-gold rounded-2xl px-6 py-5 text-white placeholder-zinc-500 focus:outline-none transition-all"
                  placeholder={language === 'es' ? 'tu@email.com' : 'your@email.com'}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gold hover:bg-amber-400 disabled:bg-zinc-600 text-black font-semibold py-5 rounded-2xl text-xl transition-all active:scale-95"
              >
                {status === 'loading' 
                  ? (language === 'es' ? 'Enviando...' : 'Sending...')
                  : (language === 'es' ? 'Unirme a la lista de espera' : 'Join the waitlist')}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-zinc-500 text-sm mt-8">
          {language === 'es' 
            ? 'Te avisaremos tan pronto como el Dashboard y la API estén disponibles.' 
            : 'We will notify you as soon as the Dashboard and API are ready.'}
        </p>
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
       