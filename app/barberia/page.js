'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function CitaCard({ cita, onCambiarEstado, isLoading }) {
  const colores = {
    'Confirmada': 'from-violet-500 to-purple-600',
    'Completada': 'from-green-400 to-emerald-500',
    'No Asistió': 'from-red-400 to-red-600',
  };
  const iconos = { 'Confirmada': '📅', 'Completada': '✅', 'No Asistió': '❌' };

  return (
    <div className={`bg-gradient-to-br ${colores[cita.estado] || colores['Confirmada']} rounded-2xl p-4 text-white shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl font-bold">⏰ {cita.hora}</span>
        <span className="text-3xl">{iconos[cita.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold text-lg">{cita.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cita.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2">✂️ <span>{cita.servicio}</span></div>
      </div>
      <div className="flex gap-2">
        {cita.estado === 'Confirmada' && (
          <>
            <button onClick={() => onCambiarEstado(cita.fila, 'Completada')} disabled={isLoading}
              className="flex-1 bg-white text-green-600 font-bold py-2 rounded-xl disabled:opacity-50">
              {isLoading ? '...' : '✅ Completada'}
            </button>
            <button onClick={() => onCambiarEstado(cita.fila, 'No Asistió')} disabled={isLoading}
              className="bg-white/20 text-white font-bold py-2 px-4 rounded-xl">❌</button>
          </>
        )}
        {cita.estado === 'Completada' && <span className="flex-1 text-center py-2">Atendido ✓</span>}
        {cita.estado === 'No Asistió' && <span className="flex-1 text-center py-2">No se presentó</span>}
      </div>
    </div>
  );
}

export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('Confirmada');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);

  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/citas');
      const data = await res.json();
      if (data.success) { 
        setCitas(data.citas || []); 
        setStats(data.stats || {}); 
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingCita(fila);
    try {
      await fetch(`https://freyes0519901.pythonanywhere.com/api/barberia/cita/${fila}/estado`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setCitas(prev => prev.map(c => c.fila === fila ? { ...c, estado: nuevoEstado } : c));
      setTimeout(cargarCitas, 500);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoadingCita(null); 
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date().toLocaleTimeString('es-CL')), 1000);
    setHora(new Date().toLocaleTimeString('es-CL'));
    cargarCitas();
    const refresh = setInterval(cargarCitas, 15000);
    return () => { clearInterval(timer); clearInterval(refresh); };
  }, [cargarCitas]);

  const citasFiltradas = filtro === 'todos' ? citas : citas.filter(c => c.estado === filtro);

  return (
    <div className="min-h-screen">
      <header className="bg-black/30 sticky top-0 z-50 border-b border-white/10 px-4 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white text-2xl">←</Link>
            <h1 className="text-xl font-bold text-white">💈 El Galpón de la Barba</h1>
          </div>
          <div className="text-3xl font-mono font-bold text-white">{hora}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.confirmadas || 0}</div>
            <div className="text-sm">📅 Pendientes</div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.completadas || 0}</div>
            <div className="text-sm">✅ Completadas</div>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.no_asistio || 0}</div>
            <div className="text-sm">❌ No asistió</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.total || 0}</div>
            <div className="text-sm">📊 Total hoy</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['Confirmada', 'Completada', 'No Asistió', 'todos'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap ${filtro === f ? 'bg-white text-purple-600' : 'bg-white/10 text-white'}`}>
              {f === 'Confirmada' ? '📅 Pendientes' : f === 'todos' ? '📋 Todas' : f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12"><div className="text-6xl animate-bounce">💈</div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citasFiltradas.map(c => (
              <CitaCard key={c.fila} cita={c} onCambiarEstado={cambiarEstado} isLoading={loadingCita === c.fila} />
            ))}
          </div>
        )}
        {!isLoading && citasFiltradas.length === 0 && (
          <div className="text-center text-white/50 py-12">📭 No hay citas</div>
        )}
      </main>
    </div>
  );
}
