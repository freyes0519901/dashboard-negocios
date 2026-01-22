'use client';
import { useState, useEffect } from 'react';

export default function ReportesVentas() {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  // En producción, esto vendrá de tu API en PythonAnywhere
  const API_URL = 'https://freyes0519901.pythonanywhere.com/api/reportes';

  const datosDemo = {
    hoy: {
      totalVentas: 127500,
      cantidadPedidos: 18,
      ticketPromedio: 7083,
      productosMasVendidos: [
        { nombre: 'Hamburguesa Doble', cantidad: 12, total: 180000, emoji: '🍔' },
        { nombre: 'Sándwich de Pollo', cantidad: 8, total: 56000, emoji: '🥪' },
        { nombre: 'Papas Fritas', cantidad: 15, total: 45000, emoji: '🍟' },
        { nombre: 'Bebida 500ml', cantidad: 14, total: 14000, emoji: '🥤' },
        { nombre: 'Sándwich de Carne', cantidad: 5, total: 50000, emoji: '🥩' },
      ],
      ventasPorHora: [
        { label: '16:00', ventas: 15000 },
        { label: '17:00', ventas: 22000 },
        { label: '18:00', ventas: 35000 },
        { label: '19:00', ventas: 28000 },
        { label: '20:00', ventas: 18000 },
        { label: '21:00', ventas: 9500 },
      ],
      metodoPago: { flow: 65, efectivo: 35 },
      estadoPedidos: { entregados: 15, preparando: 2, listos: 1 },
      clientesNuevos: 5,
      clientesRecurrentes: 13
    },
    semana: {
      totalVentas: 892500,
      cantidadPedidos: 126,
      ticketPromedio: 7083,
      productosMasVendidos: [
        { nombre: 'Hamburguesa Doble', cantidad: 84, total: 1260000, emoji: '🍔' },
        { nombre: 'Sándwich de Pollo', cantidad: 56, total: 392000, emoji: '🥪' },
        { nombre: 'Papas Fritas', cantidad: 105, total: 315000, emoji: '🍟' },
        { nombre: 'Bebida 500ml', cantidad: 98, total: 98000, emoji: '🥤' },
        { nombre: 'Sándwich de Carne', cantidad: 35, total: 350000, emoji: '🥩' },
      ],
      ventasPorHora: [
        { label: 'Mar', ventas: 95000 },
        { label: 'Mié', ventas: 112000 },
        { label: 'Jue', ventas: 134000 },
        { label: 'Vie', ventas: 178000 },
        { label: 'Sáb', ventas: 215000 },
        { label: 'Dom', ventas: 158500 },
      ],
      metodoPago: { flow: 58, efectivo: 42 },
      estadoPedidos: { entregados: 120, preparando: 4, listos: 2 },
      clientesNuevos: 35,
      clientesRecurrentes: 91
    },
    mes: {
      totalVentas: 3850000,
      cantidadPedidos: 543,
      ticketPromedio: 7090,
      productosMasVendidos: [
        { nombre: 'Hamburguesa Doble', cantidad: 362, total: 5430000, emoji: '🍔' },
        { nombre: 'Sándwich de Pollo', cantidad: 241, total: 1687000, emoji: '🥪' },
        { nombre: 'Papas Fritas', cantidad: 452, total: 1356000, emoji: '🍟' },
        { nombre: 'Bebida 500ml', cantidad: 421, total: 421000, emoji: '🥤' },
        { nombre: 'Sándwich de Carne', cantidad: 151, total: 1510000, emoji: '🥩' },
      ],
      ventasPorHora: [
        { label: 'Sem 1', ventas: 850000 },
        { label: 'Sem 2', ventas: 920000 },
        { label: 'Sem 3', ventas: 1180000 },
        { label: 'Sem 4', ventas: 900000 },
      ],
      metodoPago: { flow: 62, efectivo: 38 },
      estadoPedidos: { entregados: 538, preparando: 3, listos: 2 },
      clientesNuevos: 142,
      clientesRecurrentes: 401
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Intentar cargar desde API real
      // const response = await fetch(`${API_URL}?periodo=${periodo}`);
      // const data = await response.json();
      // setDatos(data);
      
      // Por ahora usar datos demo
      setTimeout(() => {
        setDatos(datosDemo[periodo]);
        setCargando(false);
      }, 300);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setDatos(datosDemo[periodo]);
      setCargando(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  const maxVenta = Math.max(...datos.ventasPorHora.map(i => i.ventas));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-3xl">📊</span> Reportes de Ventas
            </h1>
            <p className="text-gray-400 mt-1">🥪 Sánguchez con Hambre</p>
          </div>
          
          {/* Selector de período */}
          <div className="flex bg-gray-800/50 backdrop-blur rounded-xl p-1 border border-gray-700">
            {[
              { key: 'hoy', label: '📅 Hoy' },
              { key: 'semana', label: '📆 Semana' },
              { key: 'mes', label: '🗓️ Mes' }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  periodo === p.key
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur border border-green-500/30 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-green-300 text-sm font-medium">Total Ventas</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-green-400">{formatearPrecio(datos.totalVentas)}</p>
          <p className="text-green-300/60 text-xs mt-2">
            {periodo === 'hoy' ? 'Hoy' : periodo === 'semana' ? 'Esta semana' : 'Este mes'}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur border border-blue-500/30 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-blue-300 text-sm font-medium">Pedidos</p>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-blue-400">{datos.cantidadPedidos}</p>
          <p className="text-blue-300/60 text-xs mt-2">Completados</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur border border-purple-500/30 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-purple-300 text-sm font-medium">Ticket Promedio</p>
            <span className="text-2xl">🧾</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-purple-400">{formatearPrecio(datos.ticketPromedio)}</p>
          <p className="text-purple-300/60 text-xs mt-2">Por pedido</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur border border-orange-500/30 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-orange-300 text-sm font-medium">Clientes Nuevos</p>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mt-2 text-orange-400">{datos.clientesNuevos}</p>
          <p className="text-orange-300/60 text-xs mt-2">+{datos.clientesRecurrentes} recurrentes</p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Productos más vendidos */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            🏆 Productos Más Vendidos
          </h2>
          <div className="space-y-4">
            {datos.productosMasVendidos.map((producto, index) => {
              const porcentaje = (producto.cantidad / datos.productosMasVendidos[0].cantidad) * 100;
              const colores = ['from-orange-500 to-orange-600', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600'];
              
              return (
                <div key={producto.nombre} className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl w-8 text-center group-hover:scale-125 transition-transform">{producto.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{producto.nombre}</span>
                        <div className="text-right">
                          <span className="text-white font-bold">{producto.cantidad}</span>
                          <span className="text-gray-400 text-sm ml-1">uds</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-11 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${colores[index]} transition-all duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de ventas */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📈 Ventas por {periodo === 'hoy' ? 'Hora' : periodo === 'semana' ? 'Día' : 'Semana'}
          </h2>
          <div className="flex items-end justify-between gap-2 h-48 px-2">
            {datos.ventasPorHora.map((item, index) => {
              const altura = (item.ventas / maxVenta) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatearPrecio(item.ventas)}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg transition-all duration-300 hover:from-orange-500 hover:to-orange-300 cursor-pointer"
                      style={{ height: `${altura}%`, minHeight: '20px' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            💳 Métodos de Pago
          </h2>
          <div className="flex items-center justify-center gap-8 py-4">
            <div className="text-center group cursor-pointer">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#374151" strokeWidth="12" fill="none" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="url(#flowGradient)" 
                    strokeWidth="12" 
                    fill="none"
                    strokeDasharray={`${datos.metodoPago.flow * 3.01} 301`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-400">{datos.metodoPago.flow}%</span>
                </div>
              </div>
              <p className="text-gray-400 mt-2 group-hover:text-blue-400 transition-colors">💳 Flow</p>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#374151" strokeWidth="12" fill="none" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    stroke="url(#efectivoGradient)" 
                    strokeWidth="12" 
                    fill="none"
                    strokeDasharray={`${datos.metodoPago.efectivo * 3.01} 301`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="efectivoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#16A34A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-400">{datos.metodoPago.efectivo}%</span>
                </div>
              </div>
              <p className="text-gray-400 mt-2 group-hover:text-green-400 transition-colors">💵 Efectivo</p>
            </div>
          </div>
        </div>

        {/* Estado de pedidos */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📦 Estado de Pedidos
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center hover:bg-green-500/20 transition-colors cursor-pointer">
              <p className="text-3xl font-bold text-green-400">{datos.estadoPedidos.entregados}</p>
              <p className="text-sm text-gray-400 mt-1">✅ Entregados</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center hover:bg-orange-500/20 transition-colors cursor-pointer">
              <p className="text-3xl font-bold text-orange-400">{datos.estadoPedidos.preparando}</p>
              <p className="text-sm text-gray-400 mt-1">👨‍🍳 Preparando</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center hover:bg-blue-500/20 transition-colors cursor-pointer">
              <p className="text-3xl font-bold text-blue-400">{datos.estadoPedidos.listos}</p>
              <p className="text-sm text-gray-400 mt-1">🔔 Listos</p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                style={{ width: `${(datos.estadoPedidos.entregados / datos.cantidadPedidos) * 100}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-500"
                style={{ width: `${(datos.estadoPedidos.preparando / datos.cantidadPedidos) * 100}%` }}
              ></div>
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-500"
                style={{ width: `${(datos.estadoPedidos.listos / datos.cantidadPedidos) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen con IA (preparado para el futuro) */}
      <div className="mt-6 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur border border-orange-500/30 rounded-2xl p-5">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          🤖 Análisis Inteligente
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">Beta</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
            <span className="text-2xl">🍔</span>
            <div>
              <p className="font-medium text-white">Producto Estrella</p>
              <p className="text-gray-400 mt-1">La Hamburguesa Doble representa el <strong className="text-orange-400">{Math.round((datos.productosMasVendidos[0].cantidad / datos.cantidadPedidos) * 100)}%</strong> de tus ventas</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-medium text-white">Hora Pico</p>
              <p className="text-gray-400 mt-1">Las <strong className="text-blue-400">{datos.ventasPorHora.reduce((a, b) => a.ventas > b.ventas ? a : b).label}</strong> es tu mejor momento de ventas</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-xl">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-white">Sugerencia</p>
              <p className="text-gray-400 mt-1">Promociona las <strong className="text-green-400">Papas</strong> como complemento, se venden bien con hamburguesas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>🚀 Próximamente: Chat con IA para analizar ventas • Predicciones • Alertas</p>
      </div>
    </div>
  );
}
