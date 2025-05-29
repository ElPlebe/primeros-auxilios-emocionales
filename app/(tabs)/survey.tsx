import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import ValidationMessage from '../../components/ValidationMessage';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const questions: string[] = [
  "Hoy me siento muy ansioso o alterado.",
  "Siento que no puedo controlar mis pensamientos negativos.",
  "He tenido pensamientos de rendirme o no querer continuar.",
  "Me cuesta respirar o me siento con presión en el pecho.",
  "Siento que no tengo a nadie con quien hablar."
];

const scaleLabels: string[] = ["Nada", "Poco", "Regular", "Mucho", "Demasiado"];

export default function SurveyScreen() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex: number, value: number) => {
    const updated = [...answers];
    updated[qIndex] = value;
    setAnswers(updated);
  };

  const isComplete = answers.every(a => a !== -1);

  const handleSubmit = () => {
    setSubmitted(true);
    const total = answers.reduce((sum, val) => sum + val, 0);
    let level: 'leve' | 'moderado' | 'alto' = 'leve';

    if (total > 10) level = 'alto';
    else if (total > 5) level = 'moderado';

    setTimeout(() => {
      router.push({ pathname: '/results', params: { level } });
    }, 2500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!submitted ? (
        <>
          <Text style={styles.title}>Encuesta emocional</Text>
          <Text style={styles.subtitle}>Responde sinceramente cómo te has sentido hoy:</Text>

          {questions.map((q, qIndex) => (
            <View key={qIndex} style={styles.questionBlock}>
              <Text style={styles.question}>{q}</Text>
              <View style={styles.optionsRow}>
                {scaleLabels.map((label, val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.optionButton,
                      answers[qIndex] === val && styles.optionSelected
                    ]}
                    onPress={() => handleSelect(qIndex, val)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answers[qIndex] === val && styles.optionTextSelected
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {isComplete && (
            <PrimaryButton title="Ver resultado" onPress={handleSubmit} />
          )}
        </>
      ) : (
        <ValidationMessage
          title="¡Encuesta enviada!"
          message="Gracias por darte este momento para cuidar tu bienestar emocional."
        />
      )}
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
    marginBottom: SIZES.base
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.padding
  },
  questionBlock: {
    marginBottom: SIZES.padding
  },
  question: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E0E6ED',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },
  optionSelected: {
    backgroundColor: COLORS.primary
  },
  optionText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: FONTS.bold
  }
});
