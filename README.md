# Primeros Auxilios Emocionales

Aplicacion movil desarrollada con React Native y Expo para ofrecer apoyo inicial ante malestar emocional, ansiedad, estres o crisis emocional. El MVP esta pensado como herramienta de orientacion y autorregulacion inmediata, no como sustituto de psicoterapia, diagnostico profesional ni servicios de emergencia.

## Alcance Actual

La version actual esta enfocada en Mexico y funciona local-first:

1. Consentimiento inicial versionado.
2. Inicio con acceso visible a ayuda urgente.
3. Modo crisis offline en `/crisis`.
4. Plan de seguridad breve.
5. Evaluacion breve de seguridad, malestar, PHQ-4 y necesidad principal.
6. Resultado emocional no diagnostico.
7. Ejercicios sugeridos y seguimiento antes/despues.
8. Privacidad, exportacion local y borrado de historial.
9. Pantalla de cuenta preparada para sincronizacion futura.
10. Backend Fastify con schema SQL Server y endpoints autenticados.

El modo crisis, recursos de Mexico y datos locales no requieren cuenta.

## Fundamento Psicologico

La aplicacion se apoya en:

- Primeros Auxilios Psicologicos: seguridad, estabilizacion, apoyo practico y conexion con redes o servicios.
- Cinco principios de Hobfoll et al. (2007): seguridad, calma, autoeficacia, conexion y esperanza.
- Enfoque humanista: lenguaje empatico, validacion emocional, respeto por la autonomia y ausencia de juicio.

PHQ-4 se usa como tamizaje ultrabreve. El resultado orienta ejercicios dentro de la app, pero no diagnostica trastornos mentales.

## Crisis Mexico

La app incluye un modo `/crisis` que funciona sin login:

- Emergencias: 911.
- Linea de la Vida: 800 911 2000.
- Sitio oficial: https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000
- Contacto de confianza local.
- Checklist de seguridad inmediata.
- Opcion de grounding breve.

Los flujos de alto riesgo dirigen primero a `/crisis`: respuesta insegura o no segura, malestar 9-10, nivel severo o aumento de malestar despues de ejercicio.

## Datos Y Seguimiento

El MVP guarda localmente:

- Evaluaciones breves.
- Ejercicios completados.
- Malestar antes y despues.
- Cambio inmediato observado.
- Utilidad percibida en escala 1 a 5.
- Comentario opcional posterior al ejercicio.
- Registros emocionales.
- Estado local del plan de seguridad.
- Cola de sincronizacion pendiente.

La metrica principal del MVP es:

```text
cambio inmediato = malestar despues - malestar antes
```

Un cambio negativo indica reduccion del malestar reportado. Esta metrica describe utilidad percibida inmediata; no demuestra tratamiento, cura ni eficacia clinica por si sola.

## Backend Y Arquitectura

El backend vive en `backend/` y usa:

- Node.js con TypeScript.
- Fastify.
- Prisma.
- Azure SQL Database / SQL Server como store relacional objetivo.
- Autenticacion por bearer token; en tests existe un verificador local solo cuando `NODE_ENV === "test"`.

La app movil nunca debe conectarse directamente a SQL Server. Toda sincronizacion remota debe pasar por la API.

Endpoints principales:

- `GET /health`
- `GET /consent/current`
- `POST /me/consents`
- `GET/POST /me/assessments`
- `GET/POST /me/custom-exercises`
- `GET/POST /me/exercise-follow-ups`
- `GET/POST /me/emotion-logs`
- `GET/PUT /me/safety-plan`
- `GET/PUT/DELETE /me/trusted-contact`
- `GET/POST /me/export-events`
- `GET/POST /me/deletion-requests`

Variables requeridas fuera de `NODE_ENV=test`:

- `DATABASE_URL`: conexion SQL Server/Azure SQL para Prisma.
- `AUTH_AUDIENCE` o `ENTRA_CLIENT_ID`: audiencia esperada del token.
- `AUTH_ISSUER`: issuer del proveedor de identidad.
- `AUTH_JWKS_URL`: JWKS usado para validar firmas JWT.
- `CORS_ORIGINS`: origenes permitidos separados por coma.
- `RATE_LIMIT_MAX`: limite por ventana para rutas `/me/*` en produccion. Default: `120`.
- `RATE_LIMIT_WINDOW_MS`: ventana de rate limit. Default: `60000`.

## Sync Movil

La sincronizacion movil esta preparada con:

- `services/auth/secureTokenStore.ts` para tokens en `expo-secure-store`.
- `services/api/client.ts` para llamadas tipadas a la API.
- `services/sync/syncQueue.ts` para registros locales con `clientId`, reintentos e idempotencia.
- `services/sync/syncService.ts` para reintentar pendientes de forma manual o automatica.

Sin token de acceso, la cola no envia datos y conserva los registros pendientes. Cuando existe `EXPO_PUBLIC_API_BASE_URL`
y un token guardado, el layout principal reintenta la cola al abrir la app o volver a estado activo.

## Estructura Relevante

```text
app/crisis/index.tsx                  Modo crisis
app/account/index.tsx                 Estado de cuenta y sync
app/(tabs)/consent.tsx                Consentimiento inicial
app/(tabs)/survey.tsx                 Evaluacion breve
app/(tabs)/results.tsx                Resultado emocional
app/(tabs)/exercises/[id].tsx         Detalle y seguimiento
app/(tabs)/create-exercise.tsx        Ejercicios personalizados locales/sync
app/(tabs)/privacy-data.tsx           Privacidad, exportacion y borrado
backend/prisma/schema.prisma          Schema SQL Server
backend/src/server.ts                 API Fastify
features/crisis/*                     Recursos, copy y routing de crisis
features/privacy/consentContent.ts    Consentimiento versionado
services/api/client.ts                Cliente API movil
services/auth/secureTokenStore.ts     Tokens seguros
services/sync/syncQueue.ts            Cola local de sync
services/sync/syncService.ts          Sync manual y automatico
utils/storage.ts                      Persistencia local
utils/wellnessReport.ts               Resumen y exportacion
```

## Instalacion Y Ejecucion

Instalar dependencias moviles:

```bash
npm install
```

Iniciar Expo:

```bash
npx expo start
```

Export web:

```bash
npx expo export --platform web --output-dir dist
```

Instalar backend:

```bash
cd backend
npm install
```

## Verificacion

Mobile:

```bash
npm run test:assessment
node --test tests/localStorage.test.cjs tests/crisisRouting.test.cjs tests/crisisScreen.test.cjs tests/consent.test.cjs tests/syncQueue.test.cjs tests/phone.test.cjs
npx tsc --noEmit
npm run lint
npx expo export --platform web --output-dir dist
```

Backend:

```bash
cd backend
npm run build
npm test
```

Prisma SQL Server:

```bash
cd backend
set DATABASE_URL=sqlserver://localhost:1433;database=primeros_auxilios;user=sa;password=YOUR_STRONG_PASSWORD;encrypt=true;trustServerCertificate=true
npm run prisma:generate
npm run prisma:validate
npm run prisma:deploy
```

## Documentos Store Readiness

- `docs/store-readiness/privacy-policy-draft.md`
- `docs/store-readiness/qa-checklist.md`
- `docs/store-readiness/clinical-review-checklist.md`

## Estado Para Stores

Mas cerca de store-ready:

- Crisis mode offline y Mexico-only.
- Consentimiento y privacidad preparados.
- Exportacion y borrado local.
- Backend con auth boundaries y schema SQL.
- Sync queue local idempotente.

Antes de publicar:

- Revision clinica formal del contenido.
- Politica de privacidad revisada legalmente.
- QA en dispositivo fisico Android.
- Revision de iOS si se publica en App Store.
- Migrar `expo-av` a `expo-audio` antes de actualizar a Expo SDK 54.

## Fuentes Base

- Organizacion Mundial de la Salud. Primera ayuda psicologica: guia para trabajadores de campo. https://www.who.int/es/publications/i/item/9789241548205
- Hobfoll, S. E., Watson, P., Bell, C. C., et al. (2007). Five essential elements of immediate and mid-term mass trauma intervention: empirical evidence. https://pubmed.ncbi.nlm.nih.gov/18181708/
- Kroenke, K., Spitzer, R. L., Williams, J. B. W., & Lowe, B. (2009). An ultra-brief screening scale for anxiety and depression: the PHQ-4. https://pubmed.ncbi.nlm.nih.gov/19996233/
