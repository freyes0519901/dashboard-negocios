'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function PedidoCard({ pedido, onCambiarEstado, isLoading }) {
  const colores = {
    'Preparando': 'from-yellow-400 to-orange-500',
    'Listo': 'from-green-400 to-emerald-500',
    'Entregado': 'from-gray-400 to-gray-500',
  };
  const iconos = { 'Preparando': '👨‍🍳', 'Listo': '✅', 'Entregado': '📦' };

  return (
    <div className={`bg-gradient-to-br ${colores[pedido.estado] || colores['Preparando']} rounded-2xl p-4 text-white shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl font-bold">#{pedido.numero}</span>
        <span className="text-3xl">{iconos[pedido.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{pedido.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {pedido.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="text-sm">🛒 {pedido.items}</div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold">{pedido.total}</span>
      </div>
      <div className="flex gap-2">
        {pedido.estado === 'Preparando' && (
          <button onClick={() => onCambiarEstado(pedido.fila, 'Listo')} disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-2 rounded-xl disabled:opacity-50">
            {isLoading ? '...' : '✅ Listo'}
          </button>
        )}
        {pedido.estado === 'Listo' && (
          <button onClick={() => onCambiarEstado(pedido.fila, 'Entregado')} disabled={isLoading}
            className="flex-1 bg-white text-blue-600 font-bold py-2 rounded-xl disabled:opacity-50">
            {isLoading ? '...' : '📦 Entregar'}
          </button>
        )}
        {pedido.estado === 'Entregado' && <span className="flex-1 text-center py-2">Completado ✓</span>}
      </div>
    </div>
  );
}

export default function CarritoDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('activos');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('dashboard_user');
    if (!userData) { router.push('/login'); return; }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.negocio !== 'carrito') { router.push('/login'); return; }
      setUser(parsed);
    } catch (e) { router.push('/login'); }
  }, [router]);

  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/pedidos');
      const data = await res.json();
      if (data.success) { setPedidos(data.pedidos || []); setStats(data.stats || {}); }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingPedido(fila);
    try {
      await fetch(`https://freyes0519901.pythonanywhere.com/api/carrito/pedido/${fila}/estado`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setPedidos(prev => prev.map(p => p.fila === fila ? { ...p, estado: nuevoEstado } : p));
      setTimeout(cargarPedidos, 500);
    } catch (e) { console.error(e); }
    finally { setLoadingPedido(null); }
  };

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date().toLocaleTimeString('es-CL')), 1000);
    setHora(new Date().toLocaleTimeString('es-CL'));
    cargarPedidos();
    const refresh = setInterval(cargarPedidos, 10000);
    return () => { clearInterval(timer); clearInterval(refresh); };
  }, [cargarPedidos]);

  const pedidosFiltrados = filtro === 'activos' 
    ? pedidos.filter(p => p.estado === 'Preparando' || p.estado === 'Listo')
    : filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  const handleLogout = () => { localStorage.removeItem('dashboard_user'); router.push('/login'); };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="text-6xl animate-bounce">🔐</div></div>;

  return (
    <div className="min-h-screen">
      <header className="bg-black/30 sticky top-0 z-50 border-b border-white/10 px-4 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white text-2xl">←</Link>
            <div>
