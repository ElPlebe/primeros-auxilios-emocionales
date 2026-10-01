export type PsychoeducationSectionId =
  | 'scope'
  | 'psychological-first-aid'
  | 'humanistic-approach'
  | 'screening'
  | 'exercises'
  | 'urgent-help';

export interface PsychoeducationSection {
  id: PsychoeducationSectionId;
  title: string;
  body: string[];
}

export interface EvidenceSource {
  title: string;
  description: string;
  url: string;
}

export const HOME_DISCLAIMER =
  'Esta app ofrece apoyo inicial ante malestar emocional. No sustituye psicoterapia, diagnóstico profesional ni servicios de emergencia.';

export const PRIVACY_NOTE =
  'El seguimiento del MVP se guarda de forma local en este dispositivo mediante AsyncStorage. Para pruebas clínicas debe explicarse este alcance al usuario.';

export const PSYCHOEDUCATION_SECTIONS: PsychoeducationSection[] = [
  {
    id: 'scope',
    title: 'Qué hace esta app',
    body: [
      'Primeros Auxilios Emocionales ofrece una pausa guiada para identificar cómo te sientes, elegir un ejercicio breve y observar si tu malestar cambia después.',
      'Su objetivo es orientar y acompañar en un momento difícil, no diagnosticar ni reemplazar el trabajo de profesionales de salud mental.'
    ]
  },
  {
    id: 'psychological-first-aid',
    title: 'Primeros Auxilios Psicológicos',
    body: [
      'El enfoque de PAP prioriza seguridad, apoyo práctico, escucha respetuosa y conexión con redes o servicios cuando hace falta.',
      'La app traduce esa lógica a un flujo simple: revisar seguridad, escuchar la experiencia mediante preguntas breves, sugerir una intervención y conectar con ayuda si hay riesgo.',
      'El marco de Hobfoll propone promover seguridad, calma, autoeficacia, conexión y esperanza después de situaciones adversas.'
    ]
  },
  {
    id: 'humanistic-approach',
    title: 'Enfoque humanista',
    body: [
      'La app evita juzgar o minimizar lo que la persona siente. En vez de ordenar que deje de sentir ansiedad, valida la experiencia y ofrece un siguiente paso posible.',
      'Este tono se relaciona con principios humanistas como empatía, aceptación y respeto por la autonomía de la persona.'
    ]
  },
  {
    id: 'screening',
    title: 'Evaluación breve',
    body: [
      'El cuestionario usa PHQ-4 como tamizaje ultrabreve de ansiedad y depresión, con un puntaje total de 0 a 12.',
      'Un puntaje alto no es un diagnóstico. Solo indica que conviene priorizar apoyo, regulación emocional y, si es necesario, orientación profesional.',
      'La pregunta de seguridad se evalúa aparte: si hay riesgo inmediato, la app dirige a ayuda urgente sin depender del puntaje del cuestionario.'
    ]
  },
  {
    id: 'exercises',
    title: 'Ejercicios breves',
    body: [
      'La respiración guiada busca reducir activación fisiológica y dirigir la atención al cuerpo.',
      'El grounding ayuda a volver al presente mediante los sentidos cuando la emoción se siente intensa.',
      'La escritura emocional ayuda a ordenar situación, pensamiento, emoción y un siguiente paso concreto.'
    ]
  },
  {
    id: 'urgent-help',
    title: 'Cuándo buscar ayuda',
    body: [
      'Busca ayuda urgente si estás en peligro, sientes que podrías hacerte daño, no puedes mantenerte a salvo o necesitas acompañamiento inmediato.',
      'En México, la app muestra 911 para emergencias y Línea de la Vida como apoyo emocional especializado.'
    ]
  }
];

export const EVIDENCE_SOURCES: EvidenceSource[] = [
  {
    title: 'OMS/OPS: Primera ayuda psicológica',
    description: 'Guía para brindar apoyo humano, práctico y respetuoso en situaciones de crisis.',
    url: 'https://www.who.int/es/publications/i/item/9789241548205'
  },
  {
    title: 'Hobfoll et al. (2007)',
    description: 'Cinco principios: seguridad, calma, autoeficacia, conexión y esperanza.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18181708/'
  },
  {
    title: 'PHQ-4',
    description: 'Instrumento ultrabreve de tamizaje para ansiedad y depresión.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19996233/'
  },
  {
    title: 'NIH: PHQ-4 en español',
    description: 'Ficha del instrumento con archivos en inglés y español.',
    url: 'https://www.nih.gov/node/21506'
  },
  {
    title: 'Línea de la Vida',
    description: 'Recurso de apoyo emocional para México.',
    url: 'https://www.gob.mx/conasama/articulos/linea-de-la-vida-800-911-2000'
  }
];
