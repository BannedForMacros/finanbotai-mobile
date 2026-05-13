import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import { tema } from '../estilos/tema';
import { postJson } from '../servicios/clienteAxios';

export default function RestablecerContrasenaScreen({ navigation, route }: any) {
  const token: string = route.params?.token || '';
  const [credencial, setCredencial] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function onRestablecer() {
    if (!token) {
      Alert.alert('Token', 'No hay token de recuperacion.');
      return;
    }
    if (credencial.length < 8) {
      Alert.alert('Validacion', 'La credencial debe tener al menos 8 caracteres.');
      return;
    }
    if (credencial !== confirmar) {
      Alert.alert('Validacion', 'Las credenciales no coinciden.');
      return;
    }
    setCargando(true);
    try {
      await postJson('/api/auth/restablecer', { token, credencial });
      Alert.alert('Listo', 'Credencial actualizada. Inicia sesion.', [
        { text: 'OK', onPress: () => navigation.navigate('Acceso') }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo restablecer.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Restablecer credencial" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Nueva credencial</Text>
        <View style={styles.pwdWrap}>
          <AppInput value={credencial} onChangeText={setCredencial} secureTextEntry={!ver} placeholder="Min 8 caracteres" style={{ flex: 1, paddingRight: 40 }} />
          <Pressable style={styles.eye} onPress={() => setVer((v) => !v)}>
            <Ionicons name={ver ? 'eye-off' : 'eye'} size={20} color={tema.textoSecundario} />
          </Pressable>
        </View>
        <Text style={styles.label}>Confirma credencial</Text>
        <AppInput value={confirmar} onChangeText={setConfirmar} secureTextEntry={!ver} placeholder="Repite" />
        <PrimaryButton texto="Restablecer" onPress={onRestablecer} cargando={cargando} style={{ marginTop: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, backgroundColor: tema.scrollFondo, flexGrow: 1 },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  pwdWrap: { flexDirection: 'row', alignItems: 'center' },
  eye: { position: 'absolute', right: 10, padding: 6 }
});
