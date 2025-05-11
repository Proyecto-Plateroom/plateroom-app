# PlateRoom App

Aplicación web desarrollada con React, TypeScript y Vite, con autenticación mediante Clerk.

## Características

- Autenticación de usuarios con Clerk
- Interfaz moderna y responsiva
- Desarrollada con React 18 y TypeScript
- Estructura de proyecto limpia y organizada

## Requisitos

- Node.js 16+ y npm 9+ o pnpm 7+ o yarn 1.22+

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
Crea un archivo `.env` en la raíz del proyecto con:
```
VITE_CLERK_PUBLISHABLE_KEY=tu_clave_aqui
```

4. Inicia el servidor de desarrollo:
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
- `.env` - Variables de entorno (crear manualmente)

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter
- `npm run check` - Verifica los tipos de TypeScript
