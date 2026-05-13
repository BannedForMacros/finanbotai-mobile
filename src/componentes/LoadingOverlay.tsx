import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { tema } from '../estilos/tema';

interface Props {
  visible: boolean;
  texto?: string;
  delay?: number;
}

export default function LoadingOverlay({ visible, texto = 'Cargando...', delay = 300 }: Props) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    let t: any;
    if (visible) {
      t = setTimeout(() => setMostrar(true), delay);
    } else {
      setMostrar(false);
    }
    return () => clearTimeout(t);
  }, [visible, delay]);

  if (!visible || !mostrar) return null;
  return (
    <View style={styles.cont}>
      <ActivityIndicator size="large" color={tema.primario} />
      <Text style={styles.txt}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(249,250,251,0.92)',
    alignItems: 'center', justifyContent: 'center', zIndex: 999
  },
  txt: { marginTop: 8, color: tema.primario, fontWeight: '600' }
});
