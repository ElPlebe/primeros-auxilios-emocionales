import { clearAllTokens, setAccessToken, setIdToken, setRefreshToken } from './secureTokenStore';

export interface Auth0TokenSet {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
}

export async function persistAuth0Tokens(tokens: Auth0TokenSet) {
  await setAccessToken(tokens.accessToken);
  if (tokens.refreshToken) {
    await setRefreshToken(tokens.refreshToken);
  }
  if (tokens.idToken) {
    await setIdToken(tokens.idToken);
  }
}

export async function clearAuth0Session() {
  await clearAllTokens();
}
