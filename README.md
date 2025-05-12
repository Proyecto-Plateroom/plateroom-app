# PlateRoom App

Aplicación web desarrollada con React, TypeScript y Vite, con autenticación mediante Clerk.

## Características

- Autenticación de usuarios con Clerk
- Interfaz moderna y responsiva
- Desarrollada con React 18 y TypeScript
- Estructura de proyecto limpia y organizada

## Requisitos

- Node.js 16+ y npm 9+ o pnpm 7+ o yarn 1.22+
- Docker (o Docker Desktop para Windows/macOS) para desarrollo local con Supabase

## Instalación

1. Clona el repositorio:
```bash
git clone git@github.com:Proyecto-Plateroom/plateroom-app.git
cd plateroom-app
```

2. Instala las dependencias:
```bash
npm install
# o
yarn
# o
pnpm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Completa las variables de entorno necesarias en el archivo `.env`

   ```bash
   cp .env.example .env
   ```

   Abre el archivo `.env` y completa las siguientes variables:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=tu_clave_aquí
   VITE_SUPABASE_URL=url_de_tu_instancia_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_supabase
   ```

4. Configuración de Supabase local (opcional, solo si trabajas con base de datos local):
   
   **Primera vez que configuras Supabase localmente:**
   ```bash
   # Inicializa la configuración de Supabase (solo primera vez)
   npm run supabase:init
   
   # Inicia los contenedores de Supabase
   npm run supabase:start
   ```

   **Para usos posteriores**, solo necesitarás ejecutar:
   ```bash
   npm run supabase:start
   ```

   Para detener Supabase:
   ```bash
   npm run supabase:stop
   ```

   Si necesitas reiniciar la instancia de Supabase (por ejemplo, después de hacer cambios en la configuración):
   ```bash
   npm run supabase:reset
   ```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

## Estructura del Proyecto

- `/src` - Código fuente de la aplicación
  - `/assets` - Recursos estáticos
  - `App.tsx` - Componente principal
  - `main.tsx` - Punto de entrada de la aplicación
- `/public` - Archivos públicos
- `/supabase` - Configuración de Supabase (se crea al ejecutar `supabase:init`)
- `.env` - Variables de entorno (copiar de `.env.example` y configurar)
- `.env.example` - Plantilla de variables de entorno

## Scripts Disponibles

### Desarrollo
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run lint` - Ejecuta el linter
- `npm run check` - Verifica los tipos de TypeScript

### Build y Producción
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción

### Supabase
- `npm run supabase:init` - Inicializa la configuración de Supabase (solo primera vez)
- `npm run supabase:start` - Inicia los contenedores de Supabase
- `npm run supabase:stop` - Detiene los contenedores de Supabase
- `npm run supabase:reset` - Reinicia la instancia de Supabase (detiene sin backup y vuelve a iniciar)
