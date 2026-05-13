# FinanBotAI Mobile: contexto para Claude

## Stack
- React Native 0.81 + Expo SDK 54 + TypeScript.
- Navegacion: `@react-navigation/native-stack` con auth gating.
- HTTP: axios con interceptor de refresh-token (singleton + cola).
- Tokens en `expo-secure-store` con cache en memoria para acceso sincronico.
- PDF: `expo-print` + `expo-sharing`.
- Deep link: `finanbotai://restablecer?token=...`.

## Paleta de diseno
- `tema.primario` `#0f5132` (verde corporativo) para headers y CTA primarios.
- `tema.secundario` `#b8860b` (dorado) para acentos secundarios.
- `tema.acento` `#6b7280` (gris) para estados neutros.
- Headers con `LinearGradient([primario, primarioOscuro])`, status bar `light`.

## Estructura
```
src/
  contextos/   AutenticacionContext, CargandoContext
  servicios/   clienteAxios, tokenLocal, aiServicio
  hooks/       useCotizacion, useCotizacionFecha
  navegacion/  PilaPrincipalNav (AppStack + AuthStack)
  utilitarios/ formatoFecha, 3 plantillas PDF
  estilos/     tema, compartidos
  componentes/
    ui/        ScreenHeader, SectionCard, PrimaryButton, OutlineButton, AppModal, InfoBanner
    [otros]    AppInput, AppSelectButton, FormRow, LoadingOverlay,
               CurrencyToggle, DatePickerButton, TipoCambioModal,
               ProyectoFormModal, CategoriaEgresoPickerModal,
               IncotermSelectionModal, SelectArancelario, SelectProyecto
  vistas/      25 pantallas
```

## Pantallas (25)
- Auth: Acceso, RegistroCorporativo, SolicitudRecuperacion, RestablecerContrasena
- Home / Perfil: MenuPrincipal, PerfilCorporativo
- Compras: Lista, Registro, Editar, Detalle, Asiento (5)
- Ventas: Lista, Registro, Editar, Detalle, Asiento (5)
- Egresos: Lista, Registro, Detalle, Editar (4)
- Rentabilidad: ParametrosRentabilidad, IndicadoresRentabilidad, AsientoConsolidado (3)
- IA: MotorIALista, DiagnosticoIA (2)

## Decisiones importantes
- **No hay roles ni XP**: PerfilCorporativoScreen solo muestra correo, nombre, identificador.
- **Diagnostico IA**: el cliente llama `POST /api/diagnostico-ia/:proyecto_id`. La API key de Gemini vive solo en el backend.
- **Tipo de cambio**:
  - `useCotizacion()` lee el del dia desde `AutenticacionContext` (publico, sin token).
  - `useCotizacionFecha(fecha)` consulta `GET /api/cotizacion?date=...` para fechas historicas. Cache `Map` en memoria.
- **Refresh token**: si una request da 401, el interceptor llama `/api/auth/refresh`. Si la cola tiene mas requests en paralelo, todas esperan al mismo refresh.
- **Sesion expirada**: si refresh falla, `fireSesionExpirada()` muestra un Alert y reinicia el state del Auth provider.
- **Auto guardado de parametros de rentabilidad**: debounce 1200 ms cuando el usuario teclea activos o patrimonio.
- **Deep link**: solo `RestablecerContrasena` es accesible por deep link.

## Variables de entorno
- `EXPO_PUBLIC_API_URL`: URL del backend (default `http://10.0.2.2:4002` para emulador Android).
- Se lee tambien desde `Constants.expoConfig.extra.apiBaseUrl` en `app.config.js`.

## Comandos
- `npm install`.
- `npm start`: arranca Expo.
- `npm run android` / `npm run ios`.
- `npm run tsc`: type-check sin emitir.
