import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import { tema } from '../estilos/tema';
import { getJson } from '../servicios/clienteAxios';
import { mostrarFecha } from '../utilitarios/formatoFecha';

interface Proyecto {
  id: string;
  nombre_proyecto: string;
  descripcion_proyecto: string | null;
  estado_proyecto: string;
  creado_en: string;
}

export default function ParametrosRentabilidadScreen({ navigation }: any) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const r = await getJson<{ data: Proyecto[] }>('/api/proyectos');
      setProyectos(r.data || []);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudieron cargar proyectos');
    } finally {
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Simulador financiero" subtitulo="Selecciona un proyecto" onBack={() => navigation.goBack()} />
      <FlatList
        style={{ flex: 1, backgroundColor: tema.scrollFondo }}
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        data={proyectos}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
        ListEmptyComponent={<Text style={styles.vacio}>Sin proyectos disponibles.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('IndicadoresRentabilidad', { proyectoId: item.id, nombreProyecto: item.nombre_proyecto })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre_proyecto}</Text>
              {item.descripcion_proyecto ? <Text style={styles.desc} numberOfLines={2}>{item.descripcion_proyecto}</Text> : null}
              <Text style={styles.meta}>Creado: {mostrarFecha(item.creado_en)}</Text>
            </View>
            <View style={[styles.badge, item.estado_proyecto === 'en_curso' ? styles.bAbierto : styles.bCerrado]}>
              <Text style={styles.badgeTxt}>{item.estado_proyecto}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={tema.primario} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: tema.blanco, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: tema.borde },
  nombre: { color: tema.textoPrincipal, fontWeight: '700' },
  desc: { color: tema.textoSecundario, fontSize: 12, marginTop: 2 },
  meta: { color: tema.textoSecundario, fontSize: 11, marginTop: 4 },
  vacio: { textAlign: 'center', color: tema.textoSecundario, marginTop: 32 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginRight: 8 },
  bAbierto: { backgroundColor: tema.exito },
  bCerrado: { backgroundColor: tema.acento },
  badgeTxt: { color: tema.blanco, fontSize: 10, fontWeight: '700' }
});
