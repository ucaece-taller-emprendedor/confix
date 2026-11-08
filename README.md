# CONFIX — Taller Emprendedor (UCAECE Mar del Plata)

CONFIX es un marketplace de **servicios para el hogar** (plomería, electricidad, pintura y carpintería): el **cliente** busca por categoría y barrio, compara profesionales verificados con reseñas y precios, y pide una cotización; el **profesional** se registra (queda *pendiente* hasta que el equipo lo aprueba), arma su perfil y servicios y gestiona los pedidos que recibe; el **admin** aprueba o suspende profesionales, gestiona usuarios y el catálogo, y ve las solicitudes. Está construida desde la plantilla común del Taller. **Todo gratis y sin tarjeta** (Firebase plan Spark + GitHub).

Sitio: https://confix-mdp.web.app (cuando se despliegue) · Proyecto Firebase: `confix-mdp`.

> Es la migración a Firebase de la versión original en Next.js + Postgres (rama `estandar-catedra` del repo `confix`). Mismo diseño, textos y pantallas; ver "Diferencias con la versión original" al final.

## Qué incluye

| Parte | Ruta | Descripción |
|---|---|---|
| Web pública | `/` | Landing: problema, solución, cómo funciona, beneficios, llamado a la acción, botones Ingresar / Registrarme |
| Explorar (público) | `/app`, `/app/buscar`, `/app/profesional/:id` | Inicio con categorías, búsqueda por texto / categoría / barrio / disponibilidad, perfil del profesional con servicios, precios y reseñas |
| Cuenta de clientes y profesionales | `/app/registro`, `/app/ingresar` | Registro y login (Google y email/contraseña), sesión persistente, elección de tipo de usuario. Mobile first |
| Cliente | `/app/solicitud`, `/app/mis-solicitudes` | Pedir cotización (servicios, dirección, día y franja, contacto) y seguirla; puede cancelarla |
| Profesional | `/app/panel` | Estado de aprobación, perfil y servicios, solicitudes recibidas (aceptar / rechazar / completar) |
| Administración | `/admin/...` | Solo login (sin registro). Resumen, profesionales (aprobar / suspender), usuarios, solicitudes y catálogo (categorías y barrios) |

**Stack:** Vite + React + TypeScript estricto + Tailwind + React Router · Firebase (Auth + Firestore + Hosting) · Zod · ESLint · Playwright · GitHub Actions. Sin servidor propio, sin Cloud Functions, sin Storage.

## Correrlo en tu computadora (con emuladores, sin tocar producción)

Necesitás [Node.js 20+](https://nodejs.org) y [Java 21+](https://adoptium.net) (los emuladores de Firebase lo usan).

```bash
npm install
npm run emuladores        # terminal 1: emuladores de Auth y Firestore (UI en http://127.0.0.1:4690)
npm run seed              # terminal 2: carga el catálogo, los profesionales y los usuarios DEMO
npm run dev:emulador      # terminal 2: la app en http://localhost:5680
```

Los emuladores empiezan vacíos cada vez que se reinician: volvé a correr `npm run seed`. (Los puertos son propios de CONFIX para poder tener varias startups de la cátedra corriendo a la vez.)

### Usuarios de prueba (DEMO, claves públicas, solo existen en los emuladores)

Contraseña de todos: `Demo-Clave-2026`

| Tipo | Email | Estado |
|---|---|---|
| Cliente | `cliente.demo@confix.test` | activo (tiene una solicitud de ejemplo) |
| Profesional | `profesional.demo@confix.test` | activo: "Esteban Gómez", carpintero aprobado, con la solicitud de ejemplo para aceptar |
| Profesional pendiente | `pendiente.demo@confix.test` | perfil "Paula Pendiente" sin aprobar (para practicar la aprobación desde el admin) |
| Admin | `admin.demo@confix.test` | entra en `/admin/login` |

Además hay 7 profesionales de ejemplo más (plomería, electricidad, pintura, carpintería) sin cuenta para ingresar. Todo lo demo está marcado `isDemo`, con la etiqueta DEMO donde corresponde. Las fotos y reseñas son ficticias.

> **Login con Google:** no se puede probar contra los emuladores (Google no autentica en local). Se prueba en el sitio publicado.

## Variables de entorno

Copiá `.env.example` a `.env` y completá con la config web de Firebase (Consola → Configuración del proyecto → Tus apps). **No son secretos** (van en el navegador), la seguridad la dan las reglas de Firestore. Para el sitio publicado, esos mismos valores van en `.env.production` (este sí se sube a git).

| Variable | Qué es |
|---|---|
| `VITE_FIREBASE_API_KEY`, `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._APP_ID`, `..._MESSAGING_SENDER_ID` | Config web del proyecto Firebase |
| `VITE_USE_EMULATORS` | `true` solo en `.env.emulador` (ya viene así) |

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev:emulador` | App local contra emuladores |
| `npm run lint` · `npm run build` | Calidad (ESLint, TypeScript estricto, build) |
| `npm run test:reglas` | Tests de las reglas de seguridad (emulador de Firestore) |
| `npm run test:e2e` | Tests de humo con Playwright (emuladores de Auth + Firestore) |
| `npm test` | Los dos anteriores |
| `npm run seed` | Carga los datos DEMO en los emuladores |
| `npm run catalogo` · `npm run catalogo:prod` | Carga las categorías y barrios base (emuladores / producción) |
| `npm run admin:dar -- email@x.com` | Hace administrador a una cuenta (contra emuladores) |

## Seguridad: cómo está pensada

- **Las reglas de Firestore (`firestore.rules`) son la validación del servidor.** Esconder botones no protege nada: toda lectura y escritura pasa por las reglas.
- **Admin** = *custom claim* `admin: true` en el token de la persona. Nadie puede dárselo desde la app; solo se otorga con el script de `firebase-admin` (ver abajo).
- Un usuario **no puede cambiar su propio rol ni su estado** de aprobación. Los profesionales se crean `pendiente` y solo el admin los activa.
- **Los perfiles de profesionales solo son públicos si están aprobados.** Aprobar o suspender cambia el perfil y el usuario en un solo *batch*, y las reglas exigen que los dos queden consistentes.
- **Las solicitudes** solo las ven el cliente que las pidió, el profesional destinatario y el admin (el teléfono viaja ahí). El total se recalcula en las reglas (ítems + visita) y el estado solo cambia por transiciones válidas (el profesional acepta / rechaza / completa; el cliente cancela).
- Un profesional no puede inventarse puntaje, reseñas ni trabajos realizados: las reglas los fijan en cero al crear el perfil y después no se pueden tocar.
- **Límites por las reglas de Firestore** (cortan a las 1000 expresiones evaluadas): hasta **5 servicios** por perfil y **5 servicios distintos** por solicitud (la versión original admitía 8). Las reglas no verifican que el precio de cada ítem coincida con el del perfil: es un valor orientativo que el profesional confirma al cotizar.
- Los formularios se validan con **Zod** en el cliente (mensajes claros) y las reglas validan tipos, enums y campos permitidos.
- Los tests de `tests/rules` prueban estos casos (escalada de rol, leer datos ajenos, publicar siendo pendiente, etc.).

## Administradores

Los admins no se registran: se les da el permiso a una cuenta existente.

- **Local (emuladores):** `npm run admin:dar -- persona@mail.com`
- **Producción:** GitHub → Actions → **Dar admin** → *Run workflow* → email. La persona primero debe registrarse en la app (o crearse la cuenta en la consola de Firebase) y después **cerrar sesión y volver a entrar**.

Para que el workflow funcione el responsable del proyecto configura **una sola vez**:

1. **Cuenta de servicio con permisos mínimos.** En Google Cloud Console → IAM → *Cuentas de servicio* → crear `admin-dar` con solo estos roles: **Administrador de Firebase Authentication** (`roles/firebaseauth.admin`) y **Usuario de Cloud Datastore** (`roles/datastore.user`, para escribir el perfil en Firestore). Nada más.
2. **Cargar la credencial como secreto:** repo de GitHub → Settings → Secrets and variables → Actions → *New repository secret* → `FIREBASE_ADMIN_SA_JSON` con el contenido del JSON de la clave. Y una *variable* (no secreto) `FIREBASE_PROJECT_ID` con el id del proyecto.
3. **Si la organización no permite crear claves** (política `iam.disableServiceAccountKeyCreation`, común en cuentas institucionales): usar *Workload Identity Federation* — sin claves. En `admin-dar.yml` reemplazar `credentials_json` por `workload_identity_provider` y `service_account` ([guía de `google-github-actions/auth`](https://github.com/google-github-actions/auth#workload-identity-federation)). Si tampoco es posible, otorgar el claim desde una computadora con `npm run admin:dar:prod -- email` usando `gcloud auth application-default login`.

> Nunca subas ni pegues la clave JSON en el repo, en un chat ni en un issue. `.gitignore` ya bloquea los nombres típicos.

## Cómo desplegar (lo hace el responsable del proyecto)

1. Crear el proyecto en [Firebase Console](https://console.firebase.google.com) (**plan Spark**, no activar Blaze), habilitar *Authentication* (Email/contraseña y Google), *Firestore* (modo producción) y *Hosting*. Registrar una app web y copiar su config a `.env.production`.
2. El id del proyecto (`confix-mdp`) ya está en `.firebaserc` y `.env.production`.
3. Subir las reglas: `npx firebase deploy --only firestore:rules,firestore:indexes` (o `npm run deploy:reglas`).
   - **Cargar el catálogo base** (categorías y barrios; sin esto la app queda vacía): `FIREBASE_PROJECT_ID=confix-mdp npm run catalogo:prod` con credenciales de Google (`gcloud auth application-default login`). Después el admin los edita desde `/admin/catalogo`.
   - **Dar el primer admin** (ver más abajo): el seed de demo NO corre en producción.
4. Conectar GitHub ↔ Hosting **una sola vez**: `npx firebase init hosting:github` (crea la cuenta de servicio y carga el secreto `FIREBASE_SERVICE_ACCOUNT_...` en GitHub; **no se crea ni se sube a mano**). Ajustar el nombre del secreto en `.github/workflows/deploy.yml` si hace falta.
5. Desde ahí, **cada merge a `main` publica la web** (`.github/workflows/deploy.yml`). Las reglas se vuelven a desplegar con el paso 3 cuando cambian.
6. En Authentication → Configuración → Dominios autorizados, verificar que figure el dominio `.web.app` del sitio (para el login con Google).

CI (`.github/workflows/ci.yml`): en cada PR corre lint, build, tests de reglas y Playwright contra emuladores.

## Límites del plan Spark (gratis, sin tarjeta)

- **Firestore:** 1 GiB almacenado, 50.000 lecturas y 20.000 escrituras por día (y 20.000 borrados). Las lecturas que hacen las reglas con `get()` también cuentan.
- **Hosting:** 10 GB almacenados y ~360 MB de transferencia por día.
- **Authentication:** email/contraseña y Google sin costo, hasta ~3.000 usuarios activos por día.
- **No hay** Cloud Functions ni Cloud Storage (por eso las imágenes son archivos del propio sitio, en `public/`, o URLs).
- Al llegar al tope diario, Firebase **corta el servicio hasta el día siguiente** (no cobra): por eso no hace falta tarjeta **mientras no activen el plan Blaze**. No lo activen.

## Cómo llevarte este proyecto

Cuando un alumno quiere quedarse con el proyecto:

1. **GitHub:** el dueño actual va a *Settings → General → Danger Zone → Transfer* y transfiere el repo a la cuenta del nuevo responsable (que tiene que aceptar la transferencia por mail).
2. **Firebase:** en la Consola → *Configuración del proyecto → Usuarios y permisos* → *Agregar miembro* → el email del nuevo responsable con rol **Propietario (Owner)**.
3. El nuevo responsable entra, comprueba que ve el proyecto, y recién entonces **la cátedra se quita** de Usuarios y permisos.
4. Volver a correr `firebase init hosting:github` desde su cuenta para que el despliegue automático use su credencial, y revisar los secretos/variables de Actions (`FIREBASE_PROJECT_ID`, etc.).

No hace falta tarjeta de crédito en ningún paso mientras sigan en el plan Spark.

## Estructura

```
src/
  config/app.ts          ← marca, roles, textos de la landing (lo primero que se cambia)
  lib/tipos.ts           ← tipos de los documentos (profesionales, solicitudes) y formatos
  lib/CatalogoContext    ← catálogo público en tiempo real (categorías, barrios, profesionales aprobados)
  lib/SolicitudContext   ← solicitud en armado (servicios elegidos)
  styles/tema.css        ← colores, radio y tipografía (variables CSS)
  lib/firebase/          ← inicialización de Firebase (emuladores o producción)
  lib/validations/       ← esquemas Zod de los formularios
  auth/                  ← AuthContext, useAuth y guardas RequireAuth / RequireRole / RequireAdmin
  components/            ← UI común y layouts
  pages/public|app|admin ← pantallas
  hooks/                 ← useColeccion (Firestore en tiempo real)
scripts/                 ← seed.ts, admin-dar.ts
tests/rules, tests/e2e   ← reglas (vitest) y humo (Playwright)
firestore.rules · firestore.indexes.json · firebase.json
.github/workflows/       ← ci.yml, deploy.yml, admin-dar.yml
```

Guía para convertir la plantilla en una startup nueva: [`docs/NUEVA-STARTUP.md`](docs/NUEVA-STARTUP.md).

## Diferencias con la versión original (Next.js + Postgres)

- **Mismo diseño, textos y pantallas** (landing, inicio, buscar, perfil, solicitud, mis solicitudes, panel del profesional, admin). Cambió la base técnica: ahora todo corre en el navegador contra Firestore, sin servidor propio.
- **El tipo de usuario se elige al registrarse** (cliente o profesional). Antes un cliente podía pasar a profesional desde "Quiero ofrecer mis servicios"; ahora son dos tipos de cuenta separados. Un profesional pendiente puede completar su perfil pero no aparece en las búsquedas hasta que lo aprueba el admin.
- **El primer admin ya no es "la primera cuenta"**: el admin se da con un *custom claim* (ver "Administradores"). `/admin` no tiene registro.
- **Máximo 5 servicios** por perfil y por solicitud (antes 8 y 10), por el límite de evaluación de las reglas.
- **El admin ya no cambia roles** de usuarios (solo suspende / reactiva clientes y aprueba / suspende profesionales); no puede existir un cliente "convertido" sin perfil.
- Las fotos de los 8 profesionales de ejemplo viajan como archivos del sitio (`public/profesionales/*.webp`, reducidas); los profesionales nuevos no pueden subir foto (no hay Cloud Storage en Spark) y muestran sus iniciales.
- Las reseñas son solo las del catálogo de ejemplo: igual que en la versión original, todavía no hay forma de dejar una reseña nueva.
- El número de solicitud (`CFX-XXXXXX`) se genera en el navegador.

## Licencia

Pendiente de definir por la cátedra (ver `LICENSE`).
