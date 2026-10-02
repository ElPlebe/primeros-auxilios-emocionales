export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
}

export type ApiRecord = Record<string, unknown>;

export function createApiClient({ baseUrl, getAccessToken, fetchImpl = fetch }: ApiClientOptions) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getAccessToken();
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API ${response.status} for ${path}`);
    }

    return response.json() as Promise<T>;
  }

  const post = <T>(path: string, payload?: ApiRecord) =>
    request<T>(path, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined
    });

  const put = <T>(path: string, payload: ApiRecord) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

  return {
    getCurrentConsent: () => request<ApiRecord>('/consent/current'),
    postConsent: (payload: ApiRecord) => post<ApiRecord>('/me/consents', payload),
    postAssessment: (payload: ApiRecord) => post<ApiRecord>('/me/assessments', payload),
    postExerciseFollowUp: (payload: ApiRecord) => post<ApiRecord>('/me/exercise-follow-ups', payload),
    postEmotionLog: (payload: ApiRecord) => post<ApiRecord>('/me/emotion-logs', payload),
    putSafetyPlan: (payload: ApiRecord) => put<ApiRecord>('/me/safety-plan', payload),
    putTrustedContact: (payload: ApiRecord) => put<ApiRecord>('/me/trusted-contact', payload),
    postExportEvent: () => post<ApiRecord>('/me/export-events'),
    postDeletionRequest: () => post<ApiRecord>('/me/deletion-requests')
  };
}
