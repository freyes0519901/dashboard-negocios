'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// 🥪 COMPONENTE PEDIDO
// ============================================
function PedidoCard({ pedido, onCambiarEstado, onNotificarListo, isLoading }) {
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
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{pedido.pago || 'Efectivo'}</span>
      </div>
      <div className="flex gap-2">
        {pedido.estado === 'Preparando' && (
          <button 
            onClick={() => onNotificarListo(pedido.fila, pedido.telefono, pedido.nombre, pedido.numero)} 
            disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '✅ LISTO - Notificar Cliente'}
          </button>
        )}
        {pedido.estado === 'Listo' && (
          <button 
            onClick={() => onCambiarEstado(pedido.fila, 'Entregado')} 
            disabled={isLoading}
            className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '📦 Marcar Entregado'}
          </button>
        )}
        {pedido.estado === 'Entregado' && (
          <span className="flex-1 text-center py-3 bg-white/20 rounded-xl">✓ Completado</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// 📋 COMPONENTE PROSPECTO
// ============================================
function ProspectoCard({ prospecto, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">📋</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          prospecto.notificado === 'Sí' ? 'bg-green-500' : 'bg-white/30'
        }`}>
          {prospecto.notificado === 'Sí' ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{prospecto.nombre || 'Sin nombre'}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {prospecto.telefono}</div>
        {prospecto.interesado_en && (
          <div className="flex items-center gap-2 text-sm mt-1">🛒 {prospecto.interesado_en}</div>
        )}
        <div className="flex items-center gap-2 text-sm mt-1">📅 {prospecto.fecha}</div>
      </div>
      {prospecto.notificado !== 'Sí' && (
        <button 
          onClick={() => onNotificar(prospecto.fila, prospecto.telefono, prospecto.nombre)}
          disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Avisar que abrimos'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function CarritoDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('activos');
  const [vista, setVista] = useState('pedidos'); // 'pedidos' o 'prospectos'
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(null);
  const [loadingProspecto, setLoadingProspecto] = useState(null);
  const [notificandoTodos, setNotificandoTodos] = useState(false);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newPedidoIds, setNewPedidoIds] = useState(new Set());
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const audioContextRef = useRef(null);
  const previousPedidosRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para reproducir sonido
  const playSound = useCallback(() => {
    if (typeof window === 'undefined' || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      [800, 1000, 1200].forEach((freq, i) => {
        setTimeout(() => {
          if (!audioContextRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        }, i * 150);
      });
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (e) {
      console.error('Error sonido:', e);
    }
  }, []);

  // Habilitar sonido
  const enableSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setSoundEnabled(true);
      playSound();
      
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {
      console.error('Error habilitando sonido:', e);
    }
  }, [playSound]);

  // Verificar autenticación
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('dashboard_user');
      if (!stored) { router.push('/login'); return; }
      const parsed = JSON.parse(stored);
      if (parsed.negocio !== 'carrito') { router.push('/login'); return; }
      setUser(parsed);
    } catch (e) { router.push('/login'); }
  }, [router]);

  // Cargar pedidos
  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/pedidos');
      const data = await res.json();
      
      if (data.success) {
        const nuevosPedidos = data.pedidos || [];
        const nuevosStats = data.stats || {};
        
        const previousIds = new Set(previousPedidosRef.current.map(p => `${p.fila}-${p.numero}`));
        const currentIds = nuevosPedidos.map(p => `${p.fila}-${p.numero}`);
        const pedidosNuevos = currentIds.filter(id => !previousIds.has(id));
        
        if (pedidosNuevos.length > 0 && previousPedidosRef.current.length > 0) {
          if (soundEnabled) playSound();
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
          setNewPedidoIds(new Set(pedidosNuevos));
          setTimeout(() => setNewPedidoIds(new Set()), 10000);
          
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('🥪 ¡Nuevo Pedido!', { body: `${pedidosNuevos.length} nuevo(s) pedido(s)`, tag: 'nuevo-pedido' });
          }
        }
        
        previousPedidosRef.current = nuevosPedidos;
        setPedidos(nuevosPedidos);
        setStats(nuevosStats);
      }
    } catch (e) { console.error('Error cargando pedidos:', e); }
    finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);

  // Cargar prospectos
  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/prospectos');
      const data = await res.json();
      if (data.success) {
        setProspectos(data.prospectos || []);
      }
    } catch (e) { console.error('Error cargando prospectos:', e); }
  }, []);

  // Reloj
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateTime = () => setHora(new Date().toLocaleTimeString('es-CL'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!user) return;
    cargarPedidos();
    cargarProspectos();
    const interval = setInterval(() => {
      cargarPedidos();
      cargarProspectos();
      setCountdown(10);
    }, 10000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 10);
    }, 1000);
    
    return () => { clearInterval(interval); clearInterval(countdownInterval); };
  }, [user, cargarPedidos, cargarProspectos]);

  // Cambiar estado pedido
  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingPedido(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, estado: nuevoEstado })
      });
      if ((await res.json()).success) await cargarPedidos();
    } catch (e) { console.error('Error:', e); }
    finally { setLoadingPedido(null); }
  };

  // Marcar como LISTO y notificar cliente
  const notificarListo = async (fila, telefono, nombre, numero) => {
    setLoadingPedido(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/pedido-listo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre, numero })
      });
      const data = await res.json();
      if (data.success) {
        await cargarPedidos();
        // Mostrar feedback
        if (data.notificado) {
          alert(`✅ Pedido #${numero} marcado como LISTO\n📲 Cliente notificado por WhatsApp`);
        }
      }
    } catch (e) { console.error('Error:', e); alert('Error al notificar'); }
    finally { setLoadingPedido(null); }
  };

  // Notificar prospecto individual (avisar que abrimos)
  const notificarProspecto = async (fila, telefono, nombre) => {
    setLoadingProspecto(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/notificar-prospecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre })
      });
      if ((await res.json()).success) await cargarProspectos();
    } catch (e) { console.error('Error:', e); }
    finally { setLoadingProspecto(null); }
  };

  // Notificar todos los prospectos (abrimos!)
  const notificarTodos = async () => {
    if (!confirm('¿Enviar mensaje "¡Ya abrimos!" a TODOS los prospectos pendientes?')) return;
    setNotificandoTodos(true);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/notificar-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} prospectos notificados` : 'Error al notificar');
      await cargarProspectos();
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setNotificandoTodos(false); }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user');
      router.push('/login');
    }
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : 
    filtro === 'activos' ? pedidos.filter(p => p.estado !== 'Entregado') :
    pedidos.filter(p => p.estado === filtro);
  const prospectosPendientes = prospectos.filter(p => p.notificado !== 'Sí');

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-500 to-pink-600">
      {/* Alerta de nuevo pedido */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-white text-orange-600 py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡NUEVO PEDIDO! 🔔
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-white/60 hover:text-white">← </Link>
            <h1 className="text-2xl font-bold text-white inline">🥪 Sánguchez con Hambre</h1>
            <p className="text-white/60 text-sm cursor-pointer hover:text-white/80" onClick={cerrarSesion}>Cerrar sesión</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
              className={`px-4 py-2 rounded-full font-bold text-sm ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}
            >
              {soundEnabled ? '🔊 ON' : '🔇 Sonido'}
            </button>
            <div className="text-right text-white">
              <div className="text-2xl font-mono font-bold">{hora}</div>
              <div className="text-xs text-white/60">🔄 {countdown}s</div>
            </div>
          </div>
        </div>

        {/* Selector de Vista */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setVista('pedidos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${vista === 'pedidos' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}
          >
            🥪 Pedidos ({pedidos.filter(p => p.estado !== 'Entregado').length})
          </button>
          <button
            onClick={() => setVista('prospectos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all relative ${vista === 'prospectos' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'}`}
          >
            📋 Prospectos ({prospectos.length})
            {prospectosPendientes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {prospectosPendientes.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================ */}
        {/* VISTA PEDIDOS */}
        {/* ============================================ */}
        {vista === 'pedidos' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.preparando || 0}</div>
                <div className="text-sm">👨‍🍳 Preparando</div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.listos || 0}</div>
                <div className="text-sm">✅ Listos</div>
              </div>
              <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.entregados || 0}</div>
                <div className="text-sm">📦 Entregados</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['activos', 'Preparando', 'Listo', 'Entregado', 'todos'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${filtro === f ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
                  {f === 'activos' ? '🔥 Activos' : f === 'todos' ? '📊 Todos' : f}
                </button>
              ))}
            </div>

            {/* Lista de Pedidos */}
            {isLoading ? (
              <div className="text-center text-white py-10">Cargando...</div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60">No hay pedidos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pedidosFiltrados.map(pedido => (
                  <PedidoCard 
                    key={pedido.fila} 
                    pedido={pedido} 
                    onCambiarEstado={cambiarEstado}
                    onNotificarListo={notificarListo}
                    isLoading={loadingPedido === pedido.fila} 
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* VISTA PROSPECTOS */}
        {/* ============================================ */}
        {vista === 'prospectos' && (
          <>
            {/* Botón notificar todos */}
            {prospectosPendientes.length > 0 && (
              <button
                onClick={notificarTodos}
                disabled={notificandoTodos}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {notificandoTodos ? '⏳ Enviando...' : `🎉 ¡ABRIMOS! Notificar a ${prospectosPendientes.length} clientes`}
              </button>
            )}

            {/* Lista de Prospectos */}
            {prospectos.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-white/60">No hay prospectos</p>
                <p className="text-white/40 text-sm mt-2">Los clientes que escriban cuando esté cerrado aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {prospectos.map(prospecto => (
                  <ProspectoCard 
                    key={prospecto.fila} 
                    prospecto={prospecto} 
                    onNotificar={notificarProspecto}
                    isLoading={loadingProspecto === prospecto.fila} 
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Botón refresh */}
        <button onClick={() => { cargarPedidos(); cargarProspectos(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-orange-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
          🔄
        </button>

        {/* Warning sonido */}
        {!soundEnabled && mounted && (
          <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            ⚠️ Activa el sonido
          </div>
        )}
      </div>
    </div>
  );
}

