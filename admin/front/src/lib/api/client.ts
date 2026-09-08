import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStore } from './token-store';
import type { ApiError, ApiSuccess, AuthSession } from './types';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const apiClient = axios.create({ baseURL, withCredentials: true });

/** Invoked when the session cannot be recovered (refresh failed). */
let authFailureHandler: (() => void) | null = null;
export function setAuthFailureHandler(handler: (() => void) | null): void {
  authFailureHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// De-duplicate concurrent refresh attempts.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<ApiSuccess<AuthSession>>(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = res.data.data.accessToken;
    tokenStore.set(token);
    return token;
  } catch {
    tokenStore.set(null);
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const token = await refreshPromise;
      refreshPromise = null;

      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      }
      authFailureHandler?.();
    }
    return Promise.reject(error);
  },
);

/** Extracts the payload from the API success envelope. */
export function unwrap<T>(res: AxiosResponse<ApiSuccess<T>>): T {
  return res.data.data;
}

/** Best-effort extraction of a human-readable error message (Arabic UI). */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.message) {
      return data.message;
    }
  }
  return 'حدث خطأ ما، يرجى المحاولة مرة أخرى';
}
