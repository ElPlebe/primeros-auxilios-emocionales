import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import {
  EVIDENCE_SOURCES,
  HOME_DISCLAIMER,
  PRIVACY_NOTE,
  PSYCHOEDUCATION_SECTIONS
} from '../../utils/psychoeducation';
import { useRouter } from 'expo-router';

export default function InfoScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Psicoeducación</Text>
      <Text style={styles.subtitle}>{HOME_DISCLAIMER}</Text>

      {PSYCHOEDUCATION_SECTIONS.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.body.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
          ))}
        </View>
      ))}

      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>Privacidad del MVP</Text>
        <Text style={styles.paragraph}>{PRIVACY_NOTE}</Text>
      </View>

      <Text style={styles.sourcesTitle}>Fuentes base</Text>
      {EVIDENCE_SOURCES.map((source) => (
        <TouchableOpacity
          key={source.url}
          style={styles.sourceCard}
          onPress={() => Linking.openURL(source.url)}
        >
          <Text style={styles.sourceTitle}>{source.title}</Text>
          <Text style={styles.sourceDescription}>{source.description}</Text>
        </TouchableOpacity>
      ))}

      <PrimaryButton
        title="Realizar evaluación breve"
        onPress={() => router.push('/survey')}
        style={{ marginTop: SIZES.padding }}
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
    marginBottom: SIZES.base
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SIZES.padding
  },
  section: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: SIZES.base * 1.5
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 6
  },
  paragraph: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 6
  },
  privacyBox: {
    backgroundColor: '#EAF6FF',
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 5,
    borderRadius: SIZES.radius,
    padding: 14,
    marginTop: SIZES.base,
    marginBottom: SIZES.padding
  },
  privacyTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4
  },
  sourcesTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.base
  },
  sourceCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: SIZES.base
  },
  sourceTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 2
  },
  sourceDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted
  }
});
