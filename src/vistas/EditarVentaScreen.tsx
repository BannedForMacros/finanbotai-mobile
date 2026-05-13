import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import AppInput from '../componentes/AppInput';
import AppSelectButton from '../componentes/AppSelectButton';
import AppModal from '../componentes/ui/AppModal';
import DatePickerButton from '../componentes/DatePickerButton';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import IncotermSelectionModal from '../componentes/IncotermSelectionModal';
import { tema } from '../estilos/tema';
import { getJson, putJson } from '../servicios/clienteAxios';
import { fechaLocal, parsearFechaLocal } from '../utilitarios/formatoFecha';

export default function EditarVentaScreen({ navigation, route }: any) {
  const venta = route.params.venta;
  const [tipos, setTipos] = useState<any[]>([]);
  const [tipoSel, setTipoSel] = useState<any>(null);
  const [tipoModal, setTipoModal] = useState(false);
  const [esLocal, setEsLocal] = useState(!!venta.flag_venta_local);
  const [incoterm, setIncoterm] = useState(venta.termino_comercio_internacional || '');
  const [incotermModal, setIncotermModal] = useState(false);
  const [descripcion, setDescripcion] = useState(venta.descripcion_articulo || '');
  const [paisOrigen, setPaisOrigen] = useState(venta.pais_origen_iso || 'PER');
  const [paisDestino, setPaisDestino] = useState(venta.pais_destino_iso || '');
  const [importeNeto, setImporteNeto] = useState(String(venta.importe_venta_neto || ''));
  const [divisa, setDivisa] = useState<'USD' | 'PEN'>(venta.divisa);
  const [fecha, setFecha] = useState(parsearFechaLocal(venta.fecha_venta));
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getJson<{ data: any[] }>('/api/ventas-internacionales/tipos-articulo').then((r) => {
      setTipos(r.data || []);
      const t = (r.data || []).find((x) => x.id === venta.tipo_articulo_id);
      if (t) setTipoSel(t);
    });
  }, []);

  async function onGuardar() {
    setEnviando(true);
    try {
      await putJson(`/api/ventas-internacionales/${venta.id}`, {
        flag_venta_local: esLocal,
        tipo_articulo_id: tipoSel?.id,
        termino_comercio_internacional: incoterm || undefined,
        descripcion_articulo: descripcion.trim(),
        pais_origen_iso: paisOrigen || undefined,
        pais_destino_iso: paisDestino || undefined,
        importe_venta_neto: parseFloat(importeNeto) || 0,
        divisa,
        fecha_venta: fechaLocal(fecha)
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo actualizar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Editar venta" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          <SectionCard titulo="Tipo">
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
                <AppSelectButton valor={incoterm} placeholder="Selecciona" onPress={() => setIncotermModal(true)} abierto={incotermModal} />
                <IncotermSelectionModal visible={incotermModal} onClose={() => setIncotermModal(false)} onSelect={setIncoterm} seleccionado={incoterm} />
              </>
            ) : null}
          </SectionCard>

          <SectionCard titulo="Articulo">
            <Text style={styles.label}>Descripcion</Text>
            <AppInput value={descripcion} onChangeText={setDescripcion} />
            <View style={styles.dosCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pais origen</Text>
                <AppInput value={paisOrigen} onChangeText={(t) => setPaisOrigen(t.toUpperCase())} maxLength={3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Pais destino</Text>
                <AppInput value={paisDestino} onChangeText={(t) => setPaisDestino(t.toUpperCase())} maxLength={3} />
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
            <Text style={styles.label}>Importe</Text>
            <AppInput value={importeNeto} onChangeText={setImporteNeto} keyboardType="numeric" />
          </SectionCard>

          <SectionCard titulo="Fecha">
            <DatePickerButton valor={fecha} onChange={setFecha} label="Fecha de la venta" />
          </SectionCard>

          <PrimaryButton texto="Guardar cambios" onPress={onGuardar} cargando={enviando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  dosCols: { flexDirection: 'row', gap: 12 },
  divisaRow: { flexDirection: 'row', gap: 8 },
  divisaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.blanco },
  divisaSel: { backgroundColor: tema.primario, borderColor: tema.primario },
  divisaTxt: { color: tema.textoPrincipal, fontWeight: '700' },
  divisaTxtSel: { color: tema.blanco },
  itemModal: { paddingVertical: 10, paddingHorizontal: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  cuenta: { color: tema.primario, fontWeight: '700' },
  denom: { color: tema.textoPrincipal }
});
