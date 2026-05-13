import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './ui/AppModal';
import { tema } from '../estilos/tema';

export const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DPU', 'DAP', 'DDP'];

export const INCOTERM_NOMBRES: Record<string, string> = {
  EXW: 'En fabrica',
  FCA: 'Franco transportista',
  FAS: 'Franco al costado del buque',
  FOB: 'Franco a bordo',
  CFR: 'Coste y flete',
  CIF: 'Coste, seguro y flete',
  CPT: 'Transporte pagado hasta',
  CIP: 'Transporte y seguro pagados hasta',
  DPU: 'Entregado en lugar descargado',
  DAP: 'Entregado en lugar',
  DDP: 'Entregado con derechos pagados'
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (t: string) => void;
  seleccionado?: string;
}

export default function IncotermSelectionModal({ visible, onClose, onSelect, seleccionado }: Props) {
  return (
    <AppModal visible={visible} onClose={onClose} titulo="Selecciona Incoterm" maxHeightPct={75}>
      <FlatList
        data={INCOTERMS}
        keyExtractor={(t) => t}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.item, seleccionado === item && styles.sel]}
            onPress={() => {
              onSelect(item);
              onClose();
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.term}>{item}</Text>
              <Text style={styles.nombre}>{INCOTERM_NOMBRES[item]}</Text>
            </View>
            {seleccionado === item ? <Ionicons name="checkmark" size={20} color={tema.primario} /> : null}
          </Pressable>
        )}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 10,
    borderBottomColor: tema.bordeClaro, borderBottomWidth: 1
  },
  sel: { backgroundColor: '#ecfdf5' },
  term: { color: tema.primario, fontWeight: '700', fontSize: 16 },
  nombre: { color: tema.textoSecundario, fontSize: 12 }
});
