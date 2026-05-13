import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import FormRow from '../componentes/FormRow';
import OutlineButton from '../componentes/ui/OutlineButton';
import LoadingOverlay from '../componentes/LoadingOverlay';
import { tema } from '../estilos/tema';
import { getJson, deleteJson } from '../servicios/clienteAxios';
import { mostrarFecha } from '../utilitarios/formatoFecha';

export default function DetalleEgresoScreen({ navigation, route }: any) {
  const [egreso, setEgreso] = useState<any>(route.params.egreso);
  const tipo = route.params.tipo;
  const [asiento, setAsiento] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getJson<{ data: any }>(`/api/egresos/${egreso.id}/asiento`);
      setAsiento(r.data);
    } finally {
      setCargando(false);
    }
  }, [egreso.id]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  async function onEliminar() {
    Alert.alert('Eliminar', 'Confirma la eliminacion.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteJson(`/api/egresos/${egreso.id}`);
          navigation.goBack();
        }
      }
    ]);
  }

  const subNeto = parseFloat(egreso.subtotal_neto || '0');
  const subIgv = parseFloat(egreso.subtotal_igv || '0');
  const total = parseFloat(egreso.importe_total || '0');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Detalle del egreso" subtitulo={egreso.concepto_egreso} onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <SectionCard titulo="Datos">
          <FormRow label="Concepto" valor={egreso.concepto_egreso} strong />
          <FormRow label="Categoria" valor={egreso.denominacion || '-'} />
          <FormRow label="Cuenta" valor={egreso.cuenta_pcge || '-'} />
          <FormRow label="Fecha" valor={mostrarFecha(egreso.fecha_egreso)} />
          <FormRow label="Divisa" valor={egreso.divisa} />
        </SectionCard>

        <SectionCard titulo="Importes">
          <FormRow label="Subtotal neto" valor={subNeto.toFixed(2)} />
          {subIgv > 0 ? <FormRow label="IGV (18%)" valor={subIgv.toFixed(2)} /> : null}
          <FormRow label="Importe total" valor={total.toFixed(2)} strong />
        </SectionCard>

        {egreso.flag_planilla ? (
          <SectionCard titulo="Planilla">
            <FormRow label="Regimen" valor={egreso.regimen_previsional || '-'} />
            <FormRow label="ESSALUD (9%)" valor={(subNeto * 0.09).toFixed(2)} hint="Calculado" />
            {egreso.regimen_previsional === 'ONP' ? <FormRow label="ONP (13%)" valor={(subNeto * 0.13).toFixed(2)} /> : null}
            {egreso.regimen_previsional === 'AFP' ? <FormRow label="AFP (11.37%)" valor={(subNeto * 0.1137).toFixed(2)} /> : null}
          </SectionCard>
        ) : null}

        {asiento ? (
          <SectionCard titulo="Asiento contable">
            {asiento.detalles?.map((l: any, i: number) => (
              <View key={i} style={styles.fila}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cuenta}>{l.cuenta}</Text>
                  <Text style={styles.nombre} numberOfLines={2}>{l.nombre_cuenta}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.colTxt}>{l.debe > 0 ? l.debe.toFixed(2) : '-'}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.colTxt}>{l.haber > 0 ? l.haber.toFixed(2) : '-'}</Text>
                </View>
              </View>
            ))}
            <View style={styles.totales}>
              <Text style={{ flex: 1, fontWeight: '700' }}>Totales</Text>
              <Text style={styles.colTxtTotal}>{asiento.total_debe?.toFixed(2)}</Text>
              <Text style={styles.colTxtTotal}>{asiento.total_haber?.toFixed(2)}</Text>
            </View>
          </SectionCard>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <OutlineButton texto="Editar" onPress={() => navigation.navigate('EditarEgreso', { egreso, tipo })} icono="create-outline" style={{ flex: 1 }} color={tema.secundario} />
          <OutlineButton texto="Eliminar" onPress={onEliminar} icono="trash-outline" style={{ flex: 1 }} color={tema.error} />
        </View>
      </ScrollView>
      <LoadingOverlay visible={cargando} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', paddingVertical: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  cuenta: { color: tema.primario, fontWeight: '700' },
  nombre: { color: tema.textoPrincipal, fontSize: 12 },
  col: { width: 80, alignItems: 'flex-end' },
  colTxt: { color: tema.textoPrincipal, fontWeight: '600' },
  totales: { flexDirection: 'row', paddingTop: 10, borderTopColor: tema.borde, borderTopWidth: 1.5, marginTop: 4 },
  colTxtTotal: { width: 80, textAlign: 'right', color: tema.primario, fontWeight: '800' }
});
