import * as Linking from 'expo-linking';
import { Link, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { normalizeAuthCallbackPath } from './+native-intent';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    Linking.getInitialURL()
      .then((initialUrl) => {
        if (!initialUrl) {
          return;
        }

        const authRoute = normalizeAuthCallbackPath(initialUrl);
        if (authRoute.startsWith('/auth')) {
          router.replace(authRoute as never);
        }
      })
      .catch(() => {
        // Keep the not-found screen visible if the incoming URL cannot be read.
      });
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Esta pantalla no existe.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Volver al inicio</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
