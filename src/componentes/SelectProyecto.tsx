import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AppSelectButton from './AppSelectButton';
import AppInput from './AppInput';
import AppModal from './ui/AppModal';
import { tema } from '../estilos/tema';
import { getJson } from '../servicios/clienteAxios';

export interface ProyectoItem {
  id: string;
  nombre_proyecto: string;
  descripcion_proyecto: string | null;
}

interface Props {
  valor: { id: string; nombre: string } | null;
  onSelect: (p: { id: string; nombre: string }) => void;
  deshabilitado?: boolean;
}

export default function SelectProyecto({ valor, onSelect, deshabilitado }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ProyectoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    setCargando(true);
    getJson<{ data: ProyectoItem[] }>('/api/proyectos', { solo_abiertos: 'true' })
      .then((r) => {
        if (!cancelado) setItems(r.data || []);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [open]);

  const filtrados = q
    ? items.filter((p) => p.nombre_proyecto.toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <>
      <AppSelectButton
        valor={valor?.nombre}
        placeholder="Selecciona un proyecto"
        onPress={() => setOpen(true)}
        deshabilitado={deshabilitado}
        abierto={open}
      />
      <AppModal visible={open} onClose={() => setOpen(false)} titulo="Proyectos abiertos" maxHeightPct={75}>
        <AppInput placeholder="Filtrar" value={q} onChangeText={setQ} />
        {cargando ? (
          <View style={styles.cargando}><ActivityIndicator color={tema.primario} /></View>
        ) : (
          <FlatList
            style={{ marginTop: 10, maxHeight: 320 }}
            data={filtrados}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  onSelect({ id: item.id, nombre: item.nombre_proyecto });
                  setOpen(false);
                  setQ('');
                }}
              >
                <Text style={styles.nombre}>{item.nombre_proyecto}</Text>
                {item.descripcion_proyecto ? (
                  <Text style={styles.desc} numberOfLines={2}>{item.descripcion_proyecto}</Text>
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.vacio}>Sin proyectos abiertos.</Text>}
          />
        )}
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  cargando: { padding: 16, alignItems: 'center' },
  item: { paddingVertical: 10, paddingHorizontal: 8, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1 },
  nombre: { color: tema.textoPrincipal, fontWeight: '700' },
  desc: { color: tema.textoSecundario, fontSize: 12 },
  vacio: { padding: 16, textAlign: 'center', color: tema.textoSecundario }
});
