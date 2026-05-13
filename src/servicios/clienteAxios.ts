import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import {
  getAccessSync, getRefreshSync, setAccessSync, setRefreshSync,
  guardarTokens, limpiarTokens, fireSesionExpirada
} from './tokenLocal';

const BASE_URL: string =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://10.0.2.2:4002';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000
});

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const access = getAccessSync();
  if (access) cfg.headers.set('Authorization', `Bearer ${access}`);
  return cfg;
});

let refrescando = false;
let cola: Array<(ok: boolean) => void> = [];

function notificarCola(ok: boolean) {
  cola.forEach((fn) => fn(ok));
  cola = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original: any = error.config;
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    if (refrescando) {
      return new Promise((resolve, reject) => {
        cola.push((ok) => {
          if (ok) {
            original._retry = true;
            original.headers.Authorization = `Bearer ${getAccessSync()}`;
            api.request(original).then(resolve).catch(reject);
          } else {
            reject(error);
          }
        });
      });
    }

    original._retry = true;
    refrescando = true;

    try {
      const refresh = getRefreshSync();
      if (!refresh) throw new Error('Sin refresh token');

      const resp = await axios.post(`${BASE_URL}/api/auth/refresh`, { refresh_token: refresh });
      const { access_token, refresh_token } = resp.data;

      setAccessSync(access_token);
      setRefreshSync(refresh_token);
      await guardarTokens(access_token, refresh_token);

      refrescando = false;
      notificarCola(true);

      original.headers.Authorization = `Bearer ${access_token}`;
      return api.request(original);
    } catch (e) {
      refrescando = false;
      notificarCola(false);
      await limpiarTokens();
      fireSesionExpirada();
      return new Promise(() => undefined);
    }
  }
);

export async function getJson<T = any>(url: string, params?: any): Promise<T> {
  const r = await api.get<T>(url, { params });
  return r.data;
}
export async function postJson<T = any>(url: string, body?: any): Promise<T> {
  const r = await api.post<T>(url, body);
  return r.data;
}
export async function putJson<T = any>(url: string, body?: any): Promise<T> {
  const r = await api.put<T>(url, body);
  return r.data;
}
export async function patchJson<T = any>(url: string, body?: any): Promise<T> {
  const r = await api.patch<T>(url, body);
  return r.data;
}
export async function deleteJson<T = any>(url: string): Promise<T> {
  const r = await api.delete<T>(url);
  return r.data;
}

export const apiBaseUrl = BASE_URL;
