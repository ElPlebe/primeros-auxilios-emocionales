interface NativeIntentEvent {
  initial: boolean;
  path: string;
}

export function redirectSystemPath({ path }: NativeIntentEvent) {
  return normalizeAuthCallbackPath(path);
}

export function normalizeAuthCallbackPath(path: string) {
  const rawPath = path.trim();
  if (!rawPath) {
    return path;
  }

  const fullUrlCallback = normalizeFullUrlCallback(rawPath);
  if (fullUrlCallback) {
    return fullUrlCallback;
  }

  const relativePath = rawPath.replace(/^\/?--\//, '/').replace(/^\/+/, '');
  if (relativePath === 'auth' || relativePath.startsWith('auth?') || relativePath.startsWith('auth/')) {
    return toAuthRoute(relativePath.includes('?') ? relativePath.slice(relativePath.indexOf('?')) : '');
  }

  return path;
}

function normalizeFullUrlCallback(path: string) {
  try {
    const url = new URL(path);
    const isAuthHostCallback = url.protocol === 'primerosauxiliosemocionales:' && url.host === 'auth';
    const isAuthPathCallback = url.pathname === '/auth' || url.pathname.startsWith('/auth/');

    if (!isAuthHostCallback && !isAuthPathCallback) {
      return null;
    }

    return toAuthRoute(url.search);
  } catch {
    return null;
  }
}

function toAuthRoute(search: string) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const query = params.toString();
  return query ? `/auth?${query}` : '/auth';
}
