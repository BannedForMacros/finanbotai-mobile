import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import DatePickerButton from '../componentes/DatePickerButton';
import CategoriaEgresoPickerModal, { CategoriaEgreso } from '../componentes/CategoriaEgresoPickerModal';
import { tema } from '../estilos/tema';
import { getJson, postJson } from '../servicios/clienteAxios';
import { fechaLocal } from '../utilitarios/formatoFecha';
import type { TipoEgresoRuta } from '../navegacion/PilaPrincipalNav';

export default function RegistroEgresoScreen({ navigation, route }: any) {
  const proyectoId: string = route.params?.proyectoId;
  const tipo: TipoEgresoRuta = route.params?.tipo || 'operativo';

  const [catalogo, setCatalogo] = useState<CategoriaEgreso[]>([]);
  const [categoria, setCategoria] = useState<CategoriaEgreso | null>(null);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [divisa, setDivisa] = useState<'USD' | 'PEN'>('PEN');
  const [fecha, setFecha] = useState(new Date());
  const [esPlanilla, setEsPlanilla] = useState(false);
  const [regimen, setRegimen] = useState<'ONP' | 'AFP' | null>(null);
  const [conIgv, setConIgv] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getJson<{ data: CategoriaEgreso[] }>('/api/egresos/catalogo').then((r) => {
      const filtradas = (r.data || []).filter((c) => c.tipo_egreso === tipo);
      setCatalogo(filtradas);
    });
  }, [tipo]);

  useEffect(() => {
    if (!categoria) return;
    const esRemu = /remuner|planilla|sueldo|salario/i.test(categoria.denominacion);
    setEsPlanilla(esRemu);
    if (!categoria.computa_igv) setConIgv(false);
    else if (categoria.computa_igv && !categoria.igv_opcional) setConIgv(true);
  }, [categoria]);

  function safeFloat(v: string) {
    const n = parseFloat((v || '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  async function onGuardar() {
    if (!categoria) { Alert.alert('Validacion', 'Selecciona una categoria.'); return; }
    if (concepto.trim().length < 3) { Alert.alert('Validacion', 'Describe el egreso.'); return; }
    const importeNum = safeFloat(importe);
    if (importeNum <= 0) { Alert.alert('Validacion', 'Importe invalido.'); return; }
    if (esPlanilla && !regimen) { Alert.alert('Validacion', 'Selecciona el regimen previsional.'); return; }

    setEnviando(true);
    try {
      await postJson('/api/egresos', {
        proyecto_id: proyectoId,
        categoria_egreso_id: categoria.id,
        concepto_egreso: concepto.trim(),
        importe_total: importeNum,
        divisa,
        fecha_egreso: fechaLocal(fecha),
        flag_planilla: esPlanilla,
        regimen_previsional: esPlanilla ? regimen : null,
        con_igv: categoria.computa_igv ? conIgv : false
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo registrar el egreso.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Nuevo egreso" subtitulo={`Tipo: ${tipo}`} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <SectionCard titulo="Categoria">
            <CategoriaEgresoPickerModal
              categorias={catalogo}
              seleccionadaId={categoria?.id}
              onSelect={setCategoria}
            />
          </SectionCard>

          <SectionCard titulo="Detalle">
            <Text style={styles.label}>Concepto</Text>
            <AppInput value={concepto} onChangeText={setConcepto} placeholder="Detalle del egreso" />
            <Text style={styles.label}>Importe total</Text>
            <AppInput value={importe} onChangeText={setImporte} keyboardType="numeric" placeholder="0.00" />
            <Text style={styles.label}>Divisa</Text>
            <View style={styles.divisaRow}>
              {(['USD', 'PEN'] as const).map((d) => (
                <Pressable key={d} style={[styles.divisaBtn, divisa === d && styles.divisaSel]} onPress={() => setDivisa(d)}>
                  <Text style={[styles.divisaTxt, divisa === d && styles.divisaTxtSel]}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <DatePickerButton valor={fecha} onChange={setFecha} label="Fecha del egreso" />
          </SectionCard>

          {categoria?.computa_igv && categoria?.igv_opcional ? (
            <SectionCard titulo="IGV">
              <View style={styles.fila}>
                <Text style={styles.label}>El importe incluye IGV</Text>
                <Switch value={conIgv} onValueChange={setConIgv} />
              </View>
            </SectionCard>
          ) : null}

          {esPlanilla ? (
            <SectionCard titulo="Planilla">
              <View style={styles.fila}>
                <Text style={styles.label}>Es planilla / remuneracion</Text>
                <Switch value={esPlanilla} onValueChange={setEsPlanilla} />
              </View>
              <Text style={styles.label}>Regimen previsional</Text>
              <View style={styles.divisaRow}>
                {(['ONP', 'AFP'] as const).map((r) => (
                  <Pressable key={r} style={[styles.divisaBtn, regimen === r && styles.divisaSel]} onPress={() => setRegimen(r)}>
                    <Text style={[styles.divisaTxt, regimen === r && styles.divisaTxtSel]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </SectionCard>
          ) : null}

          <PrimaryButton texto="Registrar egreso" onPress={onGuardar} cargando={enviando} icono="checkmark-circle" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 10, marginBottom: 6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  divisaRow: { flexDirection: 'row', gap: 8 },
  divisaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: tema.borde, backgroundColor: tema.blanco },
  divisaSel: { backgroundColor: tema.primario, borderColor: tema.primario },
  divisaTxt: { color: tema.textoPrincipal, fontWeight: '700' },
  divisaTxtSel: { color: tema.blanco }
});
