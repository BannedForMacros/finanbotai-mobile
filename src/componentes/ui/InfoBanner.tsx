import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../../estilos/tema';

type Variante = 'info' | 'exito' | 'advertencia' | 'error';

interface Props {
  mensaje: string;
  variante?: Variante;
  style?: ViewStyle;
  icono?: keyof typeof Ionicons.glyphMap;
}

const cfg: Record<Variante, { bg: string; color: string; ico: keyof typeof Ionicons.glyphMap }> = {
  info: { bg: '#e0f2fe', color: '#075985', ico: 'information-circle-outline' },
  exito: { bg: '#dcfce7', color: '#166534', ico: 'checkmark-circle-outline' },
  advertencia: { bg: '#fef3c7', color: '#92400e', ico: 'warning-outline' },
  error: { bg: '#fee2e2', color: '#991b1b', ico: 'alert-circle-outline' }
};

export default function InfoBanner({ mensaje, variante = 'info', style, icono }: Props) {
  const c = cfg[variante];
  return (
    <View style={[styles.cont, { backgroundColor: c.bg }, style]}>
      <Ionicons name={icono || c.ico} size={18} color={c.color} style={{ marginRight: 8 }} />
      <Text style={[styles.txt, { color: c.color }]}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8 },
  txt: { flex: 1, fontSize: 13 }
});

// Re-export blanco como helper visual
export const tokens = { tema };
