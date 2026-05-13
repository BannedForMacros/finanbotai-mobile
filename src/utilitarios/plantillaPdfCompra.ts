type Divisa = 'USD' | 'PEN';

interface CalcData {
  fob: number;
  flete: number;
  seguro: number;
  cif: number;
  advalorem: number;
  isc: number;
  igv: number;
  ipm: number;
  antidumping: number;
  compensatorios: number;
  percepcion: number;
  sda: number;
  total: number;
  tasaPercepcion?: number;
}

interface Params {
  compra: any;
  proyectoNombre: string;
  divisa: Divisa;
  exchangeRate: number | null;
  calc: CalcData;
}

function hoy() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
function fmt(n: number, divisa: Divisa, rate: number | null) {
  const v = divisa === 'PEN' && rate ? n * rate : n;
  const prefijo = divisa === 'USD' ? 'US$ ' : 'S/ ';
  return prefijo + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function construirPdfCompra({ compra, proyectoNombre, divisa, exchangeRate, calc }: Params): string {
  const filas: string[] = [];
  if (calc.advalorem > 0) filas.push(`<tr><td>Ad Valorem</td><td class="r">${fmt(calc.advalorem, divisa, exchangeRate)}</td></tr>`);
  if (calc.isc > 0) filas.push(`<tr><td>ISC</td><td class="r">${fmt(calc.isc, divisa, exchangeRate)}</td></tr>`);
  if (calc.igv > 0) filas.push(`<tr><td>IGV</td><td class="r">${fmt(calc.igv, divisa, exchangeRate)}</td></tr>`);
  if (calc.ipm > 0) filas.push(`<tr><td>IPM</td><td class="r">${fmt(calc.ipm, divisa, exchangeRate)}</td></tr>`);
  if (calc.antidumping > 0) filas.push(`<tr><td>Antidumping</td><td class="r">${fmt(calc.antidumping, divisa, exchangeRate)}</td></tr>`);
  if (calc.compensatorios > 0) filas.push(`<tr><td>Compensatorio</td><td class="r">${fmt(calc.compensatorios, divisa, exchangeRate)}</td></tr>`);
  if (calc.percepcion > 0) {
    const tasa = calc.tasaPercepcion ? ` (${calc.tasaPercepcion.toFixed(2)}%)` : '';
    filas.push(`<tr><td>Percepcion${tasa}</td><td class="r">${fmt(calc.percepcion, divisa, exchangeRate)}</td></tr>`);
  }
  if (calc.sda > 0) filas.push(`<tr><td>SDA</td><td class="r">${fmt(calc.sda, divisa, exchangeRate)}</td></tr>`);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  @page { size: A4; margin: 36px; }
  body { font-family: Arial, sans-serif; color: #111827; font-size: 12px; }
  h1 { color: #0f5132; text-align: center; margin: 0 0 4px; }
  .subtit { text-align: center; color: #6b7280; margin-bottom: 16px; }
  .seccion { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
  .seccion h3 { margin: 0 0 8px; color: #0f5132; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 4px; border-bottom: 1px solid #f3f4f6; }
  .r { text-align: right; font-weight: 600; }
  .total { background: #0f5132; color: #fff; padding: 16px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: 700; }
  .footer { margin-top: 24px; text-align: center; color: #6b7280; font-size: 10px; }
</style></head>
<body>
  <h1>FinanBotAI</h1>
  <div class="subtit">Compra internacional / nacional</div>

  <div class="seccion">
    <h3>Datos generales</h3>
    <table>
      <tr><td>Proyecto</td><td class="r">${proyectoNombre}</td></tr>
      <tr><td>Mercaderia</td><td class="r">${compra?.descripcion_articulo || '-'}</td></tr>
      <tr><td>Codigo arancelario</td><td class="r">${compra?.codigo_arancelario || '-'}</td></tr>
      <tr><td>Fecha</td><td class="r">${compra?.fecha_compra || '-'}</td></tr>
    </table>
  </div>

  <div class="seccion">
    <h3>Valores</h3>
    <table>
      <tr><td>Importe FOB</td><td class="r">${fmt(calc.fob, divisa, exchangeRate)}</td></tr>
      <tr><td>Importe flete</td><td class="r">${fmt(calc.flete, divisa, exchangeRate)}</td></tr>
      <tr><td>Importe seguro</td><td class="r">${fmt(calc.seguro, divisa, exchangeRate)}</td></tr>
      <tr><td>Valor CIF</td><td class="r">${fmt(calc.cif, divisa, exchangeRate)}</td></tr>
    </table>
  </div>

  <div class="seccion">
    <h3>Tributos calculados</h3>
    <table>${filas.join('')}</table>
  </div>

  <div class="total">Total carga aduanera: ${fmt(calc.total, divisa, exchangeRate)}</div>

  <div class="footer">Generado el ${hoy()}. Documento referencial sin valor legal.</div>
</body></html>`;
}
