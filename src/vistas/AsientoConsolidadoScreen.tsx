import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import CurrencyToggle from '../componentes/CurrencyToggle';
import InfoBanner from '../componentes/ui/InfoBanner';
import LoadingOverlay from '../componentes/LoadingOverlay';
import { tema } from '../estilos/tema';
import { getJson } from '../servicios/clienteAxios';
import type { Divisa } from '../hooks/useCotizacion';

export default function AsientoConsolidadoScreen({ navigation, route }: any) {
  const { proyectoId, nombreProyecto } = route.params;
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [divisa, setDivisa] = useState<Divisa>('USD');

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getJson<{ data: any; metadata: any }>(
        `/api/rentabilidad/asiento-consolidado/${proyectoId}`,
        { moneda: divisa }
      );
      setData({ ...r.data, metadata: r.metadata });
    } catch (e) {
      setData(null);
    } finally {
      setCargando(false);
    }
  }, [proyectoId, divisa]);

  useEffect(() => { cargar(); }, [cargar]);

  const cuadrado = data ? Math.abs(data.diferencia) <= 0.01 : true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader
        titulo="Asiento consolidado"
        subtitulo={nombreProyecto}
        onBack={() => navigation.goBack()}
        derecha={<CurrencyToggle divisa={divisa} onChange={setDivisa} />}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16 }}>
        {!cuadrado ? (
          <InfoBanner
            mensaje={`Diferencia entre Debe y Haber: ${data.diferencia.toFixed(2)} ${data.moneda}`}
            variante="advertencia"
          />
        ) : null}

        <SectionCard titulo={data?.glosa || 'Detalle'}>
          <View style={styles.encabezado}>
            <Text style={[styles.col, { flex: 1 }]}>Cuenta</Text>
            <Text style={[styles.col, styles.right]}>Debe</Text>
            <Text style={[styles.col, styles.right]}>Haber</Text>
          </View>
          {(data?.detalles || []).map((l: any, i: number) => (
            <View key={i} style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cuenta}>{l.cuenta}</Text>
                <Text style={styles.nombre} numberOfLines={2}>{l.nombre_cuenta}</Text>
              </View>
              <Text style={[styles.monto, styles.right]}>{l.debe > 0 ? l.debe.toFixed(2) : '-'}</Text>
              <Text style={[styles.monto, styles.right]}>{l.haber > 0 ? l.haber.toFixed(2) : '-'}</Text>
            </View>
          ))}
          {data ? (
            <View style={styles.totales}>
              <Text style={[styles.col, { flex: 1, fontWeight: '700' }]}>Totales ({data.moneda})</Text>
              <Text style={[styles.totalMonto, styles.right]}>{data.totalDebe.toFixed(2)}</Text>
              <Text style={[styles.totalMonto, styles.right]}>{data.totalHaber.toFixed(2)}</Text>
            </View>
          ) : null}
          <Text style={styles.tc}>Tipo de cambio: {data?.tipo_cambio?.toFixed(4) || '-'}</Text>
        </SectionCard>
      </ScrollView>
      <LoadingOverlay visible={cargando} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  encabezado: { flexDirection: 'row', paddingBottom: 8, borderBottomColor: tema.borde, borderBottomWidth: 1 },
  col: { color: tema.textoSecundario, fontWeight: '700', fontSize: 12, width: 90 },
  right: { textAlign: 'right' },
  fila: { flexDirection: 'row', paddingVertical: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  cuenta: { color: tema.primario, fontWeight: '700' },
  nombre: { color: tema.textoPrincipal, fontSize: 12 },
  monto: { color: tema.textoPrincipal, fontWeight: '600', width: 90 },
  totales: { flexDirection: 'row', paddingTop: 10, borderTopColor: tema.borde, borderTopWidth: 1.5, marginTop: 4 },
  totalMonto: { color: tema.primario, fontWeight: '800', width: 90 },
  tc: { textAlign: 'center', color: tema.textoSecundario, fontSize: 11, marginTop: 10 }
});
