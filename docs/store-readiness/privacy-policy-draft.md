# Borrador de Politica de Privacidad

Producto: Primeros Auxilios Emocionales.

Alcance geografico inicial: Mexico.

Este documento es un borrador para tesis y preparacion de publicacion. Debe revisarse con el asesor clinico, asesor academico y responsable legal antes de usarlo en stores o con participantes reales.

## Datos Que Trata La App

La app puede guardar en el dispositivo:

- Respuestas de seguridad inmediata.
- Nivel de malestar antes y despues de ejercicios.
- Puntajes PHQ-4 usados como tamizaje no diagnostico.
- Necesidad principal seleccionada.
- Ejercicios completados.
- Utilidad percibida y comentario opcional.
- Registros emocionales.
- Estado del plan breve de seguridad.
- Contacto de confianza guardado por la persona usuaria.

Estos datos pueden considerarse sensibles porque se relacionan con estado emocional, seguridad personal y bienestar psicologico.

## Uso Local De Datos

La app funciona local-first. El modo crisis, Linea de la Vida, 911, contacto de confianza y ejercicios principales deben poder verse sin cuenta.

Mientras no exista una cuenta activa y consentimiento de sincronizacion, los datos de seguimiento permanecen en el dispositivo. La persona puede exportar o borrar el historial local desde la pantalla de privacidad y datos.

## Sincronizacion Con Backend

La sincronizacion con backend es opcional. Solo debe iniciar cuando exista:

- Cuenta de usuario.
- Token guardado mediante almacenamiento seguro de plataforma.
- Consentimiento para sincronizar datos sensibles.
- Conexion disponible.

La app movil no debe conectarse directamente a SQL Server. Toda lectura o escritura remota debe pasar por la API backend.

## Backend Y Base De Datos

El backend propuesto usa Node.js, Fastify, Prisma y Azure SQL Database / SQL Server. La API debe exigir autenticacion en endpoints de datos personales y aplicar aislamiento por usuario para que una persona no pueda leer o modificar registros de otra.

Los eventos de exportacion y solicitudes de eliminacion deben registrarse para trazabilidad.

## Eliminacion De Datos

La app permite borrar historial local del dispositivo. Cuando la cuenta y sincronizacion esten activas, debe existir un flujo para solicitar eliminacion de datos sincronizados en el backend.

La eliminacion de datos sincronizados debe incluir:

- Registro de solicitud.
- Estado de procesamiento.
- Fecha de completado cuando aplique.
- Confirmacion visible para la persona usuaria.

## Recursos De Crisis Y Limitaciones

Para Mexico, la app muestra:

- Emergencias: 911.
- Linea de la Vida: 800 911 2000.
- Sitio oficial: https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000

La app ofrece orientacion inicial y ejercicios breves. No reemplaza servicios de emergencia, psicoterapia, diagnostico profesional ni atencion medica.

Si hay peligro inmediato o riesgo de hacerse dano, la persona debe usar servicios de emergencia, Linea de la Vida o su red de apoyo.

## Compartir Datos

La exportacion local usa las opciones de compartir del dispositivo. Antes de compartir, la persona debe revisar el contenido porque puede incluir informacion sensible.

La app no debe vender datos personales ni usarlos para publicidad conductual.

## Seguridad Minima Esperada

- HTTPS para comunicacion con backend.
- Tokens de acceso de vida corta.
- Refresh tokens guardados en SecureStore o equivalente de plataforma.
- Sin tokens sensibles en AsyncStorage.
- Sin credenciales de base de datos dentro de la app movil.
- Validacion de rangos y enums en backend.
- Aislamiento por usuario en todas las rutas `/me/*`.

