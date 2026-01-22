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
    <div className={`bg-gradient-to-br ${colores[cita.estado] || colores['Confirmada']} rounded-2xl p-4 text-white shadow-lg animate-slide-up`}>
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
      if (data.success) { setCitas(data.citas || []); setStats(data.stats || {}); }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingCita(fila);
    try {
      await fetch(`https://freyes0519901.pythonanywhere.com/api/barberia/cita/${fila}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setCitas(prev => prev.map(c => c.fila === fila ? { ...c, estado: nuevoEstado } : c));
      setTimeout(cargarCitas, 500);
    } catch (e) { console.error(e); }
    finally { setLoadingCita(null); }
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
            <Link href="/" className="text-white/70 hover:text-whit
