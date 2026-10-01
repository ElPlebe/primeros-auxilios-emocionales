# Primeros Auxilios Emocionales

Aplicacion movil desarrollada con React Native y Expo para ofrecer apoyo inicial ante malestar emocional, ansiedad, estres o crisis emocional. El MVP esta pensado como herramienta de orientacion y autorregulacion inmediata, no como sustituto de psicoterapia, diagnostico profesional ni servicios de emergencia.

## Alcance del MVP

El flujo principal es:

1. Consentimiento inicial y aviso de alcance.
2. Inicio con acceso visible a ayuda urgente.
3. Plan de seguridad breve para momentos de crisis o malestar intenso.
4. Evaluacion breve de seguridad, malestar actual, PHQ-4 y necesidad principal.
5. Resultado emocional no diagnostico.
6. Ejercicios sugeridos.
7. Detalle del ejercicio.
8. Reevaluacion antes/despues y utilidad percibida.
9. Seguimiento local, privacidad/exportacion y resumen para revision academica.
10. Salida visible a ayuda urgente.

Este MVP no incluye IA avanzada, pagos, panel empresarial, backend clinico ni base de datos remota.

## Fundamento psicologico

La aplicacion se apoya en tres capas:

- Primeros Auxilios Psicologicos (PAP): prioriza seguridad, estabilizacion, apoyo practico, escucha respetuosa y conexion con redes o servicios.
- Cinco principios de Hobfoll et al. (2007): seguridad, calma, autoeficacia, conexion y esperanza.
- Enfoque humanista: lenguaje empatico, validacion emocional, respeto por la autonomia y ausencia de juicio.

Para la evaluacion breve se usa PHQ-4 como instrumento ultrabreve de tamizaje de sintomas de ansiedad y depresion. El resultado orienta ejercicios dentro de la app, pero no diagnostica trastornos mentales.

## Cuestionario

La evaluacion se compone de:

- Pregunta de seguridad inmediata. Si la persona no esta segura o esta en riesgo, la app dirige a `Emergency`.
- Escala de malestar actual de 0 a 10.
- PHQ-4 con puntaje total de 0 a 12.
- Necesidad principal: seguridad, calma, claridad, conexion o esperanza.

Los niveles usados por la app son:

- 0-2: minimo.
- 3-5: leve.
- 6-8: moderado.
- 9-12: severo.

## Seguimiento

El MVP guarda localmente:

- Evaluaciones breves.
- Ejercicios completados.
- Malestar antes y despues del ejercicio.
- Cambio inmediato observado.
- Utilidad percibida del ejercicio en escala de 1 a 5.
- Comentario opcional posterior al ejercicio.
- Estado local del plan de seguridad breve.

La metrica principal del MVP es:

```text
cambio inmediato = malestar despues - malestar antes
```

Un cambio negativo indica reduccion del malestar reportado. Esta metrica describe utilidad percibida inmediata; no demuestra tratamiento, cura ni eficacia clinica por si sola.

## Ayuda urgente

Si existe peligro inmediato, la app muestra la opcion de llamar a emergencias 911.

Para Mexico, la app incluye Linea de la Vida como recurso de apoyo emocional:

- Telefono: [800 911 2000](tel:+528009112000?oai_link_source=model_response_hotline)
- Sitio oficial: [https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000](https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000?oai_link_source=model_response_hotline)

## Seguridad, diseño y accesibilidad

El MVP incluye un plan de seguridad breve con cuatro pasos: lugar seguro, posibilidad de contactar a alguien, contacto de confianza y ayuda urgente. Este plan se presenta como orientacion de crisis, no como terapia.

El sistema visual usa tokens basicos centralizados para botones, tarjetas, titulos, espaciado y tamanos tactiles minimos. Las interacciones principales tienen etiquetas accesibles, area tactil minima de 48 px y estados visibles con texto ademas de color.

## Privacidad

El seguimiento actual usa AsyncStorage, por lo que la informacion se guarda localmente en el dispositivo. La app incluye una pantalla de consentimiento inicial y una seccion de privacidad/datos para revisar, exportar o borrar el historial de seguimiento guardado.

Para una prueba clinica o academica, el texto de consentimiento, resguardo de datos y criterios de derivacion deben revisarse con el asesor o la institucion participante.

## Estructura relevante

```text
app/(tabs)/index.tsx              Inicio
app/(tabs)/consent.tsx            Consentimiento inicial
app/(tabs)/survey.tsx             Evaluacion breve
app/(tabs)/results.tsx            Resultado emocional
app/(tabs)/exercises.tsx          Lista de ejercicios
app/(tabs)/exercises/[id].tsx     Detalle y seguimiento
app/(tabs)/info.tsx               Psicoeducacion
app/(tabs)/emergency.tsx          Ayuda urgente
app/(tabs)/safety-plan.tsx        Plan de seguridad breve
app/(tabs)/privacy-data.tsx       Privacidad, exportacion y borrado
app/(tabs)/summary.tsx            Resumen de seguimiento
constants/design.ts               Tokens visuales y accesibilidad
utils/assessment.ts               Logica de tamizaje y seguimiento
utils/psychoeducation.ts          Contenido psicoeducativo
utils/safetyPlan.ts               Logica del plan de seguridad
utils/storage.ts                  Persistencia local
utils/wellnessReport.ts           Resumen y exportacion de datos
tests/assessment.test.cjs         Pruebas de evaluacion
```

## Instalacion y ejecucion

Instalar dependencias:

```bash
npm install
```

Iniciar Expo:

```bash
npx expo start
```

Ejecutar en Android:

```bash
npx expo start --android
```

## Verificacion

Pruebas de la logica de evaluacion:

```bash
npm run test:assessment
```

Verificacion de tipos:

```bash
npx tsc --noEmit
```

Lint:

```bash
npm run lint
```

Export web de comprobacion:

```bash
npx expo export --platform web --output-dir dist
```

Build Android preview:

```bash
npx eas build -p android --profile preview
```

## Fuentes base

- Organizacion Mundial de la Salud. Primera ayuda psicologica: guia para trabajadores de campo. https://www.who.int/es/publications/i/item/9789241548205
- Hobfoll, S. E., Watson, P., Bell, C. C., et al. (2007). Five essential elements of immediate and mid-term mass trauma intervention: empirical evidence. https://pubmed.ncbi.nlm.nih.gov/18181708/
- Kroenke, K., Spitzer, R. L., Williams, J. B. W., & Lowe, B. (2009). An ultra-brief screening scale for anxiety and depression: the PHQ-4. https://pubmed.ncbi.nlm.nih.gov/19996233/
- National Institutes of Health. Patient Health Questionnaire 4 (PHQ-4). https://www.nih.gov/node/21506

## Pendientes recomendados

- Revision clinica del contenido por un profesional de salud mental.
- Revision institucional del texto de consentimiento para pruebas con usuarios.
- Migrar `expo-av` a `expo-audio` antes de actualizar a Expo SDK 54.
- Definir si el seguimiento seguira siendo local o si se agregara backend con seguridad y privacidad apropiadas.
