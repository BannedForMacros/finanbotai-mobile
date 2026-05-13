import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'finanbotai_access';
const REFRESH_KEY = 'finanbotai_refresh';

let memoryAccess: string | null = null;
let memoryRefresh: string | null = null;
let _onSesionExpirada: (() => void) | null = null;

export function setOnSesionExpirada(cb: () => void) {
  _onSesionExpirada = cb;
}

export function fireSesionExpirada() {
  if (_onSesionExpirada) _onSesionExpirada();
}

export async function guardarTokens(access: string, refresh?: string): Promise<void> {
  memoryAccess = access;
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  if (refresh !== undefined) {
    memoryRefresh = refresh;
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  }
}

export async function cargarTokens(): Promise<{ access: string | null; refresh: string | null }> {
  if (memoryAccess && memoryRefresh) {
    return { access: memoryAccess, refresh: memoryRefresh };
  }
  const access = await SecureStore.getItemAsync(ACCESS_KEY);
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  memoryAccess = access;
  memoryRefresh = refresh;
  return { access, refresh };
}

export async function limpiarTokens(): Promise<void> {
  memoryAccess = null;
  memoryRefresh = null;
  await SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => undefined);
  await SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => undefined);
}

export function getAccessSync(): string | null {
  return memoryAccess;
}
export function getRefreshSync(): string | null {
  return memoryRefresh;
}
export function setAccessSync(v: string | null): void {
  memoryAccess = v;
}
export function setRefreshSync(v: string | null): void {
  memoryRefresh = v;
}
