import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { EMOTION_OPTIONS, EmotionLabel, getEmotionDisplayLabel } from '../../utils/emotionScale';
import { EmotionLog, getEmotionHistory, saveEmotion } from '../../utils/emotionUtils';

export default function DailyCheckinScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<EmotionLabel | null>(null);
  const [history, setHistory] = useState<EmotionLog[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getEmotionHistory();
      setHistory(data);
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert('Selecciona una emoción');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newLog: EmotionLog = { date: today, emotion: selected };

    try {
      await saveEmotion(newLog);
      const updated = await getEmotionHistory();
      setHistory(updated);
      setSelected(null);
      Alert.alert('Registro guardado', 'Gracias por registrar cómo te sientes hoy.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar tu registro. Intenta nuevamente.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      <Text style={styles.subtitle}>Elige la opción que más se acerque a este momento.</Text>

      <View style={styles.emotionGrid}>
        {EMOTION_OPTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.label}
            accessibilityHint="Toca dos veces para elegir esta emoción."
            accessibilityLabel={`Emoción ${emotion.label}${selected === emotion.label ? ', seleccionada' : ''}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === emotion.label }}
            style={[
              styles.emotionButton,
              selected === emotion.label && styles.emotionSelected
            ]}
            onPress={() => setSelected(emotion.label)}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text style={[styles.label, selected === emotion.label && styles.labelSelected]}>
              {emotion.label}
            </Text>
            {selected === emotion.label && <Text style={styles.selectedText}>Seleccionado</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton
        title="Registrar emoción"
        onPress={handleSubmit}
        style={styles.primaryButton}
        accessibilityHint="Guarda la emoción seleccionada en el historial de hoy."
      />

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historial reciente</Text>
        <TouchableOpacity
          accessibilityHint="Abre la gráfica de evolución emocional."
          accessibilityLabel="Ver gráfica emocional"
          accessibilityRole="button"
          onPress={() => router.push('../emotion-graph')}
        >
          <Text style={styles.historyLink}>Ver gráfica</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyCard}>
        {history.length === 0 ? (
          <Text style={styles.empty}>Aún no hay registros disponibles.</Text>
        ) : (
          history.slice(0, 5).map((item) => (
            <Text key={item.date} style={styles.historyItem}>
              {item.date}: {getEmotionDisplayLabel(item.emotion)}
            </Text>
          ))
        )}
      </View>

      <PrimaryButton
        title="Ver evolución emocional"
        onPress={() => router.push('../emotion-graph')}
        variant="secondary"
        style={styles.secondaryButton}
        accessibilityHint="Abre la pantalla de evolución emocional."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.padding
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SIZES.padding
  },
  emotionButton: {
    width: '48%',
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1
  },
  emotionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  emoji: {
    fontSize: 34,
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center'
  },
  labelSelected: {
    color: '#fff'
  },
  selectedText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginTop: 4
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.padding
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.base
  },
  historyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text
  },
  historyLink: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: SIZES.padding
  },
  historyItem: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: 6
  },
  empty: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center'
  },
  secondaryButton: {
    marginBottom: 0
  }
});
