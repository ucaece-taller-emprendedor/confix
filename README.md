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

> La demo corre en el plan gratuito de Vercel, que es solo para uso personal y no comercial. Alcanza para esta demo académica con datos de ejemplo.

## Cómo correrla en local

Necesitás Node.js 20+ y una base Postgres (podés crear una gratis en [Neon](https://neon.tech)).

```bash
cp .env.example .env   # completá DATABASE_URL, BETTER_AUTH_SECRET y BETTER_AUTH_URL
npm install
npm run dev
```

La app queda en http://localhost:3000.

## Usuarios de prueba por rol

Todavía no hay usuarios de prueba: se agregan junto con los datos de demostración en la rama `estandar-catedra`.

## Estado

Este repo arranca con la **versión entregada en el 2do parcial**, sin cambios. Las mejoras para cumplir el estándar de la cátedra van en la rama `estandar-catedra`, con su Pull Request.

## Cómo llevarte este proyecto

1. Creá tu propia organización de GitHub.
2. Como Admin del repo, transferilo: **Settings → Danger Zone → Transfer**. Se conservan el historial, los issues y las estrellas, y los links viejos redirigen.
3. Creá tus propias cuentas de Vercel, Neon y el cliente OAuth de Google.
4. Copiá `.env.example` a `.env`, completá tus valores y desplegá.
5. Los usuarios de demo no se migran: la base de producción arranca de cero.

## Licencia

Pendiente de definir por la cátedra. Ver [LICENSE](LICENSE).
