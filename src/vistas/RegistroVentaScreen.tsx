import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import AppInput from '../componentes/AppInput';
import AppSelectButton from '../componentes/AppSelectButton';
import AppModal from '../componentes/ui/AppModal';
import DatePickerButton from '../componentes/DatePickerButton';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import SelectProyecto from '../componentes/SelectProyecto';
import IncotermSelectionModal from '../componentes/IncotermSelectionModal';
import { tema } from '../estilos/tema';
import { getJson, postJson } from '../servicios/clienteAxios';
import { fechaLocal } from '../utilitarios/formatoFecha';

interface TipoArticulo { id: number; denominacion: string; cuenta_pcge: string; }

export default function RegistroVentaScreen({ navigation, route }: any) {
  const proyectoInicial = route.params?.proyectoId
    ? { id: route.params.proyectoId, nombre: route.params.proyectoNombre }
    : null;

  const [proyecto, setProyecto] = useState<{ id: string; nombre: string } | null>(proyectoInicial);
  const [esLocal, setEsLocal] = useState(false);
  const [tipos, setTipos] = useState<TipoArticulo[]>([]);
  const [tipoSel, setTipoSel] = useState<TipoArticulo | null>(null);
  const [tipoModal, setTipoModal] = useState(false);
  const [incoterm, setIncoterm] = useState('');
  const [incotermModal, setIncotermModal] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [paisOrigen, setPaisOrigen] = useState('PER');
  const [paisDestino, setPaisDestino] = useState('');
  const [importeNeto, setImporteNeto] = useState('');
  const [divisa, setDivisa] = useState<'USD' | 'PEN'>('USD');
  const [fecha, setFecha] = useState(new Date());
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getJson<{ data: TipoArticulo[] }>('/api/ventas-internacionales/tipos-articulo').then((r) => {
      setTipos(r.data || []);
    });
  }, []);

  useEffect(() => {
    if (!tipos.length) return;
    const cuenta = esLocal ? '7011' : '7012';
    const t = tipos.find((x) => x.cuenta_pcge === cuenta);
    if (t) setTipoSel(t);
    if (esLocal) {
      setPaisOrigen('PER');
      setPaisDestino('PER');
    }
  }, [esLocal, tipos]);

  const subtotales = useMemo(() => {
    const total = parseFloat((importeNeto || '0').replace(',', '.')) || 0;
    if (esLocal) {
      const base = Math.round((total / 1.18) * 100) / 100;
      return { base, igv: total - base, total };
    }
    return { base: total, igv: 0, total };
  }, [importeNeto, esLocal]);

  function safeFloat(v: string) {
    const n = parseFloat((v || '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  async function onGuardar() {
    if (!proyecto) { Alert.alert('Validacion', 'Selecciona un proyecto.'); return; }
    if (!tipoSel) { Alert.alert('Validacion', 'Selecciona tipo de articulo.'); return; }
    if (descripcion.trim().length < 3) { Alert.alert('Validacion', 'Descripcion muy corta.'); return; }
    if (safeFloat(importeNeto) <= 0) { Alert.alert('Validacion', 'Importe invalido.'); return; }

    setEnviando(true);
    try {
      const r = await postJson<{ data: { venta: any } }>('/api/ventas-internacionales', {
        proyecto_id: proyecto.id,
        flag_venta_local: esLocal,
        tipo_articulo_id: tipoSel.id,
        termino_comercio_internacional: incoterm || undefined,
        descripcion_articulo: descripcion.trim(),
        pais_origen_iso: paisOrigen || undefined,
        pais_destino_iso: paisDestino || undefined,
        importe_venta_neto: safeFloat(importeNeto),
        divisa,
        fecha_venta: fechaLocal(fecha)
      });
      navigation.navigate('DetalleVenta', { venta: r.data.venta });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo registrar la venta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Nueva venta" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionCard titulo="Proyecto">
            <SelectProyecto valor={proyecto} onSelect={setProyecto} deshabilitado={!!proyectoInicial} />
          </SectionCard>

          <SectionCard titulo="Tipo de venta">
            <View style={styles.fila}>
              <Text style={styles.label}>Venta nacional</Text>
              <Switch value={esLocal} onValueChange={setEsLocal} />
            </View>
            <Text style={styles.label}>Tipo de articulo</Text>
            <AppSelectButton
              valor={tipoSel ? `${tipoSel.cuenta_pcge} - ${tipoSel.denominacion}` : ''}
              placeholder="Selecciona"
              onPress={() => setTipoModal(true)}
              abierto={tipoModal}
            />
            <AppModal visible={tipoModal} onClose={() => setTipoModal(false)} titulo="Tipo de articulo">
              {tipos.map((t) => (
                <Pressable key={t.id} style={styles.itemModal} onPress={() => { setTipoSel(t); setTipoModal(false); }}>
                  <Text style={styles.cuenta}>{t.cuenta_pcge}</Text>
                  <Text style={styles.denom}>{t.denominacion}</Text>
                </Pressable>
              ))}
            </AppModal>
            {!esLocal ? (
              <>
                <Text style={styles.label}>Incoterm</Text>
                <AppSelectButton valor={incoterm} placeholder="Selecciona Incoterm" onPress={() => setIncotermModal(true)} abierto={incotermModal} />
                <IncotermSelectionModal visible={incotermModal} onClose={() => setIncotermModal(false)} onSelect={setIncoterm} seleccionado={incoterm} />
              </>
            ) : null}
          </SectionCard>

          <SectionCard titulo="Articulo">
            <Text style={styles.label}>Descripcion</Text>
            <AppInput value={descripcion} onChangeText={setDescripcion} placeholder="Detalle de la venta" />
            <View style={styles.dosCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pais origen ISO</Text>
                <AppInput value={paisOrigen} onChangeText={(t) => setPaisOrigen(t.toUpperCase())} maxLength={3} placeholder="PER" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pais destino ISO</Text>
                <AppInput value={paisDestino} onChangeText={(t) => setPaisDestino(t.toUpperCase())} maxLength={3} placeholder="USA" />
              </View>
            </View>
          </SectionCard>

          <SectionCard titulo="Importe">
            <Text style={styles.label}>Divisa</Text>
            <View style={styles.divisaRow}>
              {(['USD', 'PEN'] as const).map((d) => (
                <Pressable key={d} style={[styles.divisaBtn, divisa === d && styles.divisaSel]} onPress={() => setDivisa(d)}>
                  <Text style={[styles.divisaTxt, divisa === d && styles.divisaTxtSel]}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>{esLocal ? 'Importe total (con IGV)' : 'Importe de venta'}</Text>
            <AppInput value={importeNeto} onChangeText={setImporteNeto} keyboardType="numeric" placeholder="0.00" />
            {esLocal ? (
              <View style={styles.calcWrap}>
                <Text style={styles.calc}>Base sin IGV: {subtotales.base.toFixed(2)}</Text>
                <Text style={styles.calc}>IGV (18%): {subtotales.igv.toFixed(2)}</Text>
              </View>
            ) : (
              <Text style={styles.ayuda}>Exportacion: no aplica IGV.</Text>
            )}
          </SectionCard>

          <SectionCard titulo="Fecha">
            <DatePickerButton valor={fecha} onChange={setFecha} label="Fecha de la venta" />
          </SectionCard>

          <PrimaryButton texto="Registrar venta" onPress={onGuardar} cargando={enviando} icono="checkmark-circle" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 60 },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  dosCols: { flexDirection: 'row', gap: 12, marginTop: 6 },
  divisaRow: { flexDirection: 'row', gap: 8 },
  divisaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.blanco },
  divisaSel: { backgroundColor: tema.primario, borderColor: tema.primario },
  divisaTxt: { color: tema.textoPrincipal, fontWeight: '700' },
  divisaTxtSel: { color: tema.blanco },
  itemModal: { paddingVertical: 12, paddingHorizontal: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  cuenta: { color: tema.primario, fontWeight: '700' },
  denom: { color: tema.textoPrincipal },
  calcWrap: { marginTop: 10, backgroundColor: tema.superficie, borderRadius: 6, padding: 10 },
  calc: { color: tema.textoPrincipal, fontWeight: '600' },
  ayuda: { color: tema.acento, fontStyle: 'italic', marginTop: 8 }
});
