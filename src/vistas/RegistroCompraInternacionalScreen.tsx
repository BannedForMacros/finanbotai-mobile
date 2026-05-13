import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Switch, Text, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import DatePickerButton from '../componentes/DatePickerButton';
import SelectProyecto from '../componentes/SelectProyecto';
import SelectArancelario from '../componentes/SelectArancelario';
import AppSelectButton from '../componentes/AppSelectButton';
import AppModal from '../componentes/ui/AppModal';
import { tema } from '../estilos/tema';
import { getJson, postJson } from '../servicios/clienteAxios';
import { fechaLocal } from '../utilitarios/formatoFecha';

interface TipoMercaderia { id: number; denominacion: string; cuenta_pcge: string; }

const OPCIONES_PERCEPCION = [
  { label: '3.5 % regimen general', valor: 0.035 },
  { label: '5 % primera importacion / no habido', valor: 0.05 },
  { label: '10 % usado', valor: 0.1 }
];

export default function RegistroCompraInternacionalScreen({ navigation, route }: any) {
  const proyectoInicial = route.params?.proyectoId
    ? { id: route.params.proyectoId, nombre: route.params.proyectoNombre }
    : null;

  const [proyecto, setProyecto] = useState<{ id: string; nombre: string } | null>(proyectoInicial);
  const [esLocal, setEsLocal] = useState(false);
  const [tipos, setTipos] = useState<TipoMercaderia[]>([]);
  const [tipoSel, setTipoSel] = useState<TipoMercaderia | null>(null);
  const [tipoModal, setTipoModal] = useState(false);

  const [arancel, setArancel] = useState<{ codigo: string; label: string } | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [tasaAdValoremManual, setTasaAdValoremManual] = useState('');
  const [tasaAuto, setTasaAuto] = useState<number | null>(null);

  const [descripcion, setDescripcion] = useState('');
  const [divisa, setDivisa] = useState<'USD' | 'PEN'>('USD');
  const [fob, setFob] = useState('');
  const [flete, setFlete] = useState('');
  const [seguro, setSeguro] = useState('');

  const [aplicaIgv, setAplicaIgv] = useState(true);
  const [aplicaIsc, setAplicaIsc] = useState(false);
  const [aplicaPerc, setAplicaPerc] = useState(true);
  const [tasaIsc, setTasaIsc] = useState('');
  const [tasaPerc, setTasaPerc] = useState(0.035);
  const [percModal, setPercModal] = useState(false);

  const [antidumping, setAntidumping] = useState('');
  const [compensatorio, setCompensatorio] = useState('');
  const [sda, setSda] = useState('');
  const [fecha, setFecha] = useState(new Date());

  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getJson<{ data: TipoMercaderia[] }>('/api/compras-internacionales/tipos-mercaderia').then((r) => {
      setTipos(r.data || []);
      const def = (r.data || []).find((t) => t.cuenta_pcge === '601');
      if (def) setTipoSel(def);
    }).catch(() => undefined);
  }, []);

  const cif = useMemo(() => {
    const a = parseFloat(fob) || 0;
    const b = parseFloat(flete) || 0;
    const c = parseFloat(seguro) || 0;
    return a + b + c;
  }, [fob, flete, seguro]);

  async function buscarTasaAuto(codigo: string) {
    try {
      const r = await getJson<{ tasa: number }>('/api/catalogo/advalorem', { codigo });
      setTasaAuto(r.tasa);
    } catch {
      setTasaAuto(null);
    }
  }

  function safeFloat(v: string) {
    const n = parseFloat((v || '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  function validar(): string | null {
    if (!proyecto) return 'Selecciona un proyecto.';
    if (!tipoSel) return 'Selecciona un tipo de mercaderia.';
    if (descripcion.trim().length < 3) return 'La descripcion debe tener al menos 3 caracteres.';
    if (!esLocal) {
      const codigo = modoManual ? codigoManual : arancel?.codigo;
      if (!codigo || codigo.length !== 10) return 'Codigo arancelario invalido (10 digitos).';
    }
    if (safeFloat(fob) <= 0) return 'El importe FOB debe ser mayor a cero.';
    if (aplicaIsc && safeFloat(tasaIsc) <= 0) return 'Ingresa la tasa de ISC (0..1).';
    return null;
  }

  async function onGuardar() {
    const err = validar();
    if (err) { Alert.alert('Validacion', err); return; }

    const codigo = !esLocal ? (modoManual ? codigoManual : arancel?.codigo) : undefined;
    const tasaAv = !esLocal
      ? (modoManual ? safeFloat(tasaAdValoremManual) / 100 : tasaAuto || 0)
      : null;

    const payload: any = {
      proyecto_id: proyecto!.id,
      flag_compra_local: esLocal,
      tipo_mercaderia_id: tipoSel!.id,
      codigo_arancelario: codigo,
      descripcion_articulo: descripcion.trim(),
      divisa,
      importe_fob: safeFloat(fob),
      importe_flete: safeFloat(flete),
      importe_seguro: safeFloat(seguro),
      aplica_igv: aplicaIgv,
      aplica_isc: aplicaIsc,
      aplica_percepcion: !esLocal && aplicaPerc,
      tasa_advalorem_input: tasaAv,
      tasa_isc_input: aplicaIsc ? safeFloat(tasaIsc) : null,
      tasa_percepcion_input: !esLocal && aplicaPerc ? tasaPerc : null,
      cargo_antidumping_usd: safeFloat(antidumping),
      cargo_compensatorio_usd: safeFloat(compensatorio),
      cargo_sda_usd: safeFloat(sda),
      fecha_compra: fechaLocal(fecha)
    };

    setEnviando(true);
    try {
      const r = await postJson<{ data: any }>('/api/compras-internacionales', payload);
      navigation.navigate('DetalleCompra', { compra: r.data });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo registrar la compra.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Nueva compra" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionCard titulo="Proyecto">
            <SelectProyecto valor={proyecto} onSelect={setProyecto} deshabilitado={!!proyectoInicial} />
          </SectionCard>

          <SectionCard titulo="Tipo de operacion">
            <View style={styles.fila}>
              <Text style={styles.label}>Compra nacional</Text>
              <Switch value={esLocal} onValueChange={setEsLocal} trackColor={{ true: tema.primario, false: tema.borde }} thumbColor={tema.blanco} />
            </View>
            <Text style={styles.label}>Tipo de mercaderia</Text>
            <AppSelectButton
              valor={tipoSel ? `${tipoSel.cuenta_pcge} - ${tipoSel.denominacion}` : ''}
              placeholder="Selecciona tipo"
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

          {!esLocal ? (
            <SectionCard titulo="Codigo arancelario">
              <View style={styles.fila}>
                <Text style={styles.label}>Modo manual</Text>
                <Switch value={modoManual} onValueChange={(v) => { setModoManual(v); if (v) setArancel(null); else { setCodigoManual(''); setTasaAdValoremManual(''); } }} />
              </View>
              {!modoManual ? (
                <SelectArancelario
                  valor={arancel ? { codigo: arancel.codigo, label: arancel.label } : null}
                  onSelect={(it) => { setArancel(it); buscarTasaAuto(it.codigo); }}
                />
              ) : (
                <>
                  <AppInput value={codigoManual} onChangeText={setCodigoManual} keyboardType="numeric" maxLength={10} placeholder="10 digitos" />
                  <Text style={styles.label}>Tasa Ad Valorem (%)</Text>
                  <AppInput value={tasaAdValoremManual} onChangeText={setTasaAdValoremManual} keyboardType="numeric" placeholder="Ej. 6" />
                </>
              )}
              {tasaAuto !== null && !modoManual ? (
                <Text style={styles.ayuda}>Tasa automatica: {(tasaAuto * 100).toFixed(2)}%</Text>
              ) : null}
            </SectionCard>
          ) : null}

          <SectionCard titulo="Articulo">
            <Text style={styles.label}>Descripcion</Text>
            <AppInput value={descripcion} onChangeText={setDescripcion} placeholder="Detalle del articulo" />
            <Text style={styles.label}>Divisa</Text>
            <View style={styles.divisaRow}>
              {(['USD', 'PEN'] as const).map((d) => (
                <Pressable key={d} style={[styles.divisaBtn, divisa === d && styles.divisaSel]} onPress={() => setDivisa(d)}>
                  <Text style={[styles.divisaTxt, divisa === d && styles.divisaTxtSel]}>{d}</Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>

          <SectionCard titulo={esLocal ? 'Valor de compra' : 'Valores CIF'}>
            <Text style={styles.label}>{esLocal ? 'Valor de compra' : 'Importe FOB'}</Text>
            <AppInput value={fob} onChangeText={setFob} keyboardType="numeric" placeholder="0.00" />
            {!esLocal ? (
              <>
                <Text style={styles.label}>Importe flete</Text>
                <AppInput value={flete} onChangeText={setFlete} keyboardType="numeric" placeholder="0.00" />
                <Text style={styles.label}>Importe seguro</Text>
                <AppInput value={seguro} onChangeText={setSeguro} keyboardType="numeric" placeholder="0.00" />
                <Text style={styles.cifResumen}>CIF estimado: {cif.toFixed(2)}</Text>
              </>
            ) : null}
          </SectionCard>

          <SectionCard titulo="Tributos">
            <View style={styles.fila}>
              <Text style={styles.label}>Gravada con IGV</Text>
              <Switch value={aplicaIgv} onValueChange={setAplicaIgv} />
            </View>
            {!esLocal ? (
              <>
                <View style={styles.fila}>
                  <Text style={styles.label}>Aplica ISC</Text>
                  <Switch value={aplicaIsc} onValueChange={setAplicaIsc} />
                </View>
                {aplicaIsc ? (
                  <>
                    <Text style={styles.label}>Tasa ISC (0..1)</Text>
                    <AppInput value={tasaIsc} onChangeText={setTasaIsc} keyboardType="numeric" placeholder="Ej. 0.10" />
                  </>
                ) : null}
                <View style={styles.fila}>
                  <Text style={styles.label}>Aplica percepcion</Text>
                  <Switch value={aplicaPerc} onValueChange={setAplicaPerc} />
                </View>
                {aplicaPerc ? (
                  <>
                    <Text style={styles.label}>Tasa de percepcion</Text>
                    <AppSelectButton
                      valor={`${(tasaPerc * 100).toFixed(1)}%`}
                      placeholder="Selecciona"
                      onPress={() => setPercModal(true)}
                      abierto={percModal}
                    />
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
                <AppInput value={antidumping} onChangeText={setAntidumping} keyboardType="numeric" placeholder="0.00" />
                <Text style={styles.label}>Compensatorio (USD)</Text>
                <AppInput value={compensatorio} onChangeText={setCompensatorio} keyboardType="numeric" placeholder="0.00" />
                <Text style={styles.label}>SDA (USD)</Text>
                <AppInput value={sda} onChangeText={setSda} keyboardType="numeric" placeholder="0.00" />
              </>
            ) : null}
          </SectionCard>

          <SectionCard titulo="Fecha">
            <DatePickerButton valor={fecha} onChange={setFecha} label="Fecha de la compra" />
          </SectionCard>

          <PrimaryButton texto="Registrar compra" onPress={onGuardar} cargando={enviando} icono="checkmark-circle" style={{ marginTop: 6 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 60 },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  ayuda: { color: tema.exito, marginTop: 6, fontSize: 12 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  divisaRow: { flexDirection: 'row', gap: 8 },
  divisaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.blanco },
  divisaSel: { backgroundColor: tema.primario, borderColor: tema.primario },
  divisaTxt: { color: tema.textoPrincipal, fontWeight: '700' },
  divisaTxtSel: { color: tema.blanco },
  cifResumen: { marginTop: 10, color: tema.primario, fontWeight: '700' },
  itemModal: { paddingVertical: 12, paddingHorizontal: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  cuenta: { color: tema.primario, fontWeight: '700' },
  denom: { color: tema.textoPrincipal }
});
