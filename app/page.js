'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');
  const [statsCarrito, setStatsCarrito] = useState(null);
  const [statsBarberia, setStatsBarberia] = useState(null);

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      setHora(ahora.toLocaleTimeString('es-CL'));
      setFecha(ahora.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    actualizarHora();
    const timer = setInterval(actualizarHora, 1000);

    const cargarStats = async () => {
      try {
        const [resCarrito, resBarberia] = await Promise.all([
          fetch('https://freyes0519901.pythonanywhere.com/api/carrito/stats'),
          fetch('https://freyes0519901.pythonanywhere.com/api/barberia/stats')
        ]);
        if (resCarrito.ok) setStatsCarrito((await resCarrito.json()).stats);
        if (resBarberia.ok) setStatsBarberia((await resBarberia.json()).stats);
      } catch (e) { console.log('Error:', e); }
    };
    cargarStats();
    const statsTimer = setInterval(cargarStats, 30000);

    return () => { clearInterval(timer); clearInterval(statsTimer); };
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">🎛️ Panel de Control</h1>
        <p className="text-white/70 text-lg capitalize">{fecha}</p>
        <p className="text-4xl md:text-6xl font-mono font-bold text-white mt-4">{hora}</p>
      </header>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <Link href="/carrito" className="block group">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 group-hover:scale-105">
            <div className="text-6xl mb-4">🥪</div>
            <h2 className="text-2xl font-bold text-white mb-2">Sánguchez con Hambre</h2>
            <p className="text-white/80 mb-4">Pedidos y prospectos</p>
            {statsCarrito && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{statsCarrito.preparando || 0}</div>
                  <div className="text-xs opacity-80">Preparando</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{statsCarrito.listos || 0}</div>
                  <div className="text-xs opacity-80">Listos</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{statsCarrito.entregados || 0}</div>
                  <div className="text-xs opacity-80">Entregados</div>
                </div>
              </div>
            )}
          </div>
        </Link>

        <Link href="/barberia" className="block group">
          <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 group-hover:scale-105">
            <div className="text-6xl mb-4">💈</div>
            <h2 className="text-2xl font-bold text-white mb-2">El Galpón de la Barba</h2>
            <p className="text-white/80 mb-4">Citas del día</p>
            {statsBarberia && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{statsBarberia.confirmadas || 0}</div>
                  <div className="text-xs opacity-80">Pendientes</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{statsBarberia.completadas || 0}</div>
                  <div className="text-xs opacity-80">Completadas</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold">{statsBarberia.citas_hoy || 0}</div>
                  <div className="text-xs opacity-80">Total</div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </main>
  );
}
