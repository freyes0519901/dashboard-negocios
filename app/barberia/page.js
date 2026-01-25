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
// 📊 COMPONENTE REPORTES
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
    try {
      window.open(`${API_PROXY}/api/barberia/export/excel?periodo=${periodo}&plan=${plan}`, '_blank');
    } catch (e) { alert('Error descargando Excel'); }
    finally { setTimeout(() => setExportando(null), 1000); }
  };

  const descargarPDF = async (tipo = 'basico') => {
    if (!permisos?.exports_enabled) { alert('Exports no disponibles'); return; }
    setExportando('pdf');
    try {
      window.open(`${API_PROXY}/api/barberia/export/pdf?periodo=${periodo}&tipo=${tipo}&plan=${plan}`, '_blank');
    } catch (e) { alert('Error descargando PDF'); }
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
    
    const diasNombres = {
      'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles',
      'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo'
    };
    
    let texto = '';
    if (diasSeleccionados.length === 7) {
      texto = 'Todos los días';
    } else if (diasSeleccionados.length >= 5) {
      const primerDia = diasNombres[diasSeleccionados[0]];
      const ultimoDia = diasNombres[diasSeleccionados[diasSeleccionados.length - 1]];
      texto = `${primerDia} a ${ultimoDia}`;
    } else {
      texto = diasSeleccionados.map(d => diasNombres[d]).join(', ');
    }
    
    const horaAp = `${horaApertura.toString().padStart(2, '0')}:00`;
    const horaCi = `${horaCierre.toString().padStart(2, '0')}:00`;
    
    return `${texto} ${horaAp} - ${horaCi}`;
  };
  
  const guardarHorarios = async () => {
    setGuardando(true);
    setMensaje(null);
    
    try {
      const nuevoHorarioTexto = generarHorarioTexto();
      
      // 🔒 Usa proxy interno
      const res = await fetchSeguro(`/api/${negocio}/config/horarios`, {
        method: 'POST',
        body: JSON.stringify({
          hora_apertura: horaApertura,
          hora_cierre: horaCierre,
          dias_atencion: diasAtencion,
          horario_texto: nuevoHorarioTexto
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setHorarioTexto(nuevoHorarioTexto);
        setMensaje({ tipo: 'success', texto: '✅ Horarios guardados correctamente' });
        setEditando(false);
        if (onConfigUpdate) onConfigUpdate();
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar' });
      }
    } catch (e) {
      console.error('Error guardando horarios:', e);
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setGuardando(false);
    }
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
            <span className="text-white text-sm text-right">{config.direccion || 'Freirina 1981'}</span>
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
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            mensaje.tipo === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
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
                  <span key={dia.id}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      diasAtencion.includes(dia.id) ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/40'
                    }`}>
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
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      diasAtencion.includes(dia.id) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}>
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm block mb-2">Hora de apertura:</label>
              <select value={horaApertura} onChange={(e) => setHoraApertura(parseInt(e.target.value))}
                className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                {HORAS.map(h => (
                  <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm block mb-2">Hora de cierre:</label>
              <select value={horaCierre} onChange={(e) => setHoraCierre(parseInt(e.target.value))}
                className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                {HORAS.map(h => (
                  <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>
                ))}
              </select>
            </div>

            <div className="bg-white/5 rounded-xl p-3">
              <span className="text-white/50 text-xs">Vista previa:</span>
              <p className="text-white font-medium">{generarHorarioTexto()}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={cancelarEdicion} disabled={guardando}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={guardarHorarios} disabled={guardando || diasAtencion.length === 0}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {guardando ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {config.servicios && config.servicios.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">✂️ Servicios</h3>
          <div className="space-y-2">
            {config.servicios.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white">{s.emoji} {s.nombre}</span>
                <span className="text-white font-bold">${s.precio?.toLocaleString('es-CL')}</span>
              </div>
            ))}
          </div>
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
  const [config, setConfig] = useState({ plan: 'ENTERPRISE' });
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

  // 🔒 Todas las llamadas usan fetchSeguro (proxy interno)
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
      const res = await fetchSeguro(`/api/barberia/citas-db?fecha=${fechaSeleccionada}&estado=todos`);
      const data = await res.json();
      if (data.success && data.citas) {
        const prevIds = new Set(previousCitasRef.current.map(c => c.id));
        const nuevas = data.citas.filter(c => !prevIds.has(c.id) && c.estado === 'Confirmada');
        if (nuevas.length > 0 && previousCitasRef.current.length > 0 && soundEnabled) {
          playSound();
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 5000);
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

  const cargarNoAsistieron = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/no-asistieron`);
      const data = await res.json();
      if (data.success) setNoAsistieron(data.clientes || []);
    } catch (e) { console.error('Error no asistieron:', e); }
  }, []);

  const cargarSinAgendar = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/sin-agendar`);
      const data = await res.json();
      if (data.success) setSinAgendar(data.prospectos || []);
    } catch (e) { console.error('Error sin agendar:', e); }
  }, []);

  const cargarVips = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/vips`);
      const data = await res.json();
      if (data.success) setVips(data.clientes || []);
    } catch (e) { console.error('Error vips:', e); }
  }, []);

  const cargarRecordatorios = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/recordatorios`);
      const data = await res.json();
      if (data.success) setRecordatorios(data.citas || []);
    } catch (e) { console.error('Error recordatorios:', e); }
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
    cargarSinAgendar();
    cargarVips();
    cargarRecordatorios();
    const interval = setInterval(() => {
      cargarStats();
      cargarCitas();
      setCountdown(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarCitas, cargarNoAsistieron, cargarSinAgendar, cargarVips, cargarRecordatorios]);

  useEffect(() => { if (user) cargarCitas(); }, [fechaSeleccionada, user, cargarCitas]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  const cambiarEstado = async (id, nuevoEstado) => {
    setLoadingCita(id);
    try {
      const res = await fetchSeguro(`/api/barberia/citas/estado`, {
        method: 'POST',
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); await cargarNoAsistieron(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const completarNotificar = async (id) => {
    setLoadingCita(id);
    try {
      const res = await fetchSeguro(`/api/barberia/citas/notificar-completada`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingCita(null); }
  };

  const notificarNoAsistio = async (id) => {
    setLoadingNoAsistio(id);
    try {
      const res = await fetchSeguro(`/api/barberia/no-asistieron/${id}/notificar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) { await cargarNoAsistieron(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingNoAsistio(null); }
  };

  const notificarSinAgendar = async (id) => {
    setLoadingSinAgendar(id);
    try {
      const res = await fetchSeguro(`/api/barberia/sin-agendar/${id}/notificar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) { await cargarSinAgendar(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingSinAgendar(null); }
  };

  const enviarPromoVip = async (id) => {
    try {
      const res = await fetchSeguro(`/api/barberia/vips/${id}/promo`, {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.success ? data.mensaje : 'Error enviando promo');
    } catch (e) { alert('Error de conexión'); }
  };

  const enviarRecordatorio = async (id) => {
    setLoadingRecordatorio(id);
    try {
      const res = await fetchSeguro(`/api/barberia/recordatorios/${id}/enviar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) { await cargarRecordatorios(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingRecordatorio(null); }
  };

  const rescatarTodosNoAsistieron = async () => {
    if (!confirm('¿Enviar "¿Reagendamos?" a todos los que no asistieron?')) return;
    setRescatandoTodos(true);
    try {
      const res = await fetchSeguro(`/api/barberia/no-asistieron/rescatar-todos`, {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} clientes notificados` : 'Error al notificar');
      await cargarNoAsistieron();
    } catch (e) { alert('Error de conexión'); }
    finally { setRescatandoTodos(false); }
  };

  const enviarTodosRecordatorios = async () => {
    if (!confirm('¿Enviar recordatorio a todas las citas de mañana?')) return;
    try {
      const res = await fetchSeguro(`/api/barberia/recordatorios/enviar-todos`, {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.enviados} recordatorios enviados` : 'Error al enviar');
      await cargarRecordatorios();
    } catch (e) { alert('Error de conexión'); }
  };

  const cerrarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user');
      router.push('/login');
    }
  };

  const citasFiltradas = filtro === 'todas' ? citas :
    filtro === 'activas' ? citas.filter(c => ['Confirmada', 'En Proceso'].includes(c.estado)) :
    citas.filter(c => c.estado === filtro);

  const noAsistieronPendientes = noAsistieron.filter(c => !c.notificado);
  const sinAgendarPendientes = sinAgendar.filter(p => !p.notificado);
  const recordatoriosPendientes = recordatorios.filter(r => !r.recordatorio_enviado);
  const ingresosHoy = citas.filter(c => c.estado === 'Completada').reduce((sum, c) => sum + (c.precio || 0), 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-white text-indigo-600 py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡NUEVA CITA! 🔔
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💈 El Galpón de la Barba</h1>
            <p className="text-white/60 text-sm">
              {stats.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
              <span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>• Cerrar sesión</span>
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

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-blue-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-900">{stats.confirmadas || stats.pendientes || 0}</div>
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

        <div className="mb-4">
          <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="w-full bg-white/20 text-white border-0 rounded-xl p-3 text-center font-bold" />
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'citas', icon: '💈', badge: citas.filter(c => ['Confirmada', 'En Proceso'].includes(c.estado)).length },
            { key: 'noAsistio', icon: '😞', badge: noAsistieronPendientes.length },
            { key: 'sinAgendar', icon: '📋', badge: sinAgendarPendientes.length },
            { key: 'vips', icon: '⭐', badge: vips.length },
            { key: 'recordatorios', icon: '⏰', badge: recordatoriosPendientes.length },
            { key: 'reportes', icon: '📊' },
            { key: 'config', icon: '⚙️' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${vista === tab.key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
              {tab.icon}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {vista === 'citas' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activas', 'Confirmada', 'En Proceso', 'Completada', '📊 Todas'].map((f, i) => {
                const key = ['activas', 'Confirmada', 'En Proceso', 'Completada', 'todas'][i];
                return (
                  <button key={key} onClick={() => setFiltro(key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${filtro === key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
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
                  <CitaCard key={cita.id} cita={cita} onCambiarEstado={cambiarEstado} onCompletarNotificar={completarNotificar} isLoading={loadingCita === cita.id} />
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'noAsistio' && (
          <>
            {noAsistieronPendientes.length > 0 && (
              <button onClick={rescatarTodosNoAsistieron} disabled={rescatandoTodos}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform disabled:opacity-50">
                {rescatandoTodos ? '⏳ Enviando...' : `😞 Rescatar ${noAsistieronPendientes.length} clientes`}
              </button>
            )}
            {noAsistieron.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-white/60">¡Todos asistieron!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {noAsistieron.map(c => (
                  <NoAsistioCard key={c.id} cliente={c} onReagendar={notificarNoAsistio} isLoading={loadingNoAsistio === c.id} />
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'sinAgendar' && (
          sinAgendar.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-white/60">No hay prospectos pendientes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sinAgendar.map(p => (
                <SinAgendarCard key={p.id} prospecto={p} onNotificar={notificarSinAgendar} isLoading={loadingSinAgendar === p.id} />
              ))}
            </div>
          )
        )}

        {vista === 'vips' && (
          vips.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-white/60">Aún no hay clientes VIP</p>
              <p className="text-white/40 text-sm mt-2">Clientes con 3+ visitas aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {vips.map(c => (
                <VipCard key={c.id} cliente={c} onEnviarPromo={enviarPromoVip} />
              ))}
            </div>
          )
        )}

        {vista === 'recordatorios' && (
          <>
            {recordatoriosPendientes.length > 0 && (
              <button onClick={enviarTodosRecordatorios}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform">
                ⏰ Enviar {recordatoriosPendientes.length} recordatorios
              </button>
            )}
            {recordatorios.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">⏰</div>
                <p className="text-white/60">No hay citas próximas</p>
                <p className="text-white/40 text-sm mt-2">Las citas de mañana aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {recordatorios.map(c => (
                  <RecordatorioCard key={c.id} cita={c} onEnviarRecordatorio={enviarRecordatorio} isLoading={loadingRecordatorio === c.id} />
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'reportes' && <ReportesPanel plan={config.plan || 'ENTERPRISE'} />}

        {vista === 'config' && (
          <ConfigPanel 
            config={config} 
            negocio="barberia" 
            onConfigUpdate={cargarConfig}
          />
        )}

        <button onClick={() => { cargarStats(); cargarCitas(); cargarNoAsistieron(); cargarSinAgendar(); cargarVips(); cargarRecordatorios(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-indigo-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
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
