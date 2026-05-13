import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import AppInput from '../componentes/AppInput';
import AppSelectButton from '../componentes/AppSelectButton';
import AppModal from '../componentes/ui/AppModal';
import DatePickerButton from '../componentes/DatePickerButton';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import { tema } from '../estilos/tema';
import { getJson, putJson } from '../servicios/clienteAxios';
import { fechaLocal, parsearFechaLocal } from '../utilitarios/formatoFecha';

const OPCIONES_PERCEPCION = [
  { label: '3.5 %', valor: 0.035 },
  { label: '5 %', valor: 0.05 },
  { label: '10 %', valor: 0.1 }
];

export default function EditarCompraScreen({ navigation, route }: any) {
  const compra = route.params.compra;

  const [tipos, setTipos] = useState<any[]>([]);
  const [tipoSel, setTipoSel] = useState<any>(null);
  const [tipoModal, setTipoModal] = useState(false);

  const [descripcion, setDescripcion] = useState(compra.descripcion_articulo || '');
  const [divisa, setDivisa] = useState<'USD' | 'PEN'>(compra.divisa);
  const [fob, setFob] = useState(String(compra.importe_fob || ''));
  const [flete, setFlete] = useState(String(compra.importe_flete || ''));
  const [seguro, setSeguro] = useState(String(compra.importe_seguro || ''));
  const [aplicaIgv, setAplicaIgv] = useState(!!compra.aplica_igv);
  const [aplicaIsc, setAplicaIsc] = useState(!!compra.aplica_isc);
  const [aplicaPerc, setAplicaPerc] = useState(!!compra.aplica_percepcion);
  const [tasaIsc, setTasaIsc] = useState(String(compra.tasa_isc_input || ''));
  const [tasaPerc, setTasaPerc] = useState(parseFloat(compra.tasa_percepcion_input || '0.035'));
  const [percModal, setPercModal] = useState(false);
  const [antidumping, setAntidumping] = useState(String(compra.cargo_antidumping_usd || ''));
  const [compensatorio, setCompensatorio] = useState(String(compra.cargo_compensatorio_usd || ''));
  const [sda, setSda] = useState(String(compra.cargo_sda_usd || ''));
  const [fecha, setFecha] = useState(parsearFechaLocal(compra.fecha_compra));
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getJson<{ data: any[] }>('/api/compras-internacionales/tipos-mercaderia').then((r) => {
      setTipos(r.data || []);
      const t = (r.data || []).find((x) => x.id === compra.tipo_mercaderia_id);
      if (t) setTipoSel(t);
    });
  }, []);

  const cif = useMemo(() => (parseFloat(fob) || 0) + (parseFloat(flete) || 0) + (parseFloat(seguro) || 0), [fob, flete, seguro]);

  function safeFloat(v: string) {
    const n = parseFloat((v || '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  async function onGuardar() {
    const payload = {
      flag_compra_local: compra.flag_compra_local,
      tipo_mercaderia_id: tipoSel?.id,
      descripcion_articulo: descripcion.trim(),
      divisa,
      importe_fob: safeFloat(fob),
      importe_flete: safeFloat(flete),
      importe_seguro: safeFloat(seguro),
      aplica_igv: aplicaIgv,
      aplica_isc: aplicaIsc,
      aplica_percepcion: aplicaPerc,
      tasa_isc_input: aplicaIsc ? safeFloat(tasaIsc) : null,
      tasa_percepcion_input: aplicaPerc ? tasaPerc : null,
      cargo_antidumping_usd: safeFloat(antidumping),
      cargo_compensatorio_usd: safeFloat(compensatorio),
      cargo_sda_usd: safeFloat(sda),
      fecha_compra: fechaLocal(fecha)
    };
    setEnviando(true);
    try {
      await putJson(`/api/compras-internacionales/${compra.id}`, payload);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo actualizar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Editar compra" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionCard titulo="Tipo de mercaderia">
            <AppSelectButton
              valor={tipoSel ? `${tipoSel.cuenta_pcge} - ${tipoSel.denominacion}` : ''}
              placeholder="Selecciona"
              onPress={() => setTipoModal(true)}
              abierto={tipoModal}
            />
            <AppModal visible={tipoModal} onClose={() => setTipoModal(false)} titulo="Tipo de mercaderia">
              {tipos.map((t) => (
                <Pressable key={t.id} style={styles.itemModal} onPress={() => { setTipoSel(t); setTipoModal(false); }}>
                  <Text style={styles.cuenta}>{t.cuenta_pcge}</Text>
                  <Text style={styles.denom}>{t.denominacion}</Text>
                </Pressable>
              ))}
            </AppModal>
          </SectionCard>

          <SectionCard titulo="Articulo">
            <Text style={styles.label}>Descripcion</Text>
            <AppInput value={descripcion} onChangeText={setDescripcion} />
            <Text style={styles.label}>Divisa</Text>
            <View style={styles.divisaRow}>
              {(['USD', 'PEN'] as const).map((d) => (
                <Pressable key={d} style={[styles.divisaBtn, divisa === d && styles.divisaSel]} onPress={() => setDivisa(d)}>
                  <Text style={[styles.divisaTxt, divisa === d && styles.divisaTxtSel]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>

          <SectionCard titulo={compra.flag_compra_local ? 'Valor de compra' : 'Valores CIF'}>
            <Text style={styles.label}>{compra.flag_compra_local ? 'Valor de compra' : 'Importe FOB'}</Text>
            <AppInput value={fob} onChangeText={setFob} keyboardType="numeric" />
            {!compra.flag_compra_local ? (
              <>
                <Text style={styles.label}>Importe flete</Text>
                <AppInput value={flete} onChangeText={setFlete} keyboardType="numeric" />
                <Text style={styles.label}>Importe seguro</Text>
                <AppInput value={seguro} onChangeText={setSeguro} keyboardType="numeric" />
                <Text style={styles.cif}>CIF: {cif.toFixed(2)}</Text>
              </>
            ) : null}
          </SectionCard>

          <SectionCard titulo="Tributos">
            <View style={styles.fila}><Text style={styles.label}>Gravada con IGV</Text><Switch value={aplicaIgv} onValueChange={setAplicaIgv} /></View>
            {!compra.flag_compra_local ? (
              <>
                <View style={styles.fila}><Text style={styles.label}>Aplica ISC</Text><Switch value={aplicaIsc} onValueChange={setAplicaIsc} /></View>
                {aplicaIsc ? (
                  <>
                    <Text style={styles.label}>Tasa ISC</Text>
                    <AppInput value={tasaIsc} onChangeText={setTasaIsc} keyboardType="numeric" placeholder="0..1" />
                  </>
                ) : null}
                <View style={styles.fila}><Text style={styles.label}>Aplica percepcion</Text><Switch value={aplicaPerc} onValueChange={setAplicaPerc} /></View>
                {aplicaPerc ? (
                  <>
                    <Text style={styles.label}>Tasa de percepcion</Text>
                    <AppSelectButton valor={`${(tasaPerc * 100).toFixed(1)}%`} placeholder="Selecciona" onPress={() => setPercModal(true)} abierto={percModal} />
                    <AppModal visible={percModal} onClose={() => setPercModal(false)} titulo="Tasa de percepcion">
                      {OPCIONES_PERCEPCION.map((o) => (
                        <Pressable key={o.valor} style={styles.itemModal} onPress={() => { setTasaPerc(o.valor); setPercModal(false); }}>
                          <Text style={styles.denom}>{o.label}</Text>
                        </Pressable>
                      ))}
                    </AppModal>
                  </>
                ) : null}
                <Text style={styles.label}>Antidumping (USD)</Text>
                <AppInput value={antidumping} onChangeText={setAntidumping} keyboardType="numeric" />
                <Text style={styles.label}>Compensatorio (USD)</Text>
                <AppInput value={compensatorio} onChangeText={setCompensatorio} keyboardType="numeric" />
                <Text style={styles.label}>SDA (USD)</Text>
                <AppInput value={sda} onChangeText={setSda} keyboardType="numeric" />
              </>
            ) : null}
          </SectionCard>

          <SectionCard titulo="Fecha">
            <DatePickerButton valor={fecha} onChange={setFecha} label="Fecha de la compra" />
          </SectionCard>

          <PrimaryButton texto="Guardar cambios" onPress={onGuardar} cargando={enviando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 60 },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  divisaRow: { flexDirection: 'row', gap: 8 },
  divisaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.blanco },
  divisaSel: { backgroundColor: tema.primario, borderColor: tema.primario },
  divisaTxt: { color: tema.textoPrincipal, fontWeight: '700' },
  divisaTxtSel: { color: tema.blanco },
  cif: { color: tema.primario, fontWeight: '700', marginTop: 10 },
  itemModal: { paddingVertical: 10, paddingHorizontal: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  cuenta: { color: tema.primario, fontWeight: '700' },
  denom: { color: tema.textoPrincipal }
});
