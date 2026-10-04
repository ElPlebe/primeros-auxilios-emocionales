import { exchangeCodeAsync, makeRedirectUri } from 'expo-auth-session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { buildAuth0Config } from '../services/auth/auth0Config';
import {
  clearPendingAuth0Request,
  getPendingAuth0Request
} from '../services/auth/auth0PendingRequest';
import { persistAuth0Tokens } from '../services/auth/auth0Session';

WebBrowser.maybeCompleteAuthSession();

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatAuth0ErrorMessage(error: string, description?: string) {
  const detail = description ? `\n\nDetalle: ${description}` : '';
  return `Auth0 devolvio un error: ${error}.${detail}`;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const auth0Config = useMemo(
    () =>
      buildAuth0Config(
        undefined,
        makeRedirectUri({
          path: 'auth',
          scheme: 'primerosauxiliosemocionales'
        })
      ),
    []
  );
  const [message, setMessage] = useState('Completando inicio de sesion...');
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const completeLogin = async () => {
      const code = getSingleParam(params.code);
      const callbackState = getSingleParam(params.state);
      const error = getSingleParam(params.error);
      const errorDescription = getSingleParam(params.error_description);

      if (error) {
        setMessage(formatAuth0ErrorMessage(error, errorDescription));
        setCanContinue(true);
        return;
      }

      if (!code) {
        setMessage('No se recibio un codigo valido de Auth0.');
        setCanContinue(true);
        return;
      }

      const pendingRequest = await getPendingAuth0Request();
      if (!pendingRequest) {
        setMessage('No se encontro una solicitud de login pendiente. Intenta iniciar sesion de nuevo.');
        setCanContinue(true);
        return;
      }

      if (pendingRequest.state && callbackState !== pendingRequest.state) {
        await clearPendingAuth0Request();
        setMessage('La respuesta de Auth0 no coincide con la solicitud original.');
        setCanContinue(true);
        return;
      }

      try {
        const tokenResponse = await exchangeCodeAsync(
          {
            clientId: auth0Config.clientId,
            code,
            extraParams: {
              code_verifier: pendingRequest.codeVerifier
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
        await clearPendingAuth0Request();
        router.replace('/account');
      } catch {
        setMessage('No se pudo completar el inicio de sesion. Revisa Auth0 e intenta nuevamente.');
        setCanContinue(true);
      }
    };

    completeLogin();
  }, [auth0Config, params.code, params.error, params.error_description, params.state, router]);

  return (
    <View style={styles.container}>
      {!canContinue && <ActivityIndicator color={COLORS.primary} size="large" />}
      <Text style={styles.title}>Cuenta</Text>
      <Text style={styles.message}>{message}</Text>
      {canContinue && (
        <PrimaryButton
          title="Volver a cuenta"
          onPress={() => router.replace('/account')}
          accessibilityHint="Regresa a la pantalla de cuenta para intentar iniciar sesion de nuevo."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 26,
    marginBottom: SIZES.base,
    marginTop: SIZES.base * 2
  },
  message: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: SIZES.padding,
    textAlign: 'center'
  }
});
