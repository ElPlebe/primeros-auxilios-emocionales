import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveCompletedExercise = async (exerciseId: string) => {
  try {
    const existing = await AsyncStorage.getItem('completedExercises');
    const parsed = existing ? JSON.parse(existing) : [];
    if (!parsed.includes(exerciseId)) {
      parsed.push(exerciseId);
      await AsyncStorage.setItem('completedExercises', JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Error guardando ejercicio:', error);
  }
};

export const getCompletedExercises = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem('completedExercises');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error leyendo ejercicios completados:', error);
    return [];
  }
};
