export type EmotionLabel = 'Bien' | 'Calma' | 'Neutral' | 'Ansiedad' | 'Tristeza';

export interface EmotionOption {
  emoji: string;
  label: EmotionLabel;
  value: number;
}

export const MIN_EMOTION_LOGS_FOR_GRAPH = 3;

export const EMOTION_OPTIONS: EmotionOption[] = [
  { emoji: '😄', label: 'Bien', value: 5 },
  { emoji: '🙂', label: 'Calma', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 3 },
  { emoji: '😟', label: 'Ansiedad', value: 2 },
  { emoji: '😢', label: 'Tristeza', value: 1 }
];

const legacyEmotionLabels: Record<string, EmotionLabel> = {
  Tranquilo: 'Calma',
  Ansioso: 'Ansiedad',
  Triste: 'Tristeza'
};

export const emotionToValue: Record<string, number> = EMOTION_OPTIONS.reduce<Record<string, number>>(
  (acc, emotion) => {
    acc[emotion.label] = emotion.value;
    return acc;
  },
  {
    Tranquilo: 4,
    Ansioso: 2,
    Triste: 1
  }
);

export const getEmotionDisplayLabel = (emotion: string): string => legacyEmotionLabels[emotion] ?? emotion;

export const getEmotionValue = (emotion: string): number => emotionToValue[emotion] ?? 0;

export const valueToEmotion = (val: number): string =>
  EMOTION_OPTIONS.find((emotion) => emotion.value === val)?.label ?? '';
