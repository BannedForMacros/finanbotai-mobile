import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import DatePickerButton from '../componentes/DatePickerButton';
import CategoriaEgresoPickerModal, { CategoriaEgreso } from '../componentes/CategoriaEgresoPickerModal';
import { tema } from '../estilos/tema';
import { getJson, patchJson } from '../servicios/clienteAxios';
import { fechaLocal, parsearFechaLocal } from '../utilitarios/formatoFecha';

export default function EditarEgresoScreen({ navigation, route }: any) {
  const egreso = route.params.egreso;
  const tipo = route.params.tipo;
  const [catalogo, setCatalogo] = useState<CategoriaEgreso[]>([]);
  const [categoria, setCategoria] = useState<CategoriaEgreso | null>(null);
  const [concepto, setConcepto] = useState(egreso.concepto_egreso || '');
  const [importe, setImporte] = useState(String(egreso.importe_total || ''));
  const [divisa, setDivisa] = useState<'USD' | 'PEN'>(egreso.divisa || 'PEN');
  const [fecha, setFecha] = useState(parsearFechaLocal(egreso.fecha_egreso));
  const [esPlanilla, setEsPlanilla] = useState(!!egreso.flag_planilla);
  const [regimen, setRegimen] = useState<'ONP' | 'AFP' | null>(egreso.regimen_previsional || null);
  const [conIgv, setConIgv] = useState(!!egreso.con_igv);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getJson<{ data: CategoriaEgreso[] }>('/api/egresos/catalogo').then((r) => {
      const filtradas = (r.data || []).filter((c) => c.tipo_egreso === tipo);
      setCatalogo(filtradas);
      const sel = filtradas.find((c) => c.id === egreso.categoria_egreso_id);
      if (sel) setCategoria(sel);
    });
  }, [tipo]);

  async function onGuardar() {
    if (!categoria) { Alert.alert('Validacion', 'Selecciona una categoria.'); return; }
    if (concepto.trim().length < 3) { Alert.alert('Validacion', 'Describe el egreso.'); return; }

    setEnviando(true);
    try {
      await patchJson(`/api/egresos/${egreso.id}`, {
        categoria_egreso_id: categoria.id,
        concepto_egreso: concepto.trim(),
        importe_total: parseFloat(importe) || 0,
        divisa,
        fecha_egreso: fechaLocal(fecha),
        flag_planilla: esPlanilla,
        regimen_previsional: esPlanilla ? regimen : null,
        con_igv: categoria.computa_igv ? conIgv : false
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
      <ScreenHeader titulo="Editar egreso" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          <SectionCard titulo="Categoria">
            <CategoriaEgresoPickerModal categorias={catalogo} seleccionadaId={categoria?.id} onSelect={setCategoria} />
          </SectionCard>
          <SectionCard titulo="Detalle">
            <Text style={styles.label}>Concepto</Text>
            <AppInput value={concepto} onChangeText={setConcepto} />
            <Text style={styles.label}>Importe</Text>
            <AppInput value={importe} onChangeText={setImporte} keyboardType="numeric" />
            <Text style={styles.label}>Divisa</Text>
            <View style={styles.row}>
              {(['USD', 'PEN'] as const).map((d) => (
                <Pressable key={d} style={[styles.btn, divisa === d && styles.btnSel]} onPress={() => setDivisa(d)}>
                  <Text style={[styles.btnTxt, divisa === d && styles.btnTxtSel]}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <DatePickerButton valor={fecha} onChange={setFecha} label="Fecha" />
            {categoria?.computa_igv && categoria?.igv_opcional ? (
              <View style={styles.filaIgv}>
                <Text style={styles.label}>Incluye IGV</Text>
                <Switch value={conIgv} onValueChange={setConIgv} />
              </View>
            ) : null}
          </SectionCard>

          {esPlanilla ? (
            <SectionCard titulo="Planilla">
              <Text style={styles.label}>Regimen previsional</Text>
              <View style={styles.row}>
                {(['ONP', 'AFP'] as const).map((r) => (
                  <Pressable key={r} style={[styles.btn, regimen === r && styles.btnSel]} onPress={() => setRegimen(r)}>
                    <Text style={[styles.btnTxt, regimen === r && styles.btnTxtSel]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </SectionCard>
          ) : null}

          <PrimaryButton texto="Guardar cambios" onPress={onGuardar} cargando={enviando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.blanco },
  btnSel: { backgroundColor: tema.primario, borderColor: tema.primario },
  btnTxt: { color: tema.textoPrincipal, fontWeight: '700' },
  btnTxtSel: { color: tema.blanco },
  filaIgv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }
});
