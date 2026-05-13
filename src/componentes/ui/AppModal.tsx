import React from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../../estilos/tema';

interface Props {
  visible: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightPct?: number;
}

export default function AppModal({ visible, onClose, titulo, children, footer, maxHeightPct = 75 }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.content, { maxHeight: `${maxHeightPct}%` as any }]}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={tema.textoSecundario} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center', padding: 16
  },
  content: {
    width: '100%',
    backgroundColor: tema.blanco,
    borderRadius: 16,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titulo: { fontSize: 18, fontWeight: '700', color: tema.textoPrincipal },
  footer: { marginTop: 12 }
});
