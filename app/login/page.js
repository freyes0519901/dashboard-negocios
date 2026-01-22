'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://freyes0519901.pythonanywhere.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('dashboard_user', JSON.stringify({
          usuario: data.usuario,
          negocio: data.negocio,
          nombre: data.nombre,
          token: data.token
        }));
        router.push(`/${data.negocio}`);
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (e) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-white/60 mt-2">Ingresa a tu panel de control</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="tu_usuario"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Contraseña</label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Dashboard Negocios v1.0
        </p>
      </div>
    </main>
  );
}
