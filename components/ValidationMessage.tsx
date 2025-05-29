import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface ValidationMessageProps {
  title: string;
  message: string;
}

export default function ValidationMessage({ title, message }: ValidationMessageProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.base * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  icon: {
    marginBottom: SIZES.base
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center'
  }
});
