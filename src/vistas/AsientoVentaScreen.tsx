import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import CurrencyToggle from '../componentes/CurrencyToggle';
import LoadingOverlay from '../componentes/LoadingOverlay';
import { tema } from '../estilos/tema';
import { useCotizacionFecha } from '../hooks/useCotizacionFecha';
import { getJson } from '../servicios/clienteAxios';
import type { Divisa } from '../hooks/useCotizacion';

export default function AsientoVentaScreen({ navigation, route }: any) {
  const venta = route.params.venta;
  const [asiento, setAsiento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [divisa, setDivisa] = useState<Divisa>(venta.divisa as Divisa);
  const fx = useCotizacionFecha(venta.fecha_venta);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getJson<{ data: any }>(`/api/ventas-internacionales/${venta.id}/asiento`);
      setAsiento(r.data);
    } finally {
      setCargando(false);
    }
  }, [venta.id]);

  useEffect(() => { cargar(); }, [cargar]);

  function conv(n: number) {
    return divisa === 'PEN' ? (fx.convertir(n, venta.divisa as Divisa, 'PEN') ?? n) : n;
  }
  function fmt(n: number) { return fx.formatear(conv(n), divisa); }

  const lineas = asiento?.detalle_lineas_jsonb || [];
  const totalDebe = parseFloat(asiento?.total_debe || '0');
  const totalHaber = parseFloat(asiento?.total_haber || '0');
  const cuadrado = Math.abs(conv(totalDebe) - conv(totalHaber)) < 0.01;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader
        titulo="Asiento de venta"
        subtitulo={venta.descripcion_articulo}
        onBack={() => navigation.goBack()}
        derecha={<CurrencyToggle divisa={divisa} onChange={setDivisa} />}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16 }}>
        <SectionCard titulo={asiento?.glosa_asiento || 'Detalle'}>
          <View style={styles.encabezado}>
            <Text style={[styles.col, { flex: 1 }]}>Cuenta</Text>
            <Text style={[styles.col, styles.right]}>Debe</Text>
            <Text style={[styles.col, styles.right]}>Haber</Text>
          </View>
          {lineas.map((l: any, i: number) => (
            <View key={i} style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cuenta}>{l.cuenta || l.codigo_cuenta}</Text>
                <Text style={styles.nombre} numberOfLines={2}>{l.nombre_cuenta || l.denominacion}</Text>
              </View>
              <Text style={[styles.monto, styles.right]}>{l.debe > 0 ? fmt(l.debe) : '-'}</Text>
              <Text style={[styles.monto, styles.right]}>{l.haber > 0 ? fmt(l.haber) : '-'}</Text>
            </View>
          ))}
          <View style={styles.totales}>
            <Text style={[styles.col, { flex: 1, fontWeight: '700' }]}>Totales</Text>
            <Text style={[styles.totalMonto, styles.right]}>{fmt(totalDebe)}</Text>
            <Text style={[styles.totalMonto, styles.right]}>{fmt(totalHaber)}</Text>
          </View>
          <Text style={[styles.balance, { color: cuadrado ? tema.exito : tema.error }]}>
            {cuadrado ? 'Asiento balanceado' : 'Asiento descuadrado'}
          </Text>
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
  fila: { flexDirection: 'row', paddingVertical: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1, alignItems: 'flex-start' },
  cuenta: { color: tema.primario, fontWeight: '700' },
  nombre: { color: tema.textoPrincipal, fontSize: 12 },
  monto: { color: tema.textoPrincipal, fontWeight: '600', width: 90 },
  totales: { flexDirection: 'row', paddingVertical: 10, borderTopColor: tema.borde, borderTopWidth: 1.5, marginTop: 4 },
  totalMonto: { color: tema.primario, fontWeight: '800', width: 90 },
  balance: { marginTop: 8, fontWeight: '700', textAlign: 'center' }
});
