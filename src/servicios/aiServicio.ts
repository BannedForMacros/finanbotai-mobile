import { postJson } from './clienteAxios';

export interface DiagnosticoIA {
  resumen_ejecutivo: string;
  analisis_rentabilidad: string;
  fortalezas: string[];
  areas_mejora: string[];
  recomendaciones_especificas: {
    compras: string[];
    ventas: string[];
    egresos: string[];
  };
  conclusion: string;
  score_financiero: number;
}

export interface RespuestaDiagnosticoIA {
  success: boolean;
  data: {
    proyecto_id: string;
    analisis_base: {
      utilidad_neta: number;
      margen_neto: number;
      ratios: any;
    };
    diagnostico: DiagnosticoIA;
  };
}

export async function generarDiagnostico(proyectoId: string): Promise<RespuestaDiagnosticoIA> {
  return postJson<RespuestaDiagnosticoIA>(`/api/diagnostico-ia/${proyectoId}`);
}
