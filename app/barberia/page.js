'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// 💈 COMPONENTE RESERVA
// ============================================
function ReservaCard({ reserva, onCambiarEstado, onNotificarListo, isLoading }) {
  const colores = {
    'Pendiente': 'from-yellow-400 to-orange-500',
    'Confirmada': 'from-blue-400 to-blue-500',
    'En Proceso': 'from-purple-400 to-purple-500',
    'Completada': 'from-green-400 to-emerald-500',
    'Cancelada': 'from-gray-400 to-gray-500',
  };
  const iconos = { 
    'Pendiente': '⏳', 
    'Confirmada': '✅', 
    'En Proceso': '✂️',
    'Completada': '🎉', 
    'Cancelada': '❌' 
  };

  return (
    <div className={`bg-gradient-to-br ${colores[reserva.estado] || colores['Pendiente']} rounded-2xl p-4 text-white shadow-lg`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-3xl font-bold">#{reserva.numero}</span>
        <span className="text-3xl">{iconos[reserva.estado]}</span>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">👤 <span className="font-semibold">{reserva.nombre}</span></div>
        <div className="flex items-center gap-2 text-sm">📞 {reserva.telefono}</div>
        <div className="flex items-center gap-2 text-sm mt-1">🕐 {reserva.hora}</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <div className="text-sm">✂️ {reserva.servicio}</div>
        {reserva.barbero && <div className="text-sm mt-1">💈 {reserva.barbero}</div>}
      </div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold">{reserva.precio}</span>
        <span className="text-sm bg-white/20 px-2 py-1 rounded">{reserva.duracion || '30 min'}</span>
      </div>
      <div className="flex gap-2">
        {reserva.estado === 'Pendiente' && (
          <>
            <button 
              onClick={() => onCambiarEstado(reserva.fila, 'Confirmada')} 
              disabled={isLoading}
              className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              {isLoading ? '⏳...' : '✅ Confirmar'}
            </button>
            <button 
              onClick={() => onCambiarEstado(reserva.fila, 'Cancelada')} 
              disabled={isLoading}
              className="flex-1 bg-white/20 text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
              ❌
            </button>
          </>
        )}
        {reserva.estado === 'Confirmada' && (
          <button 
            onClick={() => onCambiarEstado(reserva.fila, 'En Proceso')} 
            disabled={isLoading}
            className="flex-1 bg-white text-purple-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '✂️ Iniciar Servicio'}
          </button>
        )}
        {reserva.estado === 'En Proceso' && (
          <button 
            onClick={() => onNotificarListo(reserva.fila, reserva.telefono, reserva.nombre, reserva.numero)} 
            disabled={isLoading}
            className="flex-1 bg-white text-green-600 font-bold py-3 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
            {isLoading ? '⏳...' : '🎉 Finalizar'}
          </button>
        )}
        {(reserva.estado === 'Completada' || reserva.estado === 'Cancelada') && (
          <span className="flex-1 text-center py-3 bg-white/20 rounded-xl">
            {reserva.estado === 'Completada' ? '✓ Completado' : '✗ Cancelado'}
          </span>
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
        {prospecto.servicio_interes && (
          <div className="flex items-center gap-2 text-sm mt-1">✂️ {prospecto.servicio_interes}</div>
        )}
        <div className="flex items-center gap-2 text-sm mt-1">📅 {prospecto.fecha}</div>
      </div>
      {prospecto.notificado !== 'Sí' && (
        <button 
          onClick={() => onNotificar(prospecto.fila, prospecto.telefono, prospecto.nombre)}
          disabled={isLoading}
          className="w-full bg-white text-orange-600 font-bold py-2 rounded-xl disabled:opacity-50 hover:scale-105 transition-transform">
          {isLoading ? '⏳...' : '📲 Avisar disponibilidad'}
        </button>
      )}
    </div>
  );
}

// ============================================
// 📊 COMPONENTE REPORTES - BARBERÍA
// ============================================
function ReportesPanel() {
  const [periodo, setPeriodo] = useState('hoy');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaDetalle, setVistaDetalle] = useState('resumen'); // 'resumen', 'servicios', 'barberos'

  // Datos demo para barbería
  const datosDemo = {
    hoy: {
      totalIngresos: 145000,
      cantidadReservas: 12,
      ticketPromedio: 12083,
      serviciosMasVendidos: [
        { nombre: 'Corte + Barba', cantidad: 5, emoji: '✂️', ingresos: 62500, duracion: '45 min' },
        { nombre: 'Corte Clásico', cantidad: 4, emoji: '💇', ingresos: 40000, duracion: '30 min' },
        { nombre: 'Barba', cantidad: 2, emoji: '🧔', ingresos: 16000, duracion: '20 min' },
        { nombre: 'Corte Niño', cantidad: 1, emoji: '👶', ingresos: 8000, duracion: '20 min' },
      ],
      barberos: [
        { nombre: 'Carlos', clientes: 6, ingresos: 72000, rating: 4.8 },
        { nombre: 'Miguel', clientes: 4, ingresos: 48000, rating: 4.9 },
        { nombre: 'Daniel', clientes: 2, ingresos: 25000, rating: 4.7 },
      ],
      metodoPago: { transferencia: 70, efectivo: 30 },
      estadoReservas: { completadas: 9, enProceso: 1, confirmadas: 2, pendientes: 0 },
      horaPico: '14:00 - 16:00',
      comparacionAyer: 12.5,
      tasaOcupacion: 85, // % de slots ocupados
      reservasPorHora: [
        { hora: '10:00', reservas: 1 },
        { hora: '11:00', reservas: 2 },
        { hora: '12:00', reservas: 2 },
        { hora: '14:00', reservas: 3 },
        { hora: '15:00', reservas: 2 },
        { hora: '17:00', reservas: 2 },
      ]
    },
    semana: {
      totalIngresos: 1015000,
      cantidadReservas: 84,
      ticketPromedio: 12083,
      serviciosMasVendidos: [
        { nombre: 'Corte + Barba', cantidad: 35, emoji: '✂️', ingresos: 437500, duracion: '45 min' },
        { nombre: 'Corte Clásico', cantidad: 28, emoji: '💇', ingresos: 280000, duracion: '30 min' },
        { nombre: 'Barba', cantidad: 14, emoji: '🧔', ingresos: 112000, duracion: '20 min' },
        { nombre: 'Corte Niño', cantidad: 7, emoji: '👶', ingresos: 56000, duracion: '20 min' },
      ],
      barberos: [
        { nombre: 'Carlos', clientes: 42, ingresos: 504000, rating: 4.8 },
        { nombre: 'Miguel', clientes: 28, ingresos: 336000, rating: 4.9 },
        { nombre: 'Daniel', clientes: 14, ingresos: 175000, rating: 4.7 },
      ],
      metodoPago: { transferencia: 68, efectivo: 32 },
      estadoReservas: { completadas: 78, enProceso: 2, confirmadas: 4, pendientes: 0 },
      horaPico: '14:00 - 16:00',
      comparacionSemanaAnterior: 15.3,
      mejorDia: 'Sábado',
      tasaOcupacion: 82,
      reservasPorDia: [
        { dia: 'Lun', reservas: 10 },
        { dia: 'Mar', reservas: 12 },
        { dia: 'Mié', reservas: 11 },
        { dia: 'Jue', reservas: 13 },
        { dia: 'Vie', reservas: 15 },
        { dia: 'Sáb', reservas: 23 },
      ]
    },
    mes: {
      totalIngresos: 4380000,
      cantidadReservas: 362,
      ticketPromedio: 12099,
      serviciosMasVendidos: [
        { nombre: 'Corte + Barba', cantidad: 151, emoji: '✂️', ingresos: 1887500, duracion: '45 min' },
        { nombre: 'Corte Clásico', cantidad: 121, emoji: '💇', ingresos: 1210000, duracion: '30 min' },
        { nombre: 'Barba', cantidad: 60, emoji: '🧔', ingresos: 480000, duracion: '20 min' },
        { nombre: 'Corte Niño', cantidad: 30, emoji: '👶', ingresos: 240000, duracion: '20 min' },
      ],
      barberos: [
        { nombre: 'Carlos', clientes: 181, ingresos: 2172000, rating: 4.8 },
        { nombre: 'Miguel', clientes: 121, ingresos: 1452000, rating: 4.9 },
        { nombre: 'Daniel', clientes: 60, ingresos: 756000, rating: 4.7 },
      ],
      metodoPago: { transferencia: 65, efectivo: 35 },
      estadoReservas: { completadas: 358, enProceso: 0, confirmadas: 4, pendientes: 0 },
      horaPico: '14:00 - 16:00',
      comparacionMesAnterior: 18.7,
      mejorSemana: 'Semana 4',
      tasaOcupacion: 79,
      crecimiento: 18.7
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [periodo]);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      // Intentar cargar desde API real
      // const res = await fetch(`https://tu-api.com/api/barberia/reportes?periodo=${periodo}`);
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
                ? 'bg-white text-blue-600'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">💰 Total Ingresos</p>
          <p className="text-2xl font-bold mt-1">{formatearPrecio(datos.totalIngresos)}</p>
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
          <p className="text-white/80 text-xs font-medium">✂️ Clientes</p>
          <p className="text-2xl font-bold mt-1">{datos.cantidadReservas}</p>
          {datos.mejorDia && (
            <p className="text-xs text-white/80 mt-1">🏆 Mejor: {datos.mejorDia}</p>
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
          <p className="text-white/80 text-xs font-medium">📊 Ocupación</p>
          <p className="text-2xl font-bold mt-1">{datos.tasaOcupacion}%</p>
          <p className="text-xs text-white/80 mt-1">De slots disponibles</p>
        </div>
      </div>

      {/* Tabs para vistas detalladas */}
      <div className="flex bg-white/10 rounded-xl p-1">
        {[
          { key: 'resumen', label: '📊 Resumen' },
          { key: 'servicios', label: '✂️ Servicios' },
          { key: 'barberos', label: '💈 Barberos' }
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setVistaDetalle(v.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              vistaDetalle === v.key
                ? 'bg-white text-blue-600'
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
                      strokeDasharray={`${datos.metodoPago.transferencia * 2.01} 201`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold">{datos.metodoPago.transferencia}%</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm">💳 Transferencia</p>
                <p className="text-white text-xs">{formatearPrecio(datos.totalIngresos * datos.metodoPago.transferencia / 100)}</p>
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
                <p className="text-white text-xs">{formatearPrecio(datos.totalIngresos * datos.metodoPago.efectivo / 100)}</p>
              </div>
            </div>
          </div>

          {/* Estado de reservas */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">📊 Estado de Reservas</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">✅ Completadas</span>
                <span className="text-white font-bold">{datos.estadoReservas.completadas}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" 
                     style={{ width: `${(datos.estadoReservas.completadas / datos.cantidadReservas) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/80 text-sm">✂️ En Proceso</span>
                <span className="text-white font-bold">{datos.estadoReservas.enProceso}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">📋 Confirmadas</span>
                <span className="text-white font-bold">{datos.estadoReservas.confirmadas}</span>
              </div>
            </div>
          </div>

          {/* Horarios de mayor actividad */}
          {periodo === 'hoy' && datos.reservasPorHora && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">⏰ Actividad del Día</h3>
              <div className="space-y-2">
                {datos.reservasPorHora.map((item) => {
                  const maxReservas = Math.max(...datos.reservasPorHora.map(r => r.reservas));
                  const porcentaje = (item.reservas / maxReservas) * 100;
                  return (
                    <div key={item.hora}>
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span>{item.hora}</span>
                        <span className="font-bold">{item.reservas} clientes</span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {periodo === 'semana' && datos.reservasPorDia && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">📅 Actividad Semanal</h3>
              <div className="flex justify-between items-end gap-2 h-40">
                {datos.reservasPorDia.map((item) => {
                  const maxReservas = Math.max(...datos.reservasPorDia.map(r => r.reservas));
                  const altura = (item.reservas / maxReservas) * 100;
                  return (
                    <div key={item.dia} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-white text-xs font-bold">{item.reservas}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-lg"
                        style={{ height: `${altura}%` }}
                      ></div>
                      <div className="text-white/70 text-xs">{item.dia}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Vista Servicios */}
      {vistaDetalle === 'servicios' && (
        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">🏆 Servicios Más Solicitados</h3>
          <div className="space-y-3">
            {datos.serviciosMasVendidos.map((servicio, index) => {
              const porcentaje = (servicio.cantidad / datos.serviciosMasVendidos[0].cantidad) * 100;
              const medallas = ['🥇', '🥈', '🥉'];
              return (
                <div key={servicio.nombre} className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{medallas[index] || '🏅'}</span>
                    <span className="text-xl">{servicio.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-white text-sm mb-1">
                        <span className="font-semibold">{servicio.nombre}</span>
                        <span className="font-bold">{servicio.cantidad} clientes</span>
                      </div>
                      <div className="flex justify-between text-white/70 text-xs">
                        <span>⏱️ {servicio.duracion}</span>
                        <span className="font-semibold">{formatearPrecio(servicio.ingresos)}</span>
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
          
          {/* Análisis de servicios */}
          <div className="mt-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-white font-medium text-sm">Recomendación</p>
                <p className="text-white/70 text-xs mt-1">
                  {datos.serviciosMasVendidos[0].nombre} es tu servicio estrella. 
                  Considera crear paquetes o membresías para fidelizar clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista Barberos */}
      {vistaDetalle === 'barberos' && (
        <div className="space-y-3">
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">💈 Rendimiento del Equipo</h3>
            <div className="space-y-3">
              {datos.barberos.map((barbero, index) => {
                const maxClientes = Math.max(...datos.barberos.map(b => b.clientes));
                const porcentaje = (barbero.clientes / maxClientes) * 100;
                const colores = ['from-yellow-400 to-orange-500', 'from-blue-400 to-blue-500', 'from-purple-400 to-purple-500'];
                
                return (
                  <div key={barbero.nombre} className={`bg-gradient-to-r ${colores[index]} rounded-xl p-3 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        <div>
                          <p className="font-bold">{barbero.nombre}</p>
                          <p className="text-xs text-white/80">⭐ {barbero.rating} rating</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{barbero.clientes}</p>
                        <p className="text-xs text-white/80">clientes</p>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2 mb-2">
                      <p className="text-sm">💰 {formatearPrecio(barbero.ingresos)}</p>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribución de clientes */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-3">📊 Distribución de Clientes</h3>
            <div className="flex justify-center items-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  {datos.barberos.map((barbero, i) => {
                    const total = datos.barberos.reduce((sum, b) => sum + b.clientes, 0);
                    const prevTotal = datos.barberos.slice(0, i).reduce((sum, b) => sum + b.clientes, 0);
                    const porcentaje = (barbero.clientes / total) * 100;
                    const offset = (prevTotal / total) * 251.2;
                    const colores = ['#F59E0B', '#3B82F6', '#8B5CF6'];
                    
                    return (
                      <circle 
                        key={i}
                        cx="80" cy="80" r="40" 
                        stroke={colores[i]} 
                        strokeWidth="16" 
                        fill="none"
                        strokeDasharray={`${(porcentaje / 100) * 251.2} 251.2`}
                        strokeDashoffset={-offset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-2xl font-bold">{datos.cantidadReservas}</span>
                  <span className="text-white/70 text-xs">Total</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {datos.barberos.map((barbero, i) => {
                const colores = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500'];
                const total = datos.barberos.reduce((sum, b) => sum + b.clientes, 0);
                const porcentaje = ((barbero.clientes / total) * 100).toFixed(0);
                return (
                  <div key={i} className="text-center">
                    <div className={`w-3 h-3 ${colores[i]} rounded-full mx-auto mb-1`}></div>
                    <p className="text-white text-xs font-bold">{barbero.nombre}</p>
                    <p className="text-white/70 text-xs">{porcentaje}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips de gestión */}
          <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-white font-medium text-sm">Gestión de Equipo</p>
                <p className="text-white/70 text-xs mt-1">
                  {datos.barberos[0].nombre} lidera en clientes atendidos. 
                  Considera equilibrar la carga de trabajo para optimizar los tiempos de espera.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight con IA */}
      <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-white font-medium">Análisis Inteligente</p>
            <p className="text-white/70 text-sm mt-1">
              {periodo === 'hoy' && `Vas ${datos.comparacionAyer.toFixed(1)}% mejor que ayer. Tu ocupación del ${datos.tasaOcupacion}% es excelente para un ${new Date().toLocaleDateString('es-CL', {weekday: 'long'})}.`}
              {periodo === 'semana' && `Crecimiento del ${datos.comparacionSemanaAnterior.toFixed(1)}% vs semana anterior. Los ${datos.mejorDia}s son tu mejor día - considera promociones especiales.`}
              {periodo === 'mes' && `Crecimiento sostenido del ${datos.comparacionMesAnterior.toFixed(1)}%. Tu tasa de ocupación promedio del ${datos.tasaOcupacion}% indica buena gestión de agenda.`}
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
// 🏠 DASHBOARD PRINCIPAL - BARBERÍA
// ============================================
export default function BarberiaDashboard() {
  const [reservas, setReservas] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [stats, setStats] = useState({});
  const [filtro, setFiltro] = useState('activas');
  const [vista, setVista] = useState('reservas'); // 'reservas', 'prospectos' o 'reportes'
  const [hora, setHora] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingReserva, setLoadingReserva] = useState(null);
  const [loadingProspecto, setLoadingProspecto] = useState(null);
  const [notificandoTodos, setNotificandoTodos] = useState(false);
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [newReservaIds, setNewReservaIds] = useState(new Set());
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const audioContextRef = useRef(null);
  const previousReservasRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para reproducir sonido
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
      if (parsed.negocio !== 'barberia') { router.push('/login'); return; }
      setUser(parsed);
    } catch (e) { router.push('/login'); }
  }, [router]);

  // Cargar reservas
  const cargarReservas = useCallback(async () => {
    try {
      const res = await fetch('https://tu-api.com/api/barberia/reservas');
      const data = await res.json();
      if (data.reservas) {
        const prevIds = new Set(previousReservasRef.current.map(r => r.numero));
        const nuevas = data.reservas.filter(r => !prevIds.has(r.numero) && r.estado === 'Pendiente');
        
        if (nuevas.length > 0 && previousReservasRef.current.length > 0 && soundEnabled) {
          playSound();
          setShowAlert(true);
          setNewReservaIds(new Set(nuevas.map(r => r.numero)));
          setTimeout(() => { setShowAlert(false); setNewReservaIds(new Set()); }, 5000);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Nueva Reserva!', { body: `Reserva #${nuevas[0].numero} - ${nuevas[0].nombre}`, icon: '💈' });
          }
        }
        
        previousReservasRef.current = data.reservas;
        setReservas(data.reservas);
        setStats(data.stats || {});
      }
    } catch (e) { console.error('Error:', e); }
    finally { setIsLoading(false); }
  }, [soundEnabled, playSound]);

  // Cargar prospectos
  const cargarProspectos = useCallback(async () => {
    try {
      const res = await fetch('https://tu-api.com/api/barberia/prospectos');
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
    cargarReservas();
    cargarProspectos();
    const interval = setInterval(() => {
      cargarReservas();
      cargarProspectos();
      setCountdown(10);
    }, 10000);
    return () => clearInterval(interval);
  }, [user, cargarReservas, cargarProspectos]);

  // Countdown
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 10), 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Cambiar estado
  const cambiarEstado = async (fila, nuevoEstado) => {
    setLoadingReserva(fila);
    try {
      const res = await fetch('https://tu-api.com/api/barberia/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) await cargarReservas();
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingReserva(null); }
  };

  // Notificar listo
  const notificarListo = async (fila, telefono, nombre, numero) => {
    setLoadingReserva(fila);
    try {
      const res = await fetch('https://tu-api.com/api/barberia/notificar-completado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fila, telefono, nombre, numero })
      });
      const data = await res.json();
      if (data.success) { await cargarReservas(); alert(`✅ Cliente notificado!`); }
      else alert('Error: ' + (data.error || 'Desconocido'));
    } catch (e) { console.error('Error:', e); alert('Error de conexión'); }
    finally { setLoadingReserva(null); }
  };

  // Notificar prospecto individual
  const notificarProspecto = async (fila, telefono, nombre) => {
    setLoadingProspecto(fila);
    try {
      const res = await fetch('https://tu-api.com/api/barberia/notificar-prospecto', {
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
      const res = await fetch('https://tu-api.com/api/barberia/notificar-todos', {
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

  const reservasFiltradas = filtro === 'todas' ? reservas : 
    filtro === 'activas' ? reservas.filter(r => !['Completada', 'Cancelada'].includes(r.estado)) :
    reservas.filter(r => r.estado === filtro);
  const prospectosPendientes = prospectos.filter(p => p.notificado !== 'Sí');

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Alerta de nueva reserva */}
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-white text-blue-600 py-3 text-center font-bold z-50 animate-pulse">
          🔔 ¡NUEVA RESERVA! 🔔
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-white/60 hover:text-white">← </Link>
            <h1 className="text-2xl font-bold text-white inline">💈 Barbería Premium</h1>
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
            onClick={() => setVista('reservas')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${vista === 'reservas' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}
          >
            💈 Reservas ({reservas.filter(r => !['Completada', 'Cancelada'].includes(r.estado)).length})
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
        {/* VISTA RESERVAS */}
        {/* ============================================ */}
        {vista === 'reservas' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{stats.pendientes || 0}</div>
                <div className="text-xs">⏳ Pendientes</div>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{stats.confirmadas || 0}</div>
                <div className="text-xs">✅ Confirmadas</div>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{stats.enProceso || 0}</div>
                <div className="text-xs">✂️ En Proceso</div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 text-white text-center">
                <div className="text-2xl font-bold">{stats.completadas || 0}</div>
                <div className="text-xs">🎉 Completadas</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['activas', 'Pendiente', 'Confirmada', 'En Proceso', 'Completada', 'todas'].map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${filtro === f ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}>
                  {f === 'activas' ? '🔥 Activas' : f === 'todas' ? '📊 Todas' : f}
                </button>
              ))}
            </div>

            {/* Lista de Reservas */}
            {isLoading ? (
              <div className="text-center text-white py-10">Cargando...</div>
            ) : reservasFiltradas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60">No hay reservas</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reservasFiltradas.map(reserva => (
                  <ReservaCard 
                    key={reserva.fila} 
                    reserva={reserva} 
                    onCambiarEstado={cambiarEstado}
                    onNotificarListo={notificarListo}
                    isLoading={loadingReserva === reserva.fila} 
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
                {notificandoTodos ? '⏳ Enviando...' : `🎉 Notificar disponibilidad a ${prospectosPendientes.length} clientes`}
              </button>
            )}

            {/* Lista de Prospectos */}
            {prospectos.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-white/60">No hay prospectos</p>
                <p className="text-white/40 text-sm mt-2">Los clientes interesados aparecerán aquí</p>
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
        <button onClick={() => { cargarReservas(); cargarProspectos(); setCountdown(10); }}
          className="fixed bottom-6 right-6 bg-white text-blue-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
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
