function hoy() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
function colorScore(score: number): string {
  if (score >= 8) return '#16a34a';
  if (score >= 6) return '#b8860b';
  if (score >= 4) return '#d97706';
  return '#dc2626';
}
function listado(items: string[], marker = '*'): string {
  if (!items?.length) return '<p>Sin datos.</p>';
  return `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
}

export function construirPdfDiagnostico(params: {
  proyectoNombre: string;
  diagnostico: any | null;
}): string {
  const { proyectoNombre, diagnostico } = params;
  if (!diagnostico) {
    return `<!DOCTYPE html><html><body style="font-family:Arial">
      <h1 style="color:#0f5132;text-align:center">FinanBotAI</h1>
      <p style="text-align:center">El diagnostico de IA no fue generado para este proyecto.</p>
    </body></html>`;
  }
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  @page { size: A4; margin: 36px; }
  body { font-family: Arial, sans-serif; color: #111827; font-size: 12px; }
  h1 { color: #0f5132; text-align: center; margin: 0; }
  .sub { text-align: center; color: #6b7280; margin: 4px 0 18px; }
  .score { font-size: 42px; font-weight: 800; text-align: center; padding: 16px; border-radius: 12px; color: #fff; margin-bottom: 14px; }
  .sec { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
  .sec h3 { margin: 0 0 8px; color: #0f5132; font-size: 13px; }
  ul { margin: 0; padding-left: 18px; }
  .concl { background: #f9fafb; border-left: 4px solid #b8860b; padding: 12px; border-radius: 4px; font-style: italic; }
  .footer { margin-top: 24px; text-align: center; color: #6b7280; font-size: 10px; }
</style></head>
<body>
  <h1>FinanBotAI</h1>
  <div class="sub">Diagnostico IA. Proyecto: ${proyectoNombre}</div>

  <div class="score" style="background:${colorScore(diagnostico.score_financiero)}">
    Score financiero: ${diagnostico.score_financiero.toFixed(1)} / 10
  </div>

  <div class="sec">
    <h3>Resumen ejecutivo</h3>
    <p>${diagnostico.resumen_ejecutivo}</p>
  </div>

  <div class="sec">
    <h3>Analisis de rentabilidad</h3>
    <p>${diagnostico.analisis_rentabilidad}</p>
  </div>

  <div class="sec">
    <h3>Fortalezas</h3>
    ${listado(diagnostico.fortalezas)}
  </div>

  <div class="sec">
    <h3>Areas de mejora</h3>
    ${listado(diagnostico.areas_mejora)}
  </div>

  <div class="sec">
    <h3>Recomendaciones especificas</h3>
    <p><strong>Compras:</strong></p>${listado(diagnostico.recomendaciones_especificas?.compras || [])}
    <p><strong>Ventas:</strong></p>${listado(diagnostico.recomendaciones_especificas?.ventas || [])}
    <p><strong>Egresos:</strong></p>${listado(diagnostico.recomendaciones_especificas?.egresos || [])}
  </div>

  <div class="concl">${diagnostico.conclusion}</div>

  <div class="footer">Generado el ${hoy()}. Documento referencial sin valor legal.</div>
</body></html>`;
}
