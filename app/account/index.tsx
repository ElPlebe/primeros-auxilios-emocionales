import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { CONSENT_COPY } from '../../features/privacy/consentContent';
import { getAccessToken } from '../../services/auth/secureTokenStore';
import { syncPendingQueue } from '../../services/sync/syncService';
import { getSyncQueue, saveSyncQueue } from '../../utils/storage';

const ACCOUNT_STATUS_ITEMS = [
  'La app funciona localmente sin cuenta.',
  'El inicio de sesion aun no muestra una pantalla para usuario final.',
  'La sincronizacion reintenta pendientes si existe API configurada, token valido y consentimiento.',
  'Los tokens se guardan fuera de AsyncStorage.',
  'El modo crisis y los recursos de Mexico seguiran disponibles sin iniciar sesion.'
];

export default function AccountScreen() {
  const [hasToken, setHasToken] = useState(false);
  const [pendingRecords, setPendingRecords] = useState(0);
  const [lastSyncStatus, setLastSyncStatus] = useState('Sin sincronizaciones recientes');

  const refreshStatus = async () => {
    const [token, queue] = await Promise.all([getAccessToken(), getSyncQueue()]);
    setHasToken(Boolean(token));
    setPendingRecords(queue.filter((record) => record.status === 'pending' || record.status === 'failed').length);
  };

  useEffect(() => {
    refreshStatus()
      .catch(() => {
        Alert.alert('No se pudo leer el estado de sincronizacion', 'Intenta abrir esta pantalla nuevamente.');
      });
  }, []);

  const retrySync = async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      Alert.alert('API no configurada', 'Define EXPO_PUBLIC_API_BASE_URL para probar sincronizacion.');
      return;
    }

    const result = await syncPendingQueue({
      baseUrl,
      getAccessToken,
      getSyncQueue,
      saveSyncQueue
    });
    await refreshStatus();
    setLastSyncStatus(result);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Cuenta</Text>
      <Text style={styles.title}>Sincronizacion proximamente</Text>
      <Text style={styles.subtitle}>
        Este MVP ya prepara la cola remota, pero todavia necesita conectar el login real del proveedor de identidad.
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
          Estado: {hasToken ? 'sesion local detectada' : 'sin sesion activa'}. Registros pendientes: {pendingRecords}.
          Sin cuenta activa no se envia informacion al backend. Los registros nuevos permanecen en este dispositivo hasta
          que exista una sesion valida y aceptes sincronizar.
        </Text>
        <Text style={styles.body}>Ultimo intento: {lastSyncStatus}</Text>
      </View>

      <PrimaryButton
        title="Intentar sincronizar pendientes"
        onPress={retrySync}
        disabled={!hasToken || pendingRecords === 0}
        style={styles.syncButton}
        accessibilityHint="Reintenta enviar registros pendientes al backend configurado."
      />

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
  },
  syncButton: {
    marginBottom: SIZES.base
  }
});
