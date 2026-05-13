import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import FormRow from '../componentes/FormRow';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import OutlineButton from '../componentes/ui/OutlineButton';
import AppInput from '../componentes/AppInput';
import CurrencyToggle from '../componentes/CurrencyToggle';
import LoadingOverlay from '../componentes/LoadingOverlay';
import { tema } from '../estilos/tema';
import { getJson, postJson } from '../servicios/clienteAxios';
import { useCotizacion } from '../hooks/useCotizacion';
import { construirPdfEstadoResultados } from '../utilitarios/plantillaPdfEstadoResultados';
import type { Divisa } from '../hooks/useCotizacion';

export default function IndicadoresRentabilidadScreen({ navigation, route }: any) {
  const { proyectoId, nombreProyecto } = route.params;
  const [analisis, setAnalisis] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [divisa, setDivisa] = useState<Divisa>('USD');
  const [activos, setActivos] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [datosGuardados, setDatosGuardados] = useState(false);
  const fx = useCotizacion();
  const debounceRef = useRef<any>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getJson<{ data: any }>(`/api/rentabilidad/analisis/${proyectoId}`);
      setAnalisis(r.data);
      const params = await getJson<{ data: any }>(`/api/egresos/parametros-rentabilidad/${proyectoId}`).catch(() => ({ data: null }));
      if (params.data) {
        setActivos(String(params.data.total_activos_caso || ''));
        setPatrimonio(String(params.data.patrimonio_neto_caso || ''));
        setDatosGuardados(true);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo cargar el analisis');
    } finally {
      setCargando(false);
    }
  }, [proyectoId]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!analisis) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const a = parseFloat(activos);
    const p = parseFloat(patrimonio);
    if (!isNaN(a) && !isNaN(p) && a > 0 && p > 0) {
      debounceRef.current = setTimeout(async () => {
        setGuardando(true);
        try {
          await postJson('/api/egresos/parametros-rentabilidad', {
            proyecto_id: proyectoId,
            total_activos_caso: a,
            patrimonio_neto_caso: p,
            divisa
          });
          setDatosGuardados(true);
          cargar();
        } finally {
          setGuardando(false);
        }
      }, 1200);
    }
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [activos, patrimonio, divisa]);

  function fmt(n: number) {
    if (divisa === 'PEN' && fx.exchangeRate) return fx.formatear(n * fx.exchangeRate, 'PEN');
    return fx.formatear(n, 'USD');
  }

  async function exportarPdf() {
    if (!analisis) return;
    try {
      const html = construirPdfEstadoResultados({
        analisis,
        divisa,
        exchangeRate: fx.exchangeRate,
        totalActivos: parseFloat(activos) || undefined,
        patrimonio: parseFloat(patrimonio) || undefined
      });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('PDF', 'No se pudo generar el PDF.');
    }
  }

  if (cargando) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Indicadores" onBack={() => navigation.goBack()} />
      <View style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <LoadingOverlay visible={true} texto="Calculando..." />
      </View>
    </SafeAreaView>
  );

  if (!analisis) return null;
  const ub = analisis.utilidad_bruta;
  const uo = analisis.utilidad_operativa;
  const un = analisis.utilidad_neta;
  const ratios = analisis.ratios_financieros;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader
        titulo="Indicadores de rentabilidad"
        subtitulo={nombreProyecto}
        onBack={() => navigation.goBack()}
        derecha={<CurrencyToggle divisa={divisa} onChange={setDivisa} />}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <SectionCard titulo="Utilidades">
          <FormRow label="Ventas (sin IGV)" valor={fmt(ub.ventas_totales_sin_igv)} strong />
          <FormRow label="Costo de ventas" valor={fmt(ub.costo_ventas)} />
          <FormRow label="Utilidad bruta" valor={fmt(ub.utilidad_bruta)} strong />
          <FormRow label="Gastos operativos" valor={fmt(uo.gastos_operativos)} />
          <FormRow label="Utilidad operativa" valor={fmt(uo.utilidad_operativa)} strong />
          <FormRow label="Otros gastos" valor={fmt(un.total_otros_gastos)} />
          <FormRow label="Utilidad neta" valor={fmt(un.utilidad_neta)} strong />
        </SectionCard>

        <SectionCard titulo="Ratios financieros">
          <FormRow label="Margen bruto" valor={`${ratios.margen_bruto.toFixed(2)}%`} />
          <FormRow label="Margen operativo" valor={`${ratios.margen_operativo.toFixed(2)}%`} />
          <FormRow label="Margen neto" valor={`${ratios.margen_neto.toFixed(2)}%`} strong />
          <FormRow label="ROS" valor={`${ratios.ros.toFixed(2)}%`} />
          <FormRow label="ROA" valor={ratios.roa !== null ? `${ratios.roa.toFixed(2)}%` : 'Ingresa activos'} />
          <FormRow label="ROE" valor={ratios.roe !== null ? `${ratios.roe.toFixed(2)}%` : 'Ingresa patrimonio'} />
        </SectionCard>

        <SectionCard titulo="Parametros (auto-guardado)">
          <Text style={styles.label}>Total de activos</Text>
          <AppInput value={activos} onChangeText={setActivos} keyboardType="numeric" placeholder="0.00" />
          <Text style={styles.label}>Patrimonio neto</Text>
          <AppInput value={patrimonio} onChangeText={setPatrimonio} keyboardType="numeric" placeholder="0.00" />
          <Text style={styles.ayuda}>
            {guardando ? 'Guardando...' : datosGuardados ? 'Guardado' : 'Ingresa activos y patrimonio para ver ROA y ROE'}
          </Text>
        </SectionCard>

        <SectionCard titulo="Acciones">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PrimaryButton
              texto="Asiento consolidado"
              onPress={() => navigation.navigate('AsientoConsolidado', { proyectoId, nombreProyecto })}
              style={{ flex: 1 }}
              icono="reader-outline"
            />
            <OutlineButton texto="PDF" onPress={exportarPdf} icono="download-outline" style={{ flex: 1 }} />
          </View>
        </SectionCard>

        <Text style={styles.fx}>Tipo de cambio: {fx.exchangeRate?.toFixed(4) || '-'} ({fx.rateDate})</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  ayuda: { color: tema.textoSecundario, marginTop: 8, fontSize: 12, fontStyle: 'italic' },
  fx: { textAlign: 'center', color: tema.textoSecundario, fontSize: 11, marginTop: 12 }
});
