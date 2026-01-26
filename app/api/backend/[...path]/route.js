// 🔒 GRADO INDUSTRIAL: Proxy con Autenticación
// Archivo: app/api/backend/[...path]/route.js

import { cookies } from 'next/headers';

const API_BASE = process.env.API_BASE_URL || 'https://freyes0519901.pythonanywhere.com';
const API_KEY = process.env.API_KEY_BACKEND || '';

async function verificarSesion() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('dashboard_session');
    
    if (!session?.value) return false;
    
    const data = JSON.parse(session.value);
    // Verificar que la sesión no tenga más de 24 horas
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) return false;
    
    return data.negocio ? true : false;
  } catch {
    return false;
  }
}

export async function GET(request, context) {
  return handleRequest(request, context, 'GET');
}

export async function POST(request, context) {
  return handleRequest(request, context, 'POST');
}

export async function PUT(request, context) {
  return handleRequest(request, context, 'PUT');
}

export async function DELETE(request, context) {
  return handleRequest(request, context, 'DELETE');
}

export async function OPTIONS() {
  return new Response(null, { status: 200 });
}

async function handleRequest(request, context, method) {
  try {
    // 🔒 VERIFICAR SESIÓN
    const autenticado = await verificarSesion();
    if (!autenticado) {
      return Response.json(
        { success: false, error: 'No autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!API_KEY) {
      return Response.json(
        { success: false, error: 'Servidor no configurado', code: 'SERVER_CONFIG_ERROR' },
        { status: 500 }
      );
    }

    const params = await context.params;
    const pathSegments = params?.path || [];
    const backendPath = '/' + pathSegments.join('/');
    
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = `${API_BASE}${backendPath}${queryString ? '?' + queryString : ''}`;
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      }
    };
    
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {}
    }
    
    const response = await fetch(fullUrl, fetchOptions);
    
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      const blob = await response.blob();
      return new Response(blob, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('content-disposition') || '',
        },
      });
    }
    
    const data = await response.json();
    return Response.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      { success: false, error: 'Error de conexión', code: 'CONNECTION_ERROR' },
      { status: 500 }
    );
  }
}
