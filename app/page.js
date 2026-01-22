'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('dashboard_user');
    if (!userData) { router.push('/login'); return; }
    try { setUser(JSON.parse(userData)); } 
    catch (e) { router.push('/login'); return; }
    setIsLoading(false);

    const actualizarHora = () => {
      const ahora = new Date();
      setHora(ahora.toLocaleTimeString('es-CL'));
      setFecha(ahora.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    actualizarHora();
    const timer = setInterval(actualizarHora, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleLogout = () => { localStorage.removeItem('dashboard_user'); router.push('/login'); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-6xl animate-bounce">🔐</div></div>;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">🎛️ Panel de Control</h1>
        <p className="text-white/70 text-lg capitalize">{fecha}</p>
        <p className="text-4xl md:text-6xl font-mono font-bold text-white mt-4">{hora}</p>
        {user && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-white/60">👤 {user.nombre}</span>
            <button onClick={handleLogout} className="text-white/60 hover:text-white text-sm underline">Cerrar sesión</button>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto">
        {user?.negocio === 'carrito' && (
          <Link href="/carrito" className="block group">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 group-hover:scale-105">
              <div className="text-6xl mb-4">🥪</div>
              <h2 className="text-2xl font-bold text-white mb-2">{user.nombre}</h2>
              <p className="text-white/80 mb-4">Pedidos y prospectos</p>
              <div className="mt-6 flex items-center justify-end text-white/80 group-hover:text-white">
                <span>Abrir dashboard →</span>
              </div>
            </div>
          </Link>
        )}

        {user?.negocio === 'barberia' && (
          <Link href="/barberia" className="block group">
            <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 group-hover:scale-105">
              <div className="text-6xl mb-4">💈</div>
              <h2 className="text-2xl font-bold text-white mb-2">{user.nombre}</h2>
              <p className="text-white/80 mb-4">Citas del día</p>
              <div className="mt-6 flex items-center justify-end text-white/80 group-hover:text-white">
                <span>Abrir dashboard →</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      <footer className="text-center mt-12 text-white/40 text-sm">Dashboard Negocios v1.0</footer>
    </main>
  );
}
