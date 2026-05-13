import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AppSelectButton from './AppSelectButton';
import AppInput from './AppInput';
import AppModal from './ui/AppModal';
import { tema } from '../estilos/tema';
import { getJson } from '../servicios/clienteAxios';

export interface ArancelarioItem {
  value: string;
  label: string;
  codigo: string;
  codigo_fmt: string;
  descripcion: string;
}

interface Props {
  valor: { codigo: string; label: string } | null;
  onSelect: (item: { codigo: string; label: string }) => void;
  limit?: number;
  deshabilitado?: boolean;
}

export default function SelectArancelario({ valor, onSelect, limit = 8, deshabilitado }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ArancelarioItem[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    setCargando(true);
    const t = setTimeout(async () => {
      try {
        const r = await getJson<{ data: ArancelarioItem[] }>('/api/catalogo/arancelario', { q, limit });
        if (!cancelado) setItems(r.data || []);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [q, open, limit]);

  return (
    <>
      <AppSelectButton
        valor={valor?.label}
        placeholder="Buscar partida arancelaria"
        onPress={() => setOpen(true)}
        deshabilitado={deshabilitado}
        abierto={open}
      />
      <AppModal visible={open} onClose={() => setOpen(false)} titulo="Catalogo arancelario" maxHeightPct={85}>
        <AppInput placeholder="Codigo (10 digitos) o palabra clave" value={q} onChangeText={setQ} />
        {cargando ? (
          <View style={styles.cargando}><ActivityIndicator color={tema.primario} /></View>
        ) : (
          <FlatList
            style={{ marginTop: 10, maxHeight: 360 }}
            data={items}
            keyExtractor={(it) => it.value}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  onSelect({ codigo: item.value, label: `${item.codigo_fmt} - ${item.descripcion}` });
                  setOpen(false);
                  setQ('');
                }}
              >
                <Text style={styles.codigo}>{item.codigo_fmt}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.descripcion}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.vacio}>Sin resultados.</Text>}
          />
        )}
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  cargando: { padding: 16, alignItems: 'center' },
  item: { paddingVertical: 10, paddingHorizontal: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  codigo: { color: tema.primario, fontWeight: '700' },
  desc: { color: tema.textoPrincipal, fontSize: 13, marginTop: 2 },
  vacio: { textAlign: 'center', padding: 16, color: tema.textoSecundario }
});
