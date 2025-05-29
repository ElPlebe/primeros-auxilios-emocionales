import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import ExerciseCard from '../../components/ExerciseCard';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getCompletedExercises } from '../../utils/storage';

const exerciseTitles: Record<string, string> = {
  respiracion: 'Respiración guiada',
  grounding: 'Grounding 5-4-3-2-1',
  afirmaciones: 'Afirmaciones positivas',
  journaling: 'Escritura emocional',
  audio: 'Escucha consciente',
  ayuda: 'Contacto con ayuda urgente'
};

interface EmotionLog {
  date: string;
  emotion: string;
}

export default function ProfileScreen() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const isDarkMode = scheme === 'dark';

  const [completed, setCompleted] = useState<string[]>([]);
  const [history, setHistory] = useState<EmotionLog[]>([]);
  const [mostFrequent, setMostFrequent] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCompletedExercises();
        setCompleted(data);

        const emotionData = await AsyncStorage.getItem('emotionHistory');
        if (emotionData) {
          const parsed: EmotionLog[] = JSON.parse(emotionData);
          const sorted = parsed.sort((a, b) => (a.date < b.date ? 1 : -1));
          setHistory(sorted);
          calculateFrequentEmotion(parsed);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateFrequentEmotion = (data: EmotionLog[]) => {
    const count: Record<string, number> = {};
    data.forEach((item) => {
      count[item.emotion] = (count[item.emotion] || 0) + 1;
    });
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    setMostFrequent(sorted[0]?.[0] || '');
  };

  const clearHistory = async () => {
    Alert.alert('¿Borrar historial?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('emotionHistory');
            setHistory([]);
            setMostFrequent('');
          } catch (error) {
            console.error('Error clearing history:', error);
          }
        }
      }
    ]);
  };

  const lastEmotion = history.length > 0 ? history[0].emotion : 'N/A';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu perfil emocional</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Días registrados: {history.length}</Text>
        <Text style={styles.summaryText}>Emoción más frecuente: {mostFrequent}</Text>
        <Text style={styles.summaryText}>Última emoción registrada: {lastEmotion}</Text>
      </View>

      {history.length > 0 && (
        <PrimaryButton
          title="Borrar historial emocional"
          onPress={clearHistory}
          style={{ marginBottom: 24, backgroundColor: COLORS.error }}
        />
      )}

      <Text style={styles.subtitle}>Ejercicios completados</Text>

      {completed.length === 0 ? (
        <Text style={styles.message}>Aún no has completado ningún ejercicio.</Text>
      ) : (
        <FlatList
          data={completed}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ExerciseCard title={exerciseTitles[item] || item} onPress={() => {}} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flex: 1
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  summaryBox: {
    backgroundColor: '#ECF0F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24
  },
  summaryText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginBottom: 6
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginVertical: SIZES.base
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: SIZES.base
  }
});
