// components/ExerciseCard.tsx

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface ExerciseCardProps {
  title: string;
  onPress: () => void;
}

export default function ExerciseCard({ title, onPress }: ExerciseCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: SIZES.base * 2,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: SIZES.base * 1.5
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text
  }
});
