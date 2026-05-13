import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import ProyectoFormModal from '../componentes/ProyectoFormModal';
import { tema } from '../estilos/tema';
import { getJson, postJson } from '../servicios/clienteAxios';
import { mostrarFecha } from '../utilitarios/formatoFecha';

interface Proyecto { id: string; nombre_proyecto: string; descripcion_proyecto: string | null; }
interface Compra {
  id: string; proyecto_id: string; descripcion_articulo: string | null;
  flag_compra_local: boolean; divisa: string; total_carga_aduanera: string; fecha_compra: string;
}

export default function ListaComprasInternacionalesScreen({ navigation }: any) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [comprasPorProyecto, setComprasPorProyecto] = useState<Record<string, Compra[]>>({});
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await getJson<{ data: Proyecto[] }>('/api/proyectos', { solo_abiertos: 'true' });
      setProyectos(r.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudieron cargar los proyectos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  async function toggleExpandir(p: Proyecto) {
    const next = new Set(expandidos);
    if (next.has(p.id)) {
      next.delete(p.id);
    } else {
      next.add(p.id);
      if (!comprasPorProyecto[p.id]) {
        try {
          const r = await getJson<{ data: Compra[] }>('/api/compras-internacionales', { proyecto_id: p.id });
          setComprasPorProyecto((s) => ({ ...s, [p.id]: r.data || [] }));
        } catch (e) {
          // ignore
        }
      }
    }
    setExpandidos(next);
  }

  async function onCrearProyecto(data: { nombre_proyecto: string; descripcion_proyecto?: string }) {
    setCreando(true);
    try {
      await postJson('/api/proyectos', data);
      setModalNuevo(false);
      cargar();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo crear el proyecto');
    } finally {
      setCreando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Compras" subtitulo="Internacionales y nacionales" onBack={() => navigation.goBack()} />

      <FlatList
        style={{ flex: 1, backgroundColor: tema.scrollFondo }}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        data={proyectos}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
        ListEmptyComponent={!cargando ? (
          <Text style={styles.vacio}>No tienes proyectos abiertos. Crea uno para registrar compras.</Text>
        ) : null}
        renderItem={({ item }) => {
          const exp = expandidos.has(item.id);
          const compras = comprasPorProyecto[item.id] || [];
          return (
            <View style={styles.card}>
              <Pressable style={styles.cardHeader} onPress={() => toggleExpandir(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombreProyecto}>{item.nombre_proyecto}</Text>
                  {item.descripcion_proyecto ? (
                    <Text style={styles.descProyecto} numberOfLines={1}>{item.descripcion_proyecto}</Text>
                  ) : null}
                </View>
                <Ionicons name={exp ? 'chevron-up' : 'chevron-down'} size={20} color={tema.primario} />
              </Pressable>
              {exp ? (
                <View style={{ marginTop: 10 }}>
                  {compras.length === 0 ? (
                    <Text style={styles.sin}>Sin compras registradas.</Text>
                  ) : (
                    compras.map((c) => (
                      <Pressable
                        key={c.id}
                        style={styles.compra}
                        onPress={() => navigation.navigate('DetalleCompra', { compra: c })}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.compraDesc} numberOfLines={1}>
                            {c.descripcion_articulo || 'Sin descripcion'}
                          </Text>
                          <Text style={styles.compraMeta}>
                            {mostrarFecha(c.fecha_compra)} | {c.divisa}
                          </Text>
                        </View>
                        <View style={[styles.badge, c.flag_compra_local ? styles.badgeNac : styles.badgeImp]}>
                          <Text style={styles.badgeTxt}>{c.flag_compra_local ? 'Nacional' : 'Internacional'}</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                  <PrimaryButton
                    texto="+ Anadir compra"
                    onPress={() => navigation.navigate('RegistroCompraInternacional', {
                      proyectoId: item.id, proyectoNombre: item.nombre_proyecto
                    })}
                    style={{ marginTop: 10 }}
                  />
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

      <ProyectoFormModal
        visible={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onSubmit={onCrearProyecto}
        enviando={creando}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tema.blanco, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: tema.borde },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nombreProyecto: { color: tema.textoPrincipal, fontWeight: '700', fontSize: 15 },
  descProyecto: { color: tema.textoSecundario, fontSize: 12, marginTop: 2 },
  vacio: { textAlign: 'center', color: tema.textoSecundario, marginTop: 32 },
  compra: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: tema.superficie, borderRadius: 8, padding: 10, marginBottom: 6
  },
  compraDesc: { color: tema.textoPrincipal, fontWeight: '600', fontSize: 13 },
  compraMeta: { color: tema.textoSecundario, fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeImp: { backgroundColor: tema.primario },
  badgeNac: { backgroundColor: tema.secundario },
  badgeTxt: { color: tema.blanco, fontSize: 10, fontWeight: '700' },
  sin: { color: tema.textoSecundario, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  fab: {
    position: 'absolute', right: 16, bottom: 24,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: tema.primario,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 28,
    elevation: 4
  },
  fabTxt: { color: tema.blanco, fontWeight: '700', marginLeft: 6 }
});
