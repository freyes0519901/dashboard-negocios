'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  const iconos = { 'Confirmada': '✅', 'En Proceso': '✂️', 'Completada': '🎉', 'Cancelada': '❌', 'No Asistió': '😞' };

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
          <span className="text-lg font-bold">${(cita.precio || 0).toLocaleString('es-CL')}</span>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">{cita.duracion || 30} min</span>
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
        {['Completada', 'Cancelada', 'No Asistió'].includes(cita.estado) && (
          <span className="flex-1 text-center py-3 bg-white/20 rounded-xl">
            {cita.estado === 'Completada' ? '✓ Completada' : cita.estado === 'Cancelada' ? '✗ Cancelada' : '✗ No asistió'}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// 😞 COMPONENTE NO ASISTIÓ
// ============================================
function NoAsistioCard({ cliente, onReagendar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">😞</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{cliente.fecha}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cliente.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cliente.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">✂️ {cliente.servicio}</div>
        <div className="flex items-center gap-2 text-sm">⏰ Cita era: {cliente.hora}</div>
      </div>
      {!cliente.notificado ? (
        <button onClick={() => onReagendar(cliente.id)} disabled={isLoading}
          className="w-full bg-white text-red-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 "¿Reagendamos?"'}
        </button>
      ) : (
        <span className="block text-center py-2 bg-white/20 rounded-xl text-sm">✅ Ya notificado</span>
      )}
    </div>
  );
}

// ============================================
// 📋 COMPONENTE SIN AGENDAR
// ============================================
function SinAgendarCard({ prospecto, onNotificar, isLoading }) {
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
        <div className="flex items-center gap-2 text-sm mt-1">✂️ Interesado en: {prospecto.servicio}</div>
      </div>
      {!prospecto.notificado && (
        <button onClick={() => onNotificar(prospecto.id)} disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 "¿Te agendamos?"'}
        </button>
      )}
    </div>
  );
}

// ============================================
// ⭐ COMPONENTE VIP
// ============================================
function VipCard({ cliente, onEnviarPromo }) {
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">⭐</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded font-bold">{cliente.visitas} visitas</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cliente.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cliente.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">✂️ Favorito: {cliente.servicio_favorito}</div>
        <div className="flex items-center gap-2 text-sm">💰 Total gastado: ${(cliente.total_gastado || 0).toLocaleString('es-CL')}</div>
      </div>
      <button onClick={() => onEnviarPromo(cliente.id)}
        className="w-full bg-white text-amber-600 font-bold py-2 rounded-xl hover:scale-105 transition-transform">
        🎁 Enviar promo VIP
      </button>
    </div>
  );
}

// ============================================
// ⏰ COMPONENTE RECORDATORIO
// ============================================
function RecordatorioCard({ cita, onEnviarRecordatorio, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">⏰</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{cita.fecha} - {cita.hora}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cita.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cita.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">✂️ {cita.servicio}</div>
      </div>
      {!cita.recordatorio_enviado ? (
        <button onClick={() => onEnviarRecordatorio(cita.id)} disabled={isLoading}
          className="w-full bg-white text-blue-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Enviar recordatorio'}
        </button>
      ) : (
        <span className="block text-center py-2 bg-white/20 rounded-xl text-sm">✅ Recordatorio enviado</span>
      )}
    </div>
  );
}

// ============================================
// 📊 COMPONENTE REPORTES BARBERÍA
// ============================================
function ReportesPanel({ plan }) {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(null);
  const [permisos, setPermisos] = useState(null);

  useEffect(() => { cargarPermisos(); }, [plan]);
  useEffect(() => { cargarReportes(); }, [periodo]);

  const cargarPermisos = async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/export/permisos?plan=${plan}`);
      const data = await res.json();
      if (data.success) setPermisos(data);
    } catch (e) { console.error('Error permisos:', e); }
  };

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetchSeguro(`/api/barberia/reportes?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) setDatos(data);
    } catch (e) { console.error('Error reportes:', e); }
    finally { setCargando(false); }
  };

  const descargarExcel = async () => {
    if (!permisos?.exports_enabled) { alert('Exports no disponibles'); return; }
    setExportando('excel');
    try { window.open(`${API_PROXY}/api/barberia/export/excel?periodo=${periodo}&plan=${plan}`, '_blank'); }
    catch (e) { alert('Error descargando Excel'); }
    finally { setTimeout(() => setExportando(null), 1000); }
  };

  const descargarPDF = async (tipo = 'basico') => {
    if (!permisos?.exports_enabled) { alert('Exports no disponibles'); return; }
    setExportando('pdf');
    try { window.open(`${API_PROXY}/api/barberia/export/pdf?periodo=${periodo}&tipo=${tipo}&plan=${plan}`, '_blank'); }
    catch (e) { alert('Error descargando PDF'); }
    finally { setTimeout(() => setExportando(null), 1000); }
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
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${periodo === p.key ? 'bg-white text-indigo-600' : 'text-white/70 hover:text-white'}`}>
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
            <p className="text-2xl font-bold">{datos.resumen?.clientes_unicos || 0}</p>
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

      <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-white/20 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">📥 Exportar Reportes</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={descargarExcel} disabled={exportando === 'excel'}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 transition-all hover:scale-105">
            {exportando === 'excel' ? '⏳...' : '📥 Excel'}
          </button>
          <button onClick={() => descargarPDF('basico')} disabled={exportando === 'pdf'}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 transition-all hover:scale-105">
            {exportando === 'pdf' ? '⏳...' : '📄 PDF'}
          </button>
        </div>
        <div className="mt-3 text-center">
          <span className="text-white/50 text-xs">Plan: <span className="font-bold text-white/70">{plan}</span></span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ⚙️ COMPONENTE CONFIG CON HORARIOS EDITABLES
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
    { id: 'lunes', label: 'Lun' }, { id: 'martes', label: 'Mar' }, { id: 'miercoles', label: 'Mié' },
    { id: 'jueves', label: 'Jue' }, { id: 'viernes', label: 'Vie' }, { id: 'sabado', label: 'Sáb' }, { id: 'domingo', label: 'Dom' },
  ];
  
  const HORAS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i.toString().padStart(2, '0')}:00` }));
  
  useEffect(() => {
    setHoraApertura(config.hora_apertura ?? 10);
    setHoraCierre(config.hora_cierre ?? 20);
    setDiasAtencion(config.dias_atencion || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
    setHorarioTexto(config.horario_texto || '');
  }, [config]);
  
  const toggleDia = (dia) => {
    if (diasAtencion.includes(dia)) setDiasAtencion(diasAtencion.filter(d => d !== dia));
    else setDiasAtencion([...diasAtencion, dia]);
  };
  
  const generarHorarioTexto = () => {
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const diasSeleccionados = diasOrden.filter(d => diasAtencion.includes(d));
    if (diasSeleccionados.length === 0) return 'Sin horario definido';
    const diasNombres = { 'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles', 'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo' };
    let texto = diasSeleccionados.length === 7 ? 'Todos los días' : diasSeleccionados.length >= 5 ? `${diasNombres[diasSeleccionados[0]]} a ${diasNombres[diasSeleccionados[diasSeleccionados.length - 1]]}` : diasSeleccionados.map(d => diasNombres[d]).join(', ');
    return `${texto} ${horaApertura.toString().padStart(2, '0')}:00 - ${horaCierre.toString().padStart(2, '0')}:00`;
  };
  
  const guardarHorarios = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const nuevoHorarioTexto = generarHorarioTexto();
      const res = await fetchSeguro(`/api/${negocio}/config/horarios`, {
        method: 'POST',
        body: JSON.stringify({ hora_apertura: horaApertura, hora_cierre: horaCierre, dias_atencion: diasAtencion, horario_texto: nuevoHorarioTexto })
      });
      const data = await res.json();
      if (data.success) { setHorarioTexto(nuevoHorarioTexto); setMensaje({ tipo: 'success', texto: '✅ Horarios guardados' }); setEditando(false); if (onConfigUpdate) onConfigUpdate(); }
      else setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar' });
    } catch (e) { setMensaje({ tipo: 'error', texto: 'Error de conexión' }); }
    finally { setGuardando(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-4">⚙️ Configuración</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-white/70">Negocio</span><span className="text-white font-bold">{config.negocio?.nombre || 'El Galpón de la Barba'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Plan</span><span className="text-white font-bold">{config.plan || 'BASICO'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Estado</span><span className={`font-bold ${config.abierto ? 'text-green-400' : 'text-red-400'}`}>{config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Dirección</span><span className="text-white text-sm text-right">{config.direccion || 'Freirina 1981'}</span></div>
        </div>
      </div>

      <div className="bg-white/10 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">⏰ Horario de Atención</h3>
          {!editando && <button onClick={() => setEditando(true)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium">✏️ Editar</button>}
        </div>
        {mensaje && <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{mensaje.texto}</div>}
        {!editando ? (
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-white/70">Horario</span><span className="text-white text-sm">{horarioTexto || config.horario_texto}</span></div>
            <div><span className="text-white/70 text-sm">Días de atención:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {DIAS_SEMANA.map(dia => <span key={dia.id} className={`px-2 py-1 rounded text-xs font-medium ${diasAtencion.includes(dia.id) ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/40'}`}>{dia.label}</span>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div><label className="text-white/70 text-sm block mb-2">Días de atención:</label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map(dia => <button key={dia.id} onClick={() => toggleDia(dia.id)} className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${diasAtencion.includes(dia.id) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'}`}>{dia.label}</button>)}
              </div>
            </div>
            <div><label className="text-white/70 text-sm block mb-2">Hora de apertura:</label>
              <select value={horaApertura} onChange={(e) => setHoraApertura(parseInt(e.target.value))} className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                {HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}
              </select>
            </div>
            <div><label className="text-white/70 text-sm block mb-2">Hora de cierre:</label>
              <select value={horaCierre} onChange={(e) => setHoraCierre(parseInt(e.target.value))} className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                {HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}
              </select>
            </div>
            <div className="bg-white/5 rounded-xl p-3"><span className="text-white/50 text-xs">Vista previa:</span><p className="text-white font-medium">{generarHorarioTexto()}</p></div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setEditando(false); setMensaje(null); }} disabled={guardando} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl disabled:opacity-50">Cancelar</button>
              <button onClick={guardarHorarios} disabled={guardando || diasAtencion.length === 0} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50">{guardando ? '⏳...' : '💾 Guardar'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// ✂️ EDITOR DE SERVICIOS
// ============================================
function EditorServicios({ onClose }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(null);

  useEffect(() => { cargarServicios(); }, []);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const res = await fetchSeguro('/api/barberia/servicios');
      const data = await res.json();
      if (data.success) setServicios(data.servicios);
    } catch (e) { console.error('Error:', e); }
    setLoading(false);
  };

  const guardarServicio = async (servicio) => {
    setSaving(true);
    try {
      const isNew = !servicio.id;
      const url = isNew ? '/api/barberia/servicios' : `/api/barberia/servicios/${servicio.id}`;
      const res = await fetchSeguro(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(servicio) });
      const data = await res.json();
      if (data.success) { await cargarServicios(); setEditando(null); setNuevo(null); }
      else alert(data.error || 'Error guardando');
    } catch (e) { alert('Error de conexión'); }
    setSaving(false);
  };

  const eliminarServicio = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      const res = await fetchSeguro(`/api/barberia/servicios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) cargarServicios();
    } catch (e) { alert('Error eliminando'); }
  };

  const FormServicio = ({ servicio, onSave, onCancel }) => {
    const [form, setForm] = useState(servicio || { key: '', nombre: '', precio: '', duracion: 30, descripcion: '', categoria: 'corte', disponible: true });
    return (
      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3">{servicio?.id ? '✏️ Editar' : '➕ Nuevo'} Servicio</h3>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Clave (ej: corte_fade)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" disabled={!!servicio?.id} />
          <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
          <input type="number" placeholder="Precio $" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Duración" value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })}
              className="flex-1 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
            <span className="text-white/60">min</span>
          </div>
          <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2">
            <option value="corte">✂️ Corte</option>
            <option value="barba">🧔 Barba</option>
            <option value="combo">🔥 Combo</option>
            <option value="especial">⭐ Especial</option>
          </select>
          <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" rows={2} />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => onSave(form)} disabled={saving || !form.nombre || !form.precio}
            className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">{saving ? '⏳...' : '💾 Guardar'}</button>
          <button onClick={onCancel} className="px-4 bg-white/20 text-white rounded-lg">✕</button>
        </div>
      </div>
    );
  };

  const iconoCategoria = { 'corte': '✂️', 'barba': '🧔', 'combo': '🔥', 'especial': '⭐' };
  const colorCategoria = { 'corte': 'from-blue-500/30 to-cyan-500/30', 'barba': 'from-amber-500/30 to-orange-500/30', 'combo': 'from-purple-500/30 to-pink-500/30', 'especial': 'from-yellow-500/30 to-amber-500/30' };

  if (loading) return <div className="text-center text-white py-10"><div className="text-4xl mb-4 animate-spin">⏳</div><p>Cargando servicios...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">✂️ Editor de Servicios</h2>
        {onClose && <button onClick={onClose} className="text-white/60 hover:text-white">✕ Cerrar</button>}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {['corte', 'barba', 'combo', 'especial'].map(cat => (
          <div key={cat} className={`bg-gradient-to-r ${colorCategoria[cat]} rounded-xl p-3 text-center`}>
            <div className="text-2xl">{iconoCategoria[cat]}</div>
            <div className="text-white font-bold">{servicios.filter(s => s.categoria === cat).length}</div>
          </div>
        ))}
      </div>
      {!nuevo && <button onClick={() => setNuevo({})} className="w-full bg-indigo-500/20 border-2 border-dashed border-indigo-500 text-indigo-400 py-3 rounded-xl mb-4">➕ Agregar Servicio</button>}
      {nuevo && <FormServicio servicio={null} onSave={guardarServicio} onCancel={() => setNuevo(null)} />}
      {['corte', 'barba', 'combo', 'especial'].map(categoria => {
        const serviciosCategoria = servicios.filter(s => s.categoria === categoria);
        if (serviciosCategoria.length === 0) return null;
        return (
          <div key={categoria} className="mb-6">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">{iconoCategoria[categoria]} {categoria.charAt(0).toUpperCase() + categoria.slice(1)}s</h3>
            <div className="space-y-3">
              {serviciosCategoria.map(serv => (
                editando === serv.id ? <FormServicio key={serv.id} servicio={serv} onSave={guardarServicio} onCancel={() => setEditando(null)} /> : (
                  <div key={serv.id} className={`bg-gradient-to-r ${colorCategoria[serv.categoria]} rounded-xl p-4 ${!serv.disponible ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold">{serv.nombre}</h4>
                        <p className="text-white/60 text-sm">{serv.descripcion}</p>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80 mt-2 inline-block">⏱️ {serv.duracion} min</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-xl">${serv.precio?.toLocaleString('es-CL')}</div>
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => guardarServicio({ ...serv, disponible: !serv.disponible })} className={`px-2 py-1 rounded text-xs ${serv.disponible ? 'bg-green-500' : 'bg-red-500'} text-white`}>{serv.disponible ? '✓' : '✗'}</button>
                          <button onClick={() => setEditando(serv.id)} className="px-2 py-1 rounded text-xs bg-blue-500 text-white">✏️</button>
                          <button onClick={() => eliminarServicio(serv.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        );
      })}
      {servicios.length === 0 && !nuevo && <div className="text-center py-10"><div className="text-4xl mb-2">💈</div><p className="text-white/60">No hay servicios</p></div>}
    </div>
  );
}

// ============================================
// 💳 PANEL DE SUSCRIPCIÓN
// ============================================
function SuscripcionPanel({ negocio, onClose }) {
  const [suscripcion, setSuscripcion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [precios, setPrecios] = useState({});
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [tab, setTab] = useState('estado');

  useEffect(() => { cargarDatos(); }, [negocio]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [subRes, histRes] = await Promise.all([
        fetchSeguro(`/api/suscripcion/${negocio}`),
        fetchSeguro(`/api/suscripcion/${negocio}/historial`)
      ]);
      const subData = await subRes.json();
      const histData = await histRes.json();
      if (subData.success) { setSuscripcion(subData.suscripcion); setPrecios(subData.precios || {}); }
      if (histData.success) setHistorial(histData.pagos || []);
    } catch (e) { console.error('Error:', e); }
    setLoading(false);
  };

  const iniciarPago = async (plan) => {
    if (procesando) return;
    setProcesando(true);
    try {
      const res = await fetchSeguro(`/api/suscripcion/${negocio}/pagar`, { method: 'POST', body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (data.success && data.url_pago) window.location.href = data.url_pago;
      else alert(data.error || 'Error iniciando pago');
    } catch (e) { alert('Error de conexión'); }
    setProcesando(false);
  };

  const beneficiosPlan = {
    'BASICO': ['✓ Reservas automáticas WhatsApp', '✓ Confirmación instantánea', '✓ Dashboard básico', '✓ Google Sheets', '✗ Pagos online', '✗ Recordatorios 24h', '✗ Rescate abandonados'],
    'PRO': ['✓ Todo del Básico', '✓ PAGOS ONLINE', '✓ Recordatorios 24h antes', '✓ Rescate citas abandonadas', '✓ Export Excel completo', '✗ Cliente frecuente', '✗ Multi-profesional'],
    'PRO_PLUS': ['✓ Todo del PRO', '✓ Cliente frecuente', '✓ Upselling auto', '✓ Multi-profesional', '✓ PDF con gráficos', '✗ Análisis IA'],
    'ENTERPRISE': ['✓ Todo del PRO+', '✓ Análisis IA', '✓ API personalizada', '✓ Multi-sucursal', '✓ Soporte prioritario']
  };

  const colorPlan = { 'BASICO': 'from-gray-500 to-gray-600', 'PRO': 'from-blue-500 to-cyan-500', 'PRO_PLUS': 'from-purple-500 to-pink-500', 'ENTERPRISE': 'from-amber-500 to-orange-500' };
  const labelPlan = { 'BASICO': 'Básico', 'PRO': 'PRO', 'PRO_PLUS': 'PRO+', 'ENTERPRISE': 'Enterprise' };

  if (loading) return <div className="text-center text-white py-10"><div className="text-4xl mb-4 animate-spin">⏳</div><p>Cargando...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">💳 Suscripción</h2>
        {onClose && <button onClick={onClose} className="text-white/60 hover:text-white">✕ Cerrar</button>}
      </div>
      <div className="flex gap-2 mb-4">
        {['estado', 'planes', 'historial'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl font-bold ${tab === t ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
            {t === 'estado' ? '📊 Estado' : t === 'planes' ? '💎 Planes' : '📋 Historial'}
          </button>
        ))}
      </div>

      {tab === 'estado' && suscripcion && (
        <div className="space-y-4">
          <div className={`bg-gradient-to-br ${colorPlan[suscripcion.plan] || colorPlan['BASICO']} rounded-2xl p-6 text-white`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm opacity-80">Plan actual</div>
                <div className="text-3xl font-bold">{labelPlan[suscripcion.plan] || suscripcion.plan}</div>
                {suscripcion.es_trial && <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">PRUEBA GRATIS</span>}
              </div>
              <div className="text-5xl">{suscripcion.plan === 'BASICO' ? '🚀' : suscripcion.plan === 'PRO' ? '⭐' : suscripcion.plan === 'PRO_PLUS' ? '💎' : '👑'}</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div><div className="text-sm opacity-80">Días restantes</div><div className={`text-4xl font-bold ${suscripcion.dias_restantes <= 5 ? 'text-red-300' : ''}`}>{suscripcion.dias_restantes}</div></div>
                <div className="text-right"><div className="text-sm opacity-80">Vence</div><div className="font-medium">{suscripcion.fecha_expiracion ? new Date(suscripcion.fecha_expiracion).toLocaleDateString('es-CL') : 'N/A'}</div></div>
              </div>
              <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden"><div className={`h-full ${suscripcion.dias_restantes <= 5 ? 'bg-red-400' : 'bg-white'}`} style={{ width: `${Math.min(100, (suscripcion.dias_restantes / 31) * 100)}%` }} /></div>
            </div>
            {suscripcion.por_vencer && <div className="bg-red-500/30 border border-red-400 rounded-xl p-3 mb-4">⚠️ ¡Tu plan está por vencer!</div>}
            <button onClick={() => setTab('planes')} className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:scale-105 transition-transform">{suscripcion.es_trial || suscripcion.vencida ? '🚀 Activar Plan' : '🔄 Renovar / Mejorar'}</button>
          </div>
        </div>
      )}

      {tab === 'planes' && (
        <div className="space-y-4">
          {Object.entries(precios).map(([plan, precio]) => (
            <div key={plan} className={`relative bg-gradient-to-br ${colorPlan[plan]} rounded-2xl p-5 text-white ${suscripcion?.plan === plan ? 'ring-4 ring-white' : ''}`}>
              {plan === 'PRO' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold">⭐ MÁS POPULAR</div>}
              <div className="flex justify-between items-start mb-3">
                <div><div className="text-2xl font-bold">{labelPlan[plan]}</div><div className="text-4xl font-bold mt-1">${precio.toLocaleString('es-CL')}<span className="text-sm font-normal opacity-80">/mes + IVA</span></div></div>
                <div className="text-4xl">{plan === 'BASICO' ? '🚀' : plan === 'PRO' ? '⭐' : plan === 'PRO_PLUS' ? '💎' : '👑'}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mb-4"><ul className="space-y-1 text-sm">{beneficiosPlan[plan]?.slice(0, 6).map((b, i) => <li key={i} className={b.startsWith('✗') ? 'opacity-50' : ''}>{b}</li>)}</ul></div>
              {suscripcion?.plan === plan && !suscripcion?.es_trial ? <div className="bg-white/30 text-center py-2 rounded-xl font-bold">✓ Plan actual</div> : (
                <button onClick={() => iniciarPago(plan)} disabled={procesando} className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">{procesando ? '⏳...' : `Contratar ${labelPlan[plan]}`}</button>
              )}
            </div>
          ))}
          <p className="text-white/50 text-xs text-center">Precios mensuales + IVA. Pago seguro con Flow.</p>
        </div>
      )}

      {tab === 'historial' && (
        <div className="space-y-3">
          {historial.length === 0 ? <div className="text-center py-10"><div className="text-4xl mb-2">📋</div><p className="text-white/60">No hay pagos registrados</p></div> : (
            historial.map(pago => (
              <div key={pago.id} className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div><div className="text-white font-bold">${pago.monto?.toLocaleString('es-CL')}</div><div className="text-white/60 text-sm">{pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-CL') : 'N/A'}</div></div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${pago.estado === 'pagado' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>{pago.estado === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL BARBERÍA
// ============================================
export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [noAsistieron, setNoAsistieron] = useState([]);
  const [sinAgendar, setSinAgendar] = useState([]);
  const [vips, setVips] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({ plan: 'BASICO' });
  const [filtro, setFiltro] = useState('activas');
  const [vista, setVista] = useState('citas');
  const [hora, setHora] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);
  const [loadingNoAsistio, setLoadingNoAsistio] = useState(null);
  const [loadingSinAgendar, setLoadingSinAgendar] = useState(null);
  const [loadingRecordatorio, setLoadingRecordatorio] = useState(null);
  const [rescatandoTodos, setRescatandoTodos] = useState(false);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = freq; osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
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
      setSoundEnabled(true); playSound();
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

  const cargarConfig = useCallback(async () => { try { const res = await fetchSeguro(`/api/barberia/config`); const data = await res.json(); if (data.success) setConfig(data); } catch (e) { console.error('Error:', e); } }, []);
  const cargarStats = useCallback(async () => { try { const res = await fetchSeguro(`/api/barberia/stats/rapidas`); const data = await res.json(); if (data.success) setStats(data); } catch (e) { console.error('Error:', e); } }, []);

  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/citas-db?fecha=${fechaSeleccionada}&estado=todos`);
      const data = await res.json();
      if (data.success && data.citas) {
        const prevIds = new Set(previousCitasRef.current.map(c => c.id));
        const nuevas = data.citas.filter(c => !prevIds.has(c.id) && c.estado === 'Confirmada');
        if (nuevas.length > 0 && previousCitasRef.current.length > 0 && soundEnabled) {
          playSound(); setShowAlert(true); setTimeout(() => setShowAlert(false), 5000);
          if ('Notification' in window && Notification.permission === 'granted') new Notification('🔔 Nueva Cita!', { body: `${nuevas[0].nombre} - ${nuevas[0].hora}`, icon: '💈' });
        }
        previousCitasRef.current = data.citas; setCitas(data.citas);
      }
    } catch (e) { console.error('Error:', e); }
    finally { setIsLoading(false); }
  }, [fechaSeleccionada, soundEnabled, playSound]);

  const cargarNoAsistieron = useCallback(async () => { try { const res = await fetchSeguro(`/api/barberia/no-asistieron`); const data = await res.json(); if (data.success) setNoAsistieron(data.clientes || []); } catch (e) { console.error('Error:', e); } }, []);
  const cargarSinAgendar = useCallback(async () => { try { const res = await fetchSeguro(`/api/barberia/sin-agendar`); const data = await res.json(); if (data.success) setSinAgendar(data.prospectos || []); } catch (e) { console.error('Error:', e); } }, []);
  const cargarVips = useCallback(async () => { try { const res = await fetchSeguro(`/api/barberia/vips`); const data = await res.json(); if (data.success) setVips(data.clientes || []); } catch (e) { console.error('Error:', e); } }, []);
  const cargarRecordatorios = useCallback(async () => { try { const res = await fetchSeguro(`/api/barberia/recordatorios`); const data = await res.json(); if (data.success) setRecordatorios(data.citas || []); } catch (e) { console.error('Error:', e); } }, []);

  useEffect(() => { if (typeof window === 'undefined') return; const updateHora = () => setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })); updateHora(); const interval = setInterval(updateHora, 1000); return () => clearInterval(interval); }, []);

  useEffect(() => {
    if (!user) return;
    cargarConfig(); cargarStats(); cargarCitas(); cargarNoAsistieron(); cargarSinAgendar(); cargarVips(); cargarRecordatorios();
    const interval = setInterval(() => { cargarStats(); cargarCitas(); setCountdown(10); }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarCitas, cargarNoAsistieron, cargarSinAgendar, cargarVips, cargarRecordatorios]);

  useEffect(() => { if (user) cargarCitas(); }, [fechaSeleccionada, user, cargarCitas]);
  useEffect(() => { if (!user) return; const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000); return () => clearInterval(interval); }, [user]);

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoadingCita(id);
    try { const res = await fetchSeguro(`/api/barberia/citas/estado`, { method: 'POST', body: JSON.stringify({ id, estado: nuevoEstado }) }); const data = await res.json(); if (data.success) { await cargarCitas(); await cargarStats(); await cargarNoAsistieron(); } else alert('Error: ' + (data.error || 'Desconocido')); }
    catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const completarNotificar = async (id) => {
    setLoadingCita(id);
    try { const res = await fetchSeguro(`/api/barberia/citas/completar-notificar`, { method: 'POST', body: JSON.stringify({ id }) }); const data = await res.json(); if (data.success) { await cargarCitas(); await cargarStats(); alert(data.mensaje); } else alert('Error: ' + (data.error || 'Desconocido')); }
    catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const notificarNoAsistio = async (id) => {
    setLoadingNoAsistio(id);
    try { const res = await fetchSeguro(`/api/barberia/no-asistieron/${id}/notificar`, { method: 'POST' }); const data = await res.json(); if (data.success) { await cargarNoAsistieron(); alert(data.mensaje); } else alert('Error: ' + (data.error || 'Desconocido')); }
    catch (e) { alert('Error de conexión'); }
    finally { setLoadingNoAsistio(null); }
  };

  const rescatarTodosNoAsistieron = async () => {
    if (!confirm('¿Rescatar a todos los que no asistieron?')) return;
    setRescatandoTodos(true);
    try { const res = await fetchSeguro(`/api/barberia/no-asistieron/notificar-todos`, { method: 'POST' }); const data = await res.json(); alert(data.success ? `✅ ${data.notificados} clientes contactados` : 'Error'); await cargarNoAsistieron(); }
    catch (e) { alert('Error de conexión'); }
    finally { setRescatandoTodos(false); }
  };

  const notificarSinAgendar = async (id) => {
    setLoadingSinAgendar(id);
    try { const res = await fetchSeguro(`/api/barberia/sin-agendar/${id}/notificar`, { method: 'POST' }); const data = await res.json(); if (data.success) { await cargarSinAgendar(); alert(data.mensaje); } else alert('Error: ' + (data.error || 'Desconocido')); }
    catch (e) { alert('Error de conexión'); }
    finally { setLoadingSinAgendar(null); }
  };

  const enviarPromoVip = async (id) => { alert('🎁 Función de promo VIP próximamente'); };

  const enviarRecordatorio = async (id) => {
    setLoadingRecordatorio(id);
    try { const res = await fetchSeguro(`/api/barberia/recordatorios/${id}/enviar`, { method: 'POST' }); const data = await res.json(); if (data.success) { await cargarRecordatorios(); alert(data.mensaje); } else alert('Error: ' + (data.error || 'Desconocido')); }
    catch (e) { alert('Error de conexión'); }
    finally { setLoadingRecordatorio(null); }
  };

  const enviarTodosRecordatorios = async () => {
    try { const res = await fetchSeguro(`/api/barberia/recordatorios/enviar-todos`, { method: 'POST' }); const data = await res.json(); alert(data.success ? `✅ ${data.enviados} recordatorios enviados` : 'Error'); await cargarRecordatorios(); }
    catch (e) { alert('Error de conexión'); }
  };

  const cerrarSesion = () => { if (typeof window !== 'undefined') { localStorage.removeItem('dashboard_user'); router.push('/login'); } };

  const citasFiltradas = filtro === 'todas' ? citas : filtro === 'activas' ? citas.filter(c => ['Confirmada', 'En Proceso'].includes(c.estado)) : citas.filter(c => c.estado === filtro);
  const noAsistieronPendientes = noAsistieron.filter(c => !c.notificado);
  const sinAgendarPendientes = sinAgendar.filter(p => !p.notificado);
  const recordatoriosPendientes = recordatorios.filter(c => !c.recordatorio_enviado);
  const ingresosHoy = citas.filter(c => c.estado === 'Completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      {showAlert && <div className="fixed top-0 left-0 right-0 bg-white text-indigo-600 py-3 text-center font-bold z-50 animate-pulse">🔔 ¡NUEVA CITA! 🔔</div>}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💈 Dashboard Barbería</h1>
            <p className="text-white/60 text-sm">{stats.abierto ? '🟢 Abierto' : '🔴 Cerrado'}<span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>• Cerrar sesión</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound} className={`px-3 py-1 rounded-full text-sm font-bold ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>{soundEnabled ? '🔊 Sonido' : '🔇 Sonido'}</button>
            <div className="text-right text-white"><div className="text-xl font-mono font-bold">{hora}</div><div className="text-xs text-white/60">🔄 {countdown}s</div></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-900">{citas.filter(c => c.estado === 'Confirmada').length}</div><div className="text-xs text-blue-800">✅ Confirmadas</div></div>
          <div className="bg-green-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-900">{stats.completadas || 0}</div><div className="text-xs text-green-800">🎉 Completadas</div></div>
          <div className="bg-yellow-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-yellow-900">${(stats.ingresos_hoy || ingresosHoy).toLocaleString('es-CL')}</div><div className="text-xs text-yellow-800">💰 Hoy</div></div>
        </div>

        <div className="mb-4"><input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="w-full bg-white/20 text-white border-0 rounded-xl p-3 text-center font-bold" /></div>

        {/* 🆕 TABS CON NUEVOS MÓDULOS */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'citas', icon: '💈', badge: citas.filter(c => ['Confirmada', 'En Proceso'].includes(c.estado)).length },
            { key: 'noAsistio', icon: '😞', badge: noAsistieronPendientes.length },
            { key: 'sinAgendar', icon: '📋', badge: sinAgendarPendientes.length },
            { key: 'vips', icon: '⭐', badge: vips.length },
            { key: 'recordatorios', icon: '⏰', badge: recordatoriosPendientes.length },
            { key: 'servicios', icon: '✂️' },
            { key: 'reportes', icon: '📊' },
            { key: 'suscripcion', icon: '💳' },
            { key: 'config', icon: '⚙️' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${vista === tab.key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
              {tab.icon}
              {tab.badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {vista === 'citas' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activas', 'Confirmada', 'En Proceso', 'Completada', '📊 Todas'].map((f, i) => {
                const key = ['activas', 'Confirmada', 'En Proceso', 'Completada', 'todas'][i];
                return <button key={key} onClick={() => setFiltro(key)} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${filtro === key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>{f}</button>;
              })}
            </div>
            {isLoading ? <div className="text-center text-white py-10">Cargando...</div> : citasFiltradas.length === 0 ? (
              <div className="text-center py-10"><div className="text-6xl mb-4">📭</div><p className="text-white/60">No hay citas para este día</p></div>
            ) : (
              <div className="grid gap-4">{citasFiltradas.map(cita => <CitaCard key={cita.id} cita={cita} onCambiarEstado={cambiarEstado} onCompletarNotificar={completarNotificar} isLoading={loadingCita === cita.id} />)}</div>
            )}
          </>
        )}

        {vista === 'noAsistio' && (
          <>
            {noAsistieronPendientes.length > 0 && <button onClick={rescatarTodosNoAsistieron} disabled={rescatandoTodos} className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform disabled:opacity-50">{rescatandoTodos ? '⏳...' : `😞 Rescatar ${noAsistieronPendientes.length} clientes`}</button>}
            {noAsistieron.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">🎉</div><p className="text-white/60">¡Todos asistieron!</p></div> : (
              <div className="grid gap-4">{noAsistieron.map(c => <NoAsistioCard key={c.id} cliente={c} onReagendar={notificarNoAsistio} isLoading={loadingNoAsistio === c.id} />)}</div>
            )}
          </>
        )}

        {vista === 'sinAgendar' && (
          sinAgendar.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">📋</div><p className="text-white/60">No hay prospectos pendientes</p></div> : (
            <div className="grid gap-4">{sinAgendar.map(p => <SinAgendarCard key={p.id} prospecto={p} onNotificar={notificarSinAgendar} isLoading={loadingSinAgendar === p.id} />)}</div>
          )
        )}

        {vista === 'vips' && (
          vips.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">⭐</div><p className="text-white/60">Aún no hay clientes VIP</p><p className="text-white/40 text-sm mt-2">Clientes con 3+ visitas aparecerán aquí</p></div> : (
            <div className="grid gap-4">{vips.map(c => <VipCard key={c.id} cliente={c} onEnviarPromo={enviarPromoVip} />)}</div>
          )
        )}

        {vista === 'recordatorios' && (
          <>
            {recordatoriosPendientes.length > 0 && <button onClick={enviarTodosRecordatorios} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform">⏰ Enviar {recordatoriosPendientes.length} recordatorios</button>}
            {recordatorios.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">⏰</div><p className="text-white/60">No hay citas próximas</p></div> : (
              <div className="grid gap-4">{recordatorios.map(c => <RecordatorioCard key={c.id} cita={c} onEnviarRecordatorio={enviarRecordatorio} isLoading={loadingRecordatorio === c.id} />)}</div>
            )}
          </>
        )}

        {/* 🆕 EDITOR DE SERVICIOS */}
        {vista === 'servicios' && <EditorServicios onClose={() => setVista('citas')} />}

        {vista === 'reportes' && <ReportesPanel plan={config.plan || 'BASICO'} />}

        {/* 🆕 SUSCRIPCIÓN */}
        {vista === 'suscripcion' && <SuscripcionPanel negocio="barberia" onClose={() => setVista('citas')} />}

        {vista === 'config' && <ConfigPanel config={config} negocio="barberia" onConfigUpdate={cargarConfig} />}

        <button onClick={() => { cargarStats(); cargarCitas(); cargarNoAsistieron(); cargarSinAgendar(); cargarVips(); cargarRecordatorios(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-indigo-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">🔄</button>

        {!soundEnabled && mounted && <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">⚠️ Activa el sonido</div>}
      </div>
    </div>
  );
}
