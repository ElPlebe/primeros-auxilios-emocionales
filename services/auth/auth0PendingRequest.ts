import * as SecureStore from 'expo-secure-store';

const PENDING_AUTH0_REQUEST_KEY = 'pae_auth0_pending_request';

export interface PendingAuth0Request {
  codeVerifier: string;
  createdAt: string;
  state?: string;
}

export async function savePendingAuth0Request(request: PendingAuth0Request) {
  await SecureStore.setItemAsync(PENDING_AUTH0_REQUEST_KEY, JSON.stringify(request));
}

export async function getPendingAuth0Request() {
  const stored = await SecureStore.getItemAsync(PENDING_AUTH0_REQUEST_KEY);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<PendingAuth0Request>;
    if (!parsed.codeVerifier || typeof parsed.codeVerifier !== 'string') {
      return null;
    }

    return {
      codeVerifier: parsed.codeVerifier,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date(0).toISOString(),
      state: typeof parsed.state === 'string' ? parsed.state : undefined
    };
  } catch {
    return null;
  }
}

export async function clearPendingAuth0Request() {
  await SecureStore.deleteItemAsync(PENDING_AUTH0_REQUEST_KEY);
}
