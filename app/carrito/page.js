'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// 🥪 COMPONENTE PEDIDO
// ============================================
function PedidoCard({ pedido, onCambiarEstado, onNotificarListo, isLoading }) {
  const colores = {
    'Preparando': 'from-yellow-400 to-orange-500',
    'Listo': 'from-green-400 to-emerald-500',
    'Entregado': 'from-gray-400 to-gray-500',
  };
  const iconos = { 'Preparando': '👨‍🍳', 'Listo': '✅', 'Entregado': '📦' };

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
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="text-sm">🛒 {pedido.items}</div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold">{pedido.total}</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{pedido.pago || 'Efectivo'}</span>
      </div>
      <div className="flex gap-2">
        {pedido.estado === 'Preparando' && (
          <button 
            onClick={() => onNotificarListo(pedido.fila, pedido.telefono, pedido.nombre, pedido.numero)} 
            disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '✅ LISTO - Notificar Cliente'}
          </button>
        )}
        {pedido.estado === 'Listo' && (
          <button 
            onClick={() => onCambiarEstado(pedido.fila, 'Entregado')} 
            disabled={isLoading}
            className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '📦 Marcar Entregado'}
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
// 📋 COMPONENTE PROSPECTO
// ============================================
function ProspectoCard({ prospecto, onNotificar, isLoading }) {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl">📋</span>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          prospecto.notificado === 'Sí' ? 'bg-green-500' : 'bg-white/30'
        }`}>
          {prospecto.notificado === 'Sí' ? '✅ Notificado' : '⏳ Pendiente'}
        </span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{prospecto.nombre || 'Sin nombre'}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {prospecto.telefono}</div>
        {prospecto.interesado_en && (
          <div className="flex items-center gap-2 text-sm mt-1">🛒 {prospecto.interesado_en}</div>
        )}
        <div className="flex items-center gap-2 text-sm mt-1">📅 {prospecto.fecha}</div>
      </div>
      {prospecto.notificado !== 'Sí' && (
        <button 
          onClick={() => onNotificar(prospecto.fila, prospecto.telefono, prospecto.nombre)}
          disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Avisar que abrimos'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 📊 COMPONENTE REPORTES - MEJORADO
// ============================================
function ReportesPanel() {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaDetalle, setVistaDetalle] = useState('resumen'); // 'resumen', 'productos', 'horarios'

  // Datos demo mejorados
  const datosDemo = {
    hoy: {
      totalVentas: 127500,
      cantidadPedidos: 18,
      ticketPromedio: 7083,
      productosMasVendidos: [
        { nombre: 'Hamburguesa Doble', cantidad: 12, emoji: '🍔', ingresos: 42000 },
        { nombre: 'Sándwich de Pollo', cantidad: 8, emoji: '🥪', ingresos: 28000 },
        { nombre: 'Papas Fritas', cantidad: 15, emoji: '🍟', ingresos: 22500 },
        { nombre: 'Bebida 500ml', cantidad: 14, emoji: '🥤', ingresos: 14000 },
        { nombre: 'Sándwich de Carne', cantidad: 5, emoji: '🥩', ingresos: 21000 },
      ],
      metodoPago: { flow: 65, efectivo: 35 },
      estadoPedidos: { entregados: 15, preparando: 2, listos: 1 },
      horaPico: '13:00 - 14:00',
      comparacionAyer: 8.5, // % de cambio vs ayer
      ventasPorHora: [
        { hora: '11:00', ventas: 3 },
        { hora: '12:00', ventas: 5 },
        { hora: '13:00', ventas: 7 },
        { hora: '14:00', ventas: 3 },
      ]
    },
    semana: {
      totalVentas: 892500,
      cantidadPedidos: 126,
      ticketPromedio: 7083,
      productosMasVendidos: [
        { nombre: 'Hamburguesa Doble', cantidad: 84, emoji: '🍔', ingresos: 294000 },
        { nombre: 'Sándwich de Pollo', cantidad: 56, emoji: '🥪', ingresos: 196000 },
        { nombre: 'Papas Fritas', cantidad: 105, emoji: '🍟', ingresos: 157500 },
        { nombre: 'Bebida 500ml', cantidad: 98, emoji: '🥤', ingresos: 98000 },
        { nombre: 'Sándwich de Carne', cantidad: 35, emoji: '🥩', ingresos: 147000 },
      ],
      metodoPago: { flow: 58, efectivo: 42 },
      estadoPedidos: { entregados: 120, preparando: 4, listos: 2 },
      horaPico: '13:00 - 14:00',
      comparacionSemanaAnterior: 12.3,
      mejorDia: 'Viernes',
      ventasPorDia: [
        { dia: 'Lun', ventas: 15 },
        { dia: 'Mar', ventas: 18 },
        { dia: 'Mié', ventas: 20 },
        { dia: 'Jue', ventas: 22 },
        { dia: 'Vie', ventas: 28 },
        { dia: 'Sáb', ventas: 23 },
      ]
    },
    mes: {
      totalVentas: 3850000,
      cantidadPedidos: 543,
      ticketPromedio: 7090,
      productosMasVendidos: [
        { nombre: 'Hamburguesa Doble', cantidad: 362, emoji: '🍔', ingresos: 1267000 },
        { nombre: 'Sándwich de Pollo', cantidad: 241, emoji: '🥪', ingresos: 843500 },
        { nombre: 'Papas Fritas', cantidad: 452, emoji: '🍟', ingresos: 678000 },
        { nombre: 'Bebida 500ml', cantidad: 421, emoji: '🥤', ingresos: 421000 },
        { nombre: 'Sándwich de Carne', cantidad: 151, emoji: '🥩', ingresos: 633500 },
      ],
      metodoPago: { flow: 62, efectivo: 38 },
      estadoPedidos: { entregados: 538, preparando: 3, listos: 2 },
      horaPico: '13:00 - 14:00',
      comparacionMesAnterior: 15.7,
      mejorSemana: 'Semana 3',
      crecimiento: 15.7
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [periodo]);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      // Intentar cargar desde API real
      // const res = await fetch(`https://freyes0519901.pythonanywhere.com/api/reportes?periodo=${periodo}`);
      // const data = await res.json();
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
      <div className="text-center text-white py-10">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de período */}
      <div className="flex bg-white/10 rounded-xl p-1">
        {[
          { key: 'hoy', label: '📅 Hoy' },
          { key: 'semana', label: '📆 Semana' },
          { key: 'mes', label: '🗓️ Mes' }
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              periodo === p.key
                ? 'bg-white text-orange-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs principales con comparación */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">💰 Total Ventas</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(datos.totalVentas)}</p>
          {datos.comparacionAyer && (
            <p className="text-xs text-white/80 mt-1">
              {datos.comparacionAyer > 0 ? '📈' : '📉'} {Math.abs(datos.comparacionAyer).toFixed(1)}% vs ayer
            </p>
          )}
          {datos.comparacionSemanaAnterior && (
            <p className="text-xs text-white/80 mt-1">
              {datos.comparacionSemanaAnterior > 0 ? '📈' : '📉'} {Math.abs(datos.comparacionSemanaAnterior).toFixed(1)}% vs semana anterior
            </p>
          )}
          {datos.comparacionMesAnterior && (
            <p className="text-xs text-white/80 mt-1">
              {datos.comparacionMesAnterior > 0 ? '📈' : '📉'} {Math.abs(datos.comparacionMesAnterior).toFixed(1)}% vs mes anterior
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">📦 Pedidos</p>
          <p className="text-2xl font-bold mt-1">{datos.cantidadPedidos}</p>
          {datos.mejorDia && (
            <p className="text-xs text-white/80 mt-1">🏆 Mejor día: {datos.mejorDia}</p>
          )}
          {datos.mejorSemana && (
            <p className="text-xs text-white/80 mt-1">🏆 Mejor: {datos.mejorSemana}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">🧾 Ticket Promedio</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(datos.ticketPromedio)}</p>
          <p className="text-xs text-white/80 mt-1">⏰ {datos.horaPico}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">🏆 Top Producto</p>
          <p className="text-xl font-bold mt-1">{datos.productosMasVendidos[0].emoji} {datos.productosMasVendidos[0].cantidad}</p>
          <p className="text-xs text-white/80 mt-1 truncate">{datos.productosMasVendidos[0].nombre}</p>
        </div>
      </div>

      {/* Tabs para vistas detalladas */}
      <div className="flex bg-white/10 rounded-xl p-1">
        {[
          { key: 'resumen', label: '📊 Resumen', icon: '📊' },
          { key: 'productos', label: '🍔 Productos', icon: '🍔' },
          { key: 'horarios', label: '⏰ Horarios', icon: '⏰' }
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setVistaDetalle(v.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              vistaDetalle === v.key
                ? 'bg-white text-orange-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Vista Resumen */}
      {vistaDetalle === 'resumen' && (
        <>
          {/* Métodos de pago */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">💳 Métodos de Pago</h3>
            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                    <circle 
                      cx="40" cy="40" r="32" 
                      stroke="#3B82F6" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={`${datos.metodoPago.flow * 2.01} 201`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold">{datos.metodoPago.flow}%</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">💳 Flow</p>
                <p className="text-white text-xs">{formatearPrecio(datos.totalVentas * datos.metodoPago.flow / 100)}</p>
              </div>
              <div className="flex-1 text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                    <circle 
                      cx="40" cy="40" r="32" 
                      stroke="#22C55E" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={`${datos.metodoPago.efectivo * 2.01} 201`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold">{datos.metodoPago.efectivo}%</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">💵 Efectivo</p>
                <p className="text-white text-xs">{formatearPrecio(datos.totalVentas * datos.metodoPago.efectivo / 100)}</p>
              </div>
            </div>
          </div>

          {/* Estado de pedidos */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">📊 Estado de Pedidos</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">✅ Entregados</span>
                <span className="text-white font-bold">{datos.estadoPedidos.entregados}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" 
                     style={{ width: `${(datos.estadoPedidos.entregados / datos.cantidadPedidos) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/80 text-sm">👨‍🍳 Preparando</span>
                <span className="text-white font-bold">{datos.estadoPedidos.preparando}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">⏰ Listos</span>
                <span className="text-white font-bold">{datos.estadoPedidos.listos}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vista Productos */}
      {vistaDetalle === 'productos' && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Ranking de Productos</h3>
          <div className="space-y-3">
            {datos.productosMasVendidos.map((prod, index) => {
              const porcentaje = (prod.cantidad / datos.productosMasVendidos[0].cantidad) * 100;
              const medallas = ['🥇', '🥈', '🥉'];
              return (
                <div key={prod.nombre} className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{medallas[index] || '🏅'}</span>
                    <span className="text-xl">{prod.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span className="font-semibold">{prod.nombre}</span>
                        <span className="font-bold">{prod.cantidad} un.</span>
                      </div>
                      <div className="flex justify-between text-white/70 text-xs">
                        <span>Ingresos</span>
                        <span className="font-semibold">{formatearPrecio(prod.ingresos)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-yellow-400' :
                        index === 1 ? 'bg-gray-300' :
                        index === 2 ? 'bg-orange-400' : 'bg-white/50'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Análisis de productos */}
          <div className="mt-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-white font-medium text-sm">Recomendación</p>
                <p className="text-white/70 text-xs mt-1">
                  {datos.productosMasVendidos[0].nombre} representa el {
                    ((datos.productosMasVendidos[0].ingresos / datos.totalVentas) * 100).toFixed(1)
                  }% de tus ingresos. Considera crear combos con este producto.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Horarios */}
      {vistaDetalle === 'horarios' && (
        <>
          {periodo === 'hoy' && datos.ventasPorHora && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">⏰ Ventas por Hora</h3>
              <div className="space-y-2">
                {datos.ventasPorHora.map((item) => {
                  const maxVentas = Math.max(...datos.ventasPorHora.map(v => v.ventas));
                  const porcentaje = (item.ventas / maxVentas) * 100;
                  return (
                    <div key={item.hora}>
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span>{item.hora}</span>
                        <span className="font-bold">{item.ventas} pedidos</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {periodo === 'semana' && datos.ventasPorDia && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">📅 Ventas por Día</h3>
              <div className="flex justify-between items-end gap-2 h-40">
                {datos.ventasPorDia.map((item) => {
                  const maxVentas = Math.max(...datos.ventasPorDia.map(v => v.ventas));
                  const altura = (item.ventas / maxVentas) * 100;
                  return (
                    <div key={item.dia} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-white text-xs font-bold">{item.ventas}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                        style={{ height: `${altura}%` }}
                      ></div>
                      <div className="text-white/70 text-xs">{item.dia}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">🕐 Hora Pico</h3>
            <div className="text-center py-4">
              <div className="text-4xl mb-2">⏰</div>
              <div className="text-white text-2xl font-bold">{datos.horaPico}</div>
              <p className="text-white/70 text-sm mt-2">Período de mayor actividad</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-white font-medium text-sm">Tip de Gestión</p>
                <p className="text-white/70 text-xs mt-1">
                  Prepara más stock antes de {datos.horaPico.split(' - ')[0]} para optimizar el servicio en hora pico.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Insight con IA (simulado) */}
      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-white font-medium">Análisis Inteligente</p>
            <p className="text-white/70 text-sm mt-1">
              {periodo === 'hoy' && 'Vas 8.5% mejor que ayer. Si mantienes este ritmo, superarás tu meta mensual.'}
              {periodo === 'semana' && 'Crecimiento del 12.3% vs semana anterior. Los viernes son tu mejor día - considera promociones especiales.'}
              {periodo === 'mes' && 'Crecimiento del 15.7% vs mes anterior. Tu ticket promedio aumentó - los clientes gastan más por pedido.'}
            </p>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-all">
                📊 Ver Proyección
              </button>
              <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-all">
                💡 Más Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Próximamente */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-4 text-white/40 text-xs">
          <span>🔮 Predicciones IA</span>
          <span>📱 Exportar PDF</span>
          <span>📧 Reportes Email</span>
        </div>
        <div className="text-white/30 text-xs">Próximamente en tu dashboard</div>
      </div>
    </div>
  );
}

// ============================================
// 🏠 DASHBOARD PRINCIPAL
// ============================================
export default function CarritoDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('activos');
  const [vista, setVista] = useState('pedidos'); // 'pedidos', 'prospectos' o 'reportes'
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(null);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para reproducir sonido
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
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch (e) {
      console.error('Error sonido:', e);
    }
  }, []);

  // Habilitar sonido
  const enableSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setSoundEnabled(true);
      playSound();
      
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {
      console.error('Error habilitando sonido:', e);
    }
  }, [playSound]);

  // Verificar autenticación
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

  // Cargar pedidos
  const cargarPedidos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/pedidos');
      const data = await res.json();
      if (data.pedidos) {
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
        setStats(data.stats || {});
      }
    } catch (e) { console.error('Error:', e); }
    finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);

  // Cargar prospectos
  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/prospectos');
      const data = await res.json();
      if (data.prospectos) setProspectos(data.prospectos);
    } catch (e) { console.error('Error:', e); }
  }, []);

  // Actualizar hora
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHora = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!user) return;
    cargarPedidos();
    cargarProspectos();
    const interval = setInterval(() => {
      cargarPedidos();
      cargarProspectos();
      setCountdown(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarPedidos, cargarProspectos]);

  // Countdown
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Cambiar estado
  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingPedido(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) await cargarPedidos();
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  // Notificar listo
  const notificarListo = async (fila, telefono, nombre, numero) => {
    setLoadingPedido(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/notificar-listo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre, numero })
      });
      const data = await res.json();
      if (data.success) { await cargarPedidos(); alert(`✅ Cliente notificado!`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingPedido(null); }
  };

  // Notificar prospecto individual
  const notificarProspecto = async (fila, telefono, nombre) => {
    setLoadingProspecto(fila);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/notificar-prospecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre })
      });
      const data = await res.json();
      if (data.success) { await cargarProspectos(); alert(`✅ Prospecto notificado!`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingProspecto(null); }
  };

  // Notificar todos los prospectos
  const notificarTodos = async () => {
    if (!confirm('¿Notificar a todos los prospectos pendientes?')) return;
    setNotificandoTodos(true);
    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/carrito/notificar-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      alert(data.success ? `✅ ${data.notificados} prospectos notificados` : 'Error al notificar');
      await cargarProspectos();
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setNotificandoTodos(false); }
  };

  // Cerrar sesión
  const cerrarSesion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard_user');
      router.push('/login');
    }
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : 
    filtro === 'activos' ? pedidos.filter(p => p.estado !== 'Entregado') :
    pedidos.filter(p => p.estado === filtro);
  const prospectosPendientes = prospectos.filter(p => p.notificado !== 'Sí');

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-500 to-pink-600">
      {/* Alerta de nuevo pedido */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-white text-orange-600 py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡NUEVO PEDIDO! 🔔
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-white/60 hover:text-white">← </Link>
            <h1 className="text-2xl font-bold text-white inline">🥪 Sánguchez con Hambre</h1>
            <p className="text-white/60 text-sm cursor-pointer hover:text-white/80" onClick={cerrarSesion}>Cerrar sesión</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={soundEnabled ? () => setSoundEnabled(false) : enableSound}
              className={`px-4 py-2 rounded-full font-bold text-sm ${soundEnabled ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}
            >
              {soundEnabled ? '🔊 ON' : '🔇 Sonido'}
            </button>
            <div className="text-right text-white">
              <div className="text-2xl font-mono font-bold">{hora}</div>
              <div className="text-xs text-white/60">🔄 {countdown}s</div>
            </div>
          </div>
        </div>

        {/* Selector de Vista - 3 PESTAÑAS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setVista('pedidos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${vista === 'pedidos' ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}
          >
            🥪 Pedidos ({pedidos.filter(p => p.estado !== 'Entregado').length})
          </button>
          <button
            onClick={() => setVista('prospectos')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all relative ${vista === 'prospectos' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'}`}
          >
            📋 Prospectos
            {prospectosPendientes.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {prospectosPendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setVista('reportes')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${vista === 'reportes' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}
          >
            📊 Reportes
          </button>
        </div>

        {/* ============================================ */}
        {/* VISTA PEDIDOS */}
        {/* ============================================ */}
        {vista === 'pedidos' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.preparando || 0}</div>
                <div className="text-sm">👨‍🍳 Preparando</div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.listos || 0}</div>
                <div className="text-sm">✅ Listos</div>
              </div>
              <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl p-4 text-white text-center">
                <div className="text-3xl font-bold">{stats.entregados || 0}</div>
                <div className="text-sm">📦 Entregados</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['activos', 'Preparando', 'Listo', 'Entregado', 'todos'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${filtro === f ? 'bg-white text-orange-600' : 'bg-white/20 text-white'}`}>
                  {f === 'activos' ? '🔥 Activos' : f === 'todos' ? '📊 Todos' : f}
                </button>
              ))}
            </div>

            {/* Lista de Pedidos */}
            {isLoading ? (
              <div className="text-center text-white py-10">Cargando...</div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60">No hay pedidos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pedidosFiltrados.map(pedido => (
                  <PedidoCard 
                    key={pedido.fila} 
                    pedido={pedido} 
                    onCambiarEstado={cambiarEstado}
                    onNotificarListo={notificarListo}
                    isLoading={loadingPedido === pedido.fila} 
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* VISTA PROSPECTOS */}
        {/* ============================================ */}
        {vista === 'prospectos' && (
          <>
            {/* Botón notificar todos */}
            {prospectosPendientes.length > 0 && (
              <button
                onClick={notificarTodos}
                disabled={notificandoTodos}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-2xl mb-6 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {notificandoTodos ? '⏳ Enviando...' : `🎉 ¡ABRIMOS! Notificar a ${prospectosPendientes.length} clientes`}
              </button>
            )}

            {/* Lista de Prospectos */}
            {prospectos.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-white/60">No hay prospectos</p>
                <p className="text-white/40 text-sm mt-2">Los clientes que escriban cuando esté cerrado aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {prospectos.map(prospecto => (
                  <ProspectoCard 
                    key={prospecto.fila} 
                    prospecto={prospecto} 
                    onNotificar={notificarProspecto}
                    isLoading={loadingProspecto === prospecto.fila} 
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* VISTA REPORTES */}
        {/* ============================================ */}
        {vista === 'reportes' && (
          <ReportesPanel />
        )}

        {/* Botón refresh */}
        <button onClick={() => { cargarPedidos(); cargarProspectos(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-orange-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
          🔄
        </button>

        {/* Warning sonido */}
        {!soundEnabled && mounted && (
          <div className="fixed bottom-6 left-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            ⚠️ Activa el sonido
          </div>
        )}
      </div>
    </div>
  );
}
