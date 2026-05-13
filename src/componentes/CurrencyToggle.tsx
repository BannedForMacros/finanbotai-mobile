import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { tema } from '../estilos/tema';
import type { Divisa } from '../hooks/useCotizacion';

interface Props {
  divisa: Divisa;
  onChange: (d: Divisa) => void;
}

export default function CurrencyToggle({ divisa, onChange }: Props) {
  return (
    <View style={styles.cont}>
      <Text style={[styles.label, divisa === 'USD' && styles.activo]}>USD</Text>
      <Switch
        value={divisa === 'PEN'}
        onValueChange={(v) => onChange(v ? 'PEN' : 'USD')}
        trackColor={{ true: tema.secundario, false: tema.borde }}
        thumbColor={tema.blanco}
      />
      <Text style={[styles.label, divisa === 'PEN' && styles.activo]}>PEN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: tema.textoSecundario, fontWeight: '600' },
  activo: { color: tema.primario }
});
