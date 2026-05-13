import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tema } from '../estilos/tema';

interface Props {
  label: string;
  valor: string;
  hint?: string;
  strong?: boolean;
}

export default function FormRow({ label, valor, hint, strong }: Props) {
  return (
    <View style={styles.fila}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={[styles.valor, strong && styles.strong]} numberOfLines={2}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomColor: tema.bordeClaro,
    borderBottomWidth: 1
  },
  label: { color: tema.textoSecundario, fontSize: 13 },
  hint: { color: tema.textoSecundario, fontSize: 11, marginTop: 2 },
  valor: { color: tema.textoPrincipal, fontWeight: '600', flexShrink: 1, textAlign: 'right', maxWidth: '55%' },
  strong: { color: tema.primario, fontWeight: '700' }
});
