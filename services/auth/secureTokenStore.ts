import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'pae_access_token';
const REFRESH_TOKEN_KEY = 'pae_refresh_token';

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

export const clearAccessToken = () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);

export const clearRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

export async function clearAllTokens() {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
}
