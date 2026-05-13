import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { tema } from '../estilos/tema';

interface Props {
  visible?: boolean;
  texto?: string;
}

export default function CargandoOverlay({ visible = true, texto = 'Cargando...' }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color={tema.primario} />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center', zIndex: 999
  },
  texto: { color: tema.primario, marginTop: 8, fontWeight: '600' }
});
