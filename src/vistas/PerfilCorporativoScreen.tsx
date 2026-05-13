import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../componentes/ui/ScreenHeader';
import SectionCard from '../componentes/ui/SectionCard';
import FormRow from '../componentes/FormRow';
import OutlineButton from '../componentes/ui/OutlineButton';
import { useAutenticacion } from '../contextos/AutenticacionContext';
import { tema } from '../estilos/tema';
import { mostrarFecha } from '../utilitarios/formatoFecha';

export default function PerfilCorporativoScreen({ navigation }: any) {
  const { perfil, cerrarSesion } = useAutenticacion();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['top']}>
      <ScreenHeader titulo="Perfil corporativo" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1, backgroundColor: tema.scrollFondo }} contentContainerStyle={{ padding: 16 }}>
        <SectionCard titulo="Datos de la cuenta">
          <FormRow label="Nombre" valor={perfil?.nombres_completos || '-'} strong />
          <FormRow label="Correo" valor={perfil?.correo_corporativo || '-'} />
          <FormRow label="Identificador" valor={perfil?.identificador_acceso || '-'} />
        </SectionCard>

        <View style={{ marginTop: 16 }}>
          <OutlineButton texto="Cerrar sesion" onPress={cerrarSesion} color={tema.error} icono="log-out-outline" />
        </View>

        <Text style={styles.footer}>FinanBotAI - Simulador Financiero Inteligente</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: { color: tema.textoSecundario, textAlign: 'center', marginTop: 32, fontSize: 12 }
});
