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

interface Linea { cuenta: string; nombre_cuenta: string; debe: number; haber: number; glosa: string; }

export default function AsientoCompraScreen({ navigation, route }: any) {
  const compra = route.params.compra;
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [totalDebe, setTotalDebe] = useState(0);
  const [totalHaber, setTotalHaber] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [divisa, setDivisa] = useState<Divisa>(compra.divisa as Divisa);
  const fx = useCotizacionFecha(compra.fecha_compra);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getJson<{ data: { lineas: Linea[]; totalDebe: number; totalHaber: number } }>(
        `/api/compras-internacionales/${compra.id}/asiento`
      );
      setLineas(r.data.lineas || []);
      setTotalDebe(r.data.totalDebe);
      setTotalHaber(r.data.totalHaber);
    } finally {
      setCargando(false);
    }
  }, [compra.id]);

  useEffect(() => { cargar(); }, [cargar]);

  function conv(n: number) {
    const v = divisa === 'PEN' ? (fx.convertir(n, compra.divisa as Divisa, 'PEN') ?? n) : n;
    return v;
  }
  function fmt(n: number) { return fx.formatear(conv(n), divisa); }

  const cuadrado = Math.abs(conv(totalDebe) - conv(totalHaber)) < 0.01;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader
        titulo="Asiento contable"
        subtitulo={compra.descripcion_articulo}
        onBack={() => navigation.goBack()}
        derecha={<CurrencyToggle divisa={divisa} onChange={setDivisa} />}
      />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16 }}>
        <SectionCard titulo="Detalle del asiento">
          <View style={styles.encabezado}>
            <Text style={[styles.col, { flex: 1 }]}>Cuenta</Text>
            <Text style={[styles.col, styles.right]}>Debe</Text>
            <Text style={[styles.col, styles.right]}>Haber</Text>
          </View>
          {lineas.map((l, i) => (
            <View key={i} style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cuenta}>{l.cuenta}</Text>
                <Text style={styles.nombre} numberOfLines={2}>{l.nombre_cuenta}</Text>
                {l.glosa ? <Text style={styles.glosa} numberOfLines={2}>{l.glosa}</Text> : null}
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
  glosa: { color: tema.textoSecundario, fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  monto: { color: tema.textoPrincipal, fontWeight: '600', width: 90 },
  totales: { flexDirection: 'row', paddingVertical: 10, borderTopColor: tema.borde, borderTopWidth: 1.5, marginTop: 4 },
  totalMonto: { color: tema.primario, fontWeight: '800', width: 90 },
  balance: { marginTop: 8, fontWeight: '700', textAlign: 'center' }
});
