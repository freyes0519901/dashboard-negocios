'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// 💈 DASHBOARD BARBERÍA - BASADO EN CARRITO (FUNCIONAL)
// ============================================================================

// 🔒 Usa proxy interno, NO expone API Key
const API_PROXY = '/api/backend';

// 🔒 Fetch seguro via proxy
const fetchSeguro = async (path, options = {}) => {
  const url = `${API_PROXY}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};

// Formatear precio chileno
const formatPrecio = (precio) => `$${(precio || 0).toLocaleString('es-CL')}`;

// ============================================
// 📅 COMPONENTE CITA
// ============================================
function CitaCard({ cita, onIniciar, onCompletar, onNoAsistio, isLoading }) {
  const colores = {
    'Confirmada': 'from-blue-400 to-blue-600',
    'En progreso': 'from-yellow-400 to-orange-500',
    'Completada': 'from-green-400 to-emerald-500',
    'Cancelada': 'from-gray-400 to-gray-500',
    'No asistió': 'from-red-400 to-red-500',
  };
  const iconos = { 'Confirmada': '📅', 'En progreso': '✂️', 'Completada': '✅', 'Cancelada': '❌', 'No asistió': '👻' };

  return (
    <div className={`bg-gradient-to-br ${colores[cita.estado] || colores['Confirmada']} rounded-2xl p-4 text-white shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl font-bold">🕐 {cita.hora}</span>
        <span className="text-3xl">{iconos[cita.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{cita.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {cita.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="text-sm font-medium mb-1">✂️ Servicio:</div>
        <div className="font-bold">{cita.servicio}</div>
        <div className="text-lg font-bold mt-1">{formatPrecio(cita.precio)}</div>
      </div>
      <div className="flex gap-2">
        {cita.estado === 'Confirmada' && (
          <>
            <button onClick={() => onIniciar(cita.id)} disabled={isLoading}
              className="flex-1 bg-white text-blue-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              {isLoading ? '⏳' : '▶️ Iniciar'}
            </button>
            <button onClick={() => onNoAsistio(cita.id)} disabled={isLoading}
              className="px-3 bg-red-500/50 text-white font-bold py-2 rounded-xl disabled:opacity-50">
              👻
            </button>
          </>
        )}
        {cita.estado === 'En progreso' && (
          <button onClick={() => onCompletar(cita.id)} disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳' : '✅ Completar'}
          </button>
        )}
        {['Completada', 'Cancelada', 'No asistió'].includes(cita.estado) && (
          <span className="flex-1 text-center py-2 bg-white/20 rounded-xl text-sm">
            {cita.estado === 'Completada' ? '✓ Atendido' : cita.estado === 'Cancelada' ? '✗ Cancelado' : '👻 No vino'}
          </span>
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
  const [error, setError] = useState(null);

  const CATEGORIAS = [
    { id: 'corte', nombre: 'Cortes', emoji: '✂️' },
    { id: 'barba', nombre: 'Barba', emoji: '🧔' },
    { id: 'combo', nombre: 'Combos', emoji: '🔥' },
    { id: 'otro', nombre: 'Otros', emoji: '⭐' },
  ];

  useEffect(() => { cargarServicios(); }, []);

  const cargarServicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSeguro('/api/barberia/servicios');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setServicios(data.servicios || []);
      } else {
        setError(data.error || 'Error cargando servicios');
      }
    } catch (e) {
      console.error('Error:', e);
      setError('Error de conexión: ' + e.message);
    }
    setLoading(false);
  };

  const guardarServicio = async (servicio) => {
    setSaving(true);
    setError(null);
    try {
      const isNew = !servicio.id || typeof servicio.id === 'string';
      const url = isNew ? '/api/barberia/servicios' : `/api/barberia/servicios/${servicio.id}`;
      const res = await fetchSeguro(url, { 
        method: isNew ? 'POST' : 'PUT', 
        body: JSON.stringify(servicio) 
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        await cargarServicios();
        setEditando(null);
        setNuevo(null);
      } else {
        setError(data.errores?.join(', ') || data.error || 'Error guardando');
      }
    } catch (e) {
      setError('Error de conexión: ' + e.message);
    }
    setSaving(false);
  };

  const eliminarServicio = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      const res = await fetchSeguro(`/api/barberia/servicios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        cargarServicios();
      } else {
        alert(data.error || 'Error eliminando');
      }
    } catch (e) {
      alert('Error de conexión: ' + e.message);
    }
  };

  const togglePromocion = async (servicio) => {
    if (servicio.promocion_precio) {
      try {
        const res = await fetchSeguro(`/api/barberia/servicios/${servicio.id}/promocion`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) cargarServicios();
        else alert(data.error || 'Error');
      } catch (e) {
        alert('Error: ' + e.message);
      }
    } else {
      const precioPromo = prompt(`Precio promoción (actual: ${formatPrecio(servicio.precio)}):`);
      if (!precioPromo) return;
      const precio = parseInt(precioPromo.replace(/\D/g, ''));
      if (!precio || precio >= servicio.precio) {
        alert('El precio promoción debe ser menor al precio normal');
        return;
      }
      try {
        const res = await fetchSeguro(`/api/barberia/servicios/${servicio.id}/promocion`, {
          method: 'POST',
          body: JSON.stringify({ precio_promocion: precio, texto: '🔥 Promo' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) cargarServicios();
        else alert(data.error || 'Error');
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  };

  const FormServicio = ({ servicio, onSave, onCancel }) => {
    const [form, setForm] = useState(servicio || {
      nombre: '', precio: '', duracion: 30, emoji: '✂️',
      descripcion: '', categoria: 'corte'
    });
    const emojis = ['✂️', '💇', '🧔', '🪒', '✨', '⭐', '🔥', '💎', '👦', '💈'];

    return (
      <div className="bg-white/10 rounded-xl p-4 mb-4 border-2 border-white/30">
        <h3 className="text-white font-bold mb-3">
          {servicio?.id ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}
        </h3>
        
        {error && <div className="bg-red-500/30 text-red-200 p-3 rounded-lg mb-3 text-sm">⚠️ {error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-white/70 text-xs">Nombre *</label>
            <input type="text" placeholder="Ej: Corte Clásico" value={form.nombre} 
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              maxLength={50} className="w-full bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 mt-1" />
          </div>
          <div>
            <label className="text-white/70 text-xs">Precio *</label>
            <input type="number" placeholder="8000" value={form.precio} 
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              min={1000} max={500000} className="w-full bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 mt-1" />
          </div>
          <div>
            <label className="text-white/70 text-xs">Duración (min)</label>
            <input type="number" placeholder="30" value={form.duracion} 
              onChange={(e) => setForm({ ...form, duracion: e.target.value })}
              min={5} max={180} className="w-full bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 mt-1" />
          </div>
          <div>
            <label className="text-white/70 text-xs">Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full bg-white/20 text-white rounded-lg px-3 py-2 mt-1">
              {CATEGORIAS.map(cat => <option key={cat.id} value={cat.id} className="bg-gray-800">{cat.emoji} {cat.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/70 text-xs">Emoji</label>
            <div className="flex gap-1 mt-1 flex-wrap">
              {emojis.map(e => (
                <button key={e} type="button" onClick={() => setForm({ ...form, emoji: e })}
                  className={`w-8 h-8 rounded ${form.emoji === e ? 'bg-white text-black' : 'bg-white/20'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-white/70 text-xs">Descripción</label>
            <textarea placeholder="Descripción del servicio..." value={form.descripcion} 
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              maxLength={200} className="w-full bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 mt-1" rows={2} />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onSave(form)} disabled={saving || !form.nombre || !form.precio}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
            {saving ? '⏳ Guardando...' : '💾 Guardar'}
          </button>
          <button onClick={onCancel} className="px-6 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl">✕</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-white py-10"><div className="text-4xl mb-4 animate-spin">⏳</div><p>Cargando servicios...</p></div>;
  }

  const serviciosPorCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    servicios: servicios.filter(s => s.categoria === cat.id)
  })).filter(cat => cat.servicios.length > 0 || nuevo?.categoria === cat.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">✂️ Editor de Servicios</h2>
        {onClose && <button onClick={onClose} className="text-white/60 hover:text-white text-lg">✕ Cerrar</button>}
      </div>

      {error && !nuevo && !editando && (
        <div className="bg-red-500/30 text-red-200 p-3 rounded-xl mb-4">
          ⚠️ {error}
          <button onClick={cargarServicios} className="ml-2 underline">Reintentar</button>
        </div>
      )}

      {!nuevo && (
        <button onClick={() => setNuevo({ categoria: 'corte' })} 
          className="w-full bg-green-500/20 border-2 border-dashed border-green-500 text-green-400 py-4 rounded-xl mb-4 hover:bg-green-500/30 font-bold">
          ➕ Agregar Servicio
        </button>
      )}

      {nuevo && <FormServicio servicio={null} onSave={guardarServicio} onCancel={() => { setNuevo(null); setError(null); }} />}

      {serviciosPorCategoria.length === 0 && !nuevo ? (
        <div className="text-center py-10">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-white/60">No hay servicios configurados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {serviciosPorCategoria.map(categoria => (
            <div key={categoria.id}>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">{categoria.emoji}</span>
                {categoria.nombre}
                <span className="text-white/50 text-sm">({categoria.servicios.length})</span>
              </h3>
              <div className="space-y-3">
                {categoria.servicios.map(servicio => (
                  editando === servicio.id ? (
                    <FormServicio key={servicio.id} servicio={servicio} onSave={guardarServicio} onCancel={() => { setEditando(null); setError(null); }} />
                  ) : (
                    <div key={servicio.id} className={`bg-white/10 rounded-xl p-4 ${servicio.promocion_precio ? 'ring-2 ring-yellow-400' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{servicio.emoji}</span>
                            <h4 className="text-white font-bold">{servicio.nombre}</h4>
                            {servicio.promocion_precio && <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">🔥 PROMO</span>}
                          </div>
                          <p className="text-white/60 text-sm mt-1">{servicio.descripcion}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
                            <span>⏱️ {servicio.duracion} min</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {servicio.promocion_precio ? (
                            <div>
                              <div className="text-white/50 line-through text-sm">{formatPrecio(servicio.precio)}</div>
                              <div className="text-yellow-400 font-bold text-xl">{formatPrecio(servicio.promocion_precio)}</div>
                            </div>
                          ) : (
                            <div className="text-white font-bold text-xl">{formatPrecio(servicio.precio)}</div>
                          )}
                          <div className="flex gap-1 mt-2 justify-end">
                            <button onClick={() => togglePromocion(servicio)}
                              className={`px-2 py-1 rounded text-xs font-bold ${servicio.promocion_precio ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white hover:bg-yellow-400 hover:text-yellow-900'}`}
                              title={servicio.promocion_precio ? 'Quitar promo' : 'Agregar promo'}>🏷️</button>
                            <button onClick={() => setEditando(servicio.id)} className="px-2 py-1 rounded text-xs bg-blue-500 text-white hover:bg-blue-600">✏️</button>
                            <button onClick={() => eliminarServicio(servicio.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600">🗑️</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-white/10 rounded-xl p-4">
        <h4 className="text-white font-bold mb-2">📊 Resumen</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-white/70">Total servicios:</div>
          <div className="text-white font-bold">{servicios.length}</div>
          <div className="text-white/70">Con promoción:</div>
          <div className="text-yellow-400 font-bold">{servicios.filter(s => s.promocion_precio).length}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ⚙️ CONFIG PANEL
// ============================================
function ConfigPanel({ config, onConfigUpdate }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  
  const [horaApertura, setHoraApertura] = useState(config.hora_apertura || 10);
  const [horaCierre, setHoraCierre] = useState(config.hora_cierre || 20);
  const [diasAtencion, setDiasAtencion] = useState(config.dias_atencion || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
  
  const DIAS_SEMANA = [
    { id: 'lunes', label: 'Lun' }, { id: 'martes', label: 'Mar' }, { id: 'miercoles', label: 'Mié' },
    { id: 'jueves', label: 'Jue' }, { id: 'viernes', label: 'Vie' }, { id: 'sabado', label: 'Sáb' }, { id: 'domingo', label: 'Dom' },
  ];
  const HORAS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i.toString().padStart(2, '0')}:00` }));

  useEffect(() => {
    setHoraApertura(config.hora_apertura ?? 10);
    setHoraCierre(config.hora_cierre ?? 20);
    setDiasAtencion(config.dias_atencion || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']);
  }, [config]);

  const toggleDia = (dia) => {
    if (diasAtencion.includes(dia)) setDiasAtencion(diasAtencion.filter(d => d !== dia));
    else setDiasAtencion([...diasAtencion, dia]);
  };

  const guardarHorarios = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetchSeguro('/api/barberia/config/horarios', {
        method: 'POST',
        body: JSON.stringify({ hora_apertura: horaApertura, hora_cierre: horaCierre, dias_atencion: diasAtencion })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setMensaje({ tipo: 'success', texto: '✅ Horarios guardados' });
        setEditando(false);
        if (onConfigUpdate) onConfigUpdate();
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al guardar' });
      }
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión: ' + e.message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-4">💈 Información</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-white/70">Negocio</span><span className="text-white font-bold">{config.nombre || 'El Galpón de la Barba'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Estado</span><span className={`font-bold ${config.abierto ? 'text-green-400' : 'text-red-400'}`}>{config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Dirección</span><span className="text-white text-sm text-right">{config.direccion}</span></div>
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
            <div className="flex justify-between"><span className="text-white/70">Horario</span><span className="text-white">{config.horario_texto}</span></div>
            <div>
              <span className="text-white/70 text-sm">Días:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {DIAS_SEMANA.map(dia => (
                  <span key={dia.id} className={`px-2 py-1 rounded text-xs font-medium ${diasAtencion.includes(dia.id) ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/40'}`}>{dia.label}</span>
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
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${diasAtencion.includes(dia.id) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'}`}>{dia.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm block mb-2">Apertura:</label>
                <select value={horaApertura} onChange={(e) => setHoraApertura(parseInt(e.target.value))} className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                  {HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/70 text-sm block mb-2">Cierre:</label>
                <select value={horaCierre} onChange={(e) => setHoraCierre(parseInt(e.target.value))} className="w-full bg-white/20 text-white border-0 rounded-xl p-3 font-bold">
                  {HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditando(false)} disabled={guardando} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl">Cancelar</button>
              <button onClick={guardarHorarios} disabled={guardando || diasAtencion.length === 0} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50">{guardando ? '⏳...' : '💾 Guardar'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 📊 REPORTES
// ============================================
function ReportesPanel() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('hoy');

  useEffect(() => { cargarDatos(); }, [periodo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetchSeguro(`/api/barberia/reportes?periodo=${periodo}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setDatos(data);
    } catch (e) {
      console.error('Error:', e);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center text-white py-10"><div className="animate-spin text-4xl mb-4">⏳</div><p>Cargando reportes...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex bg-white/10 rounded-xl p-1">
        {['hoy', 'semana', 'mes'].map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold ${periodo === p ? 'bg-white text-indigo-600' : 'text-white/70'}`}>
            {p === 'hoy' ? '📅 Hoy' : p === 'semana' ? '📆 Semana' : '🗓️ Mes'}
          </button>
        ))}
      </div>

      {datos && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">💰 Ingresos</p>
            <p className="text-2xl font-bold">{formatPrecio(datos.resumen?.ingresos)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">✂️ Citas</p>
            <p className="text-2xl font-bold">{datos.resumen?.citas || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
            <p className="text-white/80 text-xs">🎫 Ticket Prom.</p>
            <p className="text-2xl font-bold">{formatPrecio(datos.resumen?.ticket_promedio)}</p>
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
            {datos.top_servicios.map((prod, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                <span className="text-white">{['🥇', '🥈', '🥉', '🏅', '🏅'][i]} {prod.nombre}</span>
                <span className="text-white font-bold">{prod.cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function BarberiaDashboard() {
  const [citas, setCitas] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({});
  const [filtro, setFiltro] = useState('hoy');
  const [vista, setVista] = useState('citas');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCita, setLoadingCita] = useState(null);
  const [user, setUser] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Auth
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

  // Reloj
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHora = () => setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarConfig = useCallback(async () => {
    try {
      const res = await fetchSeguro('/api/barberia/config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setConfig(data);
    } catch (e) { console.error('Error config:', e); }
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetchSeguro('/api/barberia/stats/rapidas');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (e) { console.error('Error stats:', e); }
  }, []);

  const cargarCitas = useCallback(async () => {
    try {
      const res = await fetchSeguro(`/api/barberia/citas-db?fecha=${filtro}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) setCitas(data.citas || []);
    } catch (e) { console.error('Error citas:', e); }
    finally { setIsLoading(false); }
  }, [filtro]);

  useEffect(() => {
    if (!user) return;
    cargarConfig();
    cargarStats();
    cargarCitas();
    const interval = setInterval(() => { cargarStats(); cargarCitas(); setCountdown(10); }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarCitas]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  const iniciarCita = async (id) => {
    setLoadingCita(id);
    try {
      const res = await fetchSeguro('/api/barberia/citas/iniciar', { method: 'POST', body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); }
      else alert(data.error || 'Error');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoadingCita(null); }
  };

  const completarCita = async (id) => {
    setLoadingCita(id);
    try {
      const res = await fetchSeguro('/api/barberia/citas/completar', { method: 'POST', body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); }
      else alert(data.error || 'Error');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoadingCita(null); }
  };

  const marcarNoAsistio = async (id) => {
    if (!confirm('¿Marcar como no asistió?')) return;
    setLoadingCita(id);
    try {
      const res = await fetchSeguro('/api/barberia/citas/no-asistio', { method: 'POST', body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) { await cargarCitas(); await cargarStats(); }
      else alert(data.error || 'Error');
    } catch (e) { alert('Error: ' + e.message); }
    finally { setLoadingCita(null); }
  };

  const cerrarSesion = () => {
    if (typeof window !== 'undefined') { localStorage.removeItem('dashboard_user'); router.push('/login'); }
  };

  const citasActivas = citas.filter(c => ['Confirmada', 'En progreso'].includes(c.estado));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💈 El Galpón de la Barba</h1>
            <p className="text-white/60 text-sm">
              {config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}
              <span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>• Cerrar sesión</span>
            </p>
          </div>
          <div className="text-right text-white">
            <div className="text-xl font-mono font-bold">{hora}</div>
            <div className="text-xs text-white/60">🔄 {countdown}s</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-blue-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-900">{stats.pendientes || 0}</div>
            <div className="text-xs text-blue-800">📅 Pendientes</div>
          </div>
          <div className="bg-yellow-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-900">{stats.en_progreso || 0}</div>
            <div className="text-xs text-yellow-800">✂️ Atendiendo</div>
          </div>
          <div className="bg-green-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-900">{stats.completadas || 0}</div>
            <div className="text-xs text-green-800">✅ Completadas</div>
          </div>
          <div className="bg-purple-400 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-900">{formatPrecio(stats.ingresos_hoy)}</div>
            <div className="text-xs text-purple-800">💰 Hoy</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[
            { key: 'citas', icon: '📅', badge: citasActivas.length },
            { key: 'servicios', icon: '✂️' },
            { key: 'reportes', icon: '📊' },
            { key: 'config', icon: '⚙️' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setVista(tab.key)}
              className={`relative px-4 py-2 rounded-xl font-bold transition-all ${vista === tab.key ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
              {tab.icon}
              {tab.badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {vista === 'citas' && (
          <>
            <div className="flex gap-2 mb-4">
              {['hoy', 'mañana', 'semana'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${filtro === f ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
                  {f === 'hoy' ? '📅 Hoy' : f === 'mañana' ? '📆 Mañana' : '🗓️ Semana'}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center text-white py-10"><div className="animate-spin text-4xl mb-4">⏳</div><p>Cargando citas...</p></div>
            ) : citas.length === 0 ? (
              <div className="text-center py-10"><div className="text-6xl mb-4">📭</div><p className="text-white/60">No hay citas para {filtro}</p></div>
            ) : (
              <div className="grid gap-4">{citas.map(cita => <CitaCard key={cita.id} cita={cita} onIniciar={iniciarCita} onCompletar={completarCita} onNoAsistio={marcarNoAsistio} isLoading={loadingCita === cita.id} />)}</div>
            )}
          </>
        )}

        {vista === 'servicios' && <EditorServicios onClose={() => setVista('citas')} />}
        {vista === 'reportes' && <ReportesPanel />}
        {vista === 'config' && <ConfigPanel config={config} onConfigUpdate={cargarConfig} />}

        {/* Botón refresh */}
        <button onClick={() => { cargarStats(); cargarCitas(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-indigo-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">🔄</button>
      </div>
    </div>
  );
}
