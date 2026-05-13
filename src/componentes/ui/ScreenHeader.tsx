import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { tema } from '../../estilos/tema';
import { estilosCompartidos } from '../../estilos/compartidos';

interface Props {
  titulo: string;
  subtitulo?: string;
  onBack?: () => void;
  onAyuda?: () => void;
  derecha?: React.ReactNode;
}

export default function ScreenHeader({ titulo, subtitulo, onBack, onAyuda, derecha }: Props) {
  return (
    <>
      <StatusBar style="light" />
      <LinearGradient
        colors={[tema.primario, tema.primarioOscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={estilosCompartidos.header}
      >
        {onBack ? (
          <Pressable onPress={onBack} style={estilosCompartidos.headerBoton}>
            <Ionicons name="chevron-back" size={26} color={tema.blanco} />
          </Pressable>
        ) : (
          <View style={{ width: 42 }} />
        )}
        <View style={styles.centro}>
          <Text style={estilosCompartidos.headerTitulo} numberOfLines={1}>{titulo}</Text>
          {subtitulo ? <Text style={estilosCompartidos.headerSubtitulo} numberOfLines={1}>{subtitulo}</Text> : null}
        </View>
        {derecha ? (
          <View style={styles.derecha}>{derecha}</View>
        ) : onAyuda ? (
          <Pressable onPress={onAyuda} style={estilosCompartidos.headerBoton}>
            <Ionicons name="help-circle-outline" size={24} color={tema.blanco} />
          </Pressable>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center' },
  derecha: { minWidth: 42, alignItems: 'flex-end' }
});
