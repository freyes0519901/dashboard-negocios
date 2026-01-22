'use client';
import { useEffect, useState } from 'react';

export default function PagoExitoso() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10">
        {/* Icono éxito */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Pago Exitoso! 🎉</h1>
        <p className="text-gray-600 text-lg mb-6">Tu pedido está siendo preparado</p>

        {/* Info */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 mb-6 border border-orange-100">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">🥪</span>
            <span className="text-xl font-bold text-orange-600">Sánguchez con Hambre</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <span>⏱️ Tiempo estimado: <strong>15-20 min</strong></span>
          </div>
        </div>

        {/* Pasos */}
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
            <span className="text-gray-700">Pago confirmado</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold animate-pulse">2</div>
            <span className="text-gray-700">Preparando tu pedido...</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <span className="text-gray-400">Te avisamos cuando esté listo</span>
          </div>
        </div>

        {/* Botón WhatsApp */}
        
          href="https://wa.me/56961472229"
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
        >
          <span className="text-2xl">💬</span>
          <span className="text-lg">Abrir WhatsApp</span>
        </a>

        <p className="text-gray-400 text-sm mt-4">
          Te notificaremos por WhatsApp cuando esté listo 📱
        </p>
      </div>
    </div>
  );
}
