// 🔒 API de Login con Cookie Segura
// Archivo: app/api/auth/login/route.js

import { cookies } from 'next/headers';

const API_BASE = process.env.API_BASE_URL || 'https://freyes0519901.pythonanywhere.com';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Llamar al backend real
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    
    if (data.success) {
      // 🔒 Crear cookie segura de sesión
      const cookieStore = await cookies();
      const sessionData = JSON.stringify({
        usuario: data.usuario,
        negocio: data.negocio,
        token: data.token,
        timestamp: Date.now()
      });
      
      cookieStore.set('dashboard_session', sessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/'
      });
    }
    
    return Response.json(data, { status: res.status });
    
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, error: 'Error de conexión' },
      { status: 500 }
    );
  }
}
