'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// 🔧 CONFIGURACIÓN API
// ============================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://freyes0519901.pythonanywhere.com';

// ============================================
// 🎨 COMPONENTES REUTILIZABLES
// ============================================
function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="text-center text-white py-10">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p>{texto}</p>
    </div>
  );
}

function EmptyState({ emoji, titulo, subtitulo }) {
  return (
    <div className="text-center py-10">
      <div className="text-6xl mb-4">{emoji}</div>
      <p className="text-white/60">{titulo}</p>
      {subtitulo && <p className="text-white/40 text-sm mt-2">{subtitulo}</p>}
    </div>
  );
}

function Badge({ tipo, children }) {
  const colores = { success: 'bg-green-500', warning: 'bg-yellow-500', danger: 'bg-red-500', info: 'bg-blue-500', neutral: 'bg-white/30' };
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colores[tipo] || colores.neutral}`}>{children}</span>;
}

const formatearPrecio = (precio) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(precio || 0);

// ============================================
// 🥪 COMPONENTE PEDIDO
// ============================================
function PedidoCard({ pedido, onNotificarListo, onMarcarEntregado, isLoading }) {
  const colores = { 'Preparando': 'from-yellow-400 to-orange-500', 'Listo': 'from-green-400 to-emerald-500', 'Entregado': 'from-gray-400 to-gray-500', 'Cancelado': 'from-red-400 to-red-500' };
  const iconos = { 'Preparando': '👨‍🍳', 'Listo': '✅', 'Entregado': '📦', 'Cancelado': '❌' };

  return (
    <div className={`bg-gradient-to-br ${colores[pedido.estado] || colores['Preparando']} rounded-2xl p-4 text-white shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl font-bold">#{pedido.numero}</span>
        <span className="text-3xl">{iconos[pedido.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{pedido.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {pedido.telefono}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3"><div className="text-sm">🛒 {pedido.items}</div></div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold">{formatearPrecio(pedido.total)}</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">💳 {pedido.pago || 'Efectivo'}</span>
      </div>
      <div className="flex gap-2">
        {pedido.estado === 'Preparando' && (
          <button onClick={() => onNotificarListo(pedido.numero)} disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '✅ LISTO - Notificar'}
          </button>
        )}
        {pedido.estado === 'Listo' && (
          <button onClick={() => onMarcarEntregado(pedido.numero)} disabled={isLoading}
            className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '📦 Entregado'}
          </button>
        )}
        {pedido.estado === 'Entregado' && <span className="flex-1 text-center py-3 bg-white/20 rounded-xl">✓ Completado</span>}
      </div>
      <div className="mt-2 text-xs text-white/60 text-center">{new Date(pedido.fecha).toLocaleString('es-CL')}</div>
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
        <Badge tipo={prospecto.notificado ? 'success' : 'neutral'}>{prospecto.notificado ? '✅ Notificado' : '⏳ Pendiente'}</Badge>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{prospecto.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {prospecto.telefono}</div>
        {prospecto.interes && <div className="flex items-center gap-2 text-sm mt-1">🛒 {prospecto.interes}</div>}
        <div className="flex items-center gap-2 text-sm mt-1">📅 {new Date(prospecto.fecha).toLocaleDateString('es-CL')}</div>
      </div>
      {!prospecto.notificado && (
        <button onClick={() => onNotificar(prospecto.id)} disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Avisar que abrimos'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 👻 COMPONENTE CARRITO FANTASMA
// ============================================
function CarritoFantasmaCard({ carrito, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">👻</span>
        <Badge tipo={carrito.convertido ? 'info' : carrito.notificado ? 'success' : 'neutral'}>
          {carrito.convertido ? '🎉 Convertido' : carrito.notificado ? '✅ Notificado' : '⏳ Reservado'}
        </Badge>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{carrito.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {carrito.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">🛒 {carrito.items}</div>
        <div className="flex items-center gap-2 text-sm mt-1 font-bold">💰 {formatearPrecio(carrito.total)}</div>
        <div className="flex items-center gap-2 text-sm mt-1">📅 {new Date(carrito.fecha).toLocaleDateString('es-CL')}</div>
      </div>
      {!carrito.notificado && !carrito.convertido && (
        <button onClick={() => onNotificar(carrito.id)} disabled={isLoading}
          className="w-full bg-white text-purple-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '🔔 Notificar - Ya Abrimos!'}
        </button>
      )}
      {carrito.notificado && !carrito.convertido && <div className="text-center text-white/70 text-sm py-2">⏳ Esperando respuesta...</div>}
      {carrito.convertido && <div className="text-center bg-green-500/30 text-white font-bold py-2 rounded-xl">🎉 ¡Convertido en pedido!</div>}
    </div>
  );
}

// ============================================
// 🛒 COMPONENTE CARRITO ABANDONADO
// ============================================
function CarritoAbandonadoCard({ carrito }) {
  return (
    <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">🛒</span>
        <Badge tipo={carrito.recuperado ? 'success' : carrito.recordatorio_enviado ? 'warning' : 'danger'}>
          {carrito.recuperado ? '🎉 Recuperado' : carrito.recordatorio_enviado ? '📩 Recordatorio enviado' : '😢 Abandonado'}
        </Badge>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{carrito.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {carrito.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">🛒 {carrito.items}</div>
        <div className="flex items-center gap-2 text-sm mt-1 font-bold">💰 {formatearPrecio(carrito.total)}</div>
        <div className="flex items-center gap-2 text-sm mt-1">📅 {new Date(carrito.fecha).toLocaleDateString('es-CL')}</div>
      </div>
    </div>
  );
}

// ============================================
// 📊 COMPONENTE REPORTES
// ============================================
function ReportesPanel() {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [analisisIA, setAnalisisIA] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [vistaDetalle, setVistaDetalle] = useState('resumen');

  useEffect(() => { cargarReportes(); }, [periodo]);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/api/reportes?periodo=${periodo}`);
      const data = await res.json();
      if (data.success) setDatos(data);
    } catch (err) { console.error('Error:', err); }
    finally { setCargando(false); }
  };

  const cargarAnalisisIA = async () => {
    setCargandoIA(true);
    try {
      const res = await fetch(`${API_BASE}/api/analisis-ia?periodo=${periodo}`);
      const data = await res.json();
      if (data.success && data.analisis) setAnalisisIA(data.analisis);
    } catch (err) { console.error('Error:', err); }
    finally { setCargandoIA(false); }
  };

  if (cargando) return <Loader texto="Cargando reportes..." />;
  if (!datos?.resumen) return <EmptyState emoji="📊" titulo="No hay datos disponibles" />;

  const { resumen, por_estado, top_productos, metodos_pago, funciones } = datos;

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

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">💰 Total Ventas</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(resumen.ventas)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">📦 Pedidos</p>
          <p className="text-2xl font-bold mt-1">{resumen.pedidos || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">🧾 Ticket Promedio</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(resumen.ticket_promedio)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">👥 Clientes</p>
          <p className="text-2xl font-bold mt-1">{resumen.clientes_unicos || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-3 text-white text-center">
          <p className="text-white/80 text-xs">📋 Prospectos</p>
          <p className="text-xl font-bold">{resumen.prospectos || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-3 text-white text-center">
          <p className="text-white/80 text-xs">👻 Reservas</p>
          <p className="text-xl font-bold">{resumen.carritos_fantasma || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-3 text-white text-center">
          <p className="text-white/80 text-xs">🛒 Abandonados</p>
          <p className="text-xl font-bold">{resumen.carritos_abandonados || 0}</p>
        </div>
      </div>

      <div className="flex bg-white/10 rounded-xl p-1">
        {[{ key: 'resumen', label: '📊 Estado' }, { key: 'productos', label: '🍔 Top' }, { key: 'pagos', label: '💳 Pagos' }].map((v) => (
          <button key={v.key} onClick={() => setVistaDetalle(v.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${vistaDetalle === v.key ? 'bg-white text-orange-600' : 'text-white/70 hover:text-white'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {vistaDetalle === 'resumen' && por_estado && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">📊 Estado de Pedidos</h3>
          <div className="space-y-3">
            {[{ label: '✅ Entregados', value: por_estado.entregado, color: 'bg-green-500' },
              { label: '⏰ Listos', value: por_estado.listo, color: 'bg-blue-500' },
              { label: '👨‍🍳 Preparando', value: por_estado.preparando, color: 'bg-yellow-500' }].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/80 text-sm">{item.label}</span>
                  <span className="text-white font-bold">{item.value || 0}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min(100, ((item.value || 0) / Math.max(resumen.pedidos, 1)) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vistaDetalle === 'productos' && top_productos && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Top Productos</h3>
          <div className="space-y-3">
            {top_productos.length === 0 ? <p className="text-white/60 text-center">Sin datos</p> : top_productos.map((prod, i) => {
              const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              const maxCant = top_productos[0]?.cantidad || 1;
              return (
                <div key={prod.nombre} className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{medallas[i] || '🏅'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-white text-sm">
                        <span className="font-semibold">{prod.nombre}</span>
                        <span className="font-bold">{prod.cantidad} un.</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-orange-400' : 'bg-white/50'}`}
                      style={{ width: `${(prod.cantidad / maxCant) * 100}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {vistaDetalle === 'pagos' && metodos_pago && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">💳 Métodos de Pago</h3>
          <div className="space-y-3">
            {[{ label: '💵 Efectivo', value: metodos_pago.efectivo, color: 'bg-green-500' },
              { label: '💳 Flow', value: metodos_pago.flow, color: 'bg-blue-500' },
              { label: '💳 Webpay', value: metodos_pago.webpay, color: 'bg-purple-500' }].map((item) => {
              const total = (metodos_pago.efectivo || 0) + (metodos_pago.flow || 0) + (metodos_pago.webpay || 0);
              const porcentaje = total > 0 ? ((item.value || 0) / total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/80 text-sm">{item.label}</span>
                    <span className="text-white font-bold">{item.value || 0} ({porcentaje.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${porcentaje}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {funciones?.analisis_ventas && (
        <button onClick={cargarAnalisisIA} disabled={cargandoIA}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50">
          {cargandoIA ? '🤖 Analizando...' : '🤖 Generar Análisis IA'}
        </button>
      )}

      {analisisIA && (
        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2"><span className="text-2xl">🤖</span><span className="text-white font-bold">Análisis IA</span></div>
          {analisisIA.resumen && <p className="text-white/80 text-sm">{analisisIA.resumen}</p>}
          {analisisIA.insights?.map((insight, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 flex items-start gap-3">
              <span className="text-xl">{insight.emoji}</span>
              <div>
                <p className="text-white font-medium text-sm">{insight.titulo}</p>
                <p className="text-white/70 text-xs">{insight.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 🔒 COMPONENTE BLOQUEOS
// ============================================
function BloqueosPanel() {
  const [bloqueados, setBloqueados] = useState({ permanentes: [], temporales: [] });
  const [cargando, setCargando] = useState(true);
  const [nuevoNumero, setNuevoNumero] = useState('');
  const [agregando, setAgregando] = useState(false);

  useEffect(() => { cargarBloqueados(); }, []);

  const cargarBloqueados = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/api/bloqueados`);
      const data = await res.json();
      if (data.success) setBloqueados(data);
    } catch (err) { console.error('Error:', err); }
    finally { setCargando(false); }
  };

  const agregarBloqueado = async () => {
    if (!nuevoNumero.trim()) return;
    setAgregando(true);
    try {
      const res = await fetch(`${API_BASE}/api/bloqueados/agregar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: nuevoNumero })
      });
      const data = await res.json();
      if (data.success) { setNuevoNumero(''); cargarBloqueados(); alert('✅ Número bloqueado'); }
      else alert('Error: ' + data.error);
    } catch (err) { alert('Error de conexión'); }
    finally { setAgregando(false); }
  };

  const quitarBloqueado = async (telefono) => {
    if (!confirm(`¿Desbloquear ${telefono}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/bloqueados/quitar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono })
      });
      const data = await res.json();
      if (data.success) { cargarBloqueados(); alert('✅ Desbloqueado'); }
    } catch (err) { alert('Error de conexión'); }
  };

  if (cargando) return <Loader texto="Cargando bloqueados..." />;

  return (
    <div className="space-y-4">
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">🚫 Bloquear número</h3>
        <div className="flex gap-2">
          <input type="text" value={nuevoNumero} onChange={(e) => setNuevoNumero(e.target.value)} placeholder="+56912345678"
            className="flex-1 px-4 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 outline-none" />
          <button onClick={agregarBloqueado} disabled={agregando || !nuevoNumero.trim()}
            className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50">
            {agregando ? '⏳' : '🚫'}
          </button>
        </div>
      </div>
      <div className="bg-white/10 rounded-2xl p-4">
        <h3 className="text-white font-bold mb-3">🔒 Bloqueados permanentes ({bloqueados.permanentes?.length || 0})</h3>
        {bloqueados.permanentes?.length === 0 ? <p className="text-white/60 text-sm text-center">No hay números bloqueados</p> : (
          <div className="space-y-2">
            {bloqueados.permanentes?.map((tel) => (
              <div key={tel} className="flex justify-between items-center bg-white/10 rounded-xl px-3 py-2">
                <span className="text-white text-sm">📞 {tel}</span>
                <button onClick={() => quitarBloqueado(tel)} className="text-green-400 text-sm font-bold hover:text-green-300">Desbloquear</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {bloqueados.temporales?.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">⏱️ Bloqueados temporales ({bloqueados.temporales.length})</h3>
          <div className="space-y-2">
            {bloqueados.temporales.map((item) => (
              <div key={item.telefono} className="bg-white/10 rounded-xl px-3 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">📞 {item.telefono}</span>
                  <span className="text-yellow-400 text-xs">{item.razon}</span>
                </div>
                <p className="text-white/50 text-xs">Hasta: {new Date(item.hasta).toLocaleString('es-CL')}</p>
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
export default function CarritoDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [fantasmas, setFantasmas] = useState([]);
  const [abandonados, setAbandonados] = useState([]);
  const [statsRapidas, setStatsRapidas] = useState({});
  const [config, setConfig] = useState(null);
  const [filtro, setFiltro] = useState('activos');
  const [vista, setVista] = useState('pedidos');
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(null);
  const [loadingProspecto, setLoadingProspecto] = useState(null);
  const [loadingFantasma, setLoadingFantasma] = useState(null);
  const [notificandoTodos, setNotificandoTodos] = useState(null);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
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
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    } catch (e) { console.error('Error sonido:', e); }
  }, []);

  const enableSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      setSoundEnabled(true); playSound();
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    } catch (e) { console.error('Error sonido:', e); }
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
    try { const res = await fetch(`${API_BASE}/api/config`); const data = await res.json(); if (data.success) setConfig(data); } catch (e) { console.error('Error:', e); }
  }, []);

  const cargarStatsRapidas = useCallback(async () => {
    try { const res = await fetch(`${API_BASE}/api/stats/rapidas`); const data = await res.json(); if (data.success) setStatsRapidas(data); } catch (e) { console.error('Error:', e); }
  }, []);

  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos?estado=todos&limite=50`);
      const data = await res.json();
      if (data.success && data.pedidos) {
        const prevIds = new Set(previousPedidosRef.current.map(p => p.numero));
        const nuevos = data.pedidos.filter(p => !prevIds.has(p.numero) && p.estado === 'Preparando');
        if (nuevos.length > 0 && previousPedidosRef.current.length > 0 && soundEnabled) {
          playSound(); setShowAlert(true); setTimeout(() => setShowAlert(false), 5000);
          if ('Notification' in window && Notification.permission === 'granted')
            new Notification('🔔 Nuevo Pedido!', { body: `Pedido #${nuevos[0].numero} - ${nuevos[0].nombre}` });
        }
        previousPedidosRef.current = data.pedidos;
        setPedidos(data.pedidos);
      }
    } catch (e) { console.error('Error:', e); } finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);

  const cargarProspectos = useCallback(async () => {
    try { const res = await fetch(`${API_BASE}/api/prospectos`); const data = await res.json(); if (data.success) setProspectos(data.prospectos); } catch (e) { console.error('Error:', e); }
  }, []);

  const cargarFantasmas = useCallback(async () => {
    try { const res = await fetch(`${API_BASE}/api/fantasmas`); const data = await res.json(); if (data.success) setFantasmas(data.fantasmas); } catch (e) { console.error('Error:', e); }
  }, []);

  const cargarAbandonados = useCallback(async () => {
    try { const res = await fetch(`${API_BASE}/api/abandonados`); const data = await res.json(); if (data.success) setAbandonados(data.abandonados); } catch (e) { console.error('Error:', e); }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHora = () => setHora(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateHora(); const interval = setInterval(updateHora, 1000); return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    cargarConfig(); cargarStatsRapidas(); cargarPedidos(); cargarProspectos(); cargarFantasmas(); cargarAbandonados();
    const interval = setInterval(() => { cargarStatsRapidas(); cargarPedidos(); cargarProspectos(); cargarFantasmas(); setCountdown(10); }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarConfig, cargarStatsRapidas, cargarPedidos, cargarProspectos, cargarFantasmas, cargarAbandonados]);

  useEffect(() => { if (!user) return; const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000); return () => clearInterval(interval); }, [user]);

  const notificarListo = async (numero) => {
    setLoadingPedido(numero);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/notificar-listo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero }) });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); await cargarStatsRapidas(); alert(`✅ ${data.mensaje}`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); } finally { setLoadingPedido(null); }
  };

  const marcarEntregado = async (numero) => {
    setLoadingPedido(numero);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/marcar-entregado`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero }) });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); await cargarStatsRapidas(); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); } finally { setLoadingPedido(null); }
  };

  const notificarProspecto = async (id) => {
    setLoadingProspecto(id);
    try {
      const res = await fetch(`${API_BASE}/api/prospectos/${id}/notificar`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) { await cargarProspectos(); alert(`✅ ${data.mensaje}`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); } finally { setLoadingProspecto(null); }
  };

  const notificarFantasma = async (id) => {
    setLoadingFantasma(id);
    try {
      const res = await fetch(`${API_BASE}/api/fantasmas/${id}/notificar`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) { await cargarFantasmas(); alert(`✅ ${data.mensaje}`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { alert('Error de conexión'); } finally { setLoadingFantasma(null); }
  };

  const notificarTodosProspectos = async () => {
    if (!confirm('¿Notificar a todos los prospectos pendientes?')) return;
    setNotificandoTodos('prospectos');
    try {
      const res = await fetch(`${API_BASE}/api/prospectos/notificar-todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} prospectos notificados` : 'Error al notificar');
      await cargarProspectos();
    } catch (e) { alert('Error de conexión'); } finally { setNotificandoTodos(null); }
  };

  const notificarTodosFantasmas = async () => {
    if (!confirm('¿Notificar a todos los clientes con reservas?')) return;
    setNotificandoTodos('fantasmas');
    try {
      const res = await fetch(`${API_BASE}/api/fantasmas/notificar-todos`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} clientes notificados` : 'Error al notificar');
      await cargarFantasmas();
    } catch (e) { alert('Error de conexión'); } finally { setNotificandoTodos(null); }
  };

  const rescatarAbandonados = async () => {
    if (!confirm('¿Enviar recordatorios a carritos abandonados?')) return;
    setNotificandoTodos('abandonados');
    try {
      const res = await fetch(`${API_BASE}/api/abandonados/rescatar`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      alert(data.success ? `✅ ${data.rescatados} carritos rescatados` : 'Error al rescatar');
      await cargarAbandonados();
    } catch (e) { alert('Error de conexión'); } finally { setNotificandoTodos(null); }
  };

  const cerrarSesion = () => { if (typeof window !== 'undefined') { localStorage.removeItem('dashboard_user'); router.push('/login'); } };
  const refreshAll = () => { cargarStatsRapidas(); cargarPedidos(); cargarProspectos(); cargarFantasmas(); cargarAbandonados(); setCountdown(10); };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : filtro === 'activos' ? pedidos.filter(p => p.estado !== 'Entregado' && p.estado !== 'Cancelado') : pedidos.filter(p => p.estado === filtro);
  const prospectosPendientes = prospectos.filter(p => !p.notificado);
  const fantasmasPendientes = fantasmas.filter(f => !f.notificado && !f.convertido);
  const abandonadosPendientes = abandonados.filter(a => !a.recordatorio_enviado && !a.recuperado);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-500 to-pink-600">
      {showAlert && <div className="fixed top-0 left-0 right-0 bg-white text-orange-600 py-3 text-center font-bold z-50 animate-pulse">🔔 ¡NUEVO PEDIDO! 🔔</div>}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{config?.negocio?.emoji_principal || '🥪'} {config?.negocio?.nombre || 'Dashboard'}</h1>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span className={`w-2 h-2 rounded-full ${statsRapidas.abierto ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{statsRapidas.abierto ? 'Abierto' : 'Cerrado'}</span>
              <span>•</span>
              <span className="cursor-pointer hover:text-white/80" onClick={cerrarSesion}>Cerrar sesión</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
              className={`px-4 py-2 rounded-full font-bold text-sm ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>
              {soundEnabled ? '🔊 ON' : '🔇 Sonido'}
            </button>
            <div className="text-right text-white">
              <div className="text-2xl font-mono font-bold">{hora}</div>
              <div className="text-xs text-white/60">🔄 {countdown}s</div>
            </div>
          </div>
        </div>

        {config?.plan && (
          <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
            config.plan === 'ENTERPRISE' ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/50' :
            config.plan === 'PRO+' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50' :
            config.plan === 'PRO' ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50' :
            'bg-gradient-to-r from-gray-500/30 to-slate-500/30 border border-gray-400/50'}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.plan === 'ENTERPRISE' ? '👑' : config.plan === 'PRO+' ? '⭐' : config.plan === 'PRO' ? '🚀' : '📦'}</span>
              <div>
                <p className="text-white font-bold text-sm">Plan {config.plan}</p>
                <p className="text-white/60 text-xs">{config.plan === 'ENTERPRISE' ? 'Todas las funciones' : config.plan === 'PRO+' ? 'Incluye Messenger' : config.plan === 'PRO' ? 'Prospectos + Reservas' : 'Funciones básicas'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-yellow-500/30 rounded-xl p-2 text-center"><div className="text-xl font-bold text-white">{statsRapidas.preparando || 0}</div><div className="text-xs text-white/70">👨‍🍳 Preparando</div></div>
          <div className="bg-green-500/30 rounded-xl p-2 text-center"><div className="text-xl font-bold text-white">{statsRapidas.listos || 0}</div><div className="text-xs text-white/70">✅ Listos</div></div>
          <div className="bg-blue-500/30 rounded-xl p-2 text-center"><div className="text-xl font-bold text-white">{formatearPrecio(statsRapidas.ventas_hoy)}</div><div className="text-xs text-white/70">💰 Hoy</div></div>
          <div className="bg-purple-500/30 rounded-xl p-2 text-center"><div className="text-xl font-bold text-white">{(statsRapidas.prospectos_pendientes || 0) + (statsRapidas.fantasmas_pendientes || 0)}</div><div className="text-xs text-white/70">📋 Pendientes</div></div>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {[{ key: 'pedidos', label: '🥪', count: pedidosFiltrados.filter(p => p.estado !== 'Entregado').length },
            { key: 'fantasmas', label: '👻', count: fantasmasPendientes.length },
            { key: 'prospectos', label: '📋', count: prospectosPendientes.length },
            { key: 'abandonados', label: '🛒', count: abandonadosPendientes.length },
            { key: 'reportes', label: '📊', count: null },
            { key: 'bloqueos', label: '🔒', count: null }].map((v) => (
            <button key={v.key} onClick={() => setVista(v.key)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm relative min-w-[60px] ${vista === v.key ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
              {v.label}
              {v.count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{v.count}</span>}
            </button>
          ))}
        </div>

        {vista === 'pedidos' && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['activos', 'Preparando', 'Listo', 'Entregado', 'todos'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all text-sm ${filtro === f ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
                  {f === 'activos' ? '🔥 Activos' : f === 'todos' ? '📊 Todos' : f}
                </button>
              ))}
            </div>
            {isLoading ? <Loader texto="Cargando pedidos..." /> : pedidosFiltrados.length === 0 ? <EmptyState emoji="📭" titulo="No hay pedidos" subtitulo="Los nuevos pedidos aparecerán aquí" /> : (
              <div className="grid gap-4">{pedidosFiltrados.map(pedido => <PedidoCard key={pedido.numero || pedido.id} pedido={pedido} onNotificarListo={notificarListo} onMarcarEntregado={marcarEntregado} isLoading={loadingPedido === pedido.numero} />)}</div>
            )}
          </>
        )}

        {vista === 'fantasmas' && (
          <>
            {fantasmasPendientes.length > 0 && <button onClick={notificarTodosFantasmas} disabled={notificandoTodos === 'fantasmas'} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50">{notificandoTodos === 'fantasmas' ? '⏳ Enviando...' : `🔔 ¡YA ABRIMOS! Notificar ${fantasmasPendientes.length} reservas`}</button>}
            <div className="bg-white/10 rounded-2xl p-4 mb-6"><div className="flex items-start gap-3"><span className="text-2xl">👻</span><div><p className="text-white font-medium">¿Qué son los Carritos Fantasma?</p><p className="text-white/70 text-sm mt-1">Pedidos que los clientes hicieron cuando estabas cerrado. ¡Notifícalos cuando abras!</p></div></div></div>
            {fantasmas.length === 0 ? <EmptyState emoji="👻" titulo="No hay reservas pendientes" subtitulo="Los pedidos fuera de horario aparecerán aquí" /> : <div className="grid gap-4">{fantasmas.map(carrito => <CarritoFantasmaCard key={carrito.id} carrito={carrito} onNotificar={notificarFantasma} isLoading={loadingFantasma === carrito.id} />)}</div>}
          </>
        )}

        {vista === 'prospectos' && (
          <>
            {prospectosPendientes.length > 0 && <button onClick={notificarTodosProspectos} disabled={notificandoTodos === 'prospectos'} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50">{notificandoTodos === 'prospectos' ? '⏳ Enviando...' : `🎉 ¡ABRIMOS! Notificar a ${prospectosPendientes.length} clientes`}</button>}
            {prospectos.length === 0 ? <EmptyState emoji="📋" titulo="No hay prospectos" subtitulo="Los clientes que escriban cuando esté cerrado aparecerán aquí" /> : <div className="grid gap-4">{prospectos.map(prospecto => <ProspectoCard key={prospecto.id} prospecto={prospecto} onNotificar={notificarProspecto} isLoading={loadingProspecto === prospecto.id} />)}</div>}
          </>
        )}

        {vista === 'abandonados' && (
          <>
            {abandonadosPendientes.length > 0 && <button onClick={rescatarAbandonados} disabled={notificandoTodos === 'abandonados'} className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50">{notificandoTodos === 'abandonados' ? '⏳ Enviando...' : `🛟 Rescatar ${abandonadosPendientes.length} carritos abandonados`}</button>}
            <div className="bg-white/10 rounded-2xl p-4 mb-6"><div className="flex items-start gap-3"><span className="text-2xl">🛒</span><div><p className="text-white font-medium">Carritos Abandonados</p><p className="text-white/70 text-sm mt-1">Clientes que armaron su pedido pero no lo completaron. ¡Envíales un recordatorio!</p></div></div></div>
            {abandonados.length === 0 ? <EmptyState emoji="🛒" titulo="No hay carritos abandonados" subtitulo="Los carritos sin completar aparecerán aquí" /> : <div className="grid gap-4">{abandonados.map(carrito => <CarritoAbandonadoCard key={carrito.id} carrito={carrito} />)}</div>}
          </>
        )}

        {vista === 'reportes' && <ReportesPanel />}
        {vista === 'bloqueos' && <BloqueosPanel />}

        <button onClick={refreshAll} className="fixed bottom-6 right-6 bg-white text-orange-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">🔄</button>
        {!soundEnabled && mounted && <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">⚠️ Activa el sonido</div>}
      </div>
    </div>
  );
}
