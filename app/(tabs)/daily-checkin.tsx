import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const emotions = [
  { emoji: '😄', label: 'Bien' },
  { emoji: '🙂', label: 'Tranquilo' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😟', label: 'Ansioso' },
  { emoji: '😢', label: 'Triste' }
];

interface EmotionLog {
  date: string;
  emotion: string;
}

export default function DailyCheckinScreen() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<EmotionLog[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('emotionHistory');
      if (data) {
        const parsed: EmotionLog[] = JSON.parse(data);
        const sorted = parsed.sort((a, b) => (a.date < b.date ? 1 : -1));
        setHistory(sorted);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert('Selecciona una emoción');
      return;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const newLog = { date: today, emotion: selected };
    const updated = [newLog, ...history.filter(h => h.date !== today)];

    try {
      await AsyncStorage.setItem('emotionHistory', JSON.stringify(updated));
      setHistory(updated);
      setSelected(null);
      Alert.alert('Registro guardado', 'Gracias por registrar cómo te sientes hoy.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar tu registro. Intenta nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>

      <View style={styles.emotionRow}>
        {emotions.map((e) => (
          <TouchableOpacity
            key={e.label}
            style={[
              styles.emotionButton,
              selected === e.label && styles.emotionSelected
            ]}
            onPress={() => setSelected(e.label)}
          >
            <Text style={styles.emoji}>{e.emoji}</Text>
            <Text style={styles.label}>{e.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Registrar emoción</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Historial reciente</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <Text style={styles.historyItem}>📅 {item.date}: {item.emotion}</Text>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aún no hay registros disponibles.</Text>}
      />

      <PrimaryButton
        title="Ver evolución emocional"
        onPress={() => router.push('../emotion-graph')}
        style={{ marginTop: 24 }}
      />
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
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base
  },
  emotionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#E0E6ED',
    flex: 1,
    marginHorizontal: 4
  },
  emotionSelected: {
    backgroundColor: COLORS.primary
  },
  emoji: {
    fontSize: 28
  },
  label: {
    marginTop: 4,
    fontFamily: FONTS.regular,
    color: COLORS.text
  },
  submitButton: {
    marginTop: SIZES.base,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center'
  },
  submitText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 16
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base
  },
  historyItem: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  empty: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SIZES.base
  }
});
