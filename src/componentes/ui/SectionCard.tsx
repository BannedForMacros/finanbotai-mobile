import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { estilosCompartidos } from '../../estilos/compartidos';

interface Props {
  titulo?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({ titulo, children, style }: Props) {
  return (
    <View style={[estilosCompartidos.card, style]}>
      {titulo ? <Text style={estilosCompartidos.cardTitulo}>{titulo}</Text> : null}
      {children}
    </View>
  );
}
