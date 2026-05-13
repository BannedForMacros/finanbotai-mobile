import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import InfoBanner from '../componentes/ui/InfoBanner';
import { tema } from '../estilos/tema';
import { getJson } from '../servicios/clienteAxios';

interface Proyecto { id: string; nombre_proyecto: string; descripcion_proyecto: string | null; estado_proyecto: string; }

export default function MotorIAListaScreen({ navigation }: any) {
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
      <ScreenHeader titulo="Diagnostico IA" subtitulo="Selecciona un proyecto" onBack={() => navigation.goBack()} />
      <FlatList
        style={{ flex: 1, backgroundColor: tema.scrollFondo }}
        contentContainerStyle={{ padding: 16 }}
        data={proyectos}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
        ListHeaderComponent={
          <InfoBanner
            variante="info"
            mensaje="Gemini 2.5 Flash analiza tu proyecto y entrega fortalezas, areas de mejora, recomendaciones y un score 0 a 10."
          />
        }
        ListEmptyComponent={<Text style={styles.vacio}>Sin proyectos disponibles.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('DiagnosticoIA', { proyectoId: item.id, nombreProyecto: item.nombre_proyecto })}
          >
            <View style={[styles.icon, { backgroundColor: tema.secundario }]}>
              <Ionicons name="sparkles" size={20} color={tema.blanco} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre_proyecto}</Text>
              {item.descripcion_proyecto ? <Text style={styles.desc} numberOfLines={2}>{item.descripcion_proyecto}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={tema.primario} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: tema.blanco, padding: 14, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: tema.borde },
  icon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  nombre: { color: tema.textoPrincipal, fontWeight: '700' },
  desc: { color: tema.textoSecundario, fontSize: 12 },
  vacio: { color: tema.textoSecundario, textAlign: 'center', marginTop: 32 }
});
