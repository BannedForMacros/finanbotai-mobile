import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppModal from './ui/AppModal';
import { tema } from '../estilos/tema';
import { useCotizacion } from '../hooks/useCotizacion';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TipoCambioModal({ visible, onClose }: Props) {
  const { exchangeRate, buyPrice, rateDate, loadingFx, fxError } = useCotizacion();

  return (
    <AppModal visible={visible} onClose={onClose} titulo="Tipo de cambio SBS">
      {loadingFx ? (
        <Text style={styles.txt}>Cargando cotizacion...</Text>
      ) : fxError ? (
        <Text style={[styles.txt, { color: tema.error }]}>No se pudo obtener la cotizacion.</Text>
      ) : (
        <View>
          <View style={styles.fila}>
            <Text style={styles.label}>Compra</Text>
            <Text style={styles.valor}>S/ {buyPrice?.toFixed(3) || '-'}</Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.label}>Venta</Text>
            <Text style={styles.valor}>S/ {exchangeRate?.toFixed(3) || '-'}</Text>
          </View>
          <Text style={styles.fuente}>SBS, fecha {rateDate}</Text>
        </View>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  txt: { color: tema.textoPrincipal, padding: 12 },
  fila: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomColor: tema.bordeClaro, borderBottomWidth: 1
  },
  label: { color: tema.textoSecundario },
  valor: { color: tema.textoPrincipal, fontWeight: '700' },
  fuente: { color: tema.textoSecundario, fontSize: 12, marginTop: 12, textAlign: 'center' }
});
