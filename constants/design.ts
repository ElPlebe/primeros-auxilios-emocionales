import { COLORS, FONTS, SIZES } from './theme';

export const ACCESSIBILITY = {
  minTouchTarget: 48,
  comfortableTouchTarget: 56,
  bodyMaxLineLength: 72
};

export const SPACING = {
  xs: SIZES.base,
  sm: SIZES.base * 1.5,
  md: SIZES.base * 2,
  lg: SIZES.padding,
  xl: SIZES.padding + SIZES.base
};

export const TYPOGRAPHY = {
  screenTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    lineHeight: 34,
    color: COLORS.text
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.text
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textMuted
  },
  bodyStrong: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted
  }
};

export const SCREEN_STYLES = {
  padded: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: SIZES.padding
  }
};

export const CARD_STYLES = {
  default: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: SPACING.md
  },
  softInfo: {
    backgroundColor: '#EAF6FF',
    borderRadius: SIZES.radius,
    padding: SPACING.md
  },
  urgent: {
    backgroundColor: '#FDECEA',
    borderColor: COLORS.error,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    padding: SPACING.md
  }
};

export const BUTTON_VARIANTS = {
  primary: {
    container: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary
    },
    text: {
      color: COLORS.card
    }
  },
  secondary: {
    container: {
      backgroundColor: COLORS.card,
      borderColor: COLORS.primary
    },
    text: {
      color: COLORS.text
    }
  },
  danger: {
    container: {
      backgroundColor: '#FDECEA',
      borderColor: COLORS.error
    },
    text: {
      color: COLORS.error
    }
  },
  ghost: {
    container: {
      backgroundColor: COLORS.card,
      borderColor: COLORS.border
    },
    text: {
      color: COLORS.text
    }
  }
};

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
