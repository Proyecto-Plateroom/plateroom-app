# PlateRoom

> **Nota importante sobre el estado actual:**
> - Hemos identificado problemas con la sincronización en tiempo real entre múltiples clientes debido a limitaciones técnicas con WebSockets en el entorno de producción.
> - La aplicación funciona correctamente en modo individual: puedes añadir platos y completar rondas sin problemas.
> - Es posible que aparezcan mensajes de error de conexión después de períodos de inactividad.
>
> **Estado del desarrollo:**
> - Esta es una versión en desarrollo activo.
> - Funcionalidades pendientes de implementar:
>   - Revisión de rondas anteriores
>   - Cierre de pedidos desde el panel de administración
>   - Sincronización en tiempo real entre múltiples clientes
>   - Y muchas más mejoras planeadas

Sistema de gestión de pedidos para restaurantes con servicio de buffet a la carta, diseñado para ofrecer una experiencia fluida tanto para clientes como para personal del restaurante.

## Descripción del Proyecto

PlateRoom es una solución todo-en-uno para restaurantes que ofrecen servicio de buffet a la carta, especialmente diseñada para establecimientos de sushi y cocina asiática. La plataforma permite a los clientes realizar pedidos directamente desde su mesa a través de una interfaz intuitiva, mientras que el personal de cocina recibe y gestiona los pedidos en tiempo real.

**Características principales:**
- Sistema de pedidos en tiempo real con WebSockets
- Gestión de mesas y salas del restaurante
- Menú digital con imágenes y descripciones detalladas
- Panel de control para el personal de cocina
- Autenticación y autorización segura con Clerk
- Integración con Supabase para gestión de datos

## Enlace a la Demo

[https://plateroom.arnaugra.eu/](https://plateroom.arnaugra.eu/)

## Capturas de Pantalla

*Sección pendiente de actualizar con capturas de la aplicación en funcionamiento.*
![Vista Home / Gestor de  Pedidos](/readme_files/home.png)
![Vista Gestor de Menús](/readme_files/menu.png)
![Vista Gestor de Mesas](/readme_files/mesas.png)
![Vista Gestor de Platos](/readme_files/platos.png)
![Vista Pública (orden)](/readme_files/orden.png)

## Integración con Clerk

PlateRoom utiliza Clerk para la autenticación y gestión de usuarios, aprovechando las siguientes características:

1. **Autenticación de Usuarios**
   - Inicio de sesión con múltiples proveedores (Google, correo electrónico y username)
   - Gestión de sesiones seguras

2. **Organizaciones (SaaS Multi-tenant)**
   - Cada restaurante opera como una organización independiente
   - Gestión de miembros del equipo

3. **Integración con Supabase RLS**
   - Las políticas de Row Level Security (RLS) de Supabase están vinculadas a los usuarios autenticados de Clerk
   - Restricciones de acceso basadas en la organización del usuario
   - Seguridad a nivel de fila para garantizar el aislamiento de datos entre organizaciones

## Detalles Técnicos

Aplicación web desarrollada con React, TypeScript y Vite, con autenticación mediante Clerk y Supabase como BaaS.

## Características

- Autenticación de usuarios con Clerk
- Interfaz moderna y responsiva
- Desarrollada con React 19 y TypeScript
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
   npx supabase init
   
   # Inicia los contenedores de Supabase
   npx supabase start
   ```

   **Para usos posteriores**, solo necesitarás ejecutar:
   ```bash
   npx supabase start
   ```

   Para detener Supabase:
   ```bash
   npx supabase stop
   ```

   Si necesitas reiniciar la instancia de Supabase (por ejemplo, después de hacer cambios en la configuración):
   ```bash
   npx supabase stop --no-backup && npx supabase start
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
  - `/components/` - Componentes reutilizables
  - `/contexts/` - Contextos de React para estado global
  - `/hooks/` - Hooks personalizados
  - `/pages/` - Vistas principales de la app
    - `/Room/` - (ejemplo)
      - `Room.tsx` - Componente principal
      - `/components/` - Componentes específicos
  - `/services/` - Servicios y lógica de acceso a datos externos (APIs, Supabase, etc.)
  - `/utils/` - Funciones utilitarias y helpers
  - `/entities/` - Entidades del dominio
  - `types.ts` - Tipos de la aplicación
  - `App.tsx` - Componente principal
  - `main.tsx` - Punto de entrada de la aplicación
- `/public` - Archivos públicos
- `/supabase` - Configuración de Supabase (se crea al ejecutar `npx supabase init`)
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
- `npm run supabase:restart` - (alternativa cómoda) Reinicia la instancia de Supabase

## Almacenamiento en Supabase

### Configuración del Bucket

Para el almacenamiento de archivos, se utiliza el bucket `plateroom-images` en Supabase Storage. Este bucket debe tener las siguientes políticas configuradas:

1. **Política de inserción (upload)**:
   - Ruta del archivo debe comenzar con `[organization_id]/`
   - Autenticación requerida

2. **Política de lectura (select)**:
   - Acceso público a los archivos

### Ejemplo de código para subir archivos

```typescript
// 1. Subir el archivo
const fileExt = file.name.split('.').pop();
const fileName = `${userId}-${Date.now()}.${fileExt}`;
const filePath = `${organizationId}/dishes/${fileName}`;

const { error: uploadError } = await supabase
  .storage
  .from('plateroom-images')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });

// 2. Obtener la URL pública
const { data: { publicUrl } } = supabase
  .storage
  .from('plateroom-images')
  .getPublicUrl(filePath);
```

## Migraciones de Base de Datos con Supabase

### Crear una nueva migración

Para crear una nueva migración, ejecuta:
```bash
npx supabase migration new nombre_de_la_migracion
```
Esto generará un archivo SQL en la carpeta `supabase/migrations/`.

### Aplicar migraciones en local

Asegúrate de que Supabase local esté corriendo:
```bash
npx supabase start
```

Para aplicar solo las migraciones pendientes en tu entorno local:
```bash
npx supabase migration up
```

Si necesitas borrar la base de datos local y volver a aplicar todas las migraciones desde cero (útil para desarrollo):
```bash
npx supabase db reset
```
Esto recreará la base de datos local y aplicará todas las migraciones desde el principio.

### Subir migraciones a la instancia en la nube

Para subir migraciones a tu instancia de Supabase en la nube, sigue estos pasos:

1. **Haz login en Supabase CLI** (solo la primera vez o si cambias de cuenta):
```bash
npx supabase login
```

2. **Vincula tu proyecto local con tu proyecto en la nube** (solo la primera vez en este repositorio o si cambias de proyecto):
```bash
npx supabase link
```
Esto te pedirá el `project-ref`, que puedes ver en la URL del panel de Supabase.

3. **Sube las migraciones pendientes a la base de datos en la nube:**
```bash
npx supabase db push
```

Más información en la [documentación oficial de Supabase](https://supabase.com/docs/guides/database/migrations).
