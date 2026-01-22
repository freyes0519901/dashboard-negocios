'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function PedidoCard({ pedido, onCambiarEstado, isLoading, isNew }) {
  const colores = {
    'Preparando': 'from-yellow-400 to-orange-500',
    'Listo': 'from-green-400 to-emerald-500',
    'Entregado': 'from-gray-400 to-gray-500',
  };
  const iconos = { 'Preparando': '👨‍🍳', 'Listo': '✅', 'Entregado': '📦' };

  return (
    <div className={`bg-gradient-to-br ${colores[pedido.estado] || colores['Preparando']} rounded-2xl p-4 text-white shadow-lg ${isNew ? 'animate-pulse ring-4 ring-white' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl font-bold">#{pedido.numero}</span>
        <div className="flex items-center gap-2">
          {isNew && <span className="bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded-full animate-bounce">NUEVO!</span>}
          <span className="text-3xl">{iconos[pedido.estado]}</span>
        </div>
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
            className="flex-1 bg-white text-green-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '...' : '✅ Listo'}
          </button>
        )}
        {pedido.estado === 'Listo' && (
          <button onClick={() => onCambiarEstado(pedido.fila, 'Entregado')} disabled={isLoading}
            className="flex-1 bg-white text-blue-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newPedidoIds, setNewPedidoIds] = useState(new Set());
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const audioContextRef = useRef(null);
  const previousPedidosRef = useRef([]);

  // Marcar como montado (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para reproducir sonido
  const playSound = useCallback(() => {
    if (typeof window === 'undefined' || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      
      // Primer beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 800;
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);

      // Segundo beep
      setTimeout(() => {
        if (!audioContextRef.current) return;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
      }, 150);

      // Tercer beep
      setTimeout(() => {
        if (!audioContextRef.current) return;
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.frequency.value = 1200;
        osc3.type = 'sine';
        gain3.gain.setValueAtTime(0.3, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc3.start(ctx.currentTime);
        osc3.stop(ctx.currentTime + 0.3);
      }, 300);

      // Vibrar en móviles
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (e) {
      console.error('Error reproduciendo sonido:', e);
    }
  }, []);

  // Habilitar sonido
  const handleEnableSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setSoundEnabled(true);
      setTimeout(playSound, 100);
    } catch (e) {
      console.error('Error habilitando sonido:', e);
    }
  }, [playSound]);

  // Verificar autenticación
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const userData = localStorage.getItem('dashboard_user');
    if (!userData) { 
      router.push('/login'); 
      return; 
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.negocio !== 'carrito') { 
        router.push('/login'); 
        return; 
      }
      setUser(parsed);
    } catch (e) { 
      router.push('/login'); 
    }
  }, [router]);

  // Cargar pedidos y detectar nuevos
  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/pedidos');
      const data = await res.json();
      
      if (data.success) {
        const nuevosPedidos = data.pedidos || [];
        const nuevosStats = data.stats || {};
        
        // Detectar nuevos pedidos
        const previousIds = new Set(previousPedidosRef.current.map(p => `${p.fila}-${p.numero}`));
        const currentIds = nuevosPedidos.map(p => `${p.fila}-${p.numero}`);
        const pedidosNuevos = currentIds.filter(id => !previousIds.has(id));
        
        if (pedidosNuevos.length > 0 && previousPedidosRef.current.length > 0) {
          console.log('🔔 NUEVOS PEDIDOS:', pedidosNuevos.length);
          
          if (soundEnabled) {
            playSound();
          }
          
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
          
          setNewPedidoIds(new Set(pedidosNuevos));
          setTimeout(() => setNewPedidoIds(new Set()), 10000);
          
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🥪 ¡Nuevo Pedido!', {
              body: `${pedidosNuevos.length} nuevo(s) pedido(s)`,
              tag: 'nuevo-pedido'
            });
          }
        }
        
        previousPedidosRef.current = nuevosPedidos;
        setPedidos(nuevosPedidos);
        setStats(nuevosStats);
      }
    } catch (e) { 
      console.error('Error cargando pedidos:', e); 
    } finally { 
      setIsLoading(false);
      setCountdown(10);
    }
  }, [playSound, soundEnabled]);

  // Cambiar estado de pedido
  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingPedido(fila);
    try {
      await fetch(`https://freyes0519901.pythonanywhere.com/api/carrito/pedido/${fila}/estado`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setPedidos(prev => prev.map(p => p.fila === fila ? { ...p, estado: nuevoEstado } : p));
      setTimeout(cargarPedidos, 500);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoadingPedido(null); 
    }
  };

  // Solicitar permiso de notificaciones
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Reloj y auto-refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timerReloj = setInterval(() => {
      setHora(new Date().toLocaleTimeString('es-CL'));
    }, 1000);
    setHora(new Date().toLocaleTimeString('es-CL'));
    
    cargarPedidos();
    
    const refreshInterval = setInterval(cargarPedidos, 10000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 10 : prev - 1);
    }, 1000);
    
    return () => { 
      clearInterval(timerReloj); 
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [cargarPedidos]);

  const pedidosFiltrados = filtro === 'activos' 
    ? pedidos.filter(p => p.estado === 'Preparando' || p.estado === 'Listo')
    : filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  const handleLogout = () => { 
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user'); 
    }
    router.push('/login'); 
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-6xl animate-bounce">🥪</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
      {/* Alerta de nuevo pedido */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 px-6 text-center font-bold text-lg z-[100] animate-pulse shadow-2xl">
          🔔 ¡NUEVO PEDIDO! 🔔
        </div>
      )}

      <header className="bg-black/30 sticky top-0 z-50 border-b border-white/10 px-4 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white text-2xl">←</Link>
            <div>
              <h1 className="text-xl font-bold text-white">🥪 {user.nombre}</h1>
              <button onClick={handleLogout} className="text-white/50 text-xs hover:text-white">Cerrar sesión</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Botón de sonido */}
            <button 
              onClick={handleEnableSound}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                soundEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-yellow-400 text-black animate-pulse'
              }`}
            >
              {soundEnabled ? '🔊 ON' : '🔇 Activar'}
            </button>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-mono font-bold text-white">{hora}</div>
              <div className="text-xs text-white/50">🔄 {countdown}s</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.preparando || 0}</div>
            <div className="text-sm">👨‍🍳 Preparando</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.listos || 0}</div>
            <div className="text-sm">✅ Listos</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.entregados || 0}</div>
            <div className="text-sm">📦 Entregados</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white text-center">
            <div className="text-4xl font-bold">{stats.total || 0}</div>
            <div className="text-sm">📊 Total</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['activos', 'Preparando', 'Listo', 'Entregado', 'todos'].map(f => (
            <button 
              key={f} 
              onClick={() => setFiltro(f)} 
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                filtro === f 
                  ? 'bg-white text-orange-600 scale-105' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {f === 'activos' ? '🔥 Activos' : f === 'todos' ? '📋 Todos' : f}
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl animate-bounce">🥪</div>
            <p className="text-white/50 mt-4">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidosFiltrados.map(p => (
              <PedidoCard 
                key={p.fila} 
                pedido={p} 
                onCambiarEstado={cambiarEstado} 
                isLoading={loadingPedido === p.fila}
                isNew={newPedidoIds.has(`${p.fila}-${p.numero}`)}
              />
            ))}
          </div>
        )}
        
        {!isLoading && pedidosFiltrados.length === 0 && (
          <div className="text-center text-white/70 py-12">
            <div className="text-6xl mb-4">📭</div>
            <p>No hay pedidos</p>
          </div>
        )}
      </main>

      {/* Refresh button */}
      <button 
        onClick={cargarPedidos}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full text-orange-500 text-2xl shadow-lg hover:scale-110 transition-transform"
      >
        🔄
      </button>

      {/* Indicador sonido desactivado */}
      {!soundEnabled && (
        <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium animate-bounce">
          ⚠️ Activa el sonido →
        </div>
      )}
    </div>
  );
}

