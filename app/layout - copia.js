import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// 🔒 Metadata con SEO y seguridad
export const metadata = {
  title: 'Dashboard Negocios | Aethel',
  description: 'Panel de control para gestión de pedidos y citas - Aethel.cl',
  
  // Robots - No indexar dashboard (es privado)
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  
  // Theme color
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
  
  // Referrer Policy
  referrer: 'strict-origin-when-cross-origin',
  
  // Manifest para PWA
  manifest: '/manifest.json',
  
  // Apple touch icon
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dashboard',
  },
  
  // Otros
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect para mejor performance */}
        <link rel="preconnect" href="https://freyes0519901.pythonanywhere.com" />
        <link rel="dns-prefetch" href="https://freyes0519901.pythonanywhere.com" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
