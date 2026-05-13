import React from 'react';
import { StyleSheet, TextInput, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { tema } from '../estilos/tema';

interface Props extends TextInputProps {
  deshabilitado?: boolean;
  contenedorStyle?: StyleProp<ViewStyle>;
}

export default function AppInput({ deshabilitado, style, ...props }: Props) {
  return (
    <TextInput
      placeholderTextColor={tema.textoSecundario}
      editable={!deshabilitado}
      style={[
        styles.input,
        deshabilitado && styles.deshabilitado,
        style
      ]}
      {...props}
    />
  );
}

export const inputStyles = StyleSheet.create({
  input: {
    backgroundColor: tema.inputFondo,
    borderColor: tema.inputBorde,
    borderWidth: 1,
    borderRadius: tema.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: tema.textoPrincipal,
    fontSize: 14
  },
  deshabilitado: {
    backgroundColor: tema.inputDeshabilitado,
    color: tema.textoSecundario
  }
});

const styles = inputStyles;
