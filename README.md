# 🎛️ Dashboard React - Mis Negocios

Dashboard moderno para gestionar pedidos (Carrito) y citas (Barbería).

## 🚀 Deploy en Vercel (GRATIS)

### Opción 1: Deploy automático (recomendado)

1. **Sube este proyecto a GitHub:**
   - Crea un repositorio nuevo en github.com
   - Sube todos estos archivos

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Click "Add New" → "Project"
   - Selecciona tu repositorio
   - En "Environment Variables" agrega:
     ```
     API_URL = https://freyes0519901.pythonanywhere.com
     ```
   - Click "Deploy"

3. **¡Listo!** Tu dashboard estará en: `https://tu-proyecto.vercel.app`

### Opción 2: Deploy manual

1. Instala Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. En la carpeta del proyecto:
   ```bash
   vercel
   ```

3. Sigue las instrucciones y agrega la variable `API_URL`

## 💻 Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir http://localhost:3000

## 📱 Instalar como App (PWA)

En Chrome/Edge:
1. Abre el dashboard
2. Click en los 3 puntos (menú)
3. "Instalar aplicación" o "Agregar a pantalla inicio"

## 📁 Estructura

```
/app
  /carrito     → Dashboard de pedidos
  /barberia    → Dashboard de citas
  page.js      → Página principal (selector)
  layout.js    → Layout y metadatos
  globals.css  → Estilos globales
/public
  manifest.json → Configuración PWA
```

## 🔗 Endpoints API

El dashboard consume estos endpoints de tu backend Python:

- `GET /api/carrito/pedidos` - Lista pedidos
- `PUT /api/carrito/pedido/{fila}/estado` - Cambiar estado
- `GET /api/barberia/citas` - Lista citas
- `PUT /api/barberia/cita/{fila}/estado` - Cambiar estado

## ⚡ Características

- ✅ Actualización automática (cada 10-15 segundos)
- ✅ Cambio de estado con un click
- ✅ Filtros por estado
- ✅ Estadísticas en tiempo real
- ✅ Diseño responsive (móvil/desktop)
- ✅ Instalable como app (PWA)
- ✅ Modo oscuro
