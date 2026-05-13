import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AutenticacionProvider, useAutenticacion } from './src/contextos/AutenticacionContext';
import RootNavigator from './src/navegacion/PilaPrincipalNav';
import { tema } from './src/estilos/tema';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppContent() {
  const { cargando } = useAutenticacion();

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync().catch(() => undefined);
  }, [cargando]);

  if (cargando) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={tema.primario} />
        <Text style={styles.loaderText}>Cargando FinanBotAI...</Text>
      </View>
    );
  }
  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AutenticacionProvider>
        <AppContent />
      </AutenticacionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: tema.fondo,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loaderText: { color: tema.primario, marginTop: 12, fontWeight: '600' }
});
