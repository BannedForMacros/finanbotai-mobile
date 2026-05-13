import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import { tema } from '../estilos/tema';
import { postJson } from '../servicios/clienteAxios';

export default function SolicitudRecuperacionScreen({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);

  async function onSolicitar() {
    if (!correo.includes('@')) {
      Alert.alert('Validacion', 'Ingresa un correo valido.');
      return;
    }
    setCargando(true);
    try {
      await postJson('/api/auth/solicitud-recuperacion', { correo_corporativo: correo.trim() });
      Alert.alert(
        'Solicitud enviada',
        'Si existe una cuenta asociada, te enviaremos un enlace para restablecer.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Recuperar acceso" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Te enviaremos un enlace</Text>
        <Text style={styles.texto}>
          Ingresa el correo asociado a tu cuenta. Si existe, recibiras un enlace para restablecer tu credencial.
        </Text>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.label}>Correo corporativo</Text>
          <AppInput
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="correo@empresa.com"
          />
        </View>

        <PrimaryButton texto="Enviar solicitud" onPress={onSolicitar} cargando={cargando} style={{ marginTop: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60, backgroundColor: tema.scrollFondo, flexGrow: 1 },
  titulo: { fontSize: 18, fontWeight: '700', color: tema.primario, marginTop: 12 },
  texto: { color: tema.textoSecundario, marginTop: 6 },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginBottom: 6 }
});
