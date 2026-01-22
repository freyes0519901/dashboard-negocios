'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('Confirmada');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newCitaIds, setNewCitaIds] = useState(new Set());
  const [countdown, setCountdown] = useState(15);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const audioContextRef = useRef(null);
  const previousCitasRef = useRef([]);

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
      osc1.frequency.value = 600;
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
        osc2.frequency.value = 800;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
      }, 200);

      // Tercer beep
      setTimeout(() => {
        if (!audioContextRef.current) return;
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.frequency.value = 1000;
        osc3.type = 'sine';
        gain3.gain.setValueAtTime(0.3, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc3.start(ctx.currentTime);
        osc3.stop(ctx.currentTime + 0.3);
      }, 400);

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
      // Sonido de prueba
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
      if (parsed.negocio !== 'barberia') { 
        router.push('/login'); 
        return; 
      }
      setUser(parsed);
    } catch (e) { 
      router.push('/login'); 
    }
  }, [router]);

  // Cargar citas y detectar nuevas/cambios
  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/barberia/citas');
      const data = await res.json();
      
      if (data.success) {
        const nuevasCitas = data.citas || [];
        const nuevosStats = data.stats || {};
        
        // Detectar nuevas citas
        const previousIds = new Set(previousCitasRef.current.map(c => `${c.fila}-${c.nombre}-${c.hora}`));
        const currentIds = nuevasCitas.map(c => `${c.fila}-${c.nombre}-${c.hora}`);
        const citasNuevas = currentIds.filter(id => !previousIds.has(id));
        
        // 🔧 FIX: Detectar cambios de estado (cancelaciones, etc.)
        let hayCambioEstado = false;
        if (previousCitasRef.current.length > 0) {
          for (const citaNueva of nuevasCitas) {
            const citaAnterior = previousCitasRef.current.find(c => c.fila === citaNueva.fila);
            if (citaAnterior && citaAnterior.estado !== citaNueva.estado) {
              console.log(`🔄 Cambio de estado: ${citaAnterior.estado} → ${citaNueva.estado}`);
              hayCambioEstado = true;
              break;
            }
          }
        }
        
        // Notificar si hay nuevas citas O cambios de estado
        if ((citasNuevas.length > 0 || hayCambioEstado) && previousCitasRef.current.length > 0) {
          const mensaje = citasNuevas.length > 0 
            ? `${citasNuevas.length} nueva(s) cita(s)` 
            : 'Estado de cita actualizado';
          
          console.log('🔔', mensaje);
          
          // Reproducir sonido si está habilitado
          if (soundEnabled) {
            playSound();
          }
          
          // Mostrar alerta
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
          
          // Marcar citas como nuevas (solo las realmente nuevas)
          if (citasNuevas.length > 0) {
            setNewCitaIds(new Set(citasNuevas));
            setTimeout(() => setNewCitaIds(new Set()), 10000);
          }
          
          // Notificación del navegador
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('💈 Actualización', {
              body: mensaje,
              tag: 'cita-update'
            });
          }
        }
        
        previousCitasRef.current = nuevasCitas;
        setCitas(nuevasCitas);
        setStats(nuevosStats);
      }
    } catch (e) { 
      console.error('Error cargando citas:', e); 
    } finally { 
      setIsLoading(false);
      setCountdown(15);
    }
  }, [playSound, soundEnabled]);

  // Cambiar estado de cita
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

  // Solicitar permiso de notificaciones
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Reloj y auto-refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Reloj
    const timerReloj = setInterval(() => {
      setHora(new Date().toLocaleTimeString('es-CL'));
    }, 1000);
    setHora(new Date().toLocaleTimeString('es-CL'));
    
    // Carga inicial
    cargarCitas();
    
    // Auto-refresh cada 15 segundos
    const refreshInterval = setInterval(cargarCitas, 15000);
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 15 : prev - 1);
    }, 1000);
    
    return () => { 
      clearInterval(timerReloj); 
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [cargarCitas]);

  const citasFiltradas = filtro === 'todos' ? citas : citas.filter(c => c.estado === filtro);

  const handleLogout = () => { 
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user'); 
    }
    router.push('/login'); 
  };

  // Loading mientras no está montado o no hay usuario
  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 flex items-center justify-center">
        <div className="text-6xl animate-bounce">💈</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900">
      {/* Alerta de nueva cita */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 px-6 text-center font-bold text-lg z-[100] animate-pulse shadow-2xl">
          🔔 ¡NUEVA CITA AGENDADA! 🔔
        </div>
      )}

      <header className="bg-black/30 sticky top-0 z-50 border-b border-white/10 px-4 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white text-2xl">←</Link>
            <div>
              <h1 className="text-xl font-bold text-white">💈 {user.nombre}</h1>
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
                  : 'bg-yellow-500 text-black animate-pulse'
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
            <div className="text-sm">📊 Total</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['Confirmada', 'Completada', 'No Asistió', 'Cancelada', 'todos'].map(f => (
            <button 
              key={f} 
              onClick={() => setFiltro(f)} 
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                filtro === f 
                  ? 'bg-white text-purple-600 scale-105' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {f === 'Confirmada' ? '📅 Pendientes' : f === 'todos' ? '📋 Todas' : f}
            </button>
          ))}
        </div>

        {/* Lista de citas */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl animate-bounce">💈</div>
            <p className="text-white/50 mt-4">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citasFiltradas.map(c => (
              <CitaCard 
                key={c.fila} 
                cita={c} 
                onCambiarEstado={cambiarEstado} 
                isLoading={loadingCita === c.fila}
                isNew={newCitaIds.has(`${c.fila}-${c.nombre}-${c.hora}`)}
              />
            ))}
          </div>
        )}
        
        {!isLoading && citasFiltradas.length === 0 && (
          <div className="text-center text-white/50 py-12">
            <div className="text-6xl mb-4">📭</div>
            <p>No hay citas</p>
          </div>
        )}
      </main>

      {/* Refresh button */}
      <button 
        onClick={cargarCitas}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full text-white text-2xl shadow-lg hover:scale-110 transition-transform"
      >
        🔄
      </button>

      {/* Indicador sonido desactivado */}
      {!soundEnabled && (
        <div className="fixed bottom-6 left-6 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium animate-bounce">
          ⚠️ Activa el sonido →
        </div>
      )}
    </div>
  );
}
