type Divisa = 'USD' | 'PEN';

function hoy() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
function fmt(n: number, divisa: Divisa, rate: number | null) {
  const v = divisa === 'PEN' && rate ? n * rate : n;
  const p = divisa === 'USD' ? 'US$ ' : 'S/ ';
  return p + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fila(label: string, valor: string, strong = false) {
  return `<tr><td>${label}</td><td class="r ${strong ? 'b' : ''}">${valor}</td></tr>`;
}

export function construirPdfEstadoResultados(params: {
  analisis: any;
  divisa: Divisa;
  exchangeRate: number | null;
  totalActivos?: number;
  patrimonio?: number;
}): string {
  const { analisis, divisa, exchangeRate, totalActivos, patrimonio } = params;
  const ub = analisis.utilidad_bruta;
  const uo = analisis.utilidad_operativa;
  const un = analisis.utilidad_neta;
  const ratios = analisis.ratios_financieros;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  @page { size: A4; margin: 36px; }
  body { font-family: Arial, sans-serif; color: #111827; font-size: 12px; }
  h1 { color: #0f5132; text-align: center; margin: 0; }
  .sub { text-align: center; color: #6b7280; margin: 4px 0 18px; }
  .sec { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
  .sec h3 { margin: 0 0 8px; color: #0f5132; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 5px 4px; border-bottom: 1px solid #f3f4f6; }
  .r { text-align: right; }
  .b { font-weight: 700; }
  .pos { color: #16a34a; }
  .neg { color: #dc2626; }
  .footer { margin-top: 24px; text-align: center; color: #6b7280; font-size: 10px; }
</style></head>
<body>
  <h1>FinanBotAI</h1>
  <div class="sub">Simulador financiero. Proyecto: ${analisis.nombre_proyecto || ''}</div>

  <div class="sec">
    <h3>Resumen de utilidades</h3>
    <table>
      ${fila('Ventas totales (sin IGV)', fmt(ub.ventas_totales_sin_igv, divisa, exchangeRate), true)}
      ${fila('Costo de ventas', fmt(ub.costo_ventas, divisa, exchangeRate))}
      ${fila('Utilidad bruta', fmt(ub.utilidad_bruta, divisa, exchangeRate), true)}
      ${fila('Gastos operativos', fmt(uo.gastos_operativos, divisa, exchangeRate))}
      ${fila('Utilidad operativa', fmt(uo.utilidad_operativa, divisa, exchangeRate), true)}
      ${fila('Gastos administrativos', fmt(un.gastos_administrativos, divisa, exchangeRate))}
      ${fila('Gastos de ventas', fmt(un.gastos_ventas, divisa, exchangeRate))}
      ${fila('Gastos financieros', fmt(un.gastos_financieros, divisa, exchangeRate))}
      ${fila('Utilidad neta', fmt(un.utilidad_neta, divisa, exchangeRate), true)}
    </table>
  </div>

  <div class="sec">
    <h3>Ratios financieros</h3>
    <table>
      ${fila('Margen bruto', `${ratios.margen_bruto.toFixed(2)}%`)}
      ${fila('Margen operativo', `${ratios.margen_operativo.toFixed(2)}%`)}
      ${fila('Margen neto', `${ratios.margen_neto.toFixed(2)}%`)}
      ${fila('ROS', `${ratios.ros.toFixed(2)}%`)}
      ${fila('ROA', ratios.roa !== null ? `${ratios.roa.toFixed(2)}%` : 'No disponible')}
      ${fila('ROE', ratios.roe !== null ? `${ratios.roe.toFixed(2)}%` : 'No disponible')}
      ${totalActivos ? fila('Total activos ingresados', fmt(totalActivos, divisa, exchangeRate)) : ''}
      ${patrimonio ? fila('Patrimonio ingresado', fmt(patrimonio, divisa, exchangeRate)) : ''}
    </table>
  </div>

  <div class="footer">Generado el ${hoy()}. Documento referencial sin valor legal.</div>
</body></html>`;
}
