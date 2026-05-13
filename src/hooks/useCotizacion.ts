import { useAutenticacion } from '../contextos/AutenticacionContext';

export type Divisa = 'USD' | 'PEN';

export function useCotizacion() {
  const { cotizacion } = useAutenticacion();
  const { exchangeRate, buyPrice, rateDate, loadingFx, fxError } = cotizacion;

  function convertir(valor: number, de: Divisa, a: Divisa): number | null {
    if (de === a) return valor;
    if (exchangeRate === null) return null;
    if (de === 'USD' && a === 'PEN') return valor * exchangeRate;
    if (de === 'PEN' && a === 'USD') return valor / exchangeRate;
    return valor;
  }

  function formatear(valor: number, divisa: Divisa): string {
    const prefijo = divisa === 'USD' ? 'US$ ' : 'S/ ';
    return prefijo + valor.toLocaleString('es-PE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  return { exchangeRate, buyPrice, rateDate, loadingFx, fxError, convertir, formatear };
}
