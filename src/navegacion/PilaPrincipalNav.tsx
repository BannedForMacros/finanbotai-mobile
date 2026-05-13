import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAutenticacion } from '../contextos/AutenticacionContext';
import { tema } from '../estilos/tema';

// Auth
import AccesoScreen from '../vistas/AccesoScreen';
import RegistroCorporativoScreen from '../vistas/RegistroCorporativoScreen';
import SolicitudRecuperacionScreen from '../vistas/SolicitudRecuperacionScreen';
import RestablecerContrasenaScreen from '../vistas/RestablecerContrasenaScreen';

// App
import MenuPrincipalScreen from '../vistas/MenuPrincipalScreen';
import PerfilCorporativoScreen from '../vistas/PerfilCorporativoScreen';

import ListaComprasInternacionalesScreen from '../vistas/ListaComprasInternacionalesScreen';
import RegistroCompraInternacionalScreen from '../vistas/RegistroCompraInternacionalScreen';
import EditarCompraScreen from '../vistas/EditarCompraScreen';
import DetalleCompraScreen from '../vistas/DetalleCompraScreen';
import AsientoCompraScreen from '../vistas/AsientoCompraScreen';

import ListaVentasScreen from '../vistas/ListaVentasScreen';
import RegistroVentaScreen from '../vistas/RegistroVentaScreen';
import EditarVentaScreen from '../vistas/EditarVentaScreen';
import DetalleVentaScreen from '../vistas/DetalleVentaScreen';
import AsientoVentaScreen from '../vistas/AsientoVentaScreen';

import ListaEgresosScreen from '../vistas/ListaEgresosScreen';
import RegistroEgresoScreen from '../vistas/RegistroEgresoScreen';
import DetalleEgresoScreen from '../vistas/DetalleEgresoScreen';
import EditarEgresoScreen from '../vistas/EditarEgresoScreen';

import ParametrosRentabilidadScreen from '../vistas/ParametrosRentabilidadScreen';
import IndicadoresRentabilidadScreen from '../vistas/IndicadoresRentabilidadScreen';
import AsientoConsolidadoScreen from '../vistas/AsientoConsolidadoScreen';

import MotorIAListaScreen from '../vistas/MotorIAListaScreen';
import DiagnosticoIAScreen from '../vistas/DiagnosticoIAScreen';

export type TipoEgresoRuta = 'operativo' | 'administrativo' | 'ventas' | 'financiero';

export type RootStackParamList = {
  // Auth
  Acceso: undefined;
  RegistroCorporativo: undefined;
  SolicitudRecuperacion: undefined;
  RestablecerContrasena: { token: string };

  // App
  MenuPrincipal: undefined;
  PerfilCorporativo: undefined;

  ListaComprasInternacionales: undefined;
  RegistroCompraInternacional: { proyectoId?: string; proyectoNombre?: string } | undefined;
  EditarCompra: { compra: any };
  DetalleCompra: { compra: any };
  AsientoCompra: { compra: any };

  ListaVentas: undefined;
  RegistroVenta: { proyectoId?: string; proyectoNombre?: string } | undefined;
  EditarVenta: { venta: any };
  DetalleVenta: { venta: any };
  AsientoVenta: { venta: any };

  ListaEgresos: { tipo: TipoEgresoRuta } | undefined;
  RegistroEgreso: { proyectoId?: string; proyectoNombre?: string; tipo: TipoEgresoRuta };
  DetalleEgreso: { egreso: any; tipo: TipoEgresoRuta };
  EditarEgreso: { egreso: any; tipo: TipoEgresoRuta };

  ParametrosRentabilidad: undefined;
  IndicadoresRentabilidad: { proyectoId: string; nombreProyecto: string };
  AsientoConsolidado: { proyectoId: string; nombreProyecto: string };

  MotorIALista: undefined;
  DiagnosticoIA: { proyectoId: string; nombreProyecto: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['finanbotai://'],
  config: {
    screens: {
      RestablecerContrasena: 'restablecer'
    }
  }
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Acceso" component={AccesoScreen} />
      <Stack.Screen name="RegistroCorporativo" component={RegistroCorporativoScreen} />
      <Stack.Screen name="SolicitudRecuperacion" component={SolicitudRecuperacionScreen} />
      <Stack.Screen name="RestablecerContrasena" component={RestablecerContrasenaScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 150 }}>
      <Stack.Screen name="MenuPrincipal" component={MenuPrincipalScreen} />
      <Stack.Screen name="PerfilCorporativo" component={PerfilCorporativoScreen} />

      <Stack.Screen name="ListaComprasInternacionales" component={ListaComprasInternacionalesScreen} />
      <Stack.Screen name="RegistroCompraInternacional" component={RegistroCompraInternacionalScreen} />
      <Stack.Screen name="EditarCompra" component={EditarCompraScreen} />
      <Stack.Screen name="DetalleCompra" component={DetalleCompraScreen} />
      <Stack.Screen name="AsientoCompra" component={AsientoCompraScreen} />

      <Stack.Screen name="ListaVentas" component={ListaVentasScreen} />
      <Stack.Screen name="RegistroVenta" component={RegistroVentaScreen} />
      <Stack.Screen name="EditarVenta" component={EditarVentaScreen} />
      <Stack.Screen name="DetalleVenta" component={DetalleVentaScreen} />
      <Stack.Screen name="AsientoVenta" component={AsientoVentaScreen} />

      <Stack.Screen name="ListaEgresos" component={ListaEgresosScreen} />
      <Stack.Screen name="RegistroEgreso" component={RegistroEgresoScreen} />
      <Stack.Screen name="DetalleEgreso" component={DetalleEgresoScreen} />
      <Stack.Screen name="EditarEgreso" component={EditarEgresoScreen} />

      <Stack.Screen name="ParametrosRentabilidad" component={ParametrosRentabilidadScreen} />
      <Stack.Screen name="IndicadoresRentabilidad" component={IndicadoresRentabilidadScreen} />
      <Stack.Screen name="AsientoConsolidado" component={AsientoConsolidadoScreen} />

      <Stack.Screen name="MotorIALista" component={MotorIAListaScreen} />
      <Stack.Screen name="DiagnosticoIA" component={DiagnosticoIAScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { perfil, cargando } = useAutenticacion();
  if (cargando) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tema.primario }} edges={['bottom']}>
      <StatusBar style="light" />
      <NavigationContainer linking={linking}>
        {perfil ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaView>
  );
}
