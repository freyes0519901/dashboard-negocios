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

  useEffect(() => { cargarPermisos(); }, [plan]);
  useEffect(() => { cargarReportes(); }, [periodo]);

  const cargarPermisos = async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/export/permisos?plan=${plan}`);
      const data = await res.json();
      if (data.success) setPermisos(data);
    } catch (e) { console.error('Error permisos:', e); }
  };

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetchSeguro(`/api/carrito/reportes?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) setDatos(data);
    } catch (e) { console.error('Error reportes:', e); }
    finally { setCargando(false); }
  };

  const descargarExcel = async () => {
    if (!permisos?.exports_enabled) { alert('Exports no disponibles en el servidor'); return; }
    if (periodo !== 'hoy' && !permisos?.permisos?.excel_semana) {
      alert(`Tu plan ${plan} solo permite exportar el día actual. Actualiza a PRO para más.`);
      return;
    }
    setExportando('excel');
    try {
      window.open(`${API_PROXY}/api/carrito/export/excel?periodo=${periodo}&plan=${plan}`, '_blank');
    } catch (e) { alert('Error descargando Excel'); }
    finally { setTimeout(() => setExportando(null), 1000); }
  };

  const descargarPDF = async (tipo = 'basico') => {
    if (!permisos?.exports_enabled) { alert('Exports no disponibles en el servidor'); return; }
    if (tipo === 'graficos' && !permisos?.permisos?.pdf_graficos) { alert(`PDF con gráficos requiere plan PRO+`); return; }
    if (tipo === 'ia' && !permisos?.permisos?.pdf_ia) { alert(`Análisis IA requiere plan ENTERPRISE`); return; }
    setExportando('pdf');
    try {
      window.open(`${API_PROXY}/api/carrito/export/pdf?periodo=${periodo}&tipo=${tipo}&plan=${plan}`, '_blank');
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
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${periodo === p.key ? 'bg-white text-orange-600' : 'text-white/70 hover:text-white'}`}>
            {p.label}
            {p.key !== 'hoy' && !permisos?.permisos?.excel_semana && <span className="ml-1">🔒</span>}
          </button>
        ))}
      </div>

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
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => descargarPDF('graficos')} disabled={!permisos?.permisos?.pdf_graficos}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${permisos?.permisos?.pdf_graficos ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/5 text-white/40'}`}>
            📊 PDF Gráficos {!permisos?.permisos?.pdf_graficos && '🔒'}
          </button>
          <button onClick={() => descargarPDF('ia')} disabled={!permisos?.permisos?.pdf_ia}
            className={`py-2 px-3 rounded-lg text-sm font-medium ${permisos?.permisos?.pdf_ia ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/5 text-white/40'}`}>
            🤖 Análisis IA {!permisos?.permisos?.pdf_ia && '🔒'}
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
  
  const [horaApertura, setHoraApertura] = useState(config.hora_apertura || 16);
  const [horaCierre, setHoraCierre] = useState(config.hora_cierre || 2);
  const [diasAtencion, setDiasAtencion] = useState(config.dias_atencion || ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);
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
    setHoraApertura(config.hora_apertura ?? 16);
    setHoraCierre(config.hora_cierre ?? 2);
    setDiasAtencion(config.dias_atencion || ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);
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
    const amPm = horaCierre < horaApertura ? ' AM' : '';
    
    return `${texto} ${horaAp} - ${horaCi}${amPm}`;
  };
  
  const guardarHorarios = async () => {
    setGuardando(true);
    setMensaje(null);
    
    try {
      const nuevoHorarioTexto = generarHorarioTexto();
      
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
    setHoraApertura(config.hora_apertura ?? 16);
    setHoraCierre(config.hora_cierre ?? 2);
    setDiasAtencion(config.dias_atencion || ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);
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
            <span className="text-white font-bold">{config.negocio?.nombre || config.nombre || 'Sánguchez con Hambre'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Plan</span>
            <span className="text-white font-bold">{config.plan || 'BASICO'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Estado</span>
            <span className={`font-bold ${config.abierto ? 'text-green-400' : 'text-red-400'}`}>
              {config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Dirección</span>
            <span className="text-white text-sm text-right">{config.direccion || 'Los Corrales 1370, Colina'}</span>
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
              <span className="text-white font-bold">{(horaApertura ?? 16).toString().padStart(2, '0')}:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Cierre</span>
              <span className="text-white font-bold">{(horaCierre ?? 2).toString().padStart(2, '0')}:00</span>
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
              {horaCierre < horaApertura && (
                <p className="text-yellow-400 text-xs mt-1">⚠️ El cierre es al día siguiente (horario nocturno)</p>
              )}
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
    </div>
  );
}

// ============================================
// 🍔 EDITOR DE MENÚ
// ============================================
function EditorMenu({ onClose }) {
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('productos');
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prodRes, promoRes] = await Promise.all([
        fetchSeguro('/api/carrito/menu/productos'),
        fetchSeguro('/api/carrito/promociones')
      ]);
      const prodData = await prodRes.json();
      const promoData = await promoRes.json();
      if (prodData.success) setProductos(prodData.productos);
      if (promoData.success) setPromociones(promoData.promociones);
    } catch (e) { console.error('Error:', e); }
    setLoading(false);
  };

  const guardarProducto = async (producto) => {
    setSaving(true);
    try {
      const isNew = !producto.id;
      const url = isNew ? '/api/carrito/menu/productos' : `/api/carrito/menu/productos/${producto.id}`;
      const res = await fetchSeguro(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(producto) });
      const data = await res.json();
      if (data.success) { await cargarDatos(); setEditando(null); setNuevo(null); }
      else alert(data.error || 'Error guardando');
    } catch (e) { alert('Error de conexión'); }
    setSaving(false);
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetchSeguro(`/api/carrito/menu/productos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) cargarDatos();
    } catch (e) { alert('Error eliminando'); }
  };

  const guardarPromocion = async (promo) => {
    setSaving(true);
    try {
      const isNew = !promo.id;
      const url = isNew ? '/api/carrito/promociones' : `/api/carrito/promociones/${promo.id}`;
      const res = await fetchSeguro(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(promo) });
      const data = await res.json();
      if (data.success) { await cargarDatos(); setEditando(null); setNuevo(null); }
      else alert(data.error || 'Error guardando');
    } catch (e) { alert('Error de conexión'); }
    setSaving(false);
  };

  const eliminarPromocion = async (id) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    try {
      const res = await fetchSeguro(`/api/carrito/promociones/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) cargarDatos();
    } catch (e) { alert('Error eliminando'); }
  };

  const FormProducto = ({ producto, onSave, onCancel }) => {
    const [form, setForm] = useState(producto || { key: '', nombre: '', precio: '', descripcion: '', categoria: 'principal', disponible: true });
    return (
      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3">{producto?.id ? '✏️ Editar' : '➕ Nuevo'} Producto</h3>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Clave (ej: hamburguesa)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" disabled={!!producto?.id} />
          <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
          <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
          <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2">
            <option value="principal">Principal</option>
            <option value="acompañamiento">Acompañamiento</option>
            <option value="bebida">Bebida</option>
            <option value="postre">Postre</option>
          </select>
          <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" rows={2} />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => onSave(form)} disabled={saving || !form.nombre || !form.precio}
            className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">
            {saving ? '⏳...' : '💾 Guardar'}
          </button>
          <button onClick={onCancel} className="px-4 bg-white/20 text-white rounded-lg">✕</button>
        </div>
      </div>
    );
  };

  const FormPromocion = ({ promo, onSave, onCancel }) => {
    const [form, setForm] = useState(promo || { nombre: '', descripcion: '', tipo: 'descuento', valor: '', activa: true });
    return (
      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <h3 className="text-white font-bold mb-3">{promo?.id ? '✏️ Editar' : '➕ Nueva'} Promoción</h3>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Nombre de la promo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2">
            <option value="descuento">Descuento $</option>
            <option value="porcentaje">Porcentaje %</option>
            <option value="combo">Combo especial</option>
            <option value="2x1">2x1</option>
          </select>
          <input type="number" placeholder="Valor ($ o %)" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })}
            className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" />
          <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50" rows={2} />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => onSave(form)} disabled={saving || !form.nombre}
            className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">
            {saving ? '⏳...' : '💾 Guardar'}
          </button>
          <button onClick={onCancel} className="px-4 bg-white/20 text-white rounded-lg">✕</button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center text-white py-10"><div className="text-4xl mb-4 animate-spin">⏳</div><p>Cargando menú...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">🍔 Editor de Menú</h2>
        {onClose && <button onClick={onClose} className="text-white/60 hover:text-white">✕ Cerrar</button>}
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('productos')} className={`flex-1 py-2 rounded-xl font-bold ${tab === 'productos' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
          🍔 Productos ({productos.length})
        </button>
        <button onClick={() => setTab('promociones')} className={`flex-1 py-2 rounded-xl font-bold ${tab === 'promociones' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
          🎁 Promos ({promociones.length})
        </button>
      </div>

      {tab === 'productos' && (
        <>
          {!nuevo && <button onClick={() => setNuevo({})} className="w-full bg-green-500/20 border-2 border-dashed border-green-500 text-green-400 py-3 rounded-xl mb-4">➕ Agregar Producto</button>}
          {nuevo && <FormProducto producto={null} onSave={guardarProducto} onCancel={() => setNuevo(null)} />}
          <div className="space-y-3">
            {productos.map(prod => (
              editando === prod.id ? <FormProducto key={prod.id} producto={prod} onSave={guardarProducto} onCancel={() => setEditando(null)} /> : (
                <div key={prod.id} className={`bg-white/10 rounded-xl p-4 ${!prod.disponible ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold">{prod.nombre}</h3>
                      <p className="text-white/60 text-sm">{prod.descripcion}</p>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80 mt-1 inline-block">{prod.categoria}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">${prod.precio?.toLocaleString('es-CL')}</div>
                      <div className="flex gap-1 mt-2">
                        <button onClick={() => guardarProducto({ ...prod, disponible: !prod.disponible })}
                          className={`px-2 py-1 rounded text-xs ${prod.disponible ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {prod.disponible ? '✓' : '✗'}
                        </button>
                        <button onClick={() => setEditando(prod.id)} className="px-2 py-1 rounded text-xs bg-blue-500 text-white">✏️</button>
                        <button onClick={() => eliminarProducto(prod.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
          {productos.length === 0 && !nuevo && <div className="text-center py-10"><div className="text-4xl mb-2">📭</div><p className="text-white/60">No hay productos</p></div>}
        </>
      )}

      {tab === 'promociones' && (
        <>
          {!nuevo && <button onClick={() => setNuevo({})} className="w-full bg-purple-500/20 border-2 border-dashed border-purple-500 text-purple-400 py-3 rounded-xl mb-4">➕ Agregar Promoción</button>}
          {nuevo && <FormPromocion promo={null} onSave={guardarPromocion} onCancel={() => setNuevo(null)} />}
          <div className="space-y-3">
            {promociones.map(promo => (
              editando === promo.id ? <FormPromocion key={promo.id} promo={promo} onSave={guardarPromocion} onCancel={() => setEditando(null)} /> : (
                <div key={promo.id} className={`bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl p-4 ${!promo.activa ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-bold">{promo.nombre}</h3>
                      <p className="text-white/60 text-sm">{promo.descripcion}</p>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/80 mt-1 inline-block">
                        {promo.tipo}: {promo.tipo === 'porcentaje' ? `${promo.valor}%` : `$${promo.valor?.toLocaleString('es-CL')}`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => guardarPromocion({ ...promo, activa: !promo.activa })}
                        className={`px-2 py-1 rounded text-xs ${promo.activa ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                        {promo.activa ? '✓' : '✗'}
                      </button>
                      <button onClick={() => setEditando(promo.id)} className="px-2 py-1 rounded text-xs bg-blue-500 text-white">✏️</button>
                      <button onClick={() => eliminarPromocion(promo.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">🗑️</button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
          {promociones.length === 0 && !nuevo && <div className="text-center py-10"><div className="text-4xl mb-2">🎁</div><p className="text-white/60">No hay promociones</p></div>}
        </>
      )}
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
    'BASICO': ['✓ Menú interactivo WhatsApp', '✓ Carrito de compras', '✓ Confirmación pedidos', '✓ Dashboard básico', '✓ Google Sheets', '✗ Pagos online', '✗ Rescate abandonados'],
    'PRO': ['✓ Todo del Básico', '✓ PAGOS ONLINE', '✓ Rescate abandonados', '✓ Prospectos', '✓ Export Excel completo', '✗ Cliente frecuente', '✗ PDF gráficos'],
    'PRO_PLUS': ['✓ Todo del PRO', '✓ Cliente frecuente', '✓ Upselling auto', '✓ PDF con gráficos', '✓ Métricas conversión', '✗ Análisis IA'],
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
                <div>
                  <div className="text-sm opacity-80">Días restantes</div>
                  <div className={`text-4xl font-bold ${suscripcion.dias_restantes <= 5 ? 'text-red-300' : ''}`}>{suscripcion.dias_restantes}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-80">Vence</div>
                  <div className="font-medium">{suscripcion.fecha_expiracion ? new Date(suscripcion.fecha_expiracion).toLocaleDateString('es-CL') : 'N/A'}</div>
                </div>
              </div>
              <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full ${suscripcion.dias_restantes <= 5 ? 'bg-red-400' : 'bg-white'}`} style={{ width: `${Math.min(100, (suscripcion.dias_restantes / 31) * 100)}%` }} />
              </div>
            </div>
            {suscripcion.por_vencer && <div className="bg-red-500/30 border border-red-400 rounded-xl p-3 mb-4">⚠️ ¡Tu plan está por vencer!</div>}
            <button onClick={() => setTab('planes')} className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:scale-105 transition-transform">
              {suscripcion.es_trial || suscripcion.vencida ? '🚀 Activar Plan' : '🔄 Renovar / Mejorar'}
            </button>
          </div>
        </div>
      )}

      {tab === 'planes' && (
        <div className="space-y-4">
          {Object.entries(precios).map(([plan, precio]) => (
            <div key={plan} className={`relative bg-gradient-to-br ${colorPlan[plan]} rounded-2xl p-5 text-white ${suscripcion?.plan === plan ? 'ring-4 ring-white' : ''}`}>
              {plan === 'PRO' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold">⭐ MÁS POPULAR</div>}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-2xl font-bold">{labelPlan[plan]}</div>
                  <div className="text-4xl font-bold mt-1">${precio.toLocaleString('es-CL')}<span className="text-sm font-normal opacity-80">/mes + IVA</span></div>
                </div>
                <div className="text-4xl">{plan === 'BASICO' ? '🚀' : plan === 'PRO' ? '⭐' : plan === 'PRO_PLUS' ? '💎' : '👑'}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 mb-4">
                <ul className="space-y-1 text-sm">
                  {beneficiosPlan[plan]?.slice(0, 6).map((b, i) => <li key={i} className={b.startsWith('✗') ? 'opacity-50' : ''}>{b}</li>)}
                </ul>
              </div>
              {suscripcion?.plan === plan && !suscripcion?.es_trial ? (
                <div className="bg-white/30 text-center py-2 rounded-xl font-bold">✓ Plan actual</div>
              ) : (
                <button onClick={() => iniciarPago(plan)} disabled={procesando}
                  className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
                  {procesando ? '⏳...' : `Contratar ${labelPlan[plan]}`}
                </button>
              )}
            </div>
          ))}
          <p className="text-white/50 text-xs text-center">Precios mensuales + IVA. Pago seguro con Flow.</p>
        </div>
      )}

      {tab === 'historial' && (
        <div className="space-y-3">
          {historial.length === 0 ? (
            <div className="text-center py-10"><div className="text-4xl mb-2">📋</div><p className="text-white/60">No hay pagos registrados</p></div>
          ) : (
            historial.map(pago => (
              <div key={pago.id} className="bg-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">${pago.monto?.toLocaleString('es-CL')}</div>
                    <div className="text-white/60 text-sm">{pago.fecha ? new Date(pago.fecha).toLocaleDateString('es-CL') : 'N/A'}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${pago.estado === 'pagado' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                    {pago.estado === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}
                  </span>
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
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function CarritoDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [fantasmas, setFantasmas] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [abandonados, setAbandonados] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({ plan: 'BASICO' });
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
      if (parsed.negocio !== 'carrito') { router.push('/login'); return; }
      setUser(parsed);
    } catch (e) { router.push('/login'); }
  }, [router]);

  const cargarConfig = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/config`);
      const data = await res.json();
      if (data.success) setConfig(data);
    } catch (e) { console.error('Error config:', e); }
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/stats/rapidas`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) { console.error('Error stats:', e); }
  }, []);

  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/pedidos-db?estado=todos&limite=50`);
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

  const cargarFantasmas = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/fantasmas`);
      const data = await res.json();
      if (data.success) setFantasmas(data.fantasmas || []);
    } catch (e) { console.error('Error fantasmas:', e); }
  }, []);

  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/prospectos-db`);
      const data = await res.json();
      if (data.success) setProspectos(data.prospectos || []);
    } catch (e) { console.error('Error prospectos:', e); }
  }, []);

  const cargarAbandonados = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/carrito/abandonados`);
      const data = await res.json();
      if (data.success) setAbandonados(data.abandonados || []);
    } catch (e) { console.error('Error abandonados:', e); }
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
    cargarPedidos();
    cargarFantasmas();
    cargarProspectos();
    cargarAbandonados();
    const interval = setInterval(() => { cargarStats(); cargarPedidos(); setCountdown(10); }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarPedidos, cargarFantasmas, cargarProspectos, cargarAbandonados]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  const marcarListo = async (numero) => {
    setLoadingPedido(numero);
    try {
      const res = await fetchSeguro(`/api/carrito/pedidos/notificar-listo`, { method: 'POST', body: JSON.stringify({ numero }) });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); await cargarStats(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  const marcarEntregado = async (numero) => {
    setLoadingPedido(numero);
    try {
      const res = await fetchSeguro(`/api/carrito/pedidos/marcar-entregado`, { method: 'POST', body: JSON.stringify({ numero }) });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); await cargarStats(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  const notificarFantasma = async (id) => {
    setLoadingFantasma(id);
    try {
      const res = await fetchSeguro(`/api/carrito/fantasmas/${id}/notificar`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { await cargarFantasmas(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingFantasma(null); }
  };

  const notificarTodosFantasmas = async () => {
    if (!confirm('¿Notificar a todos los clientes con carritos fantasma?')) return;
    setNotificandoTodos(true);
    try {
      const res = await fetchSeguro(`/api/carrito/fantasmas/notificar-todos`, { method: 'POST' });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} clientes notificados` : 'Error al notificar');
      await cargarFantasmas();
    } catch (e) { alert('Error de conexión'); }
    finally { setNotificandoTodos(false); }
  };

  const notificarProspecto = async (id) => {
    setLoadingProspecto(id);
    try {
      const res = await fetchSeguro(`/api/carrito/prospectos/${id}/notificar`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { await cargarProspectos(); alert(data.mensaje); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); }
    finally { setLoadingProspecto(null); }
  };

  const cerrarSesion = () => {
    if (typeof window !== 'undefined') { localStorage.removeItem('dashboard_user'); router.push('/login'); }
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : filtro === 'activos' ? pedidos.filter(p => ['Preparando', 'Listo'].includes(p.estado)) : pedidos.filter(p => p.estado === filtro);
  const fantasmasPendientes = fantasmas.filter(f => !f.notificado);
  const prospectosPendientes = prospectos.filter(p => !p.notificado);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
      {showAlert && <div className="fixed top-0 left-0 right-0 bg-white text-orange-600 py-3 text-center font-bold z-50 animate-pulse">🔔 ¡NUEVO PEDIDO! 🔔</div>}

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">🥪 Dashboard</h1>
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

        {/* 🆕 TABS CON NUEVOS MÓDULOS */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[
            { key: 'pedidos', icon: '🥪', label: '' },
            { key: 'fantasmas', icon: '👻', label: '', badge: fantasmasPendientes.length },
            { key: 'prospectos', icon: '📋', label: '', badge: prospectosPendientes.length },
            { key: 'abandonados', icon: '🛒', label: '', badge: abandonados.filter(a => !a.recuperado).length },
            { key: 'menu', icon: '🍔', label: '' },
            { key: 'reportes', icon: '📊', label: '' },
            { key: 'suscripcion', icon: '💳', label: '' },
            { key: 'config', icon: '⚙️', label: '' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all ${vista === tab.key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
              {tab.icon}{tab.label}
              {tab.badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {vista === 'pedidos' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activos', 'Preparando', 'Listo', 'Entregado', '📊 Todos'].map((f, i) => {
                const key = ['activos', 'Preparando', 'Listo', 'Entregado', 'todos'][i];
                return (
                  <button key={key} onClick={() => setFiltro(key)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${filtro === key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
                    {f}
                  </button>
                );
              })}
            </div>
            {isLoading ? <div className="text-center text-white py-10">Cargando...</div> : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-10"><div className="text-6xl mb-4">📭</div><p className="text-white/60">No hay pedidos</p></div>
            ) : (
              <div className="grid gap-4">
                {pedidosFiltrados.map(pedido => (
                  <PedidoCard key={pedido.id} pedido={pedido} onMarcarListo={marcarListo} onMarcarEntregado={marcarEntregado}
                    isLoading={loadingPedido === pedido.numero} isNew={newPedidoIds.has(pedido.numero)} />
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'fantasmas' && (
          <>
            {fantasmasPendientes.length > 0 && (
              <button onClick={notificarTodosFantasmas} disabled={notificandoTodos}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-4 hover:scale-105 transition-transform disabled:opacity-50">
                {notificandoTodos ? '⏳ Enviando...' : `🎉 Notificar a ${fantasmasPendientes.length} clientes`}
              </button>
            )}
            {fantasmas.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">👻</div><p className="text-white/60">No hay carritos fantasma</p></div> : (
              <div className="grid gap-4">{fantasmas.map(f => <FantasmaCard key={f.id} fantasma={f} onNotificar={notificarFantasma} isLoading={loadingFantasma === f.id} />)}</div>
            )}
          </>
        )}

        {vista === 'prospectos' && (
          prospectos.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">📋</div><p className="text-white/60">No hay prospectos</p></div> : (
            <div className="grid gap-4">{prospectos.map(p => <ProspectoCard key={p.id} prospecto={p} onNotificar={notificarProspecto} isLoading={loadingProspecto === p.id} />)}</div>
          )
        )}

        {vista === 'abandonados' && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-white font-bold mb-2">Carritos Abandonados</p>
            <p className="text-white/60 mb-4">Clientes que empezaron pedido pero no completaron</p>
            <p className="text-3xl font-bold text-white">{abandonados.length}</p>
          </div>
        )}

        {/* 🆕 EDITOR DE MENÚ */}
        {vista === 'menu' && <EditorMenu onClose={() => setVista('pedidos')} />}

        {vista === 'reportes' && <ReportesPanel plan={config.plan || 'BASICO'} />}

        {/* 🆕 SUSCRIPCIÓN */}
        {vista === 'suscripcion' && <SuscripcionPanel negocio="carrito" onClose={() => setVista('pedidos')} />}

        {vista === 'config' && <ConfigPanel config={config} negocio="carrito" onConfigUpdate={cargarConfig} />}

        <button onClick={() => { cargarStats(); cargarPedidos(); cargarFantasmas(); cargarProspectos(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-orange-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
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
