import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../estilos/tema';

interface Props {
  valor?: string;
  placeholder: string;
  onPress: () => void;
  deshabilitado?: boolean;
  abierto?: boolean;
  style?: ViewStyle;
}

export default function AppSelectButton({ valor, placeholder, onPress, deshabilitado, abierto, style }: Props) {
  return (
    <Pressable onPress={deshabilitado ? undefined : onPress} style={[styles.cont, deshabilitado && styles.off, style]}>
      <Text style={[styles.txt, !valor && styles.ph]} numberOfLines={1}>
        {valor || placeholder}
      </Text>
      <Ionicons
        name={abierto ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={tema.textoSecundario}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cont: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: tema.inputFondo, borderColor: tema.inputBorde, borderWidth: 1,
    borderRadius: tema.radius.md, paddingHorizontal: 12, paddingVertical: 12
  },
  off: { backgroundColor: tema.inputDeshabilitado, opacity: 0.7 },
  txt: { flex: 1, color: tema.textoPrincipal, fontSize: 14, marginRight: 8 },
  ph: { color: tema.textoSecundario }
});
