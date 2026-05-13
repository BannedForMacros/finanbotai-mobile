import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import OutlineButton from '../componentes/ui/OutlineButton';
import ProyectoFormModal from '../componentes/ProyectoFormModal';
import { tema } from '../estilos/tema';
import { getJson, postJson } from '../servicios/clienteAxios';
import { mostrarFecha } from '../utilitarios/formatoFecha';
import type { TipoEgresoRuta } from '../navegacion/PilaPrincipalNav';

interface Proyecto { id: string; nombre_proyecto: string; descripcion_proyecto: string | null; }
interface Egreso {
  id: string; proyecto_id: string; concepto_egreso: string;
  importe_total: string; divisa: string; fecha_egreso: string;
  tipo_egreso?: string; cuenta_pcge?: string;
}

const TITULOS: Record<TipoEgresoRuta, string> = {
  operativo: 'Egresos operativos',
  administrativo: 'Egresos administrativos',
  ventas: 'Egresos de ventas',
  financiero: 'Egresos financieros'
};

export default function ListaEgresosScreen({ navigation, route }: any) {
  const tipo: TipoEgresoRuta = route.params?.tipo || 'operativo';
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [egresosPorProyecto, setEgresosPorProyecto] = useState<Record<string, Egreso[]>>({});
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [refrescando, setRefrescando] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await getJson<{ data: Proyecto[] }>('/api/proyectos', { solo_abiertos: 'true' });
      setProyectos(r.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudieron cargar proyectos');
    } finally {
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar, tipo]));

  async function toggle(p: Proyecto) {
    const next = new Set(expandidos);
    if (next.has(p.id)) next.delete(p.id);
    else {
      next.add(p.id);
      try {
        const r = await getJson<{ data: Egreso[] }>('/api/egresos', { proyecto_id: p.id });
        const filtrados = (r.data || []).filter((e) => e.tipo_egreso === tipo);
        setEgresosPorProyecto((s) => ({ ...s, [p.id]: filtrados }));
      } catch (e) { /* ignore */ }
    }
    setExpandidos(next);
  }

  async function onCrearProyecto(data: any) {
    setCreando(true);
    try {
      await postJson('/api/proyectos', data);
      setModalNuevo(false);
      cargar();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo crear');
    } finally {
      setCreando(false);
    }
  }

  function abrirAsiento(proyectoId: string) {
    navigation.navigate('AsientoConsolidado', { proyectoId, nombreProyecto: proyectos.find((p) => p.id === proyectoId)?.nombre_proyecto || '' });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo={TITULOS[tipo]} subtitulo="Por proyecto" onBack={() => navigation.goBack()} />

      <FlatList
        style={{ flex: 1, backgroundColor: tema.scrollFondo }}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        data={proyectos}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
        ListEmptyComponent={<Text style={styles.vacio}>No hay proyectos abiertos.</Text>}
        renderItem={({ item }) => {
          const exp = expandidos.has(item.id);
          const lista = egresosPorProyecto[item.id] || [];
          return (
            <View style={styles.card}>
              <Pressable style={styles.cardHeader} onPress={() => toggle(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{item.nombre_proyecto}</Text>
                </View>
                <Ionicons name={exp ? 'chevron-up' : 'chevron-down'} size={20} color={tema.primario} />
              </Pressable>
              {exp ? (
                <View style={{ marginTop: 10 }}>
                  {lista.length === 0 ? (
                    <Text style={styles.sin}>Sin egresos de tipo {tipo}.</Text>
                  ) : (
                    lista.map((g) => (
                      <Pressable
                        key={g.id}
                        style={styles.row}
                        onPress={() => navigation.navigate('DetalleEgreso', { egreso: g, tipo })}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.txt} numberOfLines={1}>{g.concepto_egreso}</Text>
                          <Text style={styles.meta}>
                            {g.cuenta_pcge ? g.cuenta_pcge + ' | ' : ''}
                            {mostrarFecha(g.fecha_egreso)} | {g.divisa}
                          </Text>
                        </View>
                        <Text style={styles.monto}>{Number(g.importe_total).toFixed(2)}</Text>
                      </Pressable>
                    ))
                  )}
                  <PrimaryButton
                    texto="+ Anadir egreso"
                    onPress={() => navigation.navigate('RegistroEgreso', { proyectoId: item.id, proyectoNombre: item.nombre_proyecto, tipo })}
                    style={{ marginTop: 10 }}
                  />
                  <OutlineButton texto="Ver asiento consolidado" onPress={() => abrirAsiento(item.id)} style={{ marginTop: 8 }} icono="reader-outline" />
                </View>
              ) : null}
            </View>
          );
        }}
      />

      <Pressable style={styles.fab} onPress={() => setModalNuevo(true)}>
        <Ionicons name="add" size={24} color={tema.blanco} />
        <Text style={styles.fabTxt}>Nuevo proyecto</Text>
      </Pressable>

      <ProyectoFormModal visible={modalNuevo} onClose={() => setModalNuevo(false)} onSubmit={onCrearProyecto} enviando={creando} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tema.blanco, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: tema.borde },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { color: tema.textoPrincipal, fontWeight: '700', fontSize: 15 },
  vacio: { textAlign: 'center', color: tema.textoSecundario, marginTop: 32 },
  sin: { color: tema.textoSecundario, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: tema.superficie, borderRadius: 8, padding: 10, marginBottom: 6 },
  txt: { color: tema.textoPrincipal, fontWeight: '600', fontSize: 13 },
  meta: { color: tema.textoSecundario, fontSize: 11, marginTop: 2 },
  monto: { color: tema.primario, fontWeight: '700' },
  fab: { position: 'absolute', right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: tema.primario, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 28, elevation: 4 },
  fabTxt: { color: tema.blanco, fontWeight: '700', marginLeft: 6 }
});
