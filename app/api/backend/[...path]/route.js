// 🔒 GRADO INDUSTRIAL: Proxy API Route
// Archivo: app/api/backend/[...path]/route.js
// Este proxy oculta la API_KEY del cliente - NUNCA se expone en el navegador

const API_BASE = process.env.API_BASE_URL || 'https://freyes0519901.pythonanywhere.com';

// 🔒 API Key SOLO en servidor (SIN prefijo NEXT_PUBLIC_)
const API_KEY = process.env.API_KEY_BACKEND || '';

export async function GET(request, { params }) {
  return handleRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, 'DELETE');
}

export async function OPTIONS(request, { params }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleRequest(request, { params }, method) {
  try {
    // 🔒 Verificar que API Key esté configurada
    if (!API_KEY) {
      console.error('🚨 API_KEY_BACKEND no configurada en Vercel');
      return Response.json(
        { success: false, error: 'Servidor no configurado correctamente', code: 'SERVER_CONFIG_ERROR' },
        { status: 500 }
      );
    }

    // Construir path del backend
    const pathSegments = await params.path || [];
    const backendPath = '/' + pathSegments.join('/');
    
    // Obtener query params
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = `${API_BASE}${backendPath}${queryString ? '?' + queryString : ''}`;
    
    // 🔒 Configurar headers con API Key (OCULTA del cliente)
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    };
    
    // Configurar opciones de fetch
    const fetchOptions = {
      method,
      headers,
    };
    
    // Agregar body para POST/PUT
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // Si no hay body JSON, continuar sin él
      }
    }
    
    // Hacer request al backend
    const response = await fetch(fullUrl, fetchOptions);
    
    // Manejar respuestas no-JSON (como archivos)
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
    
    // Retornar respuesta
    return Response.json(data, { status: response.status });
    
  } catch (error) {
    console.error('🔒 Proxy error:', error);
    return Response.json(
      { success: false, error: 'Error de conexión con el servidor', code: 'CONNECTION_ERROR' },
      { status: 500 }
    );
  }
}
