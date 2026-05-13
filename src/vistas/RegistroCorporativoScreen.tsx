import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import AppInput from '../componentes/AppInput';
import PrimaryButton from '../componentes/ui/PrimaryButton';
import { useAutenticacion } from '../contextos/AutenticacionContext';
import { tema } from '../estilos/tema';

const REGEX_PWD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegistroCorporativoScreen({ navigation }: any) {
  const { registrar } = useAutenticacion();
  const [nombres, setNombres] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [correo, setCorreo] = useState('');
  const [credencial, setCredencial] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verPwd, setVerPwd] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const errorPwd = useMemo(() => {
    if (!credencial) return '';
    if (!REGEX_PWD.test(credencial)) return 'Debe tener 8+ caracteres, una mayuscula y un numero.';
    return '';
  }, [credencial]);

  const errorConfirm = useMemo(() => {
    if (!confirmar) return '';
    return confirmar === credencial ? '' : 'Las credenciales no coinciden.';
  }, [credencial, confirmar]);

  const valido = nombres.length >= 2 && correo.includes('@') && !errorPwd && !errorConfirm && confirmar && credencial;

  async function onRegistrar() {
    if (!valido) {
      Alert.alert('Validacion', 'Revisa los campos del formulario.');
      return;
    }
    setEnviando(true);
    try {
      await registrar({
        nombres_completos: nombres.trim(),
        identificador_acceso: identificador.trim() || undefined,
        correo_corporativo: correo.trim(),
        credencial
      });
    } catch (e: any) {
      Alert.alert('Registro', e?.response?.data?.message || 'No se pudo registrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Crear cuenta" subtitulo="Registro corporativo" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: tema.scrollFondo }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.label}>Nombres completos</Text>
          <AppInput value={nombres} onChangeText={setNombres} placeholder="Nombre y apellidos" />

          <Text style={styles.label}>Identificador interno (opcional)</Text>
          <AppInput value={identificador} onChangeText={setIdentificador} autoCapitalize="none" placeholder="DNI, codigo, etc." />

          <Text style={styles.label}>Correo corporativo</Text>
          <AppInput value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" placeholder="correo@empresa.com" />

          <Text style={styles.label}>Credencial</Text>
          <View style={styles.pwdWrap}>
            <AppInput
              value={credencial}
              onChangeText={setCredencial}
              secureTextEntry={!verPwd}
              placeholder="Min 8 chars, 1 mayuscula, 1 numero"
              style={{ flex: 1, paddingRight: 40 }}
            />
            <Pressable style={styles.eye} onPress={() => setVerPwd((v) => !v)}>
              <Ionicons name={verPwd ? 'eye-off' : 'eye'} size={20} color={tema.textoSecundario} />
            </Pressable>
          </View>
          {errorPwd ? <Text style={styles.err}>{errorPwd}</Text> : null}

          <Text style={styles.label}>Confirma credencial</Text>
          <View style={styles.pwdWrap}>
            <AppInput
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry={!verConfirmar}
              placeholder="Repite la credencial"
              style={{ flex: 1, paddingRight: 40 }}
            />
            <Pressable style={styles.eye} onPress={() => setVerConfirmar((v) => !v)}>
              <Ionicons name={verConfirmar ? 'eye-off' : 'eye'} size={20} color={tema.textoSecundario} />
            </Pressable>
          </View>
          {errorConfirm ? <Text style={styles.err}>{errorConfirm}</Text> : null}

          <PrimaryButton texto="Crear cuenta" onPress={onRegistrar} cargando={enviando} deshabilitado={!valido} style={{ marginTop: 18 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60 },
  label: { color: tema.textoPrincipal, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  err: { color: tema.error, fontSize: 12, marginTop: 4 },
  pwdWrap: { flexDirection: 'row', alignItems: 'center' },
  eye: { position: 'absolute', right: 10, padding: 6 }
});
