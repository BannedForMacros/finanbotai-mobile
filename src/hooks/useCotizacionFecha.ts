import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../servicios/clienteAxios';
import { useAutenticacion } from '../contextos/AutenticacionContext';
import type { Divisa } from './useCotizacion';

const cache = new Map<string, { rate: number; buyPrice: number }>();

export function useCotizacionFecha(fecha?: string) {
  const { cotizacion } = useAutenticacion();
  const targetDate = fecha || new Date().toISOString().split('T')[0];

  const [rate, setRate] = useState<number | null>(cotizacion.exchangeRate);
  const [buyPrice, setBuyPrice] = useState<number | null>(cotizacion.buyPrice);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    if (!fecha || fecha === cotizacion.rateDate) {
      setRate(cotizacion.exchangeRate);
      setBuyPrice(cotizacion.buyPrice);
      return;
    }
    const cacheado = cache.get(targetDate);
    if (cacheado) {
      setRate(cacheado.rate);
      setBuyPrice(cacheado.buyPrice);
      return;
    }
    setCargando(true);
    axios
      .get(`${apiBaseUrl}/api/cotizacion`, { params: { date: targetDate }, timeout: 8000 })
      .then((r) => {
        if (cancelado) return;
        const d = r.data;
        cache.set(targetDate, { rate: d.rate, buyPrice: d.buy_price });
        setRate(d.rate);
        setBuyPrice(d.buy_price);
      })
      .catch(() => {
        if (cancelado) return;
        setError(true);
        if (cotizacion.exchangeRate !== null) setRate(cotizacion.exchangeRate);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [targetDate, cotizacion.rateDate]);

  function convertir(valor: number, de: Divisa, a: Divisa): number | null {
    if (de === a) return valor;
    if (rate === null) return null;
    if (de === 'USD' && a === 'PEN') return valor * rate;
    if (de === 'PEN' && a === 'USD') return valor / rate;
    return valor;
  }

  function formatear(valor: number, divisa: Divisa): string {
    const p = divisa === 'USD' ? 'US$ ' : 'S/ ';
    return p + valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return {
    exchangeRate: rate,
    buyPrice,
    rateDate: targetDate,
    loadingFx: cargando,
    fxError: error,
    convertir,
    formatear
  };
}
