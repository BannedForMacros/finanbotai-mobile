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
interface Venta {
  id: string; proyecto_id: string; descripcion_articulo: string | null;
  flag_venta_local: boolean; divisa: string; importe_venta_neto: string;
  fecha_venta: string; termino_comercio_internacional: string | null;
}

export default function ListaVentasScreen({ navigation }: any) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [ventasPorProyecto, setVentasPorProyecto] = useState<Record<string, Venta[]>>({});
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [refrescando, setRefrescando] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await getJson<{ data: Proyecto[] }>('/api/proyectos', { solo_abiertos: 'true' });
      setProyectos(r.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudieron cargar los proyectos');
    } finally {
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  async function toggle(p: Proyecto) {
    const next = new Set(expandidos);
    if (next.has(p.id)) next.delete(p.id);
    else {
      next.add(p.id);
      if (!ventasPorProyecto[p.id]) {
        try {
          const r = await getJson<{ data: Venta[] }>('/api/ventas-internacionales', { proyecto_id: p.id });
          setVentasPorProyecto((s) => ({ ...s, [p.id]: r.data || [] }));
        } catch (e) { /* ignore */ }
      }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Ventas" subtitulo="Internacionales y nacionales" onBack={() => navigation.goBack()} />

      <FlatList
        style={{ flex: 1, backgroundColor: tema.scrollFondo }}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        data={proyectos}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
        ListEmptyComponent={<Text style={styles.vacio}>Aun no tienes proyectos. Crea uno para registrar ventas.</Text>}
        renderItem={({ item }) => {
          const exp = expandidos.has(item.id);
          const ventas = ventasPorProyecto[item.id] || [];
          return (
            <View style={styles.card}>
              <Pressable style={styles.cardHeader} onPress={() => toggle(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{item.nombre_proyecto}</Text>
                  {item.descripcion_proyecto ? <Text style={styles.desc} numberOfLines={1}>{item.descripcion_proyecto}</Text> : null}
                </View>
                <Ionicons name={exp ? 'chevron-up' : 'chevron-down'} size={20} color={tema.primario} />
              </Pressable>
              {exp ? (
                <View style={{ marginTop: 10 }}>
                  {ventas.length === 0 ? (
                    <Text style={styles.sin}>Sin ventas registradas.</Text>
                  ) : (
                    ventas.map((v) => (
                      <Pressable key={v.id} style={styles.venta} onPress={() => navigation.navigate('DetalleVenta', { venta: v })}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ventaDesc} numberOfLines={1}>{v.descripcion_articulo}</Text>
                          <Text style={styles.ventaMeta}>
                            {mostrarFecha(v.fecha_venta)} | {v.divisa}
                            {v.termino_comercio_internacional ? ` | ${v.termino_comercio_internacional}` : ''}
                          </Text>
                        </View>
                        <View style={[styles.badge, v.flag_venta_local ? styles.badgeNac : styles.badgeExp]}>
                          <Text style={styles.badgeTxt}>{v.flag_venta_local ? 'Nacional' : 'Exportacion'}</Text>
                        </View>
                      </Pressable>
                    ))
                  )}
                  <PrimaryButton
                    texto="+ Anadir venta"
                    onPress={() => navigation.navigate('RegistroVenta', { proyectoId: item.id, proyectoNombre: item.nombre_proyecto })}
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

      <ProyectoFormModal visible={modalNuevo} onClose={() => setModalNuevo(false)} onSubmit={onCrearProyecto} enviando={creando} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: tema.blanco, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: tema.borde },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nombre: { color: tema.textoPrincipal, fontWeight: '700', fontSize: 15 },
  desc: { color: tema.textoSecundario, fontSize: 12 },
  vacio: { textAlign: 'center', color: tema.textoSecundario, marginTop: 32 },
  venta: { flexDirection: 'row', alignItems: 'center', backgroundColor: tema.superficie, borderRadius: 8, padding: 10, marginBottom: 6 },
  ventaDesc: { color: tema.textoPrincipal, fontWeight: '600', fontSize: 13 },
  ventaMeta: { color: tema.textoSecundario, fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeNac: { backgroundColor: tema.secundario },
  badgeExp: { backgroundColor: tema.primario },
  badgeTxt: { color: tema.blanco, fontSize: 10, fontWeight: '700' },
  sin: { color: tema.textoSecundario, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },
  fab: { position: 'absolute', right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: tema.primario, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 28, elevation: 4 },
  fabTxt: { color: tema.blanco, fontWeight: '700', marginLeft: 6 }
});
