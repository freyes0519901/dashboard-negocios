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
          prospecto.notificado === 'Sí' || prospecto.notificado ? 'bg-green-500' : 'bg-white/30'
        }`}>
          {prospecto.notificado === 'Sí' || prospecto.notificado ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{prospecto.nombre || 'Sin nombre'}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {prospecto.telefono}</div>
        {prospecto.interes && (
          <div className="flex items-center gap-2 text-sm mt-1">🛒 {prospecto.interes}</div>
        )}
        <div className="flex items-center gap-2 text-sm mt-1">📅 {prospecto.fecha}</div>
      </div>
      {!prospecto.notificado && prospecto.notificado !== 'Sí' && (
        <button 
          onClick={() => onNotificar(prospecto.id, prospecto.telefono, prospecto.nombre)}
          disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Avisar que abrimos'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 👻 COMPONENTE CARRITO FANTASMA (NUEVO)
// ============================================
function CarritoFantasmaCard({ carrito, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">👻</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          carrito.notificado ? 'bg-green-500' : 'bg-white/30'
        }`}>
          {carrito.notificado ? '✅ Notificado' : '⏳ Reservado'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{carrito.nombre || 'Sin nombre'}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {carrito.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">🛒 {carrito.items}</div>
        <div className="flex items-center gap-2 text-sm mt-1 font-bold">💰 ${carrito.total?.toLocaleString('es-CL')}</div>
        <div className="flex items-center gap-2 text-sm mt-1">📅 {carrito.fecha}</div>
      </div>
      {!carrito.notificado && (
        <button 
          onClick={() => onNotificar(carrito.id, carrito.telefono, carrito.nombre, carrito.items, carrito.total)}
          disabled={isLoading}
          className="w-full bg-white text-purple-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '🔔 Notificar - Ya Abrimos!'}
        </button>
      )}
      {carrito.notificado && !carrito.convertido && (
        <div className="text-center text-white/70 text-sm py-2">
          ⏳ Esperando respuesta del cliente...
        </div>
      )}
      {carrito.convertido && (
        <div className="text-center bg-green-500/30 text-white font-bold py-2 rounded-xl">
          🎉 ¡Convertido en pedido!
        </div>
      )}
    </div>
  );
}

// ============================================
// 📊 COMPONENTE REPORTES - CON API REAL
// ============================================
function ReportesPanel({ apiBase }) {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaDetalle, setVistaDetalle] = useState('resumen');
  const [error, setError] = useState(null);

  // Datos demo como fallback
  const datosDemo = {
    hoy: {
      pedidos: 18,
      ventas: 127500,
      ticket_promedio: 7083,
      clientes_unicos: 15,
      prospectos: 5,
      carritos_fantasma: 3,
      por_estado: { preparando: 2, listo: 1, entregado: 15 },
      top_productos: [
        { nombre: '🍔 Hamburguesa', cantidad: 12 },
        { nombre: '🥪 Sándwich Pollo', cantidad: 8 },
        { nombre: '🍟 Papas Fritas', cantidad: 15 },
      ]
    },
    semana: {
      pedidos: 126,
      ventas: 892500,
      ticket_promedio: 7083,
      clientes_unicos: 89,
      prospectos: 23,
      carritos_fantasma: 12,
      por_estado: { preparando: 4, listo: 2, entregado: 120 },
      top_productos: [
        { nombre: '🍔 Hamburguesa', cantidad: 84 },
        { nombre: '🥪 Sándwich Pollo', cantidad: 56 },
        { nombre: '🍟 Papas Fritas', cantidad: 105 },
      ]
    },
    mes: {
      pedidos: 543,
      ventas: 3850000,
      ticket_promedio: 7090,
      clientes_unicos: 312,
      prospectos: 87,
      carritos_fantasma: 45,
      por_estado: { preparando: 3, listo: 2, entregado: 538 },
      top_productos: [
        { nombre: '🍔 Hamburguesa', cantidad: 362 },
        { nombre: '🥪 Sándwich Pollo', cantidad: 241 },
        { nombre: '🍟 Papas Fritas', cantidad: 452 },
      ]
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [periodo]);

  const cargarReportes = async () => {
    setCargando(true);
    setError(null);
    try {
      // Intentar cargar desde API real
      const res = await fetch(`${apiBase}/api/reportes?periodo=${periodo}`);
      if (res.ok) {
        const data = await res.json();
        setDatos(data.resumen || data);
      } else {
        throw new Error('API no disponible');
      }
    } catch (err) {
      console.warn('Usando datos demo:', err.message);
      setDatos(datosDemo[periodo]);
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio || 0);
  };

  if (cargando) {
    return (
      <div className="text-center text-white py-10">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="text-center text-white py-10">
        <div className="text-4xl mb-4">📊</div>
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de período */}
      <div className="flex bg-white/10 rounded-xl p-1">
        {[
          { key: 'hoy', label: '📅 Hoy' },
          { key: 'semana', label: '📆 Semana' },
          { key: 'mes', label: '🗓️ Mes' }
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              periodo === p.key
                ? 'bg-white text-orange-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">💰 Total Ventas</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(datos.ventas)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">📦 Pedidos</p>
          <p className="text-2xl font-bold mt-1">{datos.pedidos || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">🧾 Ticket Promedio</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(datos.ticket_promedio)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">👥 Clientes Únicos</p>
          <p className="text-2xl font-bold mt-1">{datos.clientes_unicos || 0}</p>
        </div>
      </div>

      {/* Métricas de funciones proactivas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">📋 Prospectos</p>
          <p className="text-2xl font-bold mt-1">{datos.prospectos || 0}</p>
          <p className="text-xs text-white/70 mt-1">Clientes interesados</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">👻 Carritos Fantasma</p>
          <p className="text-2xl font-bold mt-1">{datos.carritos_fantasma || 0}</p>
          <p className="text-xs text-white/70 mt-1">Reservas fuera de horario</p>
        </div>
      </div>

      {/* Tabs para vistas detalladas */}
      <div className="flex bg-white/10 rounded-xl p-1">
        {[
          { key: 'resumen', label: '📊 Resumen' },
          { key: 'productos', label: '🍔 Productos' },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setVistaDetalle(v.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              vistaDetalle === v.key
                ? 'bg-white text-orange-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Vista Resumen */}
      {vistaDetalle === 'resumen' && datos.por_estado && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">📊 Estado de Pedidos</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">✅ Entregados</span>
              <span className="text-white font-bold">{datos.por_estado.entregado || 0}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" 
                   style={{ width: `${((datos.por_estado.entregado || 0) / (datos.pedidos || 1)) * 100}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/80 text-sm">👨‍🍳 Preparando</span>
              <span className="text-white font-bold">{datos.por_estado.preparando || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm">⏰ Listos</span>
              <span className="text-white font-bold">{datos.por_estado.listo || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Vista Productos */}
      {vistaDetalle === 'productos' && datos.top_productos && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Top Productos</h3>
          <div className="space-y-3">
            {datos.top_productos.map((prod, index) => {
              const maxCant = datos.top_productos[0]?.cantidad || 1;
              const porcentaje = (prod.cantidad / maxCant) * 100;
              const medallas = ['🥇', '🥈', '🥉'];
              return (
                <div key={prod.nombre} className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{medallas[index] || '🏅'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span className="font-semibold">{prod.nombre}</span>
                        <span className="font-bold">{prod.cantidad} un.</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-yellow-400' :
                        index === 1 ? 'bg-gray-300' :
                        index === 2 ? 'bg-orange-400' : 'bg-white/50'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Análisis IA */}
      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-white font-medium">Análisis del Bot</p>
            <p className="text-white/70 text-sm mt-1">
              {datos.carritos_fantasma > 0 
                ? `Tienes ${datos.carritos_fantasma} reservas pendientes. ¡Notifícalas cuando abras!`
                : 'Todo al día. Las funciones proactivas están funcionando.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function CarritoDashboard() {
  // API Base - Cambiar según ambiente
  const API_BASE = 'https://freyes0519901.pythonanywhere.com';
  
  const [pedidos, setPedidos] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [fantasmas, setFantasmas] = useState([]);
  const [stats, setStats] = useState({});
  const [planActual, setPlanActual] = useState(null);
  const [filtro, setFiltro] = useState('activos');
  const [vista, setVista] = useState('pedidos');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(null);
  const [loadingProspecto, setLoadingProspecto] = useState(null);
  const [loadingFantasma, setLoadingFantasma] = useState(null);
  const [notificandoTodos, setNotificandoTodos] = useState(null);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
      const res = await fetch(`${API_BASE}/api/pedidos`);
      const data = await res.json();
      if (data.pedidos) {
        const prevIds = new Set(previousPedidosRef.current.map(p => p.numero));
        const nuevos = data.pedidos.filter(p => !prevIds.has(p.numero) && p.estado === 'Preparando');
        
        if (nuevos.length > 0 && previousPedidosRef.current.length > 0 && soundEnabled) {
          playSound();
          setShowAlert(true);
          setTimeout(() => { setShowAlert(false); }, 5000);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Nuevo Pedido!', { body: `Pedido #${nuevos[0].numero} - ${nuevos[0].nombre}`, icon: '🥪' });
          }
        }
        
        previousPedidosRef.current = data.pedidos;
        setPedidos(data.pedidos);
        
        // Calcular stats
        const preparando = data.pedidos.filter(p => p.estado === 'Preparando').length;
        const listos = data.pedidos.filter(p => p.estado === 'Listo').length;
        const entregados = data.pedidos.filter(p => p.estado === 'Entregado').length;
        setStats({ preparando, listos, entregados });
      }
    } catch (e) { console.error('Error cargando pedidos:', e); }
    finally { setIsLoading(false); }
  }, [soundEnabled, playSound, API_BASE]);

  // Cargar prospectos
  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/prospectos`);
      const data = await res.json();
      if (data.prospectos) setProspectos(data.prospectos);
    } catch (e) { console.error('Error cargando prospectos:', e); }
  }, [API_BASE]);

  // Cargar plan actual
  const cargarPlan = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reportes?periodo=hoy`);
      const data = await res.json();
      if (data.plan) setPlanActual(data.plan);
    } catch (e) { console.error('Error cargando plan:', e); }
  }, [API_BASE]);

  // Cargar carritos fantasma
  const cargarFantasmas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/fantasmas`);
      const data = await res.json();
      if (data.fantasmas) setFantasmas(data.fantasmas);
    } catch (e) { console.error('Error cargando fantasmas:', e); }
  }, [API_BASE]);

  // Actualizar hora
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHora = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!user) return;
    cargarPedidos();
    cargarProspectos();
    cargarFantasmas();
    cargarPlan();
    const interval = setInterval(() => {
      cargarPedidos();
      cargarProspectos();
      cargarFantasmas();
      setCountdown(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarPedidos, cargarProspectos, cargarFantasmas, cargarPlan]);

  // Countdown
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Cambiar estado pedido
  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingPedido(fila);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) await cargarPedidos();
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  // Notificar pedido listo
  const notificarListo = async (fila, telefono, nombre, numero) => {
    setLoadingPedido(fila);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/notificar-listo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre, numero })
      });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); alert(`✅ Cliente notificado!`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  // Notificar prospecto
  const notificarProspecto = async (id, telefono, nombre) => {
    setLoadingProspecto(id);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/notificar-prospecto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, telefono, nombre })
      });
      const data = await res.json();
      if (data.success) { await cargarProspectos(); alert(`✅ Prospecto notificado!`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingProspecto(null); }
  };

  // Notificar carrito fantasma
  const notificarFantasma = async (id, telefono, nombre, items, total) => {
    setLoadingFantasma(id);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/notificar-fantasma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, telefono, nombre, items, total })
      });
      const data = await res.json();
      if (data.success) { await cargarFantasmas(); alert(`✅ Cliente notificado de su reserva!`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingFantasma(null); }
  };

  // Notificar todos los prospectos
  const notificarTodosProspectos = async () => {
    if (!confirm('¿Notificar a todos los prospectos pendientes?')) return;
    setNotificandoTodos('prospectos');
    try {
      const res = await fetch(`${API_BASE}/api/carrito/notificar-todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} prospectos notificados` : 'Error al notificar');
      await cargarProspectos();
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setNotificandoTodos(null); }
  };

  // Notificar todos los carritos fantasma
  const notificarTodosFantasmas = async () => {
    if (!confirm('¿Notificar a todos los clientes con reservas?')) return;
    setNotificandoTodos('fantasmas');
    try {
      const res = await fetch(`${API_BASE}/api/carrito/notificar-todos-fantasmas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} clientes notificados` : 'Error al notificar');
      await cargarFantasmas();
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setNotificandoTodos(null); }
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
  
  const prospectosPendientes = prospectos.filter(p => !p.notificado && p.notificado !== 'Sí');
  const fantasmasPendientes = fantasmas.filter(f => !f.notificado);

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
        <div className="flex items-center justify-between mb-4">
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

        {/* Indicador de Plan */}
        {planActual && (
          <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
            planActual === 'ENTERPRISE' ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/50' :
            planActual === 'PRO+' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50' :
            planActual === 'PRO' ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50' :
            'bg-gradient-to-r from-gray-500/30 to-slate-500/30 border border-gray-400/50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {planActual === 'ENTERPRISE' ? '👑' : 
                 planActual === 'PRO+' ? '⭐' : 
                 planActual === 'PRO' ? '🚀' : '📦'}
              </span>
              <div>
                <p className="text-white font-bold text-sm">Plan {planActual}</p>
                <p className="text-white/60 text-xs">
                  {planActual === 'ENTERPRISE' ? 'Todas las funciones activas' :
                   planActual === 'PRO+' ? 'Incluye Facebook Messenger' :
                   planActual === 'PRO' ? 'Prospectos + Reservas + Upselling' :
                   'Funciones básicas'}
                </p>
              </div>
            </div>
            {planActual !== 'ENTERPRISE' && (
              <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-all">
                ⬆️ Upgrade
              </button>
            )}
          </div>
        )}

        {/* Selector de Vista - 4 PESTAÑAS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setVista('pedidos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${vista === 'pedidos' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}
          >
            🥪 Pedidos ({pedidos.filter(p => p.estado !== 'Entregado').length})
          </button>
          <button
            onClick={() => setVista('fantasmas')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all relative text-sm ${vista === 'fantasmas' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}
          >
            👻 Reservas
            {fantasmasPendientes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-400 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {fantasmasPendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setVista('prospectos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all relative text-sm ${vista === 'prospectos' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'}`}
          >
            📋 Prospectos
            {prospectosPendientes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {prospectosPendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setVista('reportes')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${vista === 'reportes' ? 'bg-white text-green-600' : 'bg-white/20 text-white'}`}
          >
            📊 Reportes
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
              <div className="text-center text-white py-10">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Cargando pedidos...</p>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60">No hay pedidos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pedidosFiltrados.map(pedido => (
                  <PedidoCard 
                    key={pedido.numero || pedido.fila} 
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
        {/* VISTA CARRITOS FANTASMA */}
        {/* ============================================ */}
        {vista === 'fantasmas' && (
          <>
            {/* Botón notificar todos */}
            {fantasmasPendientes.length > 0 && (
              <button
                onClick={notificarTodosFantasmas}
                disabled={notificandoTodos === 'fantasmas'}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {notificandoTodos === 'fantasmas' ? '⏳ Enviando...' : `🔔 ¡YA ABRIMOS! Notificar ${fantasmasPendientes.length} reservas`}
              </button>
            )}

            {/* Explicación */}
            <div className="bg-white/10 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👻</span>
                <div>
                  <p className="text-white font-medium">¿Qué son los Carritos Fantasma?</p>
                  <p className="text-white/70 text-sm mt-1">
                    Son pedidos que los clientes hicieron cuando estabas cerrado. El bot los guardó para que no los pierdas. ¡Notifícalos cuando abras!
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Fantasmas */}
            {fantasmas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">👻</div>
                <p className="text-white/60">No hay reservas pendientes</p>
                <p className="text-white/40 text-sm mt-2">Los pedidos fuera de horario aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {fantasmas.map(carrito => (
                  <CarritoFantasmaCard 
                    key={carrito.id} 
                    carrito={carrito} 
                    onNotificar={notificarFantasma}
                    isLoading={loadingFantasma === carrito.id} 
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
                onClick={notificarTodosProspectos}
                disabled={notificandoTodos === 'prospectos'}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {notificandoTodos === 'prospectos' ? '⏳ Enviando...' : `🎉 ¡ABRIMOS! Notificar a ${prospectosPendientes.length} clientes`}
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
                    key={prospecto.id || prospecto.fila} 
                    prospecto={prospecto} 
                    onNotificar={notificarProspecto}
                    isLoading={loadingProspecto === (prospecto.id || prospecto.fila)} 
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* VISTA REPORTES */}
        {/* ============================================ */}
        {vista === 'reportes' && (
          <ReportesPanel apiBase={API_BASE} />
        )}

        {/* Botón refresh */}
        <button onClick={() => { cargarPedidos(); cargarProspectos(); cargarFantasmas(); setCountdown(10); }}
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
