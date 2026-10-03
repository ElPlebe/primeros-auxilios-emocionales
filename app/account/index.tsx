import { exchangeCodeAsync, ResponseType, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { CONSENT_COPY } from '../../features/privacy/consentContent';
import { buildAuth0Config } from '../../services/auth/auth0Config';
import { clearAuth0Session, persistAuth0Tokens } from '../../services/auth/auth0Session';
import { getAccessToken } from '../../services/auth/secureTokenStore';
import { syncPendingQueue } from '../../services/sync/syncService';
import { getSyncQueue, saveSyncQueue } from '../../utils/storage';

WebBrowser.maybeCompleteAuthSession();

const ACCOUNT_STATUS_ITEMS = [
  'La app funciona localmente sin cuenta.',
  'El inicio de sesion usa Auth0 Universal Login con PKCE.',
  'La sincronizacion reintenta pendientes si existe API configurada, token valido y consentimiento.',
  'Los tokens se guardan fuera de AsyncStorage.',
  'El modo crisis y los recursos de Mexico seguiran disponibles sin iniciar sesion.'
];

export default function AccountScreen() {
  const auth0Config = useMemo(() => buildAuth0Config(), []);
  const [hasToken, setHasToken] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [pendingRecords, setPendingRecords] = useState(0);
  const [lastSyncStatus, setLastSyncStatus] = useState('Sin sincronizaciones recientes');
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: auth0Config.clientId,
      extraParams: {
        audience: auth0Config.audience
      },
      redirectUri: auth0Config.redirectUri,
      responseType: ResponseType.Code,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true
    },
    auth0Config.discovery
  );

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

  useEffect(() => {
    const exchangeCode = async () => {
      if (response?.type !== 'success') {
        return;
      }

      const code = response.params.code;
      const codeVerifier = request?.codeVerifier;
      if (!code || !codeVerifier) {
        Alert.alert('Login incompleto', 'Auth0 no devolvio un codigo valido para completar la sesion.');
        return;
      }

      setIsAuthBusy(true);
      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: auth0Config.clientId,
            code,
            extraParams: {
              code_verifier: codeVerifier
            },
            redirectUri: auth0Config.redirectUri
          },
          auth0Config.discovery
        );
        await persistAuth0Tokens({
          accessToken: tokenResponse.accessToken,
          idToken: tokenResponse.idToken,
          refreshToken: tokenResponse.refreshToken
        });
        await refreshStatus();
        setLastSyncStatus('Sesion iniciada');
      } catch {
        Alert.alert('No se pudo iniciar sesion', 'Revisa la configuracion de Auth0 e intenta nuevamente.');
      } finally {
        setIsAuthBusy(false);
      }
    };

    exchangeCode();
  }, [auth0Config, request?.codeVerifier, response]);

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

  const login = async () => {
    setIsAuthBusy(true);
    try {
      await promptAsync();
    } catch {
      Alert.alert('No se pudo abrir Auth0', 'Intenta de nuevo en unos momentos.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const logout = async () => {
    const logoutUrl = `${auth0Config.issuer}v2/logout?client_id=${encodeURIComponent(
      auth0Config.clientId
    )}&returnTo=${encodeURIComponent(auth0Config.redirectUri)}`;
    setIsAuthBusy(true);
    try {
      await WebBrowser.openAuthSessionAsync(logoutUrl, auth0Config.redirectUri);
    } finally {
      await clearAuth0Session();
      await refreshStatus();
      setLastSyncStatus('Sesion cerrada');
      setIsAuthBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Cuenta</Text>
      <Text style={styles.title}>Cuenta y sincronizacion</Text>
      <Text style={styles.subtitle}>
        Inicia sesion con Auth0 para habilitar sincronizacion remota. El modo crisis sigue disponible sin cuenta.
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

      {hasToken ? (
        <PrimaryButton
          title="Cerrar sesion"
          onPress={logout}
          disabled={isAuthBusy}
          accessibilityHint="Cierra tu sesion de Auth0 en este dispositivo."
        />
      ) : (
        <PrimaryButton
          title="Iniciar sesion con Auth0"
          onPress={login}
          disabled={!request || isAuthBusy}
          accessibilityHint="Abre Auth0 para iniciar sesion y habilitar sincronizacion."
        />
      )}
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
