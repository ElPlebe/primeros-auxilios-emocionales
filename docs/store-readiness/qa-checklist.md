# Checklist QA Para Store Readiness

## Dispositivos Y Plataformas

- Android fisico: instalar build preview y recorrer flujo completo.
- Android fisico sin red: abrir `/crisis`, ver 911, Linea de la Vida, contacto de confianza y checklist.
- Android con red: validar `tel:` para 911 y Linea de la Vida.
- iOS simulador o fisico si entra al alcance de publicacion.
- Web export: ejecutar `expo export --platform web --output-dir dist` para detectar errores de render estatico.

## Flujos Criticos

- Primer inicio muestra consentimiento.
- Boton de ayuda urgente abre `/crisis`.
- Respuesta insegura o no segura en encuesta abre `/crisis`.
- Malestar 9-10 o resultado severo prioriza accion de crisis antes de ejercicios.
- Aumento de malestar despues de ejercicio muestra accion de crisis.
- `/emergency` permanece como pagina secundaria de recursos.

## Datos Locales

- Historial emocional corrupto no crashea inicio, perfil, privacidad ni resumen.
- Exportacion local incluye resumen y registros esperados.
- Borrado local elimina historial de seguimiento y conserva contacto de confianza.
- Contacto de confianza normaliza telefonos de Mexico para llamada y WhatsApp.

## Backend

- `/health` responde `{ ok: true }`.
- Rutas `/me/*` rechazan acceso anonimo.
- Usuario A no ve registros de Usuario B.
- Backend rechaza rangos invalidos: malestar fuera de 0-10, PHQ-4 fuera de 0-12 y utilidad fuera de 1-5.
- Backend rechaza telefonos que no correspondan a Mexico en formato E.164.
- Prisma schema valida con `DATABASE_URL` SQL Server.

## Sync

- Sin token, la cola local devuelve `skipped_no_auth`.
- Reintentar el mismo `clientId` no crea duplicados locales.
- Error de red deja registros como pendientes o fallidos con `attemptCount`.
- Registro sincronizado pasa a estado `synced`.

## Accesibilidad Y Contenido

- Acciones principales tienen etiquetas o texto visible.
- Botones de crisis tienen area tactil suficiente.
- No hay textos de plantilla en ingles.
- No se usan textos diagnosticos para resultados.
- Privacidad explica datos locales, sincronizacion futura, exportacion y eliminacion.

## Store Listing

- Descripcion aclara que la app no reemplaza emergencias ni atencion profesional.
- Capturas muestran crisis mode, consentimiento, evaluacion, ejercicios y privacidad.
- Politica de privacidad publicada coincide con comportamiento real de datos.
- Incluir Mexico-only en recursos de emergencia para esta version.

