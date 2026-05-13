import React from 'react';
import { ActivityIndicator, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../../estilos/tema';
import { estilosCompartidos } from '../../estilos/compartidos';

interface Props {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  style?: ViewStyle;
  textoStyle?: TextStyle;
  icono?: keyof typeof Ionicons.glyphMap;
}

export default function PrimaryButton({
  texto, onPress, cargando = false, deshabilitado = false, style, textoStyle, icono
}: Props) {
  const off = deshabilitado || cargando;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={[estilosCompartidos.botonPrimario, off && estilosCompartidos.botonPrimarioDeshabilitado, style]}
    >
      {cargando ? (
        <ActivityIndicator color={tema.blanco} />
      ) : (
        <>
          {icono ? <Ionicons name={icono} size={18} color={tema.blanco} style={{ marginRight: 8 }} /> : null}
          <Text style={[estilosCompartidos.botonPrimarioTexto, textoStyle]}>{texto}</Text>
        </>
      )}
    </Pressable>
  );
}
