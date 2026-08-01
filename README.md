# CapeForge

Tracker comunitario de requisitos para capas de RuneScape 3, construido con Next.js 16, React 19, shadcn, Prisma 7 y PostgreSQL.

## Funciones incluidas

- Landing pública y diseño adaptable a móvil.
- Registro e inicio de sesión con usuario y contraseña.
- Recuperación mediante pregunta secreta, con bloqueo temporal tras varios intentos.
- Sesiones seguras almacenadas en PostgreSQL.
- Primera cuenta registrada como administradora.
- Panel de capas con Completionist disponible y Trimmed/MQC preparadas para el futuro.
- 4.155 logros importados desde `public/Comp Req.xlsx`.
- 102 requisitos Comp, búsqueda, filtros, paginación y progreso por jugador.
- Panel de administración para roles y activación de cuentas.

## Puesta en marcha

Requiere Node.js 20.19 o posterior y pnpm.

1. Copia `.env.example` como `.env` y configura `DATABASE_URL` y `SESSION_SECRET`.
2. Instala dependencias con `pnpm install`.
3. Genera el cliente con `pnpm db:generate`.
4. Aplica la base con `pnpm db:deploy`.
5. Importa el catálogo con `pnpm db:seed`.
6. Inicia el sitio con `pnpm dev`.

La primera persona que se registre recibe el rol de administrador y los 31 checks originales del Excel. Las cuentas siguientes comienzan con todos los requisitos pendientes.

## Producción

Configura las mismas variables de entorno en el proveedor de hosting y ejecuta `pnpm build`. La URL de PostgreSQL nunca debe incluirse en Git. Si una credencial fue compartida por chat, rótala antes de publicar.
