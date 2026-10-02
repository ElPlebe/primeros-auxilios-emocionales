import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseJsonArray } from './localJson';
import { queueSyncRecord } from './storage';

export interface EmotionLog {
  date: string;
  emotion: string;
}

export const saveEmotion = async (newEntry: EmotionLog): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem('emotionHistory');
    const history = parseJsonArray<EmotionLog>(stored);
    const updated = [newEntry, ...history.filter(e => e.date !== newEntry.date)];
    await AsyncStorage.setItem('emotionHistory', JSON.stringify(updated));
    await queueSyncRecord('emotion_log', { ...newEntry });
  } catch (error) {
    console.error('Error saving emotion:', error);
    throw error;
  }
};

export const getEmotionHistory = async (): Promise<EmotionLog[]> => {
  try {
    const stored = await AsyncStorage.getItem('emotionHistory');
    const parsed = parseJsonArray<EmotionLog>(stored);
    return parsed.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('Error loading emotion history:', error);
    return [];
  }
};

export const getMostFrequentEmotion = (history: EmotionLog[]): string => {
  const count: Record<string, number> = {};
  history.forEach((entry) => {
    count[entry.emotion] = (count[entry.emotion] || 0) + 1;
  });
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : '';
};

export const getAverageEmotionValue = (
  history: EmotionLog[],
  emotionToValue: Record<string, number>
): number | null => {
  if (!history.length) return null;
  const total = history.reduce((acc, item) => acc + (emotionToValue[item.emotion] || 0), 0);
  return parseFloat((total / history.length).toFixed(2));
};
