import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface EmotionMessageProps {
  title: string;
  message: string;
  type?: 'low' | 'moderate' | 'high'; // opcional
  style?: ViewStyle;
}

export default function EmotionMessage({ title, message, type = 'moderate', style }: EmotionMessageProps) {
  const backgroundColors = {
    low: '#DFF8EB',
    moderate: '#E6F0FA',
    high: '#FFE5E0'
  };

  const borderColors = {
    low: '#4CAF50',
    moderate: '#4A90E2',
    high: '#E74C3C'
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColors[type], borderLeftColor: borderColors[type] }, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderLeftWidth: 6,
    marginBottom: SIZES.base * 2
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4
  },
  message: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted
  }
});
