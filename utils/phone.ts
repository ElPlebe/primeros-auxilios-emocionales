export interface NormalizedPhoneLinks {
  dialPhone: string;
  whatsappPhone: string;
}

export function normalizeMexicoPhoneForLinks(value: string): NormalizedPhoneLinks | null {
  const digits = value.replace(/\D/g, '');

  if (/^\d{10}$/.test(digits)) {
    return {
      dialPhone: `+52${digits}`,
      whatsappPhone: `52${digits}`
    };
  }

  if (/^52\d{10}$/.test(digits)) {
    return {
      dialPhone: `+${digits}`,
      whatsappPhone: digits
    };
  }

  return null;
}
