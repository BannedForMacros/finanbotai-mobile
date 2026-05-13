import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../estilos/tema';

interface Props {
  valor: Date;
  onChange: (d: Date) => void;
  label?: string;
}

export default function DatePickerButton({ valor, onChange, label }: Props) {
  const [mostrar, setMostrar] = useState(false);

  function fmt(d: Date) {
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.boton} onPress={() => setMostrar(true)}>
        <Ionicons name="calendar-outline" size={18} color={tema.primario} style={{ marginRight: 8 }} />
        <Text style={styles.txt}>{fmt(valor)}</Text>
      </Pressable>
      {Platform.OS === 'android' && mostrar ? (
        <DateTimePicker
          value={valor}
          mode="date"
          display="default"
          onChange={(_e, d) => {
            setMostrar(false);
            if (d) onChange(d);
          }}
        />
      ) : null}
      {Platform.OS === 'ios' ? (
        <Modal visible={mostrar} transparent animationType="slide" onRequestClose={() => setMostrar(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={valor}
                mode="date"
                display="spinner"
                onChange={(_e, d) => {
                  if (d) onChange(d);
                }}
              />
              <Pressable style={styles.cerrarBtn} onPress={() => setMostrar(false)}>
                <Text style={styles.cerrarTxt}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  label: { color: tema.textoPrincipal, fontWeight: '600', marginBottom: 6 },
  boton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: tema.inputFondo,
    borderColor: tema.inputBorde,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10
  },
  txt: { color: tema.textoPrincipal, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: tema.blanco, padding: 16 },
  cerrarBtn: { padding: 12, alignItems: 'center', backgroundColor: tema.primario, borderRadius: 8 },
  cerrarTxt: { color: tema.blanco, fontWeight: '700' }
});
