import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { ACCESSIBILITY, BUTTON_VARIANTS, ButtonVariant } from '../constants/design';
import { COLORS, FONTS, SIZES } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint
}: PrimaryButtonProps) {
  const variantStyles = BUTTON_VARIANTS[variant];

  return (
    <TouchableOpacity
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      activeOpacity={0.82}
      disabled={disabled}
      style={[
        styles.button,
        variantStyles.container,
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, variantStyles.text, disabled && styles.disabledText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    borderWidth: 1,
    minHeight: ACCESSIBILITY.minTouchTarget,
    paddingHorizontal: SIZES.base * 2,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 22,
    textAlign: 'center'
  },
  disabledButton: {
    opacity: 0.58
  },
  disabledText: {
    color: COLORS.textMuted
  }
});
