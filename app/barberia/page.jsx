'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = 'https://freyes0519901.pythonanywhere.com';

// ============================================
// 💈 COMPONENTE CITA
// ============================================
function CitaCard({ cita, onCambiarEstado, onCompletarNotificar, isLoading }) {
  const colores = {
    'Confirmada': 'from-blue-400 to-blue-500',
    'En Proceso': 'from-purple-400 to-purple-500',
    'Completada': 'from-green-400 to-emerald-500',
    'Cancelada': 'from-gray-400 to-gray-500',
    'No Asistió': 'from-red-400 to-red-500',
  };
  const iconos = { 
    'Confirmada': '✅', 
    'En Proceso': '✂️',
    'Completada': '🎉', 
    'Cancelada': '❌',
    'No Asistió': '😞'
  };

  const formatearPrecio = (precio) => `$${(precio || 0).toLocaleString('es-CL')}`;

  return (
    <div className={`bg-gradient-to-br ${colores[cita.estado] || colores['Confirmada']} rounded-2xl p-4 text-white shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl font-bold">⏰ {cita.hora}</span>
        <span className="text-3xl">{iconos[cita.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cita.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cita.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2">✂️ <span className="font-medium">{cita.servicio}</span></div>
        <div className="flex justify-between mt-2">
          <span className="text-lg font-bold">{formatearPrecio(cita.precio)}</span>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">{cita.duracion} min</span>
        </div>
      </div>
      <div className="flex gap-2">
        {cita.estado === 'Confirmada' && (
          <>
            <button onClick={() => onCambiarEstado(cita.id, 'En Proceso')} disabled={isLoading}
              className="flex-1 bg-white text-purple-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              {isLoading ? '⏳...' : '✂️ Iniciar'}
            </button>
            <button onClick={() => onCambiarEstado(cita.id, 'No Asistió')} disabled={isLoading}
              className="bg-white/20 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              😞
            </button>
          </>
        )}
        {cita.estado === 'En Proceso' && (
          <button onClick={() => onCompletarNotificar(cita.id)} disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '🎉 Completar + Notificar'}
          </button>
        )}
        {(cita.estado === 'Completada' || cita.estado === 'Cancelada' || cita.estado === 'No Asistió') && (
          <span className="flex-1 text-center py-3 bg-white/20 rounded-xl">
            {cita.estado === 'Completada' ? '✓ Completada' : cita.estado === 'Cancelada' ? '✗ Cancelada' : '✗ No asistió'}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// 👻 COMPONENTE ABANDONADA
// ============================================
function AbandonadaCard({ abandonada, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">📋</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${abandonada.notificado ? 'bg-green-500' : 'bg-white/30'}`}>
          {abandonada.notificado ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{abandonada.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {abandonada.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">✂️ {abandonada.servicio}</div>
      </div>
      {!abandonada.notificado && !abandonada.recuperado && (
        <button onClick={() => onNotificar(abandonada.id)} disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Rescatar cliente'}
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
      const res = await fetch(`${API_BASE}/api/barberia/export/permisos?plan=${plan}`);
      const data = await res.json();
      if (data.success) setPermisos(data);
    } catch (e) { console.error('Error permisos:', e); }
  };

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/api/barberia/reportes?periodo=${periodo}`);
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
      const url = `${API_BASE}/api/barberia/export/excel?periodo=${periodo}&plan=${plan}`;
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
      const url = `${API_BASE}/api/barberia/export/pdf?periodo=${periodo}&tipo=${tipo}&plan=${plan}`;
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
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${periodo === p.key ? 'bg-white text-indigo-600' : 'text-white/70 hover:text-white'}`}>
            {p.label}
            {p.key !== 'hoy' && !permisos?.permisos?.excel_semana && <span className="ml-1">🔒</span>}
          </button>
        ))}
      </div>

      {/* KPIs */}
      {datos && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">💰 Ingresos</p>
            <p className="text-2xl font-bold">{formatearPrecio(datos.resumen?.ingresos)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">📅 Citas</p>
            <p className="text-2xl font-bold">{datos.resumen?.total_citas || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">🎫 Ticket Promedio</p>
            <p className="text-2xl font-bold">{formatearPrecio(datos.resumen?.ticket_promedio)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">📊 Asistencia</p>
            <p className="text-2xl font-bold">{datos.resumen?.tasa_asistencia || 0}%</p>
          </div>
        </div>
      )}

      {/* Estados */}
      {datos?.por_estado && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">📊 Estado de Citas</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center bg-blue-500/20 rounded-xl p-2">
              <p className="text-xl font-bold text-white">{datos.por_estado.confirmadas}</p>
              <p className="text-xs text-white/70">Confirmadas</p>
            </div>
            <div className="text-center bg-green-500/20 rounded-xl p-2">
              <p className="text-xl font-bold text-white">{datos.por_estado.completadas}</p>
              <p className="text-xs text-white/70">Completadas</p>
            </div>
            <div className="text-center bg-gray-500/20 rounded-xl p-2">
              <p className="text-xl font-bold text-white">{datos.por_estado.canceladas}</p>
              <p className="text-xs text-white/70">Canceladas</p>
            </div>
            <div className="text-center bg-red-500/20 rounded-xl p-2">
              <p className="text-xl font-bold text-white">{datos.por_estado.no_asistio}</p>
              <p className="text-xs text-white/70">No Asistió</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Servicios */}
      {datos?.top_servicios && datos.top_servicios.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Top Servicios</h3>
          <div className="space-y-2">
            {datos.top_servicios.map((serv, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                <span className="text-white">{['🥇', '🥈', '🥉'][i] || '🏅'} {serv.nombre}</span>
                <span className="text-white font-bold">{serv.cantidad}</span>
              </div>
            ))}
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
// 🏠 DASHBOARD PRINCIPAL BARBERÍA
// ============================================
export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [abandonadas, setAbandonadas] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({ plan: 'PRO' });
  const [filtro, setFiltro] = useState('activas');
  const [vista, setVista] = useState('citas');
  const [hora, setHora] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);
  const [loadingAbandonada, setLoadingAbandonada] = useState(null);
  const [rescatandoTodos, setRescatandoTodos] = useState(false);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newCitaIds, setNewCitaIds] = useState(new Set());
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const audioContextRef = useRef(null);
  const previousCitasRef = useRef([]);

  useEffect(() => { setMounted(true); }, []);

  const playSound = useCallback(() => {
    if (typeof window === 'undefined' || !audioContextRef.current) return;
    try {
      const ctx = audioContextRef.current;
      [600, 800, 1000].forEach((freq, i) => {
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
      if (parsed.negocio !== 'barberia') { router.push('/login'); return; }
      setUser(parsed);
    } catch (e) { router.push('/login'); }
  }, [router]);

  // Cargar config
  const cargarConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/barberia/config`);
      const data = await res.json();
      if (data.success) setConfig(data);
    } catch (e) { console.error('Error config:', e); }
  }, []);

  // Cargar stats rápidas
  const cargarStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/barberia/stats/rapidas`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) { console.error('Error stats:', e); }
  }, []);

  // Cargar citas
  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/barberia/citas-db?fecha=${fechaSeleccionada}&estado=todos`);
      const data = await res.json();
      if (data.success && data.citas) {
        const prevIds = new Set(previousCitasRef.current.map(c => c.id));
        const nuevas = data.citas.filter(c => !prevIds.has(c.id) && c.estado === 'Confirmada');
        if (nuevas.length > 0 && previousCitasRef.current.length > 0 && soundEnabled) {
          playSound();
          setShowAlert(true);
          setNewCitaIds(new Set(nuevas.map(c => c.id)));
          setTimeout(() => { setShowAlert(false); setNewCitaIds(new Set()); }, 5000);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Nueva Cita!', { body: `${nuevas[0].nombre} - ${nuevas[0].hora}`, icon: '💈' });
          }
        }
        previousCitasRef.current = data.citas;
        setCitas(data.citas);
      }
    } catch (e) { console.error('Error citas:', e); }
    finally { setIsLoading(false); }
  }, [fechaSeleccionada, soundEnabled, playSound]);

  // Cargar abandonadas
  const cargarAbandonadas = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/barberia/abandonadas`);
      const data = await res.json();
      if (data.success) setAbandonadas(data.abandonadas || []);
    } catch (e) { console.error('Error abandonadas:', e); }
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
    cargarCitas();
    cargarAbandonadas();
    const interval = setInterval(() => {
      cargarStats();
      cargarCitas();
      setCountdown(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarCitas, cargarAbandonadas]);

  // Recargar al cambiar fecha
  useEffect(() => {
    if (user) cargarCitas();
  }, [fechaSeleccionada, user, cargarCitas]);

  // Countdown
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Cambiar estado
  const cambiarEstado = async (id, nuevoEstado) => {
    setLoadingCita(id);
    try {
      const res = await fetch(`${API_BASE}/api/barberia/citas/estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  // Completar y notificar
  const completarNotificar = async (id) => {
    setLoadingCita(id);
    try {
      const res = await fetch(`${API_BASE}/api/barberia/citas/notificar-completada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  // Notificar abandonada
  const notificarAbandonada = async (id) => {
    setLoadingAbandonada(id);
    try {
      const res = await fetch(`${API_BASE}/api/barberia/abandonadas/${id}/notificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) { await cargarAbandonadas(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingAbandonada(null); }
  };

  // Rescatar todos
  const rescatarTodos = async () => {
    if (!confirm('¿Enviar recordatorio a todos los clientes con citas abandonadas?')) return;
    setRescatandoTodos(true);
    try {
      const res = await fetch(`${API_BASE}/api/barberia/abandonadas/rescatar-todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} clientes notificados` : 'Error al notificar');
      await cargarAbandonadas();
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setRescatandoTodos(false); }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user');
      router.push('/login');
    }
  };

  const citasFiltradas = filtro === 'todas' ? citas :
    filtro === 'activas' ? citas.filter(c => ['Confirmada', 'En Proceso'].includes(c.estado)) :
    citas.filter(c => c.estado === filtro);

  const abandonadasPendientes = abandonadas.filter(a => !a.notificado && !a.recuperado);

  // Calcular ingresos del día
  const ingresosHoy = citas
    .filter(c => c.estado === 'Completada')
    .reduce((sum, c) => sum + (c.precio || 0), 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      {/* Alerta nueva cita */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-white text-indigo-600 py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡NUEVA CITA! 🔔
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💈 El Galpón de la Barba</h1>
            <p className="text-white/60 text-sm">
              {stats.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
              <span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>•Cerrar sesión</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
              className={`px-3 py-1 rounded-full text-sm font-bold ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <div className="text-right text-white">
              <div className="text-xl font-mono font-bold">{hora}</div>
              <div className="text-xs text-white/60">🔄 {countdown}s</div>
            </div>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-blue-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-900">{stats.confirmadas || 0}</div>
            <div className="text-xs text-blue-800">✅ Confirmadas</div>
          </div>
          <div className="bg-purple-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-900">{citas.filter(c => c.estado === 'En Proceso').length}</div>
            <div className="text-xs text-purple-800">✂️ En Proceso</div>
          </div>
          <div className="bg-green-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-900">{stats.completadas || 0}</div>
            <div className="text-xs text-green-800">🎉 Completadas</div>
          </div>
          <div className="bg-yellow-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-900">${(stats.ingresos_hoy || ingresosHoy).toLocaleString('es-CL')}</div>
            <div className="text-xs text-yellow-800">💰 Hoy</div>
          </div>
        </div>

        {/* Selector de fecha */}
        <div className="mb-4">
          <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="w-full bg-white/20 text-white border-0 rounded-xl p-3 text-center font-bold" />
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[
            { key: 'citas', icon: '💈', badge: citas.filter(c => ['Confirmada', 'En Proceso'].includes(c.estado)).length },
            { key: 'abandonadas', icon: '📋', badge: abandonadasPendientes.length },
            { key: 'reportes', icon: '📊' },
            { key: 'config', icon: '⚙️' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all ${
                vista === tab.key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
              }`}>
              {tab.icon}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vista Citas */}
        {vista === 'citas' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activas', 'Confirmada', 'En Proceso', 'Completada', '📊 Todas'].map((f, i) => {
                const key = ['activas', 'Confirmada', 'En Proceso', 'Completada', 'todas'][i];
                return (
                  <button key={key} onClick={() => setFiltro(key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      filtro === key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'
                    }`}>
                    {f}
                  </button>
                );
              })}
            </div>
            {isLoading ? (
              <div className="text-center text-white py-10">Cargando...</div>
            ) : citasFiltradas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60">No hay citas para este día</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {citasFiltradas.map(cita => (
                  <CitaCard key={cita.id} cita={cita}
                    onCambiarEstado={cambiarEstado} onCompletarNotificar={completarNotificar}
                    isLoading={loadingCita === cita.id} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista Abandonadas */}
        {vista === 'abandonadas' && (
          <>
            {abandonadasPendientes.length > 0 && (
              <button onClick={rescatarTodos} disabled={rescatandoTodos}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform disabled:opacity-50">
                {rescatandoTodos ? '⏳ Enviando...' : `🎉 Rescatar ${abandonadasPendientes.length} clientes`}
              </button>
            )}
            {abandonadas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-white/60">No hay citas abandonadas</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {abandonadas.map(a => (
                  <AbandonadaCard key={a.id} abandonada={a} onNotificar={notificarAbandonada} isLoading={loadingAbandonada === a.id} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista Reportes */}
        {vista === 'reportes' && (
          <ReportesPanel plan={config.plan || 'PRO'} />
        )}

        {/* Vista Config */}
        {vista === 'config' && (
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-4">⚙️ Configuración</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Negocio</span>
                <span className="text-white font-bold">{config.negocio?.nombre || 'El Galpón de la Barba'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Plan</span>
                <span className="text-white font-bold">{config.plan || 'PRO'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Estado</span>
                <span className={`font-bold ${config.abierto ? 'text-green-400' : 'text-red-400'}`}>
                  {config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Dirección</span>
                <span className="text-white text-sm">{config.direccion || 'Freirina 1981'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Horario</span>
                <span className="text-white text-sm">{config.horario_texto || 'Lun-Sáb 10:00-20:00'}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/70 text-sm mb-2">Servicios:</p>
                {config.servicios?.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span className="text-white">{s.emoji} {s.nombre}</span>
                    <span className="text-white font-bold">${s.precio?.toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botón refresh */}
        <button onClick={() => { cargarStats(); cargarCitas(); cargarAbandonadas(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-indigo-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
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
