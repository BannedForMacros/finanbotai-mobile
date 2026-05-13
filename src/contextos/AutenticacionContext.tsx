import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  api, apiBaseUrl, postJson
} from '../servicios/clienteAxios';
import {
  guardarTokens, cargarTokens, limpiarTokens,
  setAccessSync, setRefreshSync, setOnSesionExpirada
} from '../servicios/tokenLocal';

const FX_CACHE_KEY = 'finanbotai_cotizacion';

export interface PerfilSesion {
  id: string;
  correo_corporativo: string;
  nombres_completos: string;
  identificador_acceso: string | null;
}

interface CotizacionState {
  exchangeRate: number | null;
  buyPrice: number | null;
  rateDate: string | null;
  loadingFx: boolean;
  fxError: boolean;
}

interface AutenticacionContextType {
  perfil: PerfilSesion | null;
  cargando: boolean;
  cotizacion: CotizacionState;
  iniciarSesion: (correo: string, credencial: string) => Promise<void>;
  registrar: (datos: {
    correo_corporativo: string;
    nombres_completos: string;
    identificador_acceso?: string;
    credencial: string;
  }) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const Ctx = createContext<AutenticacionContextType | undefined>(undefined);

export function AutenticacionProvider({ children }: { children: React.ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilSesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cotizacion, setCotizacion] = useState<CotizacionState>({
    exchangeRate: null,
    buyPrice: null,
    rateDate: null,
    loadingFx: true,
    fxError: false
  });

  async function cargarCotizacion() {
    setCotizacion((s) => ({ ...s, loadingFx: true, fxError: false }));
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const cacheRaw = await AsyncStorage.getItem(FX_CACHE_KEY);
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw);
        if (cache?.rateDate === hoy) {
          setCotizacion({
            exchangeRate: cache.exchangeRate,
            buyPrice: cache.buyPrice,
            rateDate: cache.rateDate,
            loadingFx: false,
            fxError: false
          });
          return;
        }
      }
      const r = await axios.get(`${apiBaseUrl}/api/cotizacion`, { timeout: 8000 });
      const data = r.data;
      const next = {
        exchangeRate: data.rate as number,
        buyPrice: data.buy_price as number,
        rateDate: data.date as string,
        loadingFx: false,
        fxError: false
      };
      setCotizacion(next);
      await AsyncStorage.setItem(FX_CACHE_KEY, JSON.stringify(next));
    } catch {
      setCotizacion((s) => ({ ...s, loadingFx: false, fxError: true }));
    }
  }

  async function cargarPerfil() {
    try {
      const { access, refresh } = await cargarTokens();
      if (!access || !refresh) return;
      setAccessSync(access);
      setRefreshSync(refresh);
      try {
        const me = await api.get('/api/auth/me', { timeout: 10000 });
        const p = me.data?.perfil;
        if (p) {
          setPerfil({
            id: p.id,
            correo_corporativo: p.correo_corporativo,
            nombres_completos: p.nombres_completos,
            identificador_acceso: p.identificador_acceso
          });
        }
      } catch {
        await limpiarTokens();
      }
    } catch {
      // sin sesion previa
    }
  }

  useEffect(() => {
    setOnSesionExpirada(() => {
      Alert.alert('Sesion expirada', 'Vuelve a iniciar sesion.');
      setPerfil(null);
    });
    (async () => {
      await Promise.all([cargarCotizacion(), cargarPerfil()]);
      setCargando(false);
    })();
  }, []);

  async function iniciarSesion(correo: string, credencial: string) {
    const r = await postJson<{ access_token: string; refresh_token: string; perfil: PerfilSesion }>(
      '/api/auth/acceso',
      { correo_corporativo: correo, credencial }
    );
    setAccessSync(r.access_token);
    setRefreshSync(r.refresh_token);
    await guardarTokens(r.access_token, r.refresh_token);
    setPerfil(r.perfil);
  }

  async function registrar(datos: {
    correo_corporativo: string;
    nombres_completos: string;
    identificador_acceso?: string;
    credencial: string;
  }) {
    const r = await postJson<{ access_token: string; refresh_token: string; perfil: PerfilSesion }>(
      '/api/auth/registro',
      datos
    );
    setAccessSync(r.access_token);
    setRefreshSync(r.refresh_token);
    await guardarTokens(r.access_token, r.refresh_token);
    setPerfil(r.perfil);
  }

  async function cerrarSesion() {
    try {
      const t = (await cargarTokens()).refresh;
      if (t) {
        await postJson('/api/auth/cerrar-sesion', { refresh_token: t }).catch(() => undefined);
      }
    } finally {
      await limpiarTokens();
      setPerfil(null);
    }
  }

  return (
    <Ctx.Provider value={{ perfil, cargando, cotizacion, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAutenticacion(): AutenticacionContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAutenticacion debe usarse dentro de AutenticacionProvider');
  return ctx;
}
