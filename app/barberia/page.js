'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// 💈 DASHBOARD BARBERÍA - MISMO FORMATO QUE CARRITO
// ============================================================================

// 🔒 GRADO INDUSTRIAL: Usa proxy interno, NO expone API Key
const API_PROXY = '/api/backend';

// 🔒 Fetch seguro via proxy (API Key oculta en servidor)
const fetchSeguro = async (path, options = {}) => {
  const url = `${API_PROXY}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};

// ============================================
// 📅 COMPONENTE CITA (equivalente a PedidoCard)
// ============================================
function CitaCard({ cita, onIniciar, onCompletar, onNoAsistio, isLoading, isNew }) {
  const colores = {
    'Confirmada': 'from-blue-400 to-cyan-500',
    'En progreso': 'from-yellow-400 to-orange-500',
    'Completada': 'from-green-400 to-emerald-500',
    'Cancelada': 'from-gray-400 to-gray-500',
    'No asistió': 'from-red-400 to-red-500',
  };
  const iconos = { 'Confirmada': '📅', 'En progreso': '✂️', 'Completada': '✅', 'Cancelada': '❌', 'No asistió': '👻' };

  return (
    <div className={`bg-gradient-to-br ${colores[cita.estado] || colores['Confirmada']} rounded-2xl p-4 text-white shadow-lg ${isNew ? 'ring-4 ring-white animate-pulse' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl font-bold">🕐 {cita.hora}</span>
        <span className="text-3xl">{iconos[cita.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cita.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cita.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="text-sm font-medium mb-1">✂️ Servicio:</div>
        <div className="text-sm">{cita.servicio}</div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl font-bold">${cita.precio?.toLocaleString('es-CL')}</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{cita.estado}</span>
      </div>
      <div className="flex gap-2">
        {cita.estado === 'Confirmada' && (
          <>
            <button onClick={() => onIniciar(cita.id)} disabled={isLoading}
              className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              {isLoading ? '⏳...' : '▶️ Iniciar Atención'}
            </button>
            <button onClick={() => onNoAsistio(cita.id)} disabled={isLoading}
              className="bg-white text-red-600 font-bold py-3 px-4 rounded-xl disabled:opacity-50">
              👻
            </button>
          </>
        )}
        {cita.estado === 'En progreso' && (
          <button onClick={() => onCompletar(cita.id)} disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '✅ Completar - Notificar'}
          </button>
        )}
        {['Completada', 'Cancelada', 'No asistió'].includes(cita.estado) && (
          <span className="flex-1 text-center py-3 bg-white/20 rounded-xl">✓ {cita.estado}</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// 👻 COMPONENTE NO ASISTIÓ (equivalente a FantasmaCard)
// ============================================
function NoAsistioCard({ cliente, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">👻</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${cliente.notificado ? 'bg-green-500' : 'bg-white/30'}`}>
          {cliente.notificado ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cliente.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cliente.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">✂️ {cliente.servicio}</div>
        <div className="flex items-center gap-2 text-sm">📅 {cliente.fecha}</div>
      </div>
      {!cliente.notificado && (
        <button onClick={() => onNotificar(cliente.id)} disabled={isLoading}
          className="w-full bg-white text-purple-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Ofrecer nuevo horario'}
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
        <div className="flex items-center gap-2 text-sm mt-1">✂️ Interés: {prospecto.interes}</div>
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
// 📊 COMPONENTE REPORTES (igual que carrito)
// ============================================
function ReportesPanel({ plan }) {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarReportes(); }, [periodo]);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetchSeguro(`/api/barberia/reportes?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) setDatos(data);
    } catch (e) { console.error('Error reportes:', e); }
    finally { setCargando(false); }
  };

  const formatearPrecio = (precio) => `$${(precio || 0).toLocaleString('es-CL')}`;

  if (cargando) return (
    <div className="text-center text-white py-10">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p>Cargando reportes...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex bg-white/10 rounded-xl p-1">
        {[{ key: 'hoy', label: '📅 Hoy' }, { key: 'semana', label: '📆 Semana' }, { key: 'mes', label: '🗓️ Mes' }].map((p) => (
          <button key={p.key} onClick={() => setPeriodo(p.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${periodo === p.key ? 'bg-white text-purple-600' : 'text-white/70 hover:text-white'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {datos && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">💰 Ingresos</p>
            <p className="text-2xl font-bold">{formatearPrecio(datos.resumen?.ingresos)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">✂️ Citas</p>
            <p className="text-2xl font-bold">{datos.resumen?.citas || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">🎫 Ticket Promedio</p>
            <p className="text-2xl font-bold">{formatearPrecio(datos.resumen?.ticket_promedio)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">👥 Clientes</p>
            <p className="text-2xl font-bold">{datos.resumen?.clientes || 0}</p>
          </div>
        </div>
      )}

      {datos?.top_servicios && datos.top_servicios.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Top Servicios</h3>
          <div className="space-y-2">
            {datos.top_servicios.map((serv, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                <span className="text-white">{['🥇', '🥈', '🥉', '🏅', '🏅'][i]} {serv.nombre}</span>
                <span className="text-white font-bold">{serv.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ⚙️ COMPONENTE CONFIG CON HORARIOS EDITABLES (igual que carrito)
// ============================================
function ConfigPanel({ config, negocio, onConfigUpdate }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  
  const [horaApertura, setHoraApertura] = useState(config.hora_apertura || 10);
  const [horaCierre, setHoraCierre] = useState(config.hora_cierre || 20);
  const [diasAtencion, setDiasAtencion] = useState(config.dias_atencion || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
  const [horarioTexto, setHorarioTexto] = useState(config.horario_texto || '');
  
  const DIAS_SEMANA = [
    { id: 'lunes', label: 'Lun' },
    { id: 'martes', label: 'Mar' },
    { id: 'miercoles', label: 'Mié' },
    { id: 'jueves', label: 'Jue' },
    { id: 'viernes', label: 'Vie' },
    { id: 'sabado', label: 'Sáb' },
    { id: 'domingo', label: 'Dom' },
  ];
  
  const HORAS = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}:00`
  }));
  
  useEffect(() => {
    setHoraApertura(config.hora_apertura ?? 10);
    setHoraCierre(config.hora_cierre ?? 20);
    setDiasAtencion(config.dias_atencion || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
    setHorarioTexto(config.horario_texto || '');
  }, [config]);
  
  const toggleDia = (dia) => {
    if (diasAtencion.includes(dia)) {
      setDiasAtencion(diasAtencion.filter(d => d !== dia));
    } else {
      setDiasAtencion([...diasAtencion, dia]);
    }
  };
  
  const generarHorarioTexto = () => {
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const diasSeleccionados = diasOrden.filter(d => diasAtencion.includes(d));
    if (diasSeleccionados.length === 0) return 'Sin horario definido';
    const diasNombres = { 'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles', 'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo' };
    let texto = '';
    if (diasSeleccionados.length === 7) texto = 'Todos los días';
    else if (diasSeleccionados.length >= 5) texto = `${diasNombres[diasSeleccionados[0]]} a ${diasNombres[diasSeleccionados[diasSeleccionados.length - 1]]}`;
    else texto = diasSeleccionados.map(d => diasNombres[d]).join(', ');
    return `${texto} ${horaApertura.toString().padStart(2, '0')}:00 - ${horaCierre.toString().padStart(2, '0')}:00`;
  };
  
  const guardarHorarios = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const nuevoHorarioTexto = generarHorarioTexto();
      const res = await fetchSeguro(`/api/barberia/config/horarios`, {
        method: 'POST',
        body: JSON.stringify({ hora_apertura: horaApertura, hora_cierre: horaCierre, dias_atencion: diasAtencion, horario_texto: nuevoHorarioTexto })
      });
      const data = await res.json();
      if (data.success) {
        setHorarioTexto(nuevoHorarioTexto);
        setMensaje({ tipo: 'success', texto: '✅ Horarios guardados correctamente' });
        setEditando(false);
        if (onConfigUpdate) onConfigUpdate();
      } else setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar' });
    } catch (e) { setMensaje({ tipo: 'error', texto: 'Error de conexión' }); }
    finally { setGuardando(false); }
  };
  
  const cancelarEdicion = () => {
    setHoraApertura(config.hora_apertura ?? 10);
    setHoraCierre(config.hora_cierre ?? 20);
    setDiasAtencion(config.dias_atencion || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
    setHorarioTexto(config.horario_texto || '');
    setEditando(false);
    setMensaje(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-4">⚙️ Configuración</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/70">Negocio</span>
            <span className="text-white font-bold">{config.negocio?.nombre || config.nombre || 'El Galpón de la Barba'}</span>
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
            <span className="text-white text-sm text-right">{config.direccion || 'Melipilla, Chile'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">⏰ Horario de Atención</h3>
          {!editando && (
            <button onClick={() => setEditando(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all">
              ✏️ Editar
            </button>
          )}
        </div>

        {mensaje && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {mensaje.texto}
          </div>
        )}

        {!editando ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Horario</span>
              <span className="text-white text-sm">{horarioTexto || config.horario_texto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Apertura</span>
              <span className="text-white font-bold">{(horaApertura ?? 10).toString().padStart(2, '0')}:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Cierre</span>
              <span className="text-white font-bold">{(horaCierre ?? 20).toString().padStart(2, '0')}:00</span>
            </div>
            <div>
              <span className="text-white/70 text-sm">Días de atención:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {DIAS_SEMANA.map(dia => (
                  <span key={dia.id} className={`px-2 py-1 rounded text-xs font-medium ${diasAtencion.includes(dia.id) ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/40'}`}>
                    {dia.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm block mb-2">Días de atención:</label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map(dia => (
                  <button key={dia.id} onClick={() => toggleDia(dia.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${diasAtencion.includes(dia.id) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Hora de apertura:</label>
              <select value={horaApertura} onChange={(e) => setHoraApertura(parseInt(e.target.value))}
                className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                {HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Hora de cierre:</label>
              <select value={horaCierre} onChange={(e) => setHoraCierre(parseInt(e.target.value))}
                className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                {HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}
              </select>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-white/50 text-xs">Vista previa:</span>
              <p className="text-white font-medium">{generarHorarioTexto()}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={cancelarEdicion} disabled={guardando} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">Cancelar</button>
              <button onClick={guardarHorarios} disabled={guardando || diasAtencion.length === 0} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {guardando ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 🕐 PANEL DE HORARIOS DISPONIBLES
// ============================================
function HorariosPanel() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [disponibles, setDisponibles] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [intervalo, setIntervalo] = useState(30);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarHorarios();
    cargarIntervalo();
  }, [fecha]);

  const cargarHorarios = async () => {
    setLoading(true);
    try {
      const res = await fetchSeguro(`/api/barberia/horarios/disponibles?fecha=${fecha}`);
      const data = await res.json();
      if (data.success) {
        setDisponibles(data.disponibles || []);
        setOcupados(data.ocupados || []);
      }
    } catch (e) {
      console.error('Error cargando horarios:', e);
    } finally {
      setLoading(false);
    }
  };

  const cargarIntervalo = async () => {
    try {
      const res = await fetchSeguro('/api/barberia/horarios/intervalo');
      const data = await res.json();
      if (data.success) {
        setIntervalo(data.intervalo || 30);
      }
    } catch (e) {
      console.error('Error cargando intervalo:', e);
    }
  };

  const guardarIntervalo = async (nuevoIntervalo) => {
    setGuardando(true);
    try {
      const res = await fetchSeguro('/api/barberia/horarios/intervalo', {
        method: 'POST',
        body: JSON.stringify({ intervalo: nuevoIntervalo })
      });
      const data = await res.json();
      if (data.success) {
        setIntervalo(nuevoIntervalo);
        setMensaje({ tipo: 'success', texto: `✅ Intervalo actualizado a ${nuevoIntervalo} min` });
        cargarHorarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar' });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const bloquearHorario = async (hora) => {
    try {
      const res = await fetchSeguro('/api/barberia/horarios/bloquear', {
        method: 'POST',
        body: JSON.stringify({ fecha, hora, motivo: 'Bloqueado desde panel' })
      });
      const data = await res.json();
      if (data.success) {
        setMensaje({ tipo: 'success', texto: `🔒 ${hora} bloqueado` });
        cargarHorarios();
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al bloquear' });
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  const desbloquearHorario = async (hora) => {
    try {
      const res = await fetchSeguro('/api/barberia/horarios/desbloquear', {
        method: 'POST',
        body: JSON.stringify({ fecha, hora })
      });
      const data = await res.json();
      if (data.success) {
        setMensaje({ tipo: 'success', texto: `🔓 ${hora} desbloqueado` });
        cargarHorarios();
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al desbloquear' });
    }
    setTimeout(() => setMensaje(null), 3000);
  };

  const cambiarFecha = (dias) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFecha(nuevaFecha.toISOString().split('T')[0]);
  };

  const formatearFecha = (fechaStr) => {
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-CL', opciones);
  };

  return (
    <div className="space-y-4">
      {/* Header con fecha */}
      <div className="bg-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => cambiarFecha(-1)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl">
            ◀️
          </button>
          <div className="text-center">
            <p className="text-white/70 text-sm">📅 Fecha seleccionada</p>
            <p className="text-white font-bold text-lg capitalize">{formatearFecha(fecha)}</p>
          </div>
          <button onClick={() => cambiarFecha(1)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl">
            ▶️
          </button>
        </div>
        
        {/* Selector de fecha */}
        <input 
          type="date" 
          value={fecha} 
          onChange={(e) => setFecha(e.target.value)}
          className="w-full bg-white/20 text-white border-0 rounded-xl p-3 text-center"
        />
      </div>

      {/* Configuración de intervalo */}
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">⏱️ Intervalo entre citas</h3>
        <div className="flex gap-2">
          {[15, 30, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => guardarIntervalo(mins)}
              disabled={guardando}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                intervalo === mins 
                  ? 'bg-white text-purple-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-3 rounded-xl text-center font-bold ${
          mensaje.tipo === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs">✅ Disponibles</p>
          <p className="text-3xl font-bold">{disponibles.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs">🔒 Ocupados</p>
          <p className="text-3xl font-bold">{ocupados.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-10">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando horarios...</p>
        </div>
      ) : (
        <>
          {/* Horarios ocupados */}
          {ocupados.length > 0 && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">🔒 Citas del día</h3>
              <div className="space-y-2">
                {ocupados.map((cita, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <span className="text-white font-bold">{cita.hora}</span>
                      <span className="text-white/70 ml-2">{cita.nombre}</span>
                      <span className="text-white/50 text-sm ml-2">({cita.servicio})</span>
                    </div>
                    {cita.nombre === 'Bloqueado manualmente' || cita.servicio === 'Horario Bloqueado' ? (
                      <button 
                        onClick={() => desbloquearHorario(cita.hora)}
                        className="bg-green-500/20 hover:bg-green-500/40 text-green-300 px-3 py-1 rounded-lg text-sm"
                      >
                        🔓 Desbloquear
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Horarios disponibles */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">✅ Horarios disponibles</h3>
            {disponibles.length === 0 ? (
              <p className="text-white/50 text-center py-4">No hay horarios disponibles para este día</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {disponibles.map((hora) => (
                  <button
                    key={hora}
                    onClick={() => bloquearHorario(hora)}
                    className="bg-white/20 hover:bg-red-500/30 text-white py-2 rounded-xl text-sm font-medium transition-all group"
                    title="Click para bloquear"
                  >
                    {hora}
                    <span className="hidden group-hover:inline ml-1">🔒</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-white/40 text-xs mt-3 text-center">💡 Click en un horario para bloquearlo</p>
          </div>
        </>
      )}

      <button onClick={cargarHorarios} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all">
        🔄 Actualizar
      </button>
    </div>
  );
}

// ============================================
// ✂️ EDITOR DE SERVICIOS (equivalente a EditorMenu)
// ============================================
function EditorServicios({ onClose }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  
  // Estados del formulario SEPARADOS para evitar bug de input
  const [formNombre, setFormNombre] = useState('');
  const [formPrecio, setFormPrecio] = useState('');
  const [formDuracion, setFormDuracion] = useState('30');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formCategoria, setFormCategoria] = useState('corte');
  const [formEmoji, setFormEmoji] = useState('✂️');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetchSeguro('/api/barberia/servicios');
      const data = await res.json();
      if (data.success) setServicios(data.servicios || []);
    } catch (e) { console.error('Error:', e); }
    setLoading(false);
  };

  const limpiarForm = () => {
    setFormNombre('');
    setFormPrecio('');
    setFormDuracion('30');
    setFormDescripcion('');
    setFormCategoria('corte');
    setFormEmoji('✂️');
  };

  const iniciarEdicion = (serv) => {
    setEditandoId(serv.id);
    setFormNombre(serv.nombre || '');
    setFormPrecio(serv.precio?.toString() || '');
    setFormDuracion(serv.duracion?.toString() || '30');
    setFormDescripcion(serv.descripcion || '');
    setFormCategoria(serv.categoria || 'corte');
    setFormEmoji(serv.emoji || '✂️');
    setMostrarNuevo(false);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setMostrarNuevo(false);
    limpiarForm();
  };

  const guardarServicio = async () => {
    if (!formNombre || !formPrecio) return alert('Nombre y precio son requeridos');
    setSaving(true);
    try {
      // Generar key automáticamente desde el nombre
      const key = formNombre.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9]+/g, '_') // Solo letras/números
        .replace(/^_|_$/g, ''); // Quitar _ al inicio/final
      
      const servicio = { 
        key: key, // Backend lo requiere
        nombre: formNombre, 
        precio: parseInt(formPrecio), 
        duracion: parseInt(formDuracion) || 30, 
        descripcion: formDescripcion, 
        categoria: formCategoria, 
        emoji: formEmoji 
      };
      const isNew = mostrarNuevo;
      const url = isNew ? '/api/barberia/servicios' : `/api/barberia/servicios/${editandoId}`;
      const res = await fetchSeguro(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(servicio) });
      const data = await res.json();
      if (data.success) { await cargarDatos(); cancelarEdicion(); }
      else alert(data.errores?.join(', ') || data.error || 'Error guardando');
    } catch (e) { alert('Error de conexión: ' + e.message); }
    setSaving(false);
  };

  const eliminarServicio = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      const res = await fetchSeguro(`/api/barberia/servicios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) cargarDatos();
    } catch (e) { alert('Error eliminando'); }
  };

  const togglePromocion = async (serv) => {
    if (serv.promocion_precio) {
      await fetchSeguro(`/api/barberia/servicios/${serv.id}/promocion`, { method: 'DELETE' });
      cargarDatos();
    } else {
      const precio = prompt(`Precio promoción (actual: $${serv.precio?.toLocaleString('es-CL')}):`);
      if (!precio) return;
      const p = parseInt(precio.replace(/\D/g, ''));
      if (!p || p >= serv.precio) return alert('Precio inválido');
      await fetchSeguro(`/api/barberia/servicios/${serv.id}/promocion`, { method: 'POST', body: JSON.stringify({ precio_promocion: p }) });
      cargarDatos();
    }
  };

  // ✅ FORMULARIO INLINE (no como función separada para evitar bug de foco)
  if (loading) return <div className="text-center text-white py-10"><div className="text-4xl mb-4 animate-spin">⏳</div><p>Cargando servicios...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">✂️ Editor de Servicios</h2>
        {onClose && <button onClick={onClose} className="text-white/60 hover:text-white">✕ Cerrar</button>}
      </div>

      {!mostrarNuevo && !editandoId && (
        <button onClick={() => { setMostrarNuevo(true); limpiarForm(); }} className="w-full bg-green-500/20 border-2 border-dashed border-green-500 text-green-400 py-3 rounded-xl mb-4">
          ➕ Agregar Servicio
        </button>
      )}

      {/* ✅ FORMULARIO INLINE - Arreglado para que no pierda foco */}
      {(mostrarNuevo || editandoId) && (
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <h3 className="text-white font-bold mb-3">{mostrarNuevo ? '➕ Nuevo' : '✏️ Editar'} Servicio</h3>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Nombre del servicio" 
              value={formNombre} 
              onChange={(e) => setFormNombre(e.target.value)}
              autoFocus
              className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" 
            />
            <input 
              type="number" 
              placeholder="Precio" 
              value={formPrecio} 
              onChange={(e) => setFormPrecio(e.target.value)}
              className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" 
            />
            <input 
              type="number" 
              placeholder="Duración (min)" 
              value={formDuracion} 
              onChange={(e) => setFormDuracion(e.target.value)}
              className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" 
            />
            <select 
              value={formCategoria} 
              onChange={(e) => setFormCategoria(e.target.value)}
              className="bg-white/20 text-white rounded-lg px-3 py-2 outline-none"
            >
              <option value="corte" className="bg-gray-800">✂️ Corte</option>
              <option value="barba" className="bg-gray-800">🧔 Barba</option>
              <option value="combo" className="bg-gray-800">🔥 Combo</option>
              <option value="otro" className="bg-gray-800">⭐ Otro</option>
            </select>
            <div className="flex gap-1 items-center">
              {['✂️', '💇', '🧔', '🪒', '✨', '⭐', '🔥', '💎'].map(e => (
                <button key={e} type="button" onClick={() => setFormEmoji(e)}
                  className={`w-7 h-7 rounded text-sm ${formEmoji === e ? 'bg-white text-black' : 'bg-white/20'}`}>{e}</button>
              ))}
            </div>
            <textarea 
              placeholder="Descripción" 
              value={formDescripcion} 
              onChange={(e) => setFormDescripcion(e.target.value)}
              className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" 
              rows={2} 
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={guardarServicio} disabled={saving || !formNombre || !formPrecio}
              className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">
              {saving ? '⏳...' : '💾 Guardar'}
            </button>
            <button onClick={cancelarEdicion} className="px-4 bg-white/20 text-white rounded-lg">✕</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {servicios.filter(s => s.id !== editandoId).map(serv => (
          <div key={serv.id} className={`bg-white/10 rounded-xl p-4 ${serv.promocion_precio ? 'ring-2 ring-yellow-400' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold">{serv.emoji} {serv.nombre}</h3>
                <p className="text-white/60 text-sm">{serv.descripcion}</p>
                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80 mt-1 inline-block">{serv.categoria} • {serv.duracion} min</span>
              </div>
              <div className="text-right">
                {serv.promocion_precio ? (
                  <>
                    <div className="text-white/50 line-through text-sm">${serv.precio?.toLocaleString('es-CL')}</div>
                    <div className="text-yellow-400 font-bold text-lg">${serv.promocion_precio?.toLocaleString('es-CL')}</div>
                  </>
                ) : (
                  <div className="text-white font-bold text-lg">${serv.precio?.toLocaleString('es-CL')}</div>
                )}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => togglePromocion(serv)} className={`px-2 py-1 rounded text-xs ${serv.promocion_precio ? 'bg-yellow-500' : 'bg-white/20'} text-white`}>🏷️</button>
                  <button onClick={() => iniciarEdicion(serv)} className="px-2 py-1 rounded text-xs bg-blue-500 text-white">✏️</button>
                  <button onClick={() => eliminarServicio(serv.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {servicios.length === 0 && !mostrarNuevo && <div className="text-center py-10"><div className="text-4xl mb-2">📭</div><p className="text-white/60">No hay servicios</p></div>}
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL - MISMO FORMATO QUE CARRITO
// ============================================
export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [noAsistieron, setNoAsistieron] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({ plan: 'PRO' });
  const [filtro, setFiltro] = useState('activos');
  const [vista, setVista] = useState('citas');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);
  const [loadingNoAsistio, setLoadingNoAsistio] = useState(null);
  const [loadingProspecto, setLoadingProspecto] = useState(null);
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
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      setSoundEnabled(true);
      playSound();
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
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

  const cargarConfig = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/config`);
      const data = await res.json();
      if (data.success) setConfig(data);
    } catch (e) { console.error('Error config:', e); }
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/stats/rapidas`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) { console.error('Error stats:', e); }
  }, []);

  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/citas-db?fecha=hoy&limite=50`);
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
  }, [soundEnabled, playSound]);

  const cargarNoAsistieron = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/no-asistieron`);
      const data = await res.json();
      if (data.success) setNoAsistieron(data.clientes || []);
    } catch (e) { console.error('Error no asistieron:', e); }
  }, []);

  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/prospectos`);
      const data = await res.json();
      if (data.success) setProspectos(data.prospectos || []);
    } catch (e) { console.error('Error prospectos:', e); }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHora = () => setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    cargarConfig();
    cargarStats();
    cargarCitas();
    cargarNoAsistieron();
    cargarProspectos();
    const interval = setInterval(() => { cargarStats(); cargarCitas(); setCountdown(10); }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarCitas, cargarNoAsistieron, cargarProspectos]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  const iniciarCita = async (id) => {
    setLoadingCita(id);
    try {
      const res = await fetchSeguro(`/api/barberia/citas/iniciar`, { method: 'POST', body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const completarCita = async (id) => {
    setLoadingCita(id);
    try {
      const res = await fetchSeguro(`/api/barberia/citas/completar`, { method: 'POST', body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); alert(data.mensaje || '✅ Cita completada'); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const marcarNoAsistio = async (id) => {
    if (!confirm('¿Marcar como no asistió?')) return;
    setLoadingCita(id);
    try {
      const res = await fetchSeguro(`/api/barberia/citas/no-asistio`, { method: 'POST', body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); await cargarNoAsistieron(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const notificarNoAsistio = async (id) => {
    setLoadingNoAsistio(id);
    try {
      const res = await fetchSeguro(`/api/barberia/no-asistieron/${id}/notificar`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { await cargarNoAsistieron(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingNoAsistio(null); }
  };

  const notificarProspecto = async (id) => {
    setLoadingProspecto(id);
    try {
      const res = await fetchSeguro(`/api/barberia/prospectos/${id}/notificar`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { await cargarProspectos(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingProspecto(null); }
  };

  const cerrarSesion = () => {
    if (typeof window !== 'undefined') { localStorage.removeItem('dashboard_user'); router.push('/login'); }
  };

  const citasFiltradas = filtro === 'todos' ? citas : filtro === 'activos' ? citas.filter(c => ['Confirmada', 'En progreso'].includes(c.estado)) : citas.filter(c => c.estado === filtro);
  const noAsistieronPendientes = noAsistieron.filter(n => !n.notificado);
  const prospectosPendientes = prospectos.filter(p => !p.notificado);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600">
      {showAlert && <div className="fixed top-0 left-0 right-0 bg-white text-purple-600 py-3 text-center font-bold z-50 animate-pulse">🔔 ¡NUEVA CITA! 🔔</div>}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💈 Dashboard</h1>
            <p className="text-white/60 text-sm">
              {stats.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
              <span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>• Cerrar sesión</span>
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

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-yellow-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-900">{stats.pendientes || 0}</div>
            <div className="text-xs text-yellow-800">📅 Pendientes</div>
          </div>
          <div className="bg-green-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-900">{stats.completadas || 0}</div>
            <div className="text-xs text-green-800">✅ Completadas</div>
          </div>
          <div className="bg-blue-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-900">${(stats.ingresos_hoy || 0).toLocaleString('es-CL')}</div>
            <div className="text-xs text-blue-800">💰 Hoy</div>
          </div>
          <div className="bg-purple-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-900">{(prospectosPendientes.length || 0) + (noAsistieronPendientes.length || 0)}</div>
            <div className="text-xs text-purple-800">📋 Pendientes</div>
          </div>
        </div>

        {/* TABS - MISMO FORMATO QUE CARRITO */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[
            { key: 'citas', icon: '📅', label: '' },
            { key: 'noasistieron', icon: '👻', label: '', badge: noAsistieronPendientes.length },
            { key: 'prospectos', icon: '📋', label: '', badge: prospectosPendientes.length },
            { key: 'horarios', icon: '🕐', label: '' },
            { key: 'servicios', icon: '✂️', label: '' },
            { key: 'reportes', icon: '📊', label: '' },
            { key: 'config', icon: '⚙️', label: '' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all ${vista === tab.key ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
              {tab.icon}{tab.label}
              {tab.badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {vista === 'citas' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activos', 'Confirmada', 'En progreso', 'Completada', '📊 Todos'].map((f, i) => {
                const key = ['activos', 'Confirmada', 'En progreso', 'Completada', 'todos'][i];
                return (
                  <button key={key} onClick={() => setFiltro(key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${filtro === key ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                    {f}
                  </button>
                );
              })}
            </div>
            {isLoading ? <div className="text-center text-white py-10">Cargando...</div> : citasFiltradas.length === 0 ? (
              <div className="text-center py-10"><div className="text-6xl mb-4">📭</div><p className="text-white/60">No hay citas</p></div>
            ) : (
              <div className="grid gap-4">
                {citasFiltradas.map(cita => (
                  <CitaCard key={cita.id} cita={cita} onIniciar={iniciarCita} onCompletar={completarCita} onNoAsistio={marcarNoAsistio}
                    isLoading={loadingCita === cita.id} isNew={newCitaIds.has(cita.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'noasistieron' && (
          noAsistieron.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">👻</div><p className="text-white/60">No hay clientes que no asistieron</p></div> : (
            <div className="grid gap-4">{noAsistieron.map(c => <NoAsistioCard key={c.id} cliente={c} onNotificar={notificarNoAsistio} isLoading={loadingNoAsistio === c.id} />)}</div>
          )
        )}

        {vista === 'prospectos' && (
          prospectos.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">📋</div><p className="text-white/60">No hay prospectos</p></div> : (
            <div className="grid gap-4">{prospectos.map(p => <ProspectoCard key={p.id} prospecto={p} onNotificar={notificarProspecto} isLoading={loadingProspecto === p.id} />)}</div>
          )
        )}

        {vista === 'servicios' && <EditorServicios onClose={() => setVista('citas')} />}

        {vista === 'horarios' && <HorariosPanel />}

        {vista === 'reportes' && <ReportesPanel plan={config.plan || 'PRO'} />}

        {vista === 'config' && <ConfigPanel config={config} negocio="barberia" onConfigUpdate={cargarConfig} />}

        <button onClick={() => { cargarStats(); cargarCitas(); cargarNoAsistieron(); cargarProspectos(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-purple-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
          🔄
        </button>

        {!soundEnabled && mounted && (
          <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            ⚠️ Activa el sonido
          </div>
        )}
      </div>
    </div>
  );
}
