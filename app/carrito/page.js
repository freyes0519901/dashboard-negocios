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
// 📊 COMPONENTE REPORTES
// ============================================
function ReportesPanel({ plan }) {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarReportes(); }, [periodo]);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetchSeguro(`/api/carrito/reportes?periodo=${periodo}`);
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
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${periodo === p.key ? 'bg-white text-orange-600' : 'text-white/70 hover:text-white'}`}>
            {p.label}
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
    </div>
  );
}

// ============================================
// ⚙️ COMPONENTE CONFIG
// ============================================
function ConfigPanel({ config, negocio, onConfigUpdate }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  
  const [horaApertura, setHoraApertura] = useState(config.hora_apertura || 16);
  const [horaCierre, setHoraCierre] = useState(config.hora_cierre || 2);
  const [diasAtencion, setDiasAtencion] = useState(config.dias_atencion || ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);
  
  const DIAS_SEMANA = [
    { id: 'lunes', label: 'Lun' }, { id: 'martes', label: 'Mar' }, { id: 'miercoles', label: 'Mié' },
    { id: 'jueves', label: 'Jue' }, { id: 'viernes', label: 'Vie' }, { id: 'sabado', label: 'Sáb' }, { id: 'domingo', label: 'Dom' },
  ];
  const HORAS = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i.toString().padStart(2, '0')}:00` }));

  useEffect(() => {
    setHoraApertura(config.hora_apertura ?? 16);
    setHoraCierre(config.hora_cierre ?? 2);
    setDiasAtencion(config.dias_atencion || ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);
  }, [config]);

  const toggleDia = (dia) => setDiasAtencion(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);

  const guardarHorarios = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetchSeguro(`/api/${negocio}/config/horarios`, {
        method: 'POST',
        body: JSON.stringify({ hora_apertura: horaApertura, hora_cierre: horaCierre, dias_atencion: diasAtencion })
      });
      const data = await res.json();
      if (data.success) { setMensaje({ tipo: 'success', texto: '✅ Horarios guardados' }); setEditando(false); if (onConfigUpdate) onConfigUpdate(); }
      else setMensaje({ tipo: 'error', texto: data.error || 'Error' });
    } catch (e) { setMensaje({ tipo: 'error', texto: 'Error de conexión' }); }
    setGuardando(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-4">⚙️ Configuración</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><span className="text-white/70">Negocio</span><span className="text-white font-bold">{config.nombre || 'Sánguchez con Hambre'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Plan</span><span className="text-white font-bold">{config.plan || 'BASICO'}</span></div>
          <div className="flex justify-between"><span className="text-white/70">Estado</span><span className={`font-bold ${config.abierto ? 'text-green-400' : 'text-red-400'}`}>{config.abierto ? '🟢 Abierto' : '🔴 Cerrado'}</span></div>
        </div>
      </div>

      <div className="bg-white/10 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">⏰ Horario</h3>
          {!editando && <button onClick={() => setEditando(true)} className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm">✏️ Editar</button>}
        </div>

        {mensaje && <div className={`mb-4 p-3 rounded-xl text-sm ${mensaje.tipo === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{mensaje.texto}</div>}

        {!editando ? (
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-white/70">Horario</span><span className="text-white">{config.horario_texto}</span></div>
            <div><span className="text-white/70 text-sm">Días:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {DIAS_SEMANA.map(dia => <span key={dia.id} className={`px-2 py-1 rounded text-xs ${diasAtencion.includes(dia.id) ? 'bg-green-500/30 text-green-300' : 'bg-white/10 text-white/40'}`}>{dia.label}</span>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div><label className="text-white/70 text-sm block mb-2">Días:</label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map(dia => <button key={dia.id} onClick={() => toggleDia(dia.id)} className={`px-3 py-2 rounded-xl text-sm font-bold ${diasAtencion.includes(dia.id) ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'}`}>{dia.label}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-white/70 text-sm block mb-2">Apertura:</label>
                <select value={horaApertura} onChange={(e) => setHoraApertura(parseInt(e.target.value))} className="w-full bg-white/20 text-white rounded-xl p-3">{HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}</select>
              </div>
              <div><label className="text-white/70 text-sm block mb-2">Cierre:</label>
                <select value={horaCierre} onChange={(e) => setHoraCierre(parseInt(e.target.value))} className="w-full bg-white/20 text-white rounded-xl p-3">{HORAS.map(h => <option key={h.value} value={h.value} className="bg-gray-800">{h.label}</option>)}</select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl">Cancelar</button>
              <button onClick={guardarHorarios} disabled={guardando} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50">{guardando ? '⏳' : '💾 Guardar'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 🍔 EDITOR DE MENÚ - CON FIX DE INPUTS
// ============================================
function EditorMenu({ onClose }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  // Estados SEPARADOS para formulario
  const [formKey, setFormKey] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formPrecio, setFormPrecio] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formCategoria, setFormCategoria] = useState('principal');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetchSeguro('/api/carrito/menu/productos');
      const data = await res.json();
      if (data.success) setProductos(data.productos || []);
    } catch (e) { console.error('Error:', e); }
    setLoading(false);
  };

  const limpiarForm = () => { setFormKey(''); setFormNombre(''); setFormPrecio(''); setFormDescripcion(''); setFormCategoria('principal'); };

  const iniciarEdicion = (prod) => {
    setEditandoId(prod.id);
    setFormKey(prod.key || '');
    setFormNombre(prod.nombre || '');
    setFormPrecio(prod.precio?.toString() || '');
    setFormDescripcion(prod.descripcion || '');
    setFormCategoria(prod.categoria || 'principal');
    setMostrarNuevo(false);
  };

  const cancelarEdicion = () => { setEditandoId(null); setMostrarNuevo(false); limpiarForm(); };

  const guardarProducto = async () => {
    if (!formNombre || !formPrecio) return alert('Nombre y precio son requeridos');
    setSaving(true);
    try {
      const producto = { key: formKey, nombre: formNombre, precio: parseInt(formPrecio), descripcion: formDescripcion, categoria: formCategoria };
      const isNew = mostrarNuevo;
      const url = isNew ? '/api/carrito/menu/productos' : `/api/carrito/menu/productos/${editandoId}`;
      const res = await fetchSeguro(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(producto) });
      const data = await res.json();
      if (data.success) { await cargarDatos(); cancelarEdicion(); }
      else alert(data.error || 'Error');
    } catch (e) { alert('Error de conexión'); }
    setSaving(false);
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    await fetchSeguro(`/api/carrito/menu/productos/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const toggleDisponible = async (prod) => {
    await fetchSeguro(`/api/carrito/menu/productos/${prod.id}`, { method: 'PUT', body: JSON.stringify({ ...prod, disponible: !prod.disponible }) });
    cargarDatos();
  };

  // FIX v3.2: Formulario inline (no como función) para evitar pérdida de foco

  if (loading) return <div className="text-center text-white py-10"><div className="text-4xl mb-4 animate-spin">⏳</div><p>Cargando menú...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">🍔 Editor de Menú</h2>
        {onClose && <button onClick={onClose} className="text-white/60 hover:text-white">✕ Cerrar</button>}
      </div>

      {!mostrarNuevo && !editandoId && <button onClick={() => { setMostrarNuevo(true); limpiarForm(); }} className="w-full bg-green-500/20 border-2 border-dashed border-green-500 text-green-400 py-3 rounded-xl mb-4">➕ Agregar Producto</button>}
      
      {(mostrarNuevo || editandoId) && (
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <h3 className="text-white font-bold mb-3">{mostrarNuevo ? '➕ Nuevo' : '✏️ Editar'} Producto</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Clave (ej: hamburguesa)" value={formKey} onChange={(e) => setFormKey(e.target.value)}
              disabled={!!editandoId} className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50" />
            <input type="text" placeholder="Nombre" value={formNombre} onChange={(e) => setFormNombre(e.target.value)}
              className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" />
            <input type="number" placeholder="Precio" value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)}
              className="bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" />
            <select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)}
              className="bg-white/20 text-white rounded-lg px-3 py-2 outline-none">
              <option value="principal" className="bg-gray-800">Principal</option>
              <option value="acompañamiento" className="bg-gray-800">Acompañamiento</option>
              <option value="bebida" className="bg-gray-800">Bebida</option>
              <option value="postre" className="bg-gray-800">Postre</option>
            </select>
            <textarea placeholder="Descripción" value={formDescripcion} onChange={(e) => setFormDescripcion(e.target.value)}
              className="col-span-2 bg-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40" rows={2} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={guardarProducto} disabled={saving || !formNombre || !formPrecio} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50">{saving ? '⏳...' : '💾 Guardar'}</button>
            <button onClick={cancelarEdicion} className="px-4 bg-white/20 text-white rounded-lg">✕</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {productos.filter(p => p.id !== editandoId).map(prod => (
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
                  <button onClick={() => toggleDisponible(prod)} className={`px-2 py-1 rounded text-xs ${prod.disponible ? 'bg-green-500' : 'bg-red-500'} text-white`}>{prod.disponible ? '✓' : '✗'}</button>
                  <button onClick={() => iniciarEdicion(prod)} className="px-2 py-1 rounded text-xs bg-blue-500 text-white">✏️</button>
                  <button onClick={() => eliminarProducto(prod.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {productos.length === 0 && !mostrarNuevo && <div className="text-center py-10"><div className="text-4xl mb-2">📭</div><p className="text-white/60">No hay productos</p></div>}
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL CARRITO
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
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = freq; osc.type = 'sine';
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        }, i * 150);
      });
    } catch (e) { console.error('Error:', e); }
  }, []);

  const enableSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      setSoundEnabled(true); playSound();
    } catch (e) { console.error('Error:', e); }
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

  const cargarConfig = useCallback(async () => { try { const res = await fetchSeguro('/api/carrito/config'); const data = await res.json(); if (data.success) setConfig(data); } catch (e) {} }, []);
  const cargarStats = useCallback(async () => { try { const res = await fetchSeguro('/api/carrito/stats/rapidas'); const data = await res.json(); if (data.success) setStats(data); } catch (e) {} }, []);
  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetchSeguro('/api/carrito/pedidos-db?estado=todos&limite=50');
      const data = await res.json();
      if (data.success && data.pedidos) {
        const prevIds = new Set(previousPedidosRef.current.map(p => p.numero));
        const nuevos = data.pedidos.filter(p => !prevIds.has(p.numero) && p.estado === 'Preparando');
        if (nuevos.length > 0 && previousPedidosRef.current.length > 0 && soundEnabled) {
          playSound(); setShowAlert(true); setNewPedidoIds(new Set(nuevos.map(p => p.numero)));
          setTimeout(() => { setShowAlert(false); setNewPedidoIds(new Set()); }, 5000);
        }
        previousPedidosRef.current = data.pedidos;
        setPedidos(data.pedidos);
      }
    } catch (e) {} finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);
  const cargarFantasmas = useCallback(async () => { try { const res = await fetchSeguro('/api/carrito/fantasmas'); const data = await res.json(); if (data.success) setFantasmas(data.fantasmas || []); } catch (e) {} }, []);
  const cargarProspectos = useCallback(async () => { try { const res = await fetchSeguro('/api/carrito/prospectos-db'); const data = await res.json(); if (data.success) setProspectos(data.prospectos || []); } catch (e) {} }, []);
  const cargarAbandonados = useCallback(async () => { try { const res = await fetchSeguro('/api/carrito/abandonados'); const data = await res.json(); if (data.success) setAbandonados(data.abandonados || []); } catch (e) {} }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHora = () => setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    cargarConfig(); cargarStats(); cargarPedidos(); cargarFantasmas(); cargarProspectos(); cargarAbandonados();
    const interval = setInterval(() => { cargarStats(); cargarPedidos(); setCountdown(10); }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStats, cargarPedidos, cargarFantasmas, cargarProspectos, cargarAbandonados]);

  useEffect(() => { if (!user) return; const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000); return () => clearInterval(interval); }, [user]);

  const marcarListo = async (numero) => { setLoadingPedido(numero); try { const res = await fetchSeguro('/api/carrito/pedidos/notificar-listo', { method: 'POST', body: JSON.stringify({ numero }) }); const data = await res.json(); if (data.success) { await cargarPedidos(); await cargarStats(); alert(data.mensaje); } else alert('Error'); } catch (e) { alert('Error'); } finally { setLoadingPedido(null); } };
  const marcarEntregado = async (numero) => { setLoadingPedido(numero); try { const res = await fetchSeguro('/api/carrito/pedidos/marcar-entregado', { method: 'POST', body: JSON.stringify({ numero }) }); if ((await res.json()).success) { await cargarPedidos(); await cargarStats(); } } catch (e) {} finally { setLoadingPedido(null); } };
  const notificarFantasma = async (id) => { setLoadingFantasma(id); try { const res = await fetchSeguro(`/api/carrito/fantasmas/${id}/notificar`, { method: 'POST' }); const data = await res.json(); if (data.success) { await cargarFantasmas(); alert(data.mensaje); } } catch (e) {} finally { setLoadingFantasma(null); } };
  const notificarTodosFantasmas = async () => { if (!confirm('¿Notificar a todos?')) return; setNotificandoTodos(true); try { const res = await fetchSeguro('/api/carrito/fantasmas/notificar-todos', { method: 'POST' }); const data = await res.json(); alert(data.success ? `✅ ${data.notificados} notificados` : 'Error'); await cargarFantasmas(); } catch (e) {} finally { setNotificandoTodos(false); } };
  const notificarProspecto = async (id) => { setLoadingProspecto(id); try { const res = await fetchSeguro(`/api/carrito/prospectos/${id}/notificar`, { method: 'POST' }); const data = await res.json(); if (data.success) { await cargarProspectos(); alert(data.mensaje); } } catch (e) {} finally { setLoadingProspecto(null); } };

  const cerrarSesion = () => { if (typeof window !== 'undefined') { localStorage.removeItem('dashboard_user'); router.push('/login'); } };

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
            <p className="text-white/60 text-sm">{stats.abierto ? '🟢 Abierto' : '🔴 Cerrado'}<span className="ml-2 cursor-pointer hover:text-white" onClick={cerrarSesion}>• Cerrar sesión</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound} className={`px-3 py-1 rounded-full text-sm font-bold ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>{soundEnabled ? '🔊 Sonido' : '🔇 Sonido'}</button>
            <div className="text-right text-white"><div className="text-xl font-mono font-bold">{hora}</div><div className="text-xs text-white/60">🔄 {countdown}s</div></div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-yellow-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-yellow-900">{stats.preparando || 0}</div><div className="text-xs text-yellow-800">👨‍🍳 Preparando</div></div>
          <div className="bg-green-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-green-900">{stats.listos || 0}</div><div className="text-xs text-green-800">✅ Listos</div></div>
          <div className="bg-blue-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-blue-900">${(stats.ventas_hoy || 0).toLocaleString('es-CL')}</div><div className="text-xs text-blue-800">💰 Hoy</div></div>
          <div className="bg-purple-400 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-purple-900">{(stats.prospectos_pendientes || 0) + (stats.fantasmas_pendientes || 0)}</div><div className="text-xs text-purple-800">📋 Pendientes</div></div>
        </div>

        <div className="flex gap-1 mb-4 overflow-x-auto">
          {[{ key: 'pedidos', icon: '🥪' }, { key: 'fantasmas', icon: '👻', badge: fantasmasPendientes.length }, { key: 'prospectos', icon: '📋', badge: prospectosPendientes.length }, { key: 'abandonados', icon: '🛒', badge: abandonados.filter(a => !a.recuperado).length }, { key: 'menu', icon: '🍔' }, { key: 'reportes', icon: '📊' }, { key: 'config', icon: '⚙️' }].map(tab => (
            <button key={tab.key} onClick={() => setVista(tab.key)} className={`relative px-4 py-2 rounded-xl font-bold ${vista === tab.key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
              {tab.icon}
              {tab.badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>}
            </button>
          ))}
        </div>

        {vista === 'pedidos' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {['🔥 Activos', 'Preparando', 'Listo', 'Entregado', '📊 Todos'].map((f, i) => {
                const key = ['activos', 'Preparando', 'Listo', 'Entregado', 'todos'][i];
                return <button key={key} onClick={() => setFiltro(key)} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${filtro === key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>{f}</button>;
              })}
            </div>
            {isLoading ? <div className="text-center text-white py-10">Cargando...</div> : pedidosFiltrados.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">📭</div><p className="text-white/60">No hay pedidos</p></div> : <div className="grid gap-4">{pedidosFiltrados.map(p => <PedidoCard key={p.id} pedido={p} onMarcarListo={marcarListo} onMarcarEntregado={marcarEntregado} isLoading={loadingPedido === p.numero} isNew={newPedidoIds.has(p.numero)} />)}</div>}
          </>
        )}

        {vista === 'fantasmas' && (
          <>
            {fantasmasPendientes.length > 0 && <button onClick={notificarTodosFantasmas} disabled={notificandoTodos} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-4 disabled:opacity-50">{notificandoTodos ? '⏳...' : `🎉 Notificar a ${fantasmasPendientes.length} clientes`}</button>}
            {fantasmas.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">👻</div><p className="text-white/60">No hay carritos fantasma</p></div> : <div className="grid gap-4">{fantasmas.map(f => <FantasmaCard key={f.id} fantasma={f} onNotificar={notificarFantasma} isLoading={loadingFantasma === f.id} />)}</div>}
          </>
        )}

        {vista === 'prospectos' && (prospectos.length === 0 ? <div className="text-center py-10"><div className="text-6xl mb-4">📋</div><p className="text-white/60">No hay prospectos</p></div> : <div className="grid gap-4">{prospectos.map(p => <ProspectoCard key={p.id} prospecto={p} onNotificar={notificarProspecto} isLoading={loadingProspecto === p.id} />)}</div>)}

        {vista === 'abandonados' && <div className="text-center py-10"><div className="text-6xl mb-4">🛒</div><p className="text-white font-bold">Carritos Abandonados</p><p className="text-3xl font-bold text-white mt-4">{abandonados.length}</p></div>}

        {vista === 'menu' && <EditorMenu onClose={() => setVista('pedidos')} />}
        {vista === 'reportes' && <ReportesPanel plan={config.plan || 'BASICO'} />}
        {vista === 'config' && <ConfigPanel config={config} negocio="carrito" onConfigUpdate={cargarConfig} />}

        <button onClick={() => { cargarStats(); cargarPedidos(); cargarFantasmas(); cargarProspectos(); setCountdown(10); }} className="fixed bottom-6 right-6 bg-white text-orange-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">🔄</button>

        {!soundEnabled && mounted && <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">⚠️ Activa el sonido</div>}
      </div>
    </div>
  );
}
