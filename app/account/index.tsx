import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { CONSENT_COPY } from '../../features/privacy/consentContent';

const ACCOUNT_STATUS_ITEMS = [
  'La app funciona localmente sin cuenta.',
  'El inicio de sesion y la sincronizacion aun no estan activos.',
  'Cuando se habilite, la sincronizacion requerira consentimiento y guardara tokens fuera de AsyncStorage.',
  'El modo crisis y los recursos de Mexico seguiran disponibles sin iniciar sesion.'
];

export default function AccountScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Cuenta</Text>
      <Text style={styles.title}>Sincronizacion proximamente</Text>
      <Text style={styles.subtitle}>
        Este MVP esta listo para conectar una cuenta, pero todavia no muestra formularios de login ni simula una sesion.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>Estado actual</Text>
        {ACCOUNT_STATUS_ITEMS.map((item) => (
          <Text key={item} style={styles.item}>
            - {item}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{CONSENT_COPY.backendSync.title}</Text>
        <Text style={styles.body}>{CONSENT_COPY.backendSync.body}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pendientes de sincronizacion</Text>
        <Text style={styles.body}>
          Sin cuenta activa no se envia informacion al backend. Los registros nuevos permanecen en este dispositivo hasta
          que exista una sesion valida y aceptes sincronizar.
        </Text>
      </View>

      <PrimaryButton
        title="Login no disponible en este MVP"
        onPress={() => undefined}
        disabled
        accessibilityHint="El inicio de sesion se habilitara en una fase posterior."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: SIZES.padding
  },
  kicker: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 28,
    marginBottom: SIZES.base
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: SIZES.padding
  },
  statusCard: {
    backgroundColor: '#EAF6FF',
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 2,
    padding: 16
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: SIZES.base * 2,
    padding: 16
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: 10
  },
  body: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22
  },
  item: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 23
  }
});
