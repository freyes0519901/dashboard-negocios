// 🔒 GRADO INDUSTRIAL: Proxy API Route - NEXT.JS 15 COMPATIBLE
// Archivo: app/api/backend/[...path]/route.js

const API_BASE = process.env.API_BASE_URL || 'https://freyes0519901.pythonanywhere.com';
const API_KEY = process.env.API_KEY_BACKEND || '';

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
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleRequest(request, context, method) {
  try {
    if (!API_KEY) {
      console.error('🚨 API_KEY_BACKEND no configurada en Vercel');
      return Response.json(
        { success: false, error: 'Servidor no configurado correctamente', code: 'SERVER_CONFIG_ERROR' },
        { status: 500 }
      );
    }

    // 🔒 FIX NEXT.JS 15: params es una Promise
    const params = await context.params;
    const pathSegments = params?.path || [];
    const backendPath = '/' + pathSegments.join('/');
    
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = `${API_BASE}${backendPath}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🔒 Proxy: ${method} ${fullUrl}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    };
    
    const fetchOptions = { method, headers };
    
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // Sin body JSON
      }
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
    console.error('🔒 Proxy error:', error);
    return Response.json(
      { success: false, error: 'Error de conexión con el servidor', code: 'CONNECTION_ERROR' },
      { status: 500 }
    );
  }
}
