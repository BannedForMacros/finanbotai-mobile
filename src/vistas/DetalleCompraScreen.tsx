import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import FormRow from '../componentes/FormRow';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import OutlineButton from '../componentes/ui/OutlineButton';
import CurrencyToggle from '../componentes/CurrencyToggle';
import TipoCambioModal from '../componentes/TipoCambioModal';
import { tema } from '../estilos/tema';
import { useCotizacionFecha } from '../hooks/useCotizacionFecha';
import { getJson, deleteJson } from '../servicios/clienteAxios';
import { construirPdfCompra } from '../utilitarios/plantillaPdfCompra';
import { mostrarFecha } from '../utilitarios/formatoFecha';
import type { Divisa } from '../hooks/useCotizacion';

export default function DetalleCompraScreen({ navigation, route }: any) {
  const [compra, setCompra] = useState<any>(route.params.compra);
  const [divisa, setDivisa] = useState<Divisa>(compra.divisa as Divisa);
  const [modalFx, setModalFx] = useState(false);
  const fx = useCotizacionFecha(compra.fecha_compra);

  const cargar = useCallback(async () => {
    try {
      const r = await getJson<{ data: any }>(`/api/compras-internacionales/${compra.id}`);
      setCompra(r.data);
    } catch (e) { /* ignore */ }
  }, [compra.id]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const calc = useMemo(() => {
    const fob = parseFloat(compra.importe_fob) || 0;
    const flete = parseFloat(compra.importe_flete) || 0;
    const seguro = parseFloat(compra.importe_seguro) || 0;
    const cif = parseFloat(compra.valor_cif_resultante) || 0;
    const advalorem = parseFloat(compra.valor_advalorem_resultante) || 0;
    const isc = parseFloat(compra.valor_isc_resultante) || 0;
    const igv = parseFloat(compra.valor_igv_resultante) || 0;
    const ipm = parseFloat(compra.valor_ipm_resultante) || 0;
    const percepcion = parseFloat(compra.valor_percepcion_resultante) || 0;
    const antidumping = parseFloat(compra.cargo_antidumping_usd) || 0;
    const compensatorios = parseFloat(compra.cargo_compensatorio_usd) || 0;
    const sda = parseFloat(compra.cargo_sda_usd) || 0;
    const total = parseFloat(compra.total_carga_aduanera) || 0;
    return { fob, flete, seguro, cif, advalorem, isc, igv, ipm, percepcion, antidumping, compensatorios, sda, total };
  }, [compra]);

  function fmt(n: number) {
    return fx.formatear(divisa === 'PEN' ? (fx.convertir(n, compra.divisa as Divisa, 'PEN') ?? n) : n, divisa);
  }

  async function exportarPdf() {
    const html = construirPdfCompra({
      compra,
      proyectoNombre: compra.nombre_proyecto || '',
      divisa,
      exchangeRate: fx.exchangeRate,
      calc
    });
    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('PDF', 'No se pudo generar el PDF.');
    }
  }

  async function onEliminar() {
    Alert.alert('Eliminar', 'Confirma la eliminacion de esta compra.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJson(`/api/compras-internacionales/${compra.id}`);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo eliminar.');
          }
        }
      }
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader
        titulo={compra.flag_compra_local ? 'Compra nacional' : 'Compra internacional'}
        subtitulo={compra.descripcion_articulo}
        onBack={() => navigation.goBack()}
        derecha={<CurrencyToggle divisa={divisa} onChange={setDivisa} />}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <SectionCard titulo="Datos">
          <FormRow label="Fecha" valor={mostrarFecha(compra.fecha_compra)} />
          <FormRow label="Divisa original" valor={compra.divisa} />
          <FormRow label="Codigo arancelario" valor={compra.codigo_arancelario || '-'} />
        </SectionCard>

        <SectionCard titulo="Valores">
          <FormRow label={compra.flag_compra_local ? 'Valor compra' : 'Importe FOB'} valor={fmt(calc.fob)} />
          {!compra.flag_compra_local ? (
            <>
              <FormRow label="Importe flete" valor={fmt(calc.flete)} />
              <FormRow label="Importe seguro" valor={fmt(calc.seguro)} />
              <FormRow label="Valor CIF" valor={fmt(calc.cif)} strong />
            </>
          ) : null}
        </SectionCard>

        <SectionCard titulo="Tributos calculados">
          {calc.advalorem > 0 ? <FormRow label="Ad Valorem" valor={fmt(calc.advalorem)} /> : null}
          {calc.isc > 0 ? <FormRow label="ISC" valor={fmt(calc.isc)} /> : null}
          {calc.igv > 0 ? <FormRow label="IGV" valor={fmt(calc.igv)} /> : null}
          {calc.ipm > 0 ? <FormRow label="IPM" valor={fmt(calc.ipm)} /> : null}
          {calc.antidumping > 0 ? <FormRow label="Antidumping" valor={fmt(calc.antidumping)} /> : null}
          {calc.compensatorios > 0 ? <FormRow label="Compensatorio" valor={fmt(calc.compensatorios)} /> : null}
          {calc.percepcion > 0 ? <FormRow label="Percepcion" valor={fmt(calc.percepcion)} /> : null}
          {calc.sda > 0 ? <FormRow label="SDA" valor={fmt(calc.sda)} /> : null}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total carga aduanera</Text>
            <Text style={styles.totalValor}>{fmt(calc.total)}</Text>
          </View>
        </SectionCard>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <PrimaryButton texto="Ver asiento" onPress={() => navigation.navigate('AsientoCompra', { compra })} style={{ flex: 1 }} icono="reader-outline" />
          <OutlineButton texto="PDF" onPress={exportarPdf} icono="download-outline" style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <OutlineButton texto="Editar" onPress={() => navigation.navigate('EditarCompra', { compra })} icono="create-outline" style={{ flex: 1 }} color={tema.secundario} />
          <OutlineButton texto="Eliminar" onPress={onEliminar} icono="trash-outline" style={{ flex: 1 }} color={tema.error} />
        </View>

        <View style={{ marginTop: 16 }}>
          <OutlineButton texto="Tipo de cambio SBS" onPress={() => setModalFx(true)} icono="information-circle-outline" color={tema.acento} />
        </View>
      </ScrollView>

      <TipoCambioModal visible={modalFx} onClose={() => setModalFx(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  total: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: tema.primario, borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 14, marginTop: 8
  },
  totalLabel: { color: tema.blanco, fontWeight: '700' },
  totalValor: { color: tema.blanco, fontWeight: '800', fontSize: 16 }
});
