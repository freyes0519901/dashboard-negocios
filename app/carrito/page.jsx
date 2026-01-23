'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://freyes0519901.pythonanywhere.com';

// ============================================
// 🥪 COMPONENTE PEDIDO
// ============================================
function PedidoCard({ pedido, onMarcarListo, onMarcarEntregado, isLoading, isNew }) {
  const colores = {
    'Preparando': 'from-yellow-400 to-orange-500',
    'Listo': 'from-green-400 to-emerald-500',
    'Entregado': 'from-gray-400 to-gray-500',
  };
  const iconos = { 'Preparando': '👨‍🍳', 'Listo': '✅', 'Entregado': '🎉' };

  return (
    <div className={`bg-gradient-to-br ${colores[pedido.estado] || colores['Preparando']} rounded-2xl p-4 text-white shadow-lg ${isNew ? 'ring-4 ring-white animate-pulse' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl font-bold">#{pedido.numero}</span>
        <span className="text-3xl">{iconos[pedido.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{pedido.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {pedido.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="text-sm font-medium mb-1">🛒 Pedido:</div>
        <div className="text-sm">{pedido.items}</div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl font-bold">${pedido.total?.toLocaleString('es-CL')}</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{pedido.pago || 'Efectivo'}</span>
      </div>
      <div className="flex gap-2">
        {pedido.estado === 'Preparando' && (
          <button onClick={() => onMarcarListo(pedido.numero)} disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '✅ LISTO - Notificar'}
          </button>
        )}
        {pedido.estado === 'Listo' && (
          <button onClick={() => onMarcarEntregado(pedido.numero)} disabled={isLoading}
            className="flex-1 bg-white text-gray-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '🎉 Marcar Entregado'}
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
// 👻 COMPONENTE FANTASMA
// ============================================
function FantasmaCard({ fantasma, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">👻</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${fantasma.notificado ? 'bg-green-500' : 'bg-white/30'}`}>
          {fantasma.notificado ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{fantasma.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {fantasma.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">🛒 {fantasma.items}</div>
        <div className="flex items-center gap-2 text-sm">💰 ${fantasma.total?.toLocaleString('es-CL')}</div>
      </div>
      {!fantasma.notificado && (
        <button onClick={() => onNotificar(fantasma.id)} disabled={isLoading}
          className="w-full bg-white text-purple-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Notificar "Ya abrimos"'}
        </button>
      )}
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
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${prospecto.notificado ? 'bg-green-500' : 'bg-white/30'}`}>
          {prospecto.notificado ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{prospecto.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {prospecto.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">🍔 {prospecto.interes}</div>
      </div>
      {!prospecto.notificado && (
        <button onClick={() => onNotificar(prospecto.id)} disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Notificar disponibilidad'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 📊 COMPONENTE REPORTES CON EXPORTS
// ============================================
function ReportesPanel({ plan }) {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(null);
  const [permisos, setPermisos] = useState(null);

  useEffect(() => {
    cargarPermisos();
  }, [plan]);

  useEffect(() => {
    cargarReportes();
  }, [periodo]);

  const cargarPermisos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/export/permisos?plan=${plan}`);
      const data = await res.json();
      if (data.success) setPermisos(data);
    } catch (e) { console.error('Error permisos:', e); }
  };

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/reportes?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) setDatos(data);
    } catch (e) { console.error('Error reportes:', e); }
    finally { setCargando(false); }
  };

  const descargarExcel = async () => {
    if (!permisos?.exports_enabled) {
      alert('Exports no disponibles en el servidor');
      return;
    }
    if (periodo !== 'hoy' && !permisos?.permisos?.excel_semana) {
      alert(`Tu plan ${plan} solo permite exportar el día actual. Actualiza a PRO para más.`);
      return;
    }
    setExportando('excel');
    try {
      const url = `${API_BASE}/api/carrito/export/excel?periodo=${periodo}&plan=${plan}`;
      window.open(url, '_blank');
    } catch (e) { console.error('Error:', e); alert('Error descargando Excel'); }
    finally { setTimeout(() => setExportando(null), 1000); }
  };

  const descargarPDF = async (tipo = 'basico') => {
    if (!permisos?.exports_enabled) {
      alert('Exports no disponibles en el servidor');
      return;
    }
    if (tipo === 'graficos' && !permisos?.permisos?.pdf_graficos) {
      alert(`PDF con gráficos requiere plan PRO+`);
      return;
    }
    if (tipo === 'ia' && !permisos?.permisos?.pdf_ia) {
      alert(`Análisis IA requiere plan ENTERPRISE`);
      return;
    }
    setExportando('pdf');
    try {
      const url = `${API_BASE}/api/carrito/export/pdf?periodo=${periodo}&tipo=${tipo}&plan=${plan}`;
      window.open(url, '_blank');
    } catch (e) { console.error('Error:', e); alert('Error descargando PDF'); }
    finally { setTimeout(() => setExportando(null), 1000); }
  };

  const formatearPrecio = (precio) => `$${(precio || 0).toLocaleString('es-CL')}`;

  if (cargando) {
    return (
      <div className="text-center text-white py-10">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector período */}
      <div className="flex bg-white/10 rounded-xl p-1">
        {[{ key: 'hoy', label: '📅 Hoy' }, { key: 'semana', label: '📆 Semana' }, { key: 'mes', label: '🗓️ Mes' }].map((p) => (
          <button key={p.key} onClick={() => setPeriodo(p.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${periodo === p.key ? 'bg-white text-orange-600' : 'text-white/70 hover:text-white'}`}>
            {p.label}
            {p.key !== 'hoy' && !permisos?.permisos?.excel_semana && <span className="ml-1">🔒</span>}
          </button>
        ))}
      </div>

      {/* KPIs */}
      {datos && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">💰 Ventas</p>
            <p className="text-2xl font-bold">{formatearPrecio(datos.resumen?.ventas)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">📦 Pedidos</p>
            <p className="text-2xl font-bold">{datos.resumen?.pedidos || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">🎫 Ticket Promedio</p>
            <p className="text-2xl font-bold">{formatearPrecio(datos.resumen?.ticket_promedio)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">👥 Clientes</p>
            <p className="text-2xl font-bold">{datos.resumen?.clientes_unicos || 0}</p>
          </div>
        </div>
      )}

      {/* Estados */}
      {datos?.por_estado && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">📊 Estado de Pedidos</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-yellow-500/20 rounded-xl p-2">
              <p className="text-2xl font-bold text-white">{datos.por_estado.preparando}</p>
              <p className="text-xs text-white/70">Preparando</p>
            </div>
            <div className="text-center bg-green-500/20 rounded-xl p-2">
              <p className="text-2xl font-bold text-white">{datos.por_estado.listo}</p>
              <p className="text-xs text-white/70">Listos</p>
            </div>
            <div className="text-center bg-gray-500/20 rounded-xl p-2">
              <p className="text-2xl font-bold text-white">{datos.por_estado.entregado}</p>
              <p className="text-xs text-white/70">Entregados</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Productos */}
      {datos?.top_productos && datos.top_productos.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Top Productos</h3>
          <div className="space-y-2">
            {datos.top_productos.map((prod, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                <span className="text-white">{['🥇', '🥈', '🥉', '🏅', '🏅'][i]} {prod.nombre}</span>
                <span className="text-white font-bold">{prod.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métodos de Pago */}
      {datos?.metodos_pago && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">💳 Métodos de Pago</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{datos.metodos_pago.flow}</p>
              <p className="text-xs text-white/70">Flow</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{datos.metodos_pago.webpay}</p>
              <p className="text-xs text-white/70">Webpay</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{datos.metodos_pago.efectivo}</p>
              <p className="text-xs text-white/70">Efectivo</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 📥 BOTONES DE DESCARGA */}
      {/* ============================================ */}
      <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-white/20 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">📥 Exportar Reportes</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Excel */}
          <button onClick={descargarExcel} disabled={exportando === 'excel'}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105">
            {exportando === 'excel' ? '⏳ Descargando...' : '📥 Excel'}
          </button>
          
          {/* PDF Básico */}
          <button onClick={() => descargarPDF('basico')} disabled={exportando === 'pdf'}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105">
            {exportando === 'pdf' ? '⏳ Descargando...' : '📄 PDF'}
          </button>
        </div>

        {/* Opciones avanzadas según plan */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => descargarPDF('graficos')} 
            disabled={!permisos?.permisos?.pdf_graficos || exportando}
            className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all ${
              permisos?.permisos?.pdf_graficos 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-white/5 text-white/40 cursor-not-allowed'
            }`}>
            📊 PDF Gráficos {!permisos?.permisos?.pdf_graficos && '🔒'}
          </button>
          <button onClick={() => descargarPDF('ia')} 
            disabled={!permisos?.permisos?.pdf_ia || exportando}
            className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all ${
              permisos?.permisos?.pdf_ia 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-white/5 text-white/40 cursor-not-allowed'
            }`}>
            🤖 Análisis IA {!permisos?.permisos?.pdf_ia && '🔒'}
          </button>
        </div>

        {/* Info del plan */}
        <div className="mt-3 text-center">
          <span className="text-white/50 text-xs">
            Plan: <span className="font-bold text-white/70">{plan}</span>
            {!permisos?.exports_enabled && ' • ⚠️ Exports deshabilitados en servidor'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function CarritoDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [fantasmas, setFantasmas] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [abandonados, setAbandonados] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({ plan: 'ENTERPRISE' });
  const [filtro, setFiltro] = useState('activos');
  const [vista, setVista] = useState('pedidos');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(null);
  const [loadingFantasma, setLoadingFantasma] = useState(null);
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

  useEffect(() => { setMounted(true); }, []);

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
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    } catch (e) { console.error('Error sonido:', e); }
  }, []);

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
    } catch (e) { console.error('Error habilitando sonido:', e); }
  }, [playSound]);

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

  // Cargar config
  const cargarConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/config`);
      const data = await res.json();
      if (data.success) setConfig(data);
    } catch (e) { console.error('Error config:', e); }
  }, []);

  // Cargar stats rápidas
  const cargarStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/stats/rapidas`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) { console.error('Error stats:', e); }
  }, []);

  // Cargar pedidos
  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/pedidos-db?estado=todos&limite=50`);
      const data = await res.json();
      if (data.success && data.pedidos) {
        const prevIds = new Set(previousPedidosRef.current.map(p => p.numero));
        const nuevos = data.pedidos.filter(p => !prevIds.has(p.numero) && p.estado === 'Preparando');
        if (nuevos.length > 0 && previousPedidosRef.current.length > 0 && soundEnabled) {
          playSound();
          setShowAlert(true);
          setNewPedidoIds(new Set(nuevos.map(p => p.numero)));
          setTimeout(() => { setShowAlert(false); setNewPedidoIds(new Set()); }, 5000);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Nuevo Pedido!', { body: `Pedido #${nuevos[0].numero} - ${nuevos[0].nombre}`, icon: '🥪' });
          }
        }
        previousPedidosRef.current = data.pedidos;
        setPedidos(data.pedidos);
      }
    } catch (e) { console.error('Error pedidos:', e); }
    finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);

  // Cargar fantasmas
  const cargarFantasmas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/fantasmas`);
      const data = await res.json();
      if (data.success) setFantasmas(data.fantasmas || []);
    } catch (e) { console.error('Error fantasmas:', e); }
  }, []);

  // Cargar prospectos
  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/prospectos-db`);
      const data = await res.json();
      if (data.success) setProspectos(data.prospectos || []);
    } catch (e) { console.error('Error prospectos:', e); }
  }, []);

  // Cargar abandonados
  const cargarAbandonados = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/carrito/abandonados`);
      const data = await res.json();
      if (data.success) setAbandonados(data.abandonados || []);
    } catch (e) { console.error('Error abandonados:', e); }
  }, []);

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
    cargarConfig();
    cargarStats();
    cargarPedidos();
    cargarFantasmas();
    cargarProspectos();
    cargarAbandonados();
    const interval = setInterval(() => {
      cargarStats();
      cargarPedidos();
      setCountdown(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarPedidos, cargarFantasmas, cargarProspectos, cargarAbandonados]);

  // Countdown
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Marcar listo
  const marcarListo = async (numero) => {
    setLoadingPedido(numero);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/pedidos/notificar-listo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero })
      });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); await cargarStats(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  // Marcar entregado
  const marcarEntregado = async (numero) => {
    setLoadingPedido(numero);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/pedidos/marcar-entregado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero })
      });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); await cargarStats(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  // Notificar fantasma
  const notificarFantasma = async (id) => {
    setLoadingFantasma(id);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/fantasmas/${id}/notificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) { await cargarFantasmas(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingFantasma(null); }
  };

  // Notificar todos fantasmas
  const notificarTodosFantasmas = async () => {
    if (!confirm('¿Notificar a todos los clientes con carritos fantasma?')) return;
    setNotificandoTodos(true);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/fantasmas/notificar-todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} clientes notificados` : 'Error al notificar');
      await cargarFantasmas();
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setNotificandoTodos(false); }
  };

  // Notificar prospecto
  const notificarProspecto = async (id) => {
    setLoadingProspecto(id);
    try {
      const res = await fetch(`${API_BASE}/api/carrito/prospectos/${id}/notificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) { await cargarProspectos(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingProspecto(null); }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user');
      router.push('/login');
    }
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos :
    filtro === 'activos' ? pedidos.filter(p => ['Preparando', 'Listo'].includes(p.estado)) :
    pedidos.filter(p => p.estado === filtro);

  const fantasmasPendientes = fantasmas.filter(f => !f.notificado);
  const prospectosPendientes = prospectos.filter(p => !p.notificado);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
      {/* Alerta nuevo pedido */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-white text-orange-600 py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡NUEVO PEDIDO! 🔔
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">🥪 Dashboard</h1>
            <p className="text-white/60 text-sm">
              {stats.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
              <span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>•Cerrar sesión</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
              className={`px-3 py-1 rounded-full text-sm font-bold ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>
              {soundEnabled ? '🔊 Sonido' : '🔇 Sonido'}
            </button>
            <div className="text-right text-white">
              <div className="text-xl font-mono font-bold">{hora}</div>
              <div className="text-xs text-white/60">🔄 {countdown}s</div>
            </div>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-yellow-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-900">{stats.preparando || 0}</div>
            <div className="text-xs text-yellow-800">👨‍🍳 Preparando</div>
          </div>
          <div className="bg-green-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-900">{stats.listos || 0}</div>
            <div className="text-xs text-green-800">✅ Listos</div>
          </div>
          <div className="bg-blue-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-900">${(stats.ventas_hoy || 0).toLocaleString('es-CL')}</div>
            <div className="text-xs text-blue-800">💰 Hoy</div>
          </div>
          <div className="bg-purple-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-900">{(stats.prospectos_pendientes || 0) + (stats.fantasmas_pendientes || 0)}</div>
            <div className="text-xs text-purple-800">📋 Pendientes</div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[
            { key: 'pedidos', icon: '🥪', label: '' },
            { key: 'fantasmas', icon: '👻', label: '', badge: fantasmasPendientes.length },
            { key: 'prospectos', icon: '📋', label: '', badge: prospectosPendientes.length },
            { key: 'abandonados', icon: '🛒', label: '', badge: abandonados.filter(a => !a.recuperado).length },
            { key: 'reportes', icon: '📊', label: '' },
            { key: 'config', icon: '🔒', label: '' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all ${
                vista === tab.key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'
              }`}>
              {tab.icon}{tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vista Pedidos */}
        {vista === 'pedidos' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activos', 'Preparando', 'Listo', 'Entregado', '📊 Todos'].map((f, i) => {
                const key = ['activos', 'Preparando', 'Listo', 'Entregado', 'todos'][i];
                return (
                  <button key={key} onClick={() => setFiltro(key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filtro === key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'
                    }`}>
                    {f}
                  </button>
                );
              })}
            </div>
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
                  <PedidoCard key={pedido.id} pedido={pedido}
                    onMarcarListo={marcarListo} onMarcarEntregado={marcarEntregado}
                    isLoading={loadingPedido === pedido.numero}
                    isNew={newPedidoIds.has(pedido.numero)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista Fantasmas */}
        {vista === 'fantasmas' && (
          <>
            {fantasmasPendientes.length > 0 && (
              <button onClick={notificarTodosFantasmas} disabled={notificandoTodos}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform disabled:opacity-50">
                {notificandoTodos ? '⏳ Enviando...' : `🎉 Notificar a ${fantasmasPendientes.length} clientes`}
              </button>
            )}
            {fantasmas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">👻</div>
                <p className="text-white/60">No hay carritos fantasma</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {fantasmas.map(f => (
                  <FantasmaCard key={f.id} fantasma={f} onNotificar={notificarFantasma} isLoading={loadingFantasma === f.id} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista Prospectos */}
        {vista === 'prospectos' && (
          <>
            {prospectos.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-white/60">No hay prospectos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {prospectos.map(p => (
                  <ProspectoCard key={p.id} prospecto={p} onNotificar={notificarProspecto} isLoading={loadingProspecto === p.id} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista Abandonados */}
        {vista === 'abandonados' && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-white font-bold mb-2">Carritos Abandonados</p>
            <p className="text-white/60 mb-4">Clientes que empezaron pedido pero no completaron</p>
            <p className="text-3xl font-bold text-white">{abandonados.length}</p>
          </div>
        )}

        {/* Vista Reportes */}
        {vista === 'reportes' && (
          <ReportesPanel plan={config.plan || 'ENTERPRISE'} />
        )}

        {/* Vista Config */}
        {vista === 'config' && (
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-4">⚙️ Configuración</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Negocio</span>
                <span className="text-white font-bold">{config.negocio?.nombre || 'Sánguchez con Hambre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Plan</span>
                <span className="text-white font-bold">{config.plan || 'ENTERPRISE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Estado</span>
                <span className={`font-bold ${config.abierto ? 'text-green-400' : 'text-red-400'}`}>
                  {config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Dirección</span>
                <span className="text-white text-sm">{config.direccion || 'Los Corrales 1370, Colina'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Horario</span>
                <span className="text-white text-sm">{config.horario_texto || 'Lun-Dom 16:00-02:00'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón refresh */}
        <button onClick={() => { cargarStats(); cargarPedidos(); cargarFantasmas(); cargarProspectos(); setCountdown(10); }}
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
