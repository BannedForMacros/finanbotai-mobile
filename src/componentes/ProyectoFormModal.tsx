import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import AppModal from './ui/AppModal';
import AppInput from './AppInput';
import PrimaryButton from './ui/PrimaryButton';
import OutlineButton from './ui/OutlineButton';
import { tema } from '../estilos/tema';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre_proyecto: string; descripcion_proyecto?: string }) => Promise<void> | void;
  enviando?: boolean;
  proyectoExistente?: { nombre_proyecto: string; descripcion_proyecto?: string | null };
  modoEdicion?: boolean;
}

export default function ProyectoFormModal({
  visible, onClose, onSubmit, enviando, proyectoExistente, modoEdicion = false
}: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (visible && modoEdicion && proyectoExistente) {
      setNombre(proyectoExistente.nombre_proyecto || '');
      setDescripcion(proyectoExistente.descripcion_proyecto || '');
    } else if (visible) {
      setNombre('');
      setDescripcion('');
    }
  }, [visible, modoEdicion, proyectoExistente]);

  async function handleSubmit() {
    if (nombre.trim().length < 3) {
      Alert.alert('Validacion', 'El nombre debe tener al menos 3 caracteres.');
      return;
    }
    await onSubmit({
      nombre_proyecto: nombre.trim(),
      descripcion_proyecto: descripcion.trim() || undefined
    });
  }

  return (
    <AppModal visible={visible} onClose={onClose} titulo={modoEdicion ? 'Editar proyecto' : 'Nuevo proyecto'}>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: tema.textoPrincipal, fontWeight: '600', marginBottom: 6 }}>Nombre</Text>
          <AppInput value={nombre} onChangeText={setNombre} placeholder="Ej. Importacion Q4 2026" maxLength={100} />
        </View>
        <View>
          <Text style={{ color: tema.textoPrincipal, fontWeight: '600', marginBottom: 6 }}>Descripcion</Text>
          <AppInput
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Opcional"
            multiline
            numberOfLines={3}
            maxLength={200}
            style={{ minHeight: 70, textAlignVertical: 'top' }}
          />
        </View>
        <PrimaryButton
          texto={modoEdicion ? 'Actualizar' : 'Crear proyecto'}
          onPress={handleSubmit}
          cargando={enviando}
        />
        <OutlineButton texto="Cancelar" onPress={onClose} color={tema.acento} />
      </View>
    </AppModal>
  );
}
