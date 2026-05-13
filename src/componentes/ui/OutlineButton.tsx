import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../../estilos/tema';

interface Props {
  texto: string;
  onPress: () => void;
  deshabilitado?: boolean;
  color?: string;
  style?: ViewStyle;
  icono?: keyof typeof Ionicons.glyphMap;
}

export default function OutlineButton({ texto, onPress, deshabilitado, color = tema.primario, style, icono }: Props) {
  return (
    <Pressable
      onPress={deshabilitado ? undefined : onPress}
      style={[styles.boton, { borderColor: color, opacity: deshabilitado ? 0.5 : 1 }, style]}
    >
      {icono ? <Ionicons name={icono} size={18} color={color} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.texto, { color }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minHeight: 46,
    backgroundColor: tema.blanco
  },
  texto: { fontWeight: '700' }
});
