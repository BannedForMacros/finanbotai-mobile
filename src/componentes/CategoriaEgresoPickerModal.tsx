import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './ui/AppModal';
import AppInput from './AppInput';
import AppSelectButton from './AppSelectButton';
import { tema } from '../estilos/tema';

export interface CategoriaEgreso {
  id: number;
  denominacion: string;
  cuenta_pcge: string;
  tipo_egreso: string;
  computa_igv: boolean;
  igv_opcional: boolean;
}

interface Props {
  categorias: CategoriaEgreso[];
  seleccionadaId?: number | null;
  onSelect: (c: CategoriaEgreso) => void;
  label?: string;
}

export default function CategoriaEgresoPickerModal({ categorias, seleccionadaId, onSelect, label }: Props) {
  const [visible, setVisible] = useState(false);
  const [q, setQ] = useState('');

  const sel = useMemo(
    () => categorias.find((c) => c.id === seleccionadaId),
    [categorias, seleccionadaId]
  );
  const filtradas = useMemo(() => {
    if (!q.trim()) return categorias;
    const t = q.toLowerCase();
    return categorias.filter(
      (c) => c.denominacion.toLowerCase().includes(t) || c.cuenta_pcge.includes(t)
    );
  }, [categorias, q]);

  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <AppSelectButton
        valor={sel ? `${sel.cuenta_pcge} - ${sel.denominacion}` : ''}
        placeholder="Selecciona una categoria"
        onPress={() => setVisible(true)}
        abierto={visible}
      />
      <AppModal visible={visible} onClose={() => setVisible(false)} titulo="Categoria de egreso" maxHeightPct={85}>
        <AppInput placeholder="Buscar por nombre o cuenta" value={q} onChangeText={setQ} />
        <FlatList
          style={{ marginTop: 10, maxHeight: 360 }}
          data={filtradas}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.item, seleccionadaId === item.id && styles.itemSel]}
              onPress={() => {
                onSelect(item);
                setVisible(false);
                setQ('');
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cuenta}>{item.cuenta_pcge}</Text>
                <Text style={styles.nombre}>{item.denominacion}</Text>
              </View>
              <View style={[styles.badge, !item.computa_igv && styles.badgeNo, item.igv_opcional && styles.badgeOpc]}>
                <Text style={styles.badgeTxt}>
                  {item.computa_igv ? (item.igv_opcional ? 'Opcional' : 'IGV') : 'Sin IGV'}
                </Text>
              </View>
              {seleccionadaId === item.id ? (
                <Ionicons name="checkmark-circle" size={20} color={tema.primario} />
              ) : null}
            </Pressable>
          )}
        />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  label: { color: tema.textoPrincipal, fontWeight: '600', marginBottom: 6 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomColor: tema.bordeClaro, borderBottomWidth: 1, gap: 8
  },
  itemSel: { backgroundColor: '#ecfdf5' },
  cuenta: { color: tema.primario, fontWeight: '700' },
  nombre: { color: tema.textoPrincipal, fontSize: 13 },
  badge: { backgroundColor: tema.primario, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeNo: { backgroundColor: tema.acento },
  badgeOpc: { backgroundColor: tema.secundario },
  badgeTxt: { color: tema.blanco, fontSize: 10, fontWeight: '700' }
});
