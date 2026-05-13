import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import OutlineButton from '../componentes/ui/OutlineButton';
import LoadingOverlay from '../componentes/LoadingOverlay';
import { tema } from '../estilos/tema';
import { generarDiagnostico } from '../servicios/aiServicio';
import { construirPdfDiagnostico } from '../utilitarios/plantillaPdfDiagnostico';

function colorScore(s: number): string {
  if (s >= 8) return tema.exito;
  if (s >= 6) return tema.secundario;
  if (s >= 4) return tema.advertencia;
  return tema.error;
}

function textoScore(s: number): string {
  if (s >= 8) return 'Excelente';
  if (s >= 6) return 'Bueno';
  if (s >= 4) return 'Regular';
  return 'Necesita mejoras';
}

export default function DiagnosticoIAScreen({ navigation, route }: any) {
  const { proyectoId, nombreProyecto } = route.params;
  const [diag, setDiag] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [analisisBase, setAnalisisBase] = useState<any>(null);

  async function generar() {
    setCargando(true);
    try {
      const r = await generarDiagnostico(proyectoId);
      setDiag(r.data.diagnostico);
      setAnalisisBase(r.data.analisis_base);
    } catch (e: any) {
      Alert.alert('IA', e?.response?.data?.message || 'No se pudo generar el diagnostico. Revisa que el proyecto tenga ventas, compras y egresos registrados.');
    } finally {
      setCargando(false);
    }
  }

  async function exportarPdf() {
    if (!diag) return;
    try {
      const html = construirPdfDiagnostico({ proyectoNombre: nombreProyecto, diagnostico: diag });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('PDF', 'No se pudo generar el PDF.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Diagnostico IA" subtitulo={nombreProyecto} onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {!diag ? (
          <SectionCard titulo="Generar diagnostico">
            <Text style={styles.parrafo}>
              Gemini 2.5 Flash analizara la rentabilidad de tu proyecto y entregara un diagnostico con score, fortalezas, areas de mejora y recomendaciones especificas.
            </Text>
            <PrimaryButton texto="Generar diagnostico" onPress={generar} cargando={cargando} icono="sparkles" style={{ marginTop: 8 }} />
          </SectionCard>
        ) : (
          <>
            <View style={[styles.scoreCard, { backgroundColor: colorScore(diag.score_financiero) }]}>
              <Text style={styles.scoreLabel}>Score financiero</Text>
              <Text style={styles.scoreValor}>{diag.score_financiero.toFixed(1)} / 10</Text>
              <Text style={styles.scoreTxt}>{textoScore(diag.score_financiero)}</Text>
            </View>

            {analisisBase ? (
              <SectionCard titulo="Resumen base">
                <View style={styles.metricaRow}>
                  <View style={styles.metrica}>
                    <Text style={styles.metricaLabel}>Utilidad neta</Text>
                    <Text style={styles.metricaValor}>$ {analisisBase.utilidad_neta.toFixed(2)}</Text>
                  </View>
                  <View style={styles.metrica}>
                    <Text style={styles.metricaLabel}>Margen neto</Text>
                    <Text style={styles.metricaValor}>{analisisBase.margen_neto.toFixed(2)}%</Text>
                  </View>
                </View>
              </SectionCard>
            ) : null}

            <SectionCard titulo="Resumen ejecutivo">
              <Text style={styles.parrafo}>{diag.resumen_ejecutivo}</Text>
            </SectionCard>

            <SectionCard titulo="Analisis de rentabilidad">
              <Text style={styles.parrafo}>{diag.analisis_rentabilidad}</Text>
            </SectionCard>

            <SectionCard titulo="Fortalezas">
              {diag.fortalezas?.map((f: string, i: number) => (
                <View key={i} style={styles.item}>
                  <Text style={[styles.bullet, { color: tema.exito }]}>+</Text>
                  <Text style={styles.itemTxt}>{f}</Text>
                </View>
              ))}
            </SectionCard>

            <SectionCard titulo="Areas de mejora">
              {diag.areas_mejora?.map((a: string, i: number) => (
                <View key={i} style={styles.item}>
                  <Text style={[styles.bullet, { color: tema.advertencia }]}>!</Text>
                  <Text style={styles.itemTxt}>{a}</Text>
                </View>
              ))}
            </SectionCard>

            <SectionCard titulo="Recomendaciones">
              <Text style={styles.grupoTxt}>Compras</Text>
              {diag.recomendaciones_especificas?.compras?.map((r: string, i: number) => (
                <View key={`c${i}`} style={styles.item}>
                  <Text style={styles.bullet}>{'>'}</Text>
                  <Text style={styles.itemTxt}>{r}</Text>
                </View>
              ))}
              <Text style={[styles.grupoTxt, { marginTop: 12 }]}>Ventas</Text>
              {diag.recomendaciones_especificas?.ventas?.map((r: string, i: number) => (
                <View key={`v${i}`} style={styles.item}>
                  <Text style={styles.bullet}>{'>'}</Text>
                  <Text style={styles.itemTxt}>{r}</Text>
                </View>
              ))}
              <Text style={[styles.grupoTxt, { marginTop: 12 }]}>Egresos</Text>
              {diag.recomendaciones_especificas?.egresos?.map((r: string, i: number) => (
                <View key={`g${i}`} style={styles.item}>
                  <Text style={styles.bullet}>{'>'}</Text>
                  <Text style={styles.itemTxt}>{r}</Text>
                </View>
              ))}
            </SectionCard>

            <SectionCard titulo="Conclusion">
              <Text style={styles.conclusion}>{diag.conclusion}</Text>
            </SectionCard>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PrimaryButton texto="Regenerar" onPress={generar} cargando={cargando} icono="refresh" style={{ flex: 1 }} />
              <OutlineButton texto="PDF" onPress={exportarPdf} icono="download-outline" style={{ flex: 1 }} />
            </View>
          </>
        )}
      </ScrollView>
      <LoadingOverlay visible={cargando} texto="Consultando Gemini..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  parrafo: { color: tema.textoPrincipal, lineHeight: 20 },
  scoreCard: { padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  scoreLabel: { color: tema.blanco, fontWeight: '600' },
  scoreValor: { color: tema.blanco, fontWeight: '800', fontSize: 32, marginTop: 4 },
  scoreTxt: { color: tema.blanco, fontWeight: '700', marginTop: 2 },
  metricaRow: { flexDirection: 'row', gap: 12 },
  metrica: { flex: 1, backgroundColor: tema.superficie, padding: 10, borderRadius: 8, alignItems: 'center' },
  metricaLabel: { color: tema.textoSecundario, fontSize: 12 },
  metricaValor: { color: tema.primario, fontWeight: '800', marginTop: 2 },
  item: { flexDirection: 'row', paddingVertical: 6 },
  bullet: { width: 18, color: tema.primario, fontWeight: '800' },
  itemTxt: { flex: 1, color: tema.textoPrincipal, lineHeight: 19 },
  grupoTxt: { color: tema.primario, fontWeight: '700' },
  conclusion: { color: tema.textoPrincipal, fontStyle: 'italic', lineHeight: 21, padding: 10, backgroundColor: tema.superficie, borderRadius: 8, borderLeftColor: tema.secundario, borderLeftWidth: 4 }
});
