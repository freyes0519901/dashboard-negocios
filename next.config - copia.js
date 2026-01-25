/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// 🔒 CSP para Dashboard - Permite conexión con backend PythonAnywhere
const ContentSecurityPolicy = isDev
  ? "default-src * 'unsafe-inline' 'unsafe-eval'"
  : [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://freyes0519901.pythonanywhere.com https://wa.me https://api.whatsapp.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

// 🔒 Headers de Seguridad - GRADO EMPRESARIAL
const securityHeaders = [
  // Anti-clickjacking - CRÍTICO para dashboards
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  // Anti-MIME sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // XSS Filter
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  // Referrer control
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // HSTS - Fuerza HTTPS (2 años)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // Permisos del navegador - restringido
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy
  },
  // Cross-domain policies
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none'
  },
  // DNS Prefetch
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  }
];

const nextConfig = {
  // 🔒 Headers de seguridad para todas las rutas
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  // Oculta X-Powered-By: Next.js
  poweredBy: false,
  
  // Modo estricto de React
  reactStrictMode: true,
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
  },
};

module.exports = nextConfig;
