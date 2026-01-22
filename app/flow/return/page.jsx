'use client';
export default function PagoExitoso() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Pago Exitoso! 🎉</h1>
        <p className="text-gray-600 text-lg mb-6">Tu pedido está siendo preparado</p>
        <div className="bg-orange-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">🥪</span>
            <span className="text-xl font-bold text-orange-600">Sánguchez con Hambre</span>
          </div>
          <p className="text-gray-700">⏱️ Tiempo estimado: 15-20 min</p>
        </div>
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">✅</span>
            <span className="text-gray-700">Pago confirmado</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-2xl">👨‍🍳</span>
            <span className="text-gray-700">Preparando tu pedido...</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">📱</span>
            <span className="text-gray-400">Te avisamos por WhatsApp</span>
          </div>
        </div>
        <a href="https://wa.me/56961472229" className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl text-center text-lg">💬 Abrir WhatsApp</a>
        <p className="text-gray-400 text-sm mt-4">
          Te notificaremos cuando esté listo 📱
        </p>
      </div>
    </div>
  );
}

