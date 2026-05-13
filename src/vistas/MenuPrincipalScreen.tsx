import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAutenticacion } from '../contextos/AutenticacionContext';
import { tema } from '../estilos/tema';

interface Item {
  titulo: string;
  subtitulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  ruta: string;
  params?: any;
}

const ITEMS: Item[] = [
  { titulo: 'Compras', subtitulo: 'Internacionales y nacionales', icono: 'cube-outline', color: '#0f5132', ruta: 'ListaComprasInternacionales' },
  { titulo: 'Ventas', subtitulo: 'Internacionales y nacionales', icono: 'cart-outline', color: '#b8860b', ruta: 'ListaVentas' },
  { titulo: 'Egresos operativos', subtitulo: 'Cuentas 62, 63, 64', icono: 'briefcase-outline', color: '#0f5132', ruta: 'ListaEgresos', params: { tipo: 'operativo' } },
  { titulo: 'Egresos administrativos', subtitulo: 'Cuenta 65 y 63 admin', icono: 'document-text-outline', color: '#0f5132', ruta: 'ListaEgresos', params: { tipo: 'administrativo' } },
  { titulo: 'Egresos de ventas', subtitulo: 'Marketing, comisiones', icono: 'megaphone-outline', color: '#b8860b', ruta: 'ListaEgresos', params: { tipo: 'ventas' } },
  { titulo: 'Egresos financieros', subtitulo: 'Intereses, comisiones', icono: 'cash-outline', color: '#6b7280', ruta: 'ListaEgresos', params: { tipo: 'financiero' } },
  { titulo: 'Simulador financiero', subtitulo: 'Estado de resultados y ratios', icono: 'analytics-outline', color: '#0f5132', ruta: 'ParametrosRentabilidad' },
  { titulo: 'Diagnostico IA', subtitulo: 'Gemini analiza tu proyecto', icono: 'sparkles-outline', color: '#b8860b', ruta: 'MotorIALista' }
];

export default function MenuPrincipalScreen({ navigation }: any) {
  const { perfil, cerrarSesion } = useAutenticacion();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <StatusBar style="light" />
      <LinearGradient colors={[tema.primario, tema.primarioOscuro]} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>FinanBotAI</Text>
          <Text style={styles.saludo}>Hola, {perfil?.nombres_completos?.split(' ')[0] || 'Usuario'}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('PerfilCorporativo')}>
          <Ionicons name="person-circle-outline" size={32} color={tema.blanco} />
        </Pressable>
        <Pressable onPress={cerrarSesion} style={{ marginLeft: 12 }}>
          <Ionicons name="log-out-outline" size={26} color={tema.blanco} />
        </Pressable>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={styles.scroll}>
        <Text style={styles.seccion}>Modulos</Text>
        <View style={styles.grid}>
          {ITEMS.map((it, i) => (
            <Pressable key={i} style={styles.item} onPress={() => navigation.navigate(it.ruta as never, it.params as never)}>
              <View style={[styles.iconWrap, { backgroundColor: it.color }]}>
                <Ionicons name={it.icono} size={22} color={tema.blanco} />
              </View>
              <Text style={styles.titulo}>{it.titulo}</Text>
              <Text style={styles.subtitulo}>{it.subtitulo}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>FinanBotAI v1.0  Simulador financiero inteligente</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 12, paddingBottom: 18, paddingHorizontal: 18
  },
  brand: { color: tema.blanco, fontSize: 22, fontWeight: '800' },
  saludo: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 36 },
  seccion: { fontSize: 16, fontWeight: '700', color: tema.textoPrincipal, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: {
    width: '48%',
    backgroundColor: tema.blanco,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: tema.borde
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8
  },
  titulo: { color: tema.textoPrincipal, fontWeight: '700' },
  subtitulo: { color: tema.textoSecundario, fontSize: 11, marginTop: 2 },
  footer: { textAlign: 'center', color: tema.textoSecundario, fontSize: 11, marginTop: 24 }
});
