
import './globals.css'

export const metadata = {
  title: 'Dashboard - Mis Negocios',
  description: 'Panel de control para Carrito y Barbería',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
