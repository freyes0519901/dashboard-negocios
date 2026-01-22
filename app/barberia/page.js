'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// 📅 COMPONENTE CITA
// ============================================
function CitaCard({ cita, onCambiarEstado, isLoading, isNew }) {
  const colores = {
    'Confirmada': 'from-violet-500 to-purple-600',
    'Completada': 'from-green-400 to-emerald-500',
    'No Asistió': 'from-red-400 to-red-600',
    'Cancelada': 'from-gray-400 to-gray-600',
  };
  const iconos = { 'Confirmada': '📅', 'Completada': '✅', 'No Asistió': '❌', 'Cancelada': '🚫' };

  return (
    <div className={`bg-gradient-to-br ${colores[cita.estado] || colores['Confirmada']} rounded-2xl p-4 text-white shadow-lg ${isNew ? 'animate-pulse ring-4 ring-yellow-400' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl font-bold">⏰ {cita.hora}</span>
        <div className="flex items-center gap-2">
          {isNew && <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce">NUEVA!</span>}
          <span className="text-3xl">{iconos[cita.estado] || '📅'}</span>
        </div>
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
              className="flex-1 bg-white text-green-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              {isLoading ? '...' : '✅ Completada'}
            </button>
            <button onClick={() => onCambiarEstado(cita.fila, 'No Asistió')} disabled={isLoading}
              className="bg-white/20 text-white font-bold py-2 px-4 rounded-xl hover:bg-white/30 transition-colors">❌</button>
          </>
        )}
        {cita.estado === 'Completada' && <span className="flex-1 text-center py-2">Atendido ✓</span>}
        {cita.estado === 'No Asistió' && <span className="flex-1 text-center py-2">No se presentó</span>}
        {cita.estado === 'Cancelada' && <span className="flex-1 text-center py-2">Cancelada por cliente</span>}
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
        <div className="flex items-center gap-2 text-sm mt-1">📅 {prospecto.fecha}</div>
      </div>
      {prospecto.notificado !== 'Sí' && (
        <button 
          onClick={() => onNotificar(prospecto.fila, prospecto.telefono, prospecto.nombre)}
          disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '...' : '📲 Notificar'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('Confirmada');
  const [vista, setVista] = useState('citas'); // 'citas' o 'prospectos'
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);
  const [loadingProspecto, setLoadingProspecto] = useState(null);
  const [notificandoTodos, setNotificandoTodos] = useState(false);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newCitaIds, setNewCitaIds] = useState(new Set());
  const [countdown, setCountdown] = useState(15);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const audioContextRef = useRef(null);
  const previousCitasRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para reproducir sonido
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
        }, i * 200);
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
      if (parsed.negocio !== 'barberia') { router.push('/login'); return; }
      setUser(parsed);
    } catch (e) { router.push('/login'); }
  }, [router]);

  // Cargar citas
  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/citas');
      const data = await res.json();
      
      if (data.success) {
        const nuevasCitas = data.citas || [];
        const nuevosStats = data.stats || {};
        
        const previousIds = new Set(previousCitasRef.current.map(c => `${c.fila}-${c.nombre}-${c.hora}`));
        const currentIds = nuevasCitas.map(c => `${c.fila}-${c.nombre}-${c.hora}`);
        const citasNuevas = currentIds.filter(id => !previousIds.has(id));
        
        let hayCambioEstado = false;
        if (previousCitasRef.current.length > 0) {
          for (const citaNueva of nuevasCitas) {
            const citaAnterior = previousCitasRef.current.find(c => c.fila === citaNueva.fila);
            if (citaAnterior && citaAnterior.estado !== citaNueva.estado) {
              hayCambioEstado = true;
              break;
            }
          }
        }
        
        if ((citasNuevas.length > 0 || hayCambioEstado) && previousCitasRef.current.length > 0) {
          if (soundEnabled) playSound();
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
          
          if (citasNuevas.length > 0) {
            setNewCitaIds(new Set(citasNuevas));
            setTimeout(() => setNewCitaIds(new Set()), 10000);
          }
          
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('💈 Actualización', { body: citasNuevas.length > 0 ? `${citasNuevas.length} nueva(s) cita(s)` : 'Estado actualizado', tag: 'cita-update' });
          }
        }
        
        previousCitasRef.current = nuevasCitas;
        setCitas(nuevasCitas);
        setStats(nuevosStats);
      }
    } catch (e) { console.error('Error cargando citas:', e); } 
    finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);

  // Cargar prospectos
  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/prospectos');
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
    cargarCitas();
    cargarProspectos();
    const interval = setInterval(() => {
      cargarCitas();
      cargarProspectos();
      setCountdown(15);
    }, 15000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 15);
    }, 1000);
    
    return () => { clearInterval(interval); clearInterval(countdownInterval); };
  }, [user, cargarCitas, cargarProspectos]);

  // Cambiar estado cita
  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingCita(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, estado: nuevoEstado })
      });
      if ((await res.json()).success) await cargarCitas();
    } catch (e) { console.error('Error:', e); }
    finally { setLoadingCita(null); }
  };

  // Notificar prospecto individual
  const notificarProspecto = async (fila, telefono, nombre) => {
    setLoadingProspecto(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/notificar-prospecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre })
      });
      if ((await res.json()).success) await cargarProspectos();
    } catch (e) { console.error('Error:', e); }
    finally { setLoadingProspecto(null); }
  };

  // Notificar todos los prospectos
  const notificarTodos = async () => {
    if (!confirm('¿Enviar mensaje a TODOS los prospectos pendientes?')) return;
    setNotificandoTodos(true);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/notificar-todos', {
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

  const citasFiltradas = filtro === 'todos' ? citas : citas.filter(c => c.estado === filtro);
  const prospectosPendientes = prospectos.filter(p => p.notificado !== 'Sí');

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900">
      {/* Alerta de nueva cita */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡ACTUALIZACIÓN EN CITAS! 🔔
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-white/60 hover:text-white">← </Link>
            <h1 className="text-2xl font-bold text-white inline">💈 El Galpón de la Barba</h1>
            <p className="text-white/60 text-sm cursor-pointer hover:text-white/80" onClick={cerrarSesion}>Cerrar sesión</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
              className={`px-4 py-2 rounded-full font-bold text-sm ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}
            >
              {soundEnabled ? '🔊 Sonido ON' : '🔇 Activar Sonido'}
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
            onClick={() => setVista('citas')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${vista === 'citas' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}
          >
            📅 Citas ({citas.length})
          </button>
          <button
            onClick={() => setVista('prospectos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all relative ${vista === 'prospectos' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}
          >
            📋 Prospectos ({prospectos.length})
            {prospectosPendientes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {prospectosPendientes.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================ */}
        {/* VISTA CITAS */}
        {/* ============================================ */}
        {vista === 'citas' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.pendientes || 0}</div>
                <div className="text-sm">📅 Pendientes</div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.completadas || 0}</div>
                <div className="text-sm">✅ Completadas</div>
              </div>
              <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.no_asistio || 0}</div>
                <div className="text-sm">❌ No asistió</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.total || 0}</div>
                <div className="text-sm">📊 Total hoy</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Confirmada', 'Completada', 'No Asistió', 'Cancelada', 'todos'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${filtro === f ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                  {f === 'todos' ? '📊 Todos' : f === 'Confirmada' ? '📅 Pendientes' : f === 'Cancelada' ? '🚫 Cancelada' : f}
                </button>
              ))}
            </div>

            {/* Lista de Citas */}
            {isLoading ? (
              <div className="text-center text-white py-10">Cargando...</div>
            ) : citasFiltradas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60">No hay citas con estado "{filtro}"</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {citasFiltradas.map(cita => (
                  <CitaCard key={cita.fila} cita={cita} onCambiarEstado={cambiarEstado}
                    isLoading={loadingCita === cita.fila} isNew={newCitaIds.has(`${cita.fila}-${cita.nombre}-${cita.hora}`)} />
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
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {notificandoTodos ? '⏳ Notificando...' : `📲 Notificar a TODOS (${prospectosPendientes.length} pendientes)`}
              </button>
            )}

            {/* Lista de Prospectos */}
            {prospectos.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-white/60">No hay prospectos registrados</p>
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
        <button onClick={() => { cargarCitas(); cargarProspectos(); setCountdown(15); }}
          className="fixed bottom-6 right-6 bg-white text-purple-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
          🔄
        </button>

        {/* Warning sonido */}
        {!soundEnabled && mounted && (
          <div className="fixed bottom-6 left-6 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            ⚠️ Activa el sonido
          </div>
        )}
      </div>
    </div>
  );
}
