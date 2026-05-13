import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import { useAutenticacion } from '../contextos/AutenticacionContext';
import { tema } from '../estilos/tema';

export default function AccesoScreen({ navigation }: any) {
  const { iniciarSesion } = useAutenticacion();
  const [correo, setCorreo] = useState('');
  const [credencial, setCredencial] = useState('');
  const [mostrarPwd, setMostrarPwd] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function onAcceder() {
    if (!correo.trim() || !credencial) {
      Alert.alert('Validacion', 'Correo y credencial son obligatorios.');
      return;
    }
    setEnviando(true);
    try {
      await iniciarSesion(correo.trim(), credencial);
    } catch (e: any) {
      Alert.alert('Acceso', e?.response?.data?.message || 'Credenciales invalidas');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.cont}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.logoWrap}>
            <Text style={styles.brand}>FinanBotAI</Text>
            <Text style={styles.tag}>Simulador Financiero Inteligente</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Correo corporativo</Text>
            <AppInput
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="correo@empresa.com"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Credencial</Text>
            <View style={styles.pwdWrap}>
              <AppInput
                value={credencial}
                onChangeText={setCredencial}
                secureTextEntry={!mostrarPwd}
                placeholder="Tu credencial"
                style={{ flex: 1, paddingRight: 40 }}
              />
              <Pressable style={styles.eye} onPress={() => setMostrarPwd((v) => !v)}>
                <Ionicons name={mostrarPwd ? 'eye-off' : 'eye'} size={20} color={tema.textoSecundario} />
              </Pressable>
            </View>

            <PrimaryButton texto="Acceder" onPress={onAcceder} cargando={enviando} style={{ marginTop: 18 }} />

            <Pressable style={{ marginTop: 12 }} onPress={() => navigation.navigate('SolicitudRecuperacion')}>
              <Text style={styles.link}>Olvide mi credencial</Text>
            </Pressable>

            <Pressable style={{ marginTop: 16 }} onPress={() => navigation.navigate('RegistroCorporativo')}>
              <Text style={styles.linkAlt}>Crear cuenta corporativa</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cont: { flex: 1, backgroundColor: tema.scrollFondo },
  scroll: { padding: 24, paddingTop: 60 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  brand: { fontSize: 32, fontWeight: '800', color: tema.primario },
  tag: { color: tema.textoSecundario, marginTop: 4 },
  card: {
    backgroundColor: tema.blanco,
    borderRadius: 12,
    padding: 20,
    shadowColor: tema.primario,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2
  },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginBottom: 6 },
  pwdWrap: { flexDirection: 'row', alignItems: 'center' },
  eye: { position: 'absolute', right: 10, padding: 6 },
  link: { color: tema.primario, textAlign: 'center', fontWeight: '600' },
  linkAlt: { color: tema.secundario, textAlign: 'center', fontWeight: '700' }
});
