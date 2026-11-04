# Confix

Marketplace de servicios para el hogar (plomería, electricidad, pintura, carpintería): el cliente busca, compara y pide cotización a profesionales verificados. Roles: cliente, profesional y admin.

> Proyecto del **Taller Emprendedor** · Universidad CAECE (Mar del Plata) · cohorte 2026 2C.
> Docentes: Franco Vinciguerra y Luis Orviz Friser.

## El problema

Contratar a un profesional confiable para el hogar es difícil: faltan referencias, comparación de precios y garantías.

## Equipo

- [jofiblanco99-droid](https://github.com/jofiblanco99-droid)

## Demo

[https://v0-confix.vercel.app](https://v0-confix.vercel.app)

> La demo corre en el plan gratuito de Vercel (Hobby), que es **solo para uso personal y no comercial**. Alcanza para esta demo académica con datos de ejemplo; si el proyecto pasa a ser un negocio, hay que contratar un plan que lo permita.

## Cómo está organizada

| Ruta | Qué es |
| --- | --- |
| `/` | Landing pública (`app/(public)`) con botones **Ingresar** y **Registrarme**. |
| `/app/...` | App de usuarios, mobile first (`app/(app)/app`). Registro e ingreso con email y contraseña o con Google. Al registrarte elegís **cliente** o **profesional**. |
| `/admin/...` | Panel de administración (`app/admin`). Solo login, **sin registro público**. |

Carpetas: `lib/auth` (sesión, roles, `requireRole`/`checkRole`), `lib/db` (esquema y migraciones versionadas con drizzle-kit), `lib/validations` (esquemas Zod, siempre validados en el servidor), `lib/actions` (server actions), `components/`, `scripts/` (migración, seed y admins) y `tests/` (Playwright).

**Roles.** Cada server action y cada página llama a `requireRole` / `checkRole`, que verifica sesión y rol en el servidor; ocultar un botón nunca es la seguridad. `proxy.ts` es solo una primera barrera.

- **Cliente**: busca profesionales y pide cotizaciones.
- **Profesional**: se registra en `/app` y queda **pendiente** hasta que un admin lo aprueba. Recién ahí aparece en las búsquedas.
- **Admin**: gestiona usuarios, aprobación de profesionales, solicitudes y el catálogo (categorías y barrios). Los admins **no** salen de ningún registro público: ver `ADMIN_EMAILS` más abajo.

## Cómo correrla en local

Necesitás Node.js 20+ y una base Postgres (podés crear una gratis en [Neon](https://neon.tech) o levantar una con Docker).

```bash
npm install
cp .env.example .env     # completá DATABASE_URL, BETTER_AUTH_SECRET y BETTER_AUTH_URL
npm run db:migrate       # crea las tablas y el catálogo base (categorías y barrios)
npm run db:seed          # opcional: datos de DEMO y usuarios de prueba
npm run dev
```

La app queda en http://localhost:3000. Si falta o está mal alguna variable, la app no arranca y te dice cuál.

Otros comandos: `npm run lint`, `npm run build`, `npm run db:generate` (genera una migración nueva después de tocar `lib/db/schema.ts`; no se edita la base a mano) y `npm test` (test de humo con Playwright; necesita la base migrada y con el seed).

Para correr el test la primera vez: `npx playwright install chromium`. Si el puerto 3000 está ocupado, usá otro y poné la misma URL en `BETTER_AUTH_URL`: `PORT=3100 npm test`.

## Variables de entorno

Todas están documentadas en [`.env.example`](.env.example) y se validan con Zod al arrancar.

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión a Postgres. |
| `BETTER_AUTH_SECRET` | Sí | Secreto de sesiones (mínimo 32 caracteres: `openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | Sí | URL pública de la app (local: `http://localhost:3000`). |
| `ADMIN_EMAILS` | No | Emails admin separados por coma. |
| `ADMIN_INITIAL_PASSWORD` | No | Contraseña inicial que usa `npm run db:admins`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Habilitan Google. Van las dos juntas o ninguna. |

### Cómo se crean los admins

1. Poné tu email en `ADMIN_EMAILS` (y una `ADMIN_INITIAL_PASSWORD` de al menos 8 caracteres).
2. Corré `npm run db:admins`: crea la cuenta si no existe (o la promueve si ya existe) con rol admin.
3. Ingresá en `/admin/login` y cambiá la contraseña.

Si ya tenés Google configurado, un email de `ADMIN_EMAILS` que ingrese con Google (email verificado) también queda como admin. El registro con email y contraseña **nunca** da rol admin, aunque el email esté en la lista.

### Google OAuth

El botón de Google aparece solo si están `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`; si faltan, la pantalla muestra un aviso y se puede seguir con email y contraseña. En Google Cloud creá un cliente OAuth de tipo *Aplicación web* y cargá estas URI de redirección:

- Local: `http://localhost:3000/api/auth/callback/google`
- Producción: `https://<tu-dominio>/api/auth/callback/google`

## Usuarios de prueba por rol (DEMO)

> **Son datos de ejemplo para mostrar en clase.** Los crea `npm run db:seed`, están marcados como demo en la base (`esDemo`) y la contraseña es pública: **no los uses en producción real.** Volver a correr el seed borra y recrea solo los datos demo.

| Rol | Email | Contraseña | Dónde ingresar |
| --- | --- | --- | --- |
| Cliente | `cliente@demo.confix.test` | `Demo-2026!` | `/app/ingresar` |
| Profesional (aprobado) | `profesional@demo.confix.test` | `Demo-2026!` | `/app/ingresar` |
| Admin | `admin@demo.confix.test` | `Demo-2026!` | `/admin/login` |

El seed también carga 8 profesionales de ejemplo (el de la cuenta demo es Esteban Gómez) y una solicitud de muestra.

## Estado

Este repo parte de la **versión entregada en el 2do parcial**. La rama `estandar-catedra` la lleva al estándar de la cátedra (landing, `/app`, `/admin`, base de datos real, migraciones, CI y tests) conservando pantallas, textos e identidad visual.

## Cómo llevarte este proyecto

1. Creá tu propia organización de GitHub.
2. Como Admin del repo, transferilo: **Settings → Danger Zone → Transfer**. Se conservan el historial, los issues y las estrellas, y los links viejos redirigen.
3. Creá tus propias cuentas de Vercel, Neon y el cliente OAuth de Google.
4. Copiá `.env.example` a `.env`, completá tus valores y desplegá.
5. Los usuarios de demo no se migran: la base de producción arranca de cero.

## Licencia

Pendiente de definir por la cátedra. Ver [LICENSE](LICENSE).
