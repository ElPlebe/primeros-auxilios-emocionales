import type { ExerciseId } from './assessment';

export type ExerciseCategory =
  | 'crisis'
  | 'regulacion-corporal'
  | 'orientacion-presente'
  | 'activacion'
  | 'claridad'
  | 'autocompasion';

export type ExerciseModality = 'audio' | 'texto' | 'cuerpo' | 'contacto';

export interface ExerciseCatalogItem {
  id: ExerciseId;
  title: string;
  description: string;
  goal: string;
  category: ExerciseCategory;
  categoryLabel: string;
  recommendedWhen: string;
  avoidWhen: string;
  durationMinutes: number;
  modalities: ExerciseModality[];
  steps: string[];
  evidence: string;
  imageAsset: string;
  audioAsset?: string;
  priority: 'primary' | 'secondary';
}

export const EXERCISE_CATALOG: Record<ExerciseId, ExerciseCatalogItem> = {
  ayuda: {
    id: 'ayuda',
    title: 'Contacto con ayuda urgente',
    description: 'Prioriza apoyo humano y servicios inmediatos si hay riesgo o no puedes mantenerte a salvo.',
    goal: 'Conectar rápido con una persona o servicio que pueda ayudarte a reducir riesgo.',
    category: 'crisis',
    categoryLabel: 'Seguridad y crisis',
    recommendedWhen: 'Úsalo si hay peligro, ideas de hacerte daño, malestar 9-10 o necesitas acompañamiento ahora.',
    avoidWhen: 'No lo sustituyas por ejercicios individuales si hay riesgo inmediato.',
    durationMinutes: 2,
    modalities: ['contacto', 'texto'],
    steps: [
      'Si hay peligro inmediato, llama al 911.',
      'Si puedes, avisa a una persona de confianza dónde estás y qué necesitas.',
      'Usa Línea de la Vida si necesitas hablar con alguien ahora.',
      'Permanece en un lugar acompañado, visible o con menor acceso a objetos de riesgo.',
      'Buscar ayuda es una decisión de cuidado, no una falla personal.'
    ],
    evidence: 'Primeros Auxilios Psicológicos y Safety Planning Intervention priorizan seguridad, conexión y apoyo práctico.',
    imageAsset: 'assets/images/contacto-ayuda.png',
    priority: 'primary'
  },
  grounding: {
    id: 'grounding',
    title: 'Grounding 5-4-3-2-1',
    description: 'Una técnica sensorial para volver al presente cuando la emoción se siente muy intensa.',
    goal: 'Orientarte al aquí y ahora usando estímulos externos y lenguaje concreto.',
    category: 'orientacion-presente',
    categoryLabel: 'Volver al presente',
    recommendedWhen: 'Úsalo si hay ansiedad intensa, sensación de irrealidad, bloqueo, llanto o pensamientos acelerados.',
    avoidWhen: 'Si un sentido te incomoda, omítelo y usa otro; no fuerces cerrar los ojos.',
    durationMinutes: 4,
    modalities: ['texto', 'cuerpo'],
    steps: [
      'Di en voz baja: estoy en este lugar y este momento ya está ocurriendo.',
      'Mira y nombra 5 cosas que puedes ver.',
      'Toca 4 objetos cercanos y describe su textura.',
      'Escucha 3 sonidos distintos, cercanos o lejanos.',
      'Detecta 2 olores o sensaciones corporales.',
      'Elige 1 acción pequeña y segura que puedas hacer ahora.'
    ],
    evidence: 'Grounding se usa clínicamente para orientar al presente; la evidencia directa aún es limitada, por eso no debe sustituir apoyo urgente.',
    imageAsset: 'assets/images/grounding.png',
    priority: 'primary'
  },
  respiracion: {
    id: 'respiracion',
    title: 'Respiración guiada',
    description: 'Respiración lenta y flexible para bajar activación corporal sin forzar el aire.',
    goal: 'Reducir activación fisiológica con exhalaciones más largas que la inhalación.',
    category: 'regulacion-corporal',
    categoryLabel: 'Calmar el cuerpo',
    recommendedWhen: 'Úsalo si notas tensión, respiración rápida, presión en el pecho o ansiedad moderada.',
    avoidWhen: 'Si te mareas, vuelve a respirar normal; no retengas el aire si se siente incómodo.',
    durationMinutes: 3,
    modalities: ['audio', 'cuerpo'],
    steps: [
      'Apoya ambos pies en el suelo o encuentra una postura estable.',
      'Inhala suave por la nariz durante 3 o 4 segundos.',
      'Exhala lento durante 5 o 6 segundos, sin forzar.',
      'Si aparece mareo, pausa y respira normal.',
      'Repite 5 ciclos y observa si tu cuerpo cambió aunque sea un poco.'
    ],
    evidence: 'Las intervenciones respiratorias pueden reducir ansiedad, aunque su efecto depende de técnica, contexto y comodidad personal.',
    imageAsset: 'assets/images/respiracion-decorativa.png',
    audioAsset: 'assets/audios/respiracion-guiada.mp3',
    priority: 'primary'
  },
  relajacion: {
    id: 'relajacion',
    title: 'Relajación muscular progresiva',
    description: 'Tensa y suelta grupos musculares para notar diferencia entre tensión y descanso.',
    goal: 'Regular estrés y ansiedad desde el cuerpo mediante tensión breve y liberación.',
    category: 'regulacion-corporal',
    categoryLabel: 'Calmar el cuerpo',
    recommendedWhen: 'Úsalo si sientes rigidez, mandíbula apretada, hombros tensos o inquietud corporal.',
    avoidWhen: 'Evita tensar zonas con dolor, lesión o indicación médica; solo imagina soltar esa parte.',
    durationMinutes: 5,
    modalities: ['texto', 'cuerpo'],
    steps: [
      'Aprieta suavemente los puños durante 4 segundos y suelta.',
      'Sube los hombros hacia las orejas durante 4 segundos y suelta.',
      'Aprieta piernas y pies durante 4 segundos y suelta.',
      'Relaja mandíbula, frente y lengua.',
      'Nota qué parte quedó un poco menos tensa y respira normal.'
    ],
    evidence: 'La relajación muscular progresiva cuenta con revisión sistemática favorable para estrés, ansiedad y depresión.',
    imageAsset: 'assets/images/respiracion.png',
    priority: 'primary'
  },
  movimiento: {
    id: 'movimiento',
    title: 'Movimiento suave',
    description: 'Una activación corporal breve para salir de congelamiento, inquietud o baja energía.',
    goal: 'Dar al cuerpo una salida segura y pequeña cuando la emoción está trabada o acumulada.',
    category: 'activacion',
    categoryLabel: 'Activación breve',
    recommendedWhen: 'Úsalo si estás congelado/a, sin energía, inquieto/a o con necesidad de mover tensión.',
    avoidWhen: 'Evítalo si moverte aumenta riesgo, dolor, mareo o hay indicación médica de reposo.',
    durationMinutes: 3,
    modalities: ['audio', 'cuerpo'],
    steps: [
      'Mueve lentamente los hombros hacia atrás tres veces.',
      'Abre y cierra las manos diez veces.',
      'Si puedes, camina dentro del lugar durante un minuto.',
      'Estira brazos y cuello sin forzar.',
      'Elige una acción pequeña para los próximos 10 minutos: agua, luz, mensaje o sentarte en un lugar seguro.'
    ],
    evidence: 'La activación conductual y el movimiento breve pueden apoyar energía, autoeficacia y salida de evitación.',
    imageAsset: 'assets/images/ejercicio-fisico-suave.png',
    audioAsset: 'assets/audios/ejercicio-fisico-suave.mp3',
    priority: 'primary'
  },
  escritura: {
    id: 'escritura',
    title: 'Escritura emocional',
    description: 'Ordena situación, pensamiento, emoción y siguiente paso realista.',
    goal: 'Convertir una experiencia confusa en palabras y un paso posible.',
    category: 'claridad',
    categoryLabel: 'Claridad emocional',
    recommendedWhen: 'Úsalo si ya estás relativamente a salvo y necesitas entender lo que sientes.',
    avoidWhen: 'Si estás en crisis intensa o escribir te activa más, vuelve primero a grounding o contacto.',
    durationMinutes: 6,
    modalities: ['texto'],
    steps: [
      'Escribe qué ocurrió o qué detonó el malestar.',
      'Anota el pensamiento que apareció con más fuerza.',
      'Nombra la emoción principal y ponle intensidad del 0 al 10.',
      'Escribe una interpretación alternativa que no niegue lo difícil.',
      'Elige un paso pequeño y realista para las próximas horas.'
    ],
    evidence: 'La escritura expresiva muestra efectos pequeños y más duraderos cuando se practica en sesiones repetidas.',
    imageAsset: 'assets/images/escritura-emocional.png',
    priority: 'secondary'
  },
  visualizacion: {
    id: 'visualizacion',
    title: 'Visualización calmante',
    description: 'Imagina un lugar seguro o neutral para reducir tensión cuando ya puedes prestar atención.',
    goal: 'Usar imaginación guiada como apoyo complementario de calma.',
    category: 'regulacion-corporal',
    categoryLabel: 'Calmar el cuerpo',
    recommendedWhen: 'Úsalo si puedes concentrarte y una imagen mental suele tranquilizarte.',
    avoidWhen: 'Evítalo si cerrar los ojos, imaginar o quedarte quieto/a aumenta miedo o recuerdos dolorosos.',
    durationMinutes: 5,
    modalities: ['audio', 'texto'],
    steps: [
      'Mantén los ojos abiertos o cerrados, como te resulte más seguro.',
      'Imagina un lugar tranquilo, real o inventado.',
      'Agrega detalles de temperatura, luz, sonidos y distancia.',
      'Recuerda que puedes salir de la imagen cuando quieras.',
      'Vuelve mirando un objeto real frente a ti.'
    ],
    evidence: 'La imaginería guiada puede reducir ansiedad como intervención complementaria, aunque requiere ajuste a la persona.',
    imageAsset: 'assets/images/visualizacion-calmante.png',
    audioAsset: 'assets/audios/visualizacion-calmante.mp3',
    priority: 'secondary'
  },
  escucha: {
    id: 'escucha',
    title: 'Escucha consciente',
    description: 'Audio guiado para atender sonidos presentes sin tener que buscar contenido externo.',
    goal: 'Anclar atención a sonidos y disminuir sensación de aislamiento o saturación.',
    category: 'orientacion-presente',
    categoryLabel: 'Volver al presente',
    recommendedWhen: 'Úsalo si necesitas una guía auditiva simple y el sonido te resulta regulador.',
    avoidWhen: 'Evítalo si el silencio, audífonos o ciertos sonidos te incomodan; usa grounding visual/táctil.',
    durationMinutes: 4,
    modalities: ['audio', 'texto'],
    steps: [
      'Elige un volumen cómodo y seguro.',
      'Mantén la mirada abierta o en un punto fijo.',
      'Nota un sonido cercano y luego uno lejano.',
      'Cuando tu mente se vaya a otro tema, vuelve suavemente al sonido.',
      'Termina nombrando una acción concreta que harás ahora.'
    ],
    evidence: 'Las intervenciones musicales o auditivas pueden apoyar reducción de estrés; funcionan mejor como complemento.',
    imageAsset: 'assets/images/escucha-consciente.png',
    audioAsset: 'assets/audios/escucha-consciente.mp3',
    priority: 'secondary'
  },
  afirmaciones: {
    id: 'afirmaciones',
    title: 'Autocompasión breve',
    description: 'Frases realistas de cuidado para responderte con menos juicio.',
    goal: 'Validar lo difícil sin obligarte a sentirte bien de inmediato.',
    category: 'autocompasion',
    categoryLabel: 'Autocompasión',
    recommendedWhen: 'Úsalo si hay autocrítica, vergüenza o necesidad de hablarte con más cuidado.',
    avoidWhen: 'Evítalo como primera opción si hay riesgo o malestar 9-10; primero seguridad y grounding.',
    durationMinutes: 3,
    modalities: ['audio', 'texto'],
    steps: [
      'Di: esto que siento es difícil.',
      'Di: no tengo que resolver todo en este momento.',
      'Di: puedo tomar un paso pequeño de cuidado.',
      'Elige una frase que sí te suene creíble.',
      'Repite esa frase tres veces, lentamente.'
    ],
    evidence: 'La autocompasión se relaciona con menor ansiedad y depresión; se presenta aquí como apoyo, no como solución única.',
    imageAsset: 'assets/images/afirmaciones-positivas.png',
    audioAsset: 'assets/audios/afirmaciones-positivas.mp3',
    priority: 'secondary'
  },
  afirmacionesAnsiedad: {
    id: 'afirmacionesAnsiedad',
    title: 'Frases para ansiedad',
    description: 'Guía auditiva secundaria para recordar que una ola de ansiedad puede subir y bajar.',
    goal: 'Acompañar ansiedad leve o moderada con frases creíbles y respiración normal.',
    category: 'autocompasion',
    categoryLabel: 'Autocompasión',
    recommendedWhen: 'Úsalo si ya descartaste peligro inmediato y quieres una guía verbal suave.',
    avoidWhen: 'No lo uses como única herramienta si la ansiedad se siente inmanejable o aumenta.',
    durationMinutes: 4,
    modalities: ['audio', 'texto'],
    steps: [
      'Mantén una postura cómoda sin forzar inmovilidad.',
      'Escucha cada frase y quédate solo con la que parezca creíble.',
      'Respira normal si respirar profundo se siente incómodo.',
      'Recuerda que ansiedad intensa merece apoyo, no lucha solitaria.',
      'Al terminar, decide si necesitas grounding, contacto o descanso.'
    ],
    evidence: 'Las frases de afrontamiento pueden apoyar regulación cuando son realistas y no invalidantes.',
    imageAsset: 'assets/images/afirmaciones-ansiedad.png',
    audioAsset: 'assets/audios/afirmaciones-ansiedad.mp3',
    priority: 'secondary'
  }
};

export const EXERCISE_LIST = Object.values(EXERCISE_CATALOG);

export const PRIMARY_EXERCISES = EXERCISE_LIST.filter((exercise) => exercise.priority === 'primary');
