import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import FormRow from '../componentes/FormRow';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import OutlineButton from '../componentes/ui/OutlineButton';
import CurrencyToggle from '../componentes/CurrencyToggle';
import { tema } from '../estilos/tema';
import { useCotizacionFecha } from '../hooks/useCotizacionFecha';
import { getJson, deleteJson } from '../servicios/clienteAxios';
import { mostrarFecha } from '../utilitarios/formatoFecha';
import type { Divisa } from '../hooks/useCotizacion';

export default function DetalleVentaScreen({ navigation, route }: any) {
  const [venta, setVenta] = useState<any>(route.params.venta);
  const [divisa, setDivisa] = useState<Divisa>(venta.divisa as Divisa);
  const fx = useCotizacionFecha(venta.fecha_venta);

  const cargar = useCallback(async () => {
    try {
      const r = await getJson<{ data: any }>(`/api/ventas-internacionales/${venta.id}`);
      setVenta(r.data);
    } catch (e) { /* ignore */ }
  }, [venta.id]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  function fmt(n: number) {
    const v = divisa === 'PEN' ? (fx.convertir(n, venta.divisa as Divisa, 'PEN') ?? n) : n;
    return fx.formatear(v, divisa);
  }

  async function onEliminar() {
    Alert.alert('Eliminar', 'Confirma la eliminacion de esta venta.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJson(`/api/ventas-internacionales/${venta.id}`);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo eliminar.');
          }
        }
      }
    ]);
  }

  const totalNeto = parseFloat(venta.subtotal_neto) || 0;
  const totalIgv = parseFloat(venta.subtotal_igv) || 0;
  const total = parseFloat(venta.importe_venta_neto) || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader
        titulo={venta.flag_venta_local ? 'Venta nacional' : 'Exportacion'}
        subtitulo={venta.descripcion_articulo}
        onBack={() => navigation.goBack()}
        derecha={<CurrencyToggle divisa={divisa} onChange={setDivisa} />}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <SectionCard titulo="Datos">
          <FormRow label="Fecha" valor={mostrarFecha(venta.fecha_venta)} />
          <FormRow label="Divisa" valor={venta.divisa} />
          {venta.termino_comercio_internacional ? (
            <FormRow label="Incoterm" valor={venta.termino_comercio_internacional} />
          ) : null}
          {venta.pais_origen_iso ? <FormRow label="Pais origen" valor={venta.pais_origen_iso} /> : null}
          {venta.pais_destino_iso ? <FormRow label="Pais destino" valor={venta.pais_destino_iso} /> : null}
        </SectionCard>

        <SectionCard titulo="Importes">
          <FormRow label="Subtotal neto" valor={fmt(totalNeto)} strong />
          {venta.flag_venta_local ? (
            <FormRow label="IGV (18%)" valor={fmt(totalIgv)} />
          ) : (
            <FormRow label="IGV" valor="No afecta IGV" hint="Exportacion" />
          )}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValor}>{fmt(total)}</Text>
          </View>
        </SectionCard>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PrimaryButton texto="Ver asiento" onPress={() => navigation.navigate('AsientoVenta', { venta })} style={{ flex: 1 }} icono="reader-outline" />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <OutlineButton texto="Editar" onPress={() => navigation.navigate('EditarVenta', { venta })} icono="create-outline" style={{ flex: 1 }} color={tema.secundario} />
          <OutlineButton texto="Eliminar" onPress={onEliminar} icono="trash-outline" style={{ flex: 1 }} color={tema.error} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: tema.primario, borderRadius: 8, padding: 14, marginTop: 6 },
  totalLabel: { color: tema.blanco, fontWeight: '700' },
  totalValor: { color: tema.blanco, fontWeight: '800', fontSize: 16 }
});
