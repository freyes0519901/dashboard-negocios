'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';

// ============================================================================
// 🔐 DASHBOARD ADMIN SaaS - CON MÉTRICAS AVANZADAS + GESTIÓN DE PLANES
// ============================================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://freyes0519901.pythonanywhere.com';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || '';

// Planes disponibles - RESERVAS (Barberías, Dentistas, etc.)
const PLANES_RESERVAS = [
  { id: 'basico', nombre: 'Básico', precio: 29990, limite: 500 },
  { id: 'pro', nombre: 'Pro', precio: 49990, limite: 2000 },
  { id: 'pro_plus', nombre: 'Pro+', precio: 79990, limite: 7000 },
  { id: 'enterprise', nombre: 'Enterprise', precio: 149990, limite: -1 }, // -1 = ilimitado
];

// Planes disponibles - PEDIDOS (Restaurantes, Food Trucks, etc.)
const PLANES_PEDIDOS = [
  { id: 'basico', nombre: 'Básico', precio: 39990, limite: 500 },
  { id: 'pro', nombre: 'Pro', precio: 59990, limite: 2000 },
  { id: 'pro_plus', nombre: 'Pro+', precio: 89990, limite: 7000 },
  { id: 'enterprise', nombre: 'Enterprise', precio: 179990, limite: -1 },
];

// Función para obtener planes según tipo de negocio
const obtenerPlanes = (tipoNegocio) => {
  const tiposReservas = ['barberia', 'peluqueria', 'dentista', 'veterinaria', 'spa', 'kinesiologo', 'trainer'];
  if (tiposReservas.some(t => tipoNegocio?.toLowerCase().includes(t))) {
    return PLANES_RESERVAS;
  }
  return PLANES_PEDIDOS;
};

// Componente de KPI Card
function KPICard({ titulo, valor, subtitulo, icono, color = 'blue', tendencia }) {
  const colores = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
    pink: 'from-pink-500 to-pink-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colores[color]} flex items-center justify-center text-white text-xl`}>
          {icono}
        </div>
        {tendencia !== undefined && tendencia !== null && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${tendencia > 0 ? 'bg-green-100 text-green-600' : tendencia < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            {tendencia > 0 ? '↑' : tendencia < 0 ? '↓' : '→'} {Math.abs(tendencia)}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{titulo}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{valor}</p>
      {subtitulo && <p className="text-gray-400 text-xs mt-1">{subtitulo}</p>}
    </div>
  );
}

// Componente de Alerta
function AlertaCard({ alerta }) {
  const severidadConfig = {
    critica: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🚨' },
    alta: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '⚠️' },
    media: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: '📢' },
    baja: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'ℹ️' }
  };

  const config = severidadConfig[alerta.severidad] || severidadConfig.media;

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <p className={`font-medium ${config.text}`}>{alerta.mensaje}</p>
          <p className="text-gray-500 text-sm mt-1">
            {alerta.negocio} • Plan {alerta.plan}
          </p>
        </div>
      </div>
    </div>
  );
}

// 🆕 COMPONENTE DE CLIENTE CON EDICIÓN DE PLAN
function ClienteRow({ cliente, onCambiarPlan }) {
  const [editando, setEditando] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(cliente.plan?.toLowerCase().replace('+', '_plus') || 'basico');
  const [guardando, setGuardando] = useState(false);

  // Determinar qué planes mostrar según el tipo de negocio
  const planesDisponibles = obtenerPlanes(cliente.negocio);

  const estadoConfig = {
    activo: { bg: 'bg-green-100', text: 'text-green-700' },
    pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    vencido: { bg: 'bg-red-100', text: 'text-red-700' },
    inactivo: { bg: 'bg-gray-100', text: 'text-gray-700' }
  };

  const config = estadoConfig[cliente.estado] || estadoConfig.activo;
  const porcentaje = cliente.porcentaje_uso || 0;
  const barraColor = porcentaje > 80 ? 'bg-red-500' : porcentaje > 50 ? 'bg-yellow-500' : 'bg-green-500';

  const handleGuardar = async () => {
    const planActualNorm = cliente.plan?.toLowerCase().replace('+', '_plus');
    if (planSeleccionado === planActualNorm) {
      setEditando(false);
      return;
    }
    
    setGuardando(true);
    try {
      await onCambiarPlan(cliente.negocio, planSeleccionado);
      setEditando(false);
    } catch (err) {
      alert('Error al cambiar plan: ' + err.message);
    }
    setGuardando(false);
  };

  const handleCancelar = () => {
    setPlanSeleccionado(cliente.plan?.toLowerCase().replace('+', '_plus') || 'basico');
    setEditando(false);
  };

  const formatPrecio = (precio) => {
    return `$${precio.toLocaleString('es-CL')}`;
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="font-medium text-gray-800">{cliente.negocio}</div>
        <div className="text-xs text-gray-400">Inicio: {cliente.fecha_inicio?.slice(0, 10)}</div>
      </td>
      <td className="py-4 px-4">
        {editando ? (
          <div className="flex items-center gap-2">
            <select
              value={planSeleccionado}
              onChange={(e) => setPlanSeleccionado(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={guardando}
            >
              {planesDisponibles.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - {formatPrecio(plan.precio)}/mes
                </option>
              ))}
            </select>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="Guardar"
            >
              {guardando ? '⏳' : '✅'}
            </button>
            <button
              onClick={handleCancelar}
              disabled={guardando}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="Cancelar"
            >
              ❌
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {cliente.plan}
            </span>
            <button
              onClick={() => setEditando(true)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Cambiar plan"
            >
              ✏️
            </button>
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
            <div className={`h-2 rounded-full ${barraColor}`} style={{ width: `${Math.min(porcentaje, 100)}%` }} />
          </div>
          <span className="text-sm text-gray-600">
            {cliente.es_ilimitado ? '♾️' : `${cliente.mensajes_mes?.toLocaleString()}/${cliente.limite?.toLocaleString()}`}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-600">${cliente.costo_estimado_usd?.toFixed(2)} USD</td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {cliente.estado}
        </span>
      </td>
    </tr>
  );
}

// Componente de Costos
function CostosChart({ costos }) {
  if (!costos?.costos_por_cliente?.length) {
    return <p className="text-gray-400 text-center py-8">Sin datos de costos</p>;
  }
  const maxCosto = Math.max(...costos.costos_por_cliente.map(c => c.costo_total_usd || 0));
  return (
    <div className="space-y-4">
      {costos.costos_por_cliente.map((cliente, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-600 truncate">{cliente.negocio}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${(cliente.costo_total_usd / maxCosto) * 100}%` }} />
          </div>
          <div className="w-20 text-right text-sm font-medium text-gray-700">${cliente.costo_total_usd?.toFixed(3)}</div>
        </div>
      ))}
    </div>
  );
}

// Componente de Estado del Sistema
function EstadoSistema({ sistema }) {
  if (!sistema) return null;
  const servicios = sistema.estado?.servicios || {};
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(servicios).map(([nombre, info]) => (
        <div key={nombre} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className={`w-3 h-3 rounded-full ${info.conectado ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="font-medium text-gray-800 capitalize">{nombre}</p>
            <p className="text-xs text-gray-400">{info.modelo || (info.conectado ? 'Conectado' : 'Desconectado')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de Top Productos
function TopProductos({ productos }) {
  if (!productos?.productos?.length) {
    return <p className="text-gray-400 text-center py-4">Sin datos de productos</p>;
  }
  
  const colores = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-400', 'bg-blue-400', 'bg-purple-400'];
  const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  
  return (
    <div className="space-y-3">
      {productos.productos.map((prod, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span className="text-xl">{medallas[idx]}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 truncate">{prod.nombre}</span>
              <span className="text-sm text-gray-500">{prod.cantidad} vendidos</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${colores[idx]}`} style={{ width: `${prod.porcentaje}%` }} />
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-100 text-center">
        <span className="text-sm text-gray-500">Total: {productos.total_vendidos} productos vendidos</span>
      </div>
    </div>
  );
}

// Componente de Horarios Pico
function HorariosPico({ horarios }) {
  if (!horarios?.por_hora) {
    return <p className="text-gray-400 text-center py-4">Sin datos de horarios</p>;
  }
  
  const horas = Object.entries(horarios.por_hora);
  const maxMensajes = Math.max(...horas.map(([, v]) => v));
  
  const horasVisibles = horas.filter(([h]) => parseInt(h) >= 8 && parseInt(h) <= 23);
  
  return (
    <div>
      <div className="flex items-end gap-1 h-32 mb-4">
        {horasVisibles.map(([hora, cantidad]) => {
          const altura = maxMensajes > 0 ? (cantidad / maxMensajes) * 100 : 0;
          const esPico = horarios.horas_pico?.some(p => p.hora === `${hora}:00`);
          return (
            <div key={hora} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t transition-all ${esPico ? 'bg-orange-500' : 'bg-blue-400'}`}
                style={{ height: `${altura}%`, minHeight: cantidad > 0 ? '4px' : '0' }}
                title={`${hora}:00 - ${cantidad} mensajes`}
              />
              <span className="text-xs text-gray-400 mt-1">{hora}</span>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-xs text-orange-600">Hora Pico</p>
          <p className="text-lg font-bold text-orange-700">{horarios.hora_pico_principal || 'N/A'}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-600">Día más activo</p>
          <p className="text-lg font-bold text-blue-700">{horarios.dia_pico || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

// Componente de Fantasmas (Carritos Abandonados)
function FantasmasStats({ fantasmas }) {
  if (!fantasmas) return null;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-red-50 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-red-600">{fantasmas.total_activos || 0}</p>
        <p className="text-xs text-red-500">Carritos abandonados</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-yellow-600">{fantasmas.valor_perdido_formato || '$0'}</p>
        <p className="text-xs text-yellow-500">Valor potencial perdido</p>
      </div>
      <div className="bg-green-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-green-600">{fantasmas.recuperados || 0}</p>
        <p className="text-xs text-green-500">Recuperados</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-blue-600">{fantasmas.tasa_recuperacion || 0}%</p>
        <p className="text-xs text-blue-500">Tasa recuperación</p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de datos
  const [dashboard, setDashboard] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [costos, setCostos] = useState(null);
  const [ingresos, setIngresos] = useState(null);
  const [sistema, setSistema] = useState(null);
  
  // Estado para métricas avanzadas
  const [metricasAvanzadas, setMetricasAvanzadas] = useState(null);

  const fetchAdmin = useCallback(async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: {
          'X-Admin-Key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        ...options
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      throw err;
    }
  }, []);

  // 🆕 Función para cambiar plan de cliente
  const cambiarPlanCliente = useCallback(async (negocio, nuevoPlan) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/cliente/plan`, {
        method: 'POST',
        headers: {
          'X-Admin-Key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ negocio, plan: nuevoPlan })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error ${res.status}`);
      }
      
      const data = await res.json();
      
      // Actualizar lista de clientes localmente
      setClientes(prev => prev.map(c => 
        c.negocio === negocio 
          ? { ...c, plan: nuevoPlan.charAt(0).toUpperCase() + nuevoPlan.slice(1) }
          : c
      ));
      
      return data;
    } catch (err) {
      console.error('Error cambiando plan:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [dashData, clientesData, alertasData, costosData, sistemaData] = await Promise.allSettled([
          fetchAdmin('/api/admin/dashboard'),
          fetchAdmin('/api/admin/clientes'),
          fetchAdmin('/api/admin/alertas'),
          fetchAdmin('/api/admin/costos'),
          fetchAdmin('/api/admin/sistema')
        ]);

        if (dashData.status === 'fulfilled') setDashboard(dashData.value);
        if (clientesData.status === 'fulfilled') setClientes(clientesData.value.clientes || []);
        if (alertasData.status === 'fulfilled') setAlertas(alertasData.value.alertas || []);
        if (costosData.status === 'fulfilled') setCostos(costosData.value);
        if (sistemaData.status === 'fulfilled') setSistema(sistemaData.value);

        // Cargar métricas avanzadas
        try {
          const [ingresosData, metricasData] = await Promise.allSettled([
            fetchAdmin('/api/admin/ingresos'),
            fetchAdmin('/api/admin/metricas-avanzadas')
          ]);
          
          if (ingresosData.status === 'fulfilled') setIngresos(ingresosData.value);
          if (metricasData.status === 'fulfilled') setMetricasAvanzadas(metricasData.value);
        } catch (e) {
          console.log('Métricas avanzadas no disponibles');
        }

      } catch (err) {
        setError('Error cargando datos');
        console.error(err);
      }
      
      setLoading(false);
    };
    
    cargarDatos();
    const interval = setInterval(cargarDatos, 60000);
    return () => clearInterval(interval);
  }, [status, fetchAdmin]);

  // Extraer métricas
  const kpis = dashboard?.kpis || {};
  const conversion = metricasAvanzadas?.conversion || {};
  const fantasmas = metricasAvanzadas?.fantasmas || {};
  const topProductos = metricasAvanzadas?.top_productos || {};
  const horariosPico = metricasAvanzadas?.horarios_pico || {};
  const tiempoRespuesta = metricasAvanzadas?.tiempo_respuesta || {};

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Acceso restringido</p>
          </div>
          <button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Iniciar Sesión con Google
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analiticas', label: 'Analíticas', icon: '📈' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'costos', label: 'Costos', icon: '💰' },
    { id: 'alertas', label: 'Alertas', icon: '⚠️', badge: alertas.length },
    { id: 'ingresos', label: 'Ingresos', icon: '💵' },
    { id: 'sistema', label: 'Sistema', icon: '🔧' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎛️</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Panel de Control SaaS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2
                  ${activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard titulo="Mensajes Hoy" valor={kpis.mensajes_hoy?.toLocaleString() || 0} icono="💬" color="blue" />
                  <KPICard titulo="Clientes Activos" valor={kpis.clientes_activos || 0} icono="👥" color="green" />
                  <KPICard titulo="Pedidos Hoy" valor={kpis.pedidos_hoy || 0} icono="🛒" color="purple" />
                  <KPICard titulo="Ingresos Hoy" valor={`$${(kpis.ingresos_hoy || 0).toLocaleString()}`} icono="💰" color="orange" />
                </div>

                {/* Métricas adicionales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard titulo="Tasa Conversión" valor={conversion.tasa_formato || '0%'} icono="🎯" color="cyan" />
                  <KPICard titulo="Carritos Abandonados" valor={fantasmas.total_activos || 0} icono="👻" color="red" />
                  <KPICard titulo="Tiempo Respuesta" valor={tiempoRespuesta.promedio_formato || '0s'} icono="⚡" color="yellow" />
                  <KPICard titulo="MRR" valor={ingresos?.mrr?.formato || '$0'} icono="📈" color="pink" />
                </div>

                {/* Alertas y Sistema */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Alertas Recientes</h3>
                    {alertas.length > 0 ? alertas.slice(0, 3).map((a, i) => <AlertaCard key={i} alerta={a} />) : <p className="text-center py-8 text-4xl">✅</p>}
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Estado del Sistema</h3>
                    <EstadoSistema sistema={sistema} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALÍTICAS */}
            {activeTab === 'analiticas' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tasa de Conversión Detallada */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Embudo de Conversión</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-full bg-blue-100 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Conversaciones iniciadas</span>
                            <span className="text-2xl font-bold text-blue-700">{conversion.conversaciones || 0}</span>
                          </div>
                          <div className="bg-blue-500 h-3 rounded-full mt-2" style={{width: '100%'}} />
                        </div>
                      </div>
                      <div className="flex justify-center text-gray-400">↓</div>
                      <div className="flex items-center gap-4">
                        <div className="w-full bg-green-100 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 font-medium">Pedidos completados</span>
                            <span className="text-2xl font-bold text-green-700">{conversion.pedidos || 0}</span>
                          </div>
                          <div className="bg-green-500 h-3 rounded-full mt-2" style={{width: `${conversion.tasa || 0}%`}} />
                        </div>
                      </div>
                      <div className="text-center mt-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                        <p className="text-sm text-gray-500">Tasa de Conversión</p>
                        <p className="text-4xl font-bold text-cyan-600">{conversion.tasa_formato || '0%'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Carritos Abandonados */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">👻 Carritos Abandonados</h3>
                    <FantasmasStats fantasmas={fantasmas} />
                  </div>
                </div>

                {/* Top Productos y Horarios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Productos Más Vendidos</h3>
                    <TopProductos productos={topProductos} />
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Actividad por Horario</h3>
                    <HorariosPico horarios={horariosPico} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CLIENTES - 🆕 CON EDICIÓN DE PLAN */}
            {activeTab === 'clientes' && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-lg font-bold">👥 Clientes ({clientes.length})</h2>
                  <div className="text-sm text-gray-500">
                    💡 Haz clic en ✏️ para cambiar el plan de un cliente
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Negocio</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Uso</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Costo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((c, i) => (
                        <ClienteRow 
                          key={i} 
                          cliente={c} 
                          onCambiarPlan={cambiarPlanCliente}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: COSTOS */}
            {activeTab === 'costos' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">💰 Costos de IA</h2>
                <CostosChart costos={costos} />
              </div>
            )}

            {/* TAB: ALERTAS */}
            {activeTab === 'alertas' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">⚠️ Alertas ({alertas.length})</h2>
                {alertas.length > 0 ? alertas.map((a, i) => <AlertaCard key={i} alerta={a} />) : <p className="text-center py-8 text-6xl">✅</p>}
              </div>
            )}

            {/* TAB: INGRESOS */}
            {activeTab === 'ingresos' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <h2 className="text-lg font-bold mb-4">💵 MRR</h2>
                  <p className="text-5xl font-bold text-green-600">{ingresos?.mrr?.formato || '$0'}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-lg font-bold mb-4">📈 Por Plan</h2>
                  {ingresos?.ingresos_por_plan?.map((p, i) => (
                    <div key={i} className="flex justify-between p-2 bg-gray-50 rounded mb-2">
                      <span>{p.plan}</span><span className="font-bold">${p.total_clp?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SISTEMA */}
            {activeTab === 'sistema' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">🔧 Sistema</h2>
                <EstadoSistema sistema={sistema} />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-gray-400 text-sm">
          Dashboard Admin SaaS v2.1 • Última actualización: {dashboard?.timestamp?.slice(0, 19).replace('T', ' ')}
        </div>
      </footer>
    </div>
  );
}
