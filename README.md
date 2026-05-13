# FinanBotAI Mobile

App movil de **FinanBotAI: Simulador Financiero Inteligente**. React Native + Expo + TypeScript.

## Requisitos

- Node.js 18 o superior.
- Expo CLI (`npx expo`).
- Android Studio o Xcode para emuladores.
- Backend `finanbotai-server` corriendo y accesible.

## Arranque rapido

```powershell
cd finanbotai-mobile
npm install

# Edita .env (opcional, hay defaults en app.config.js)
copy .env.example .env

npm start
# despues: a (Android) o i (iOS) o w (web)
```

## URL del backend

- Emulador Android: `http://10.0.2.2:4002` (default).
- iPhone fisico o Android fisico: usa la IP LAN de tu PC, por ejemplo `http://192.168.1.50:4002`.
- Configura via `EXPO_PUBLIC_API_URL` en `.env` o en `app.config.js` (`extra.apiBaseUrl`).

## Modulos

1. Autenticacion: registro, acceso, recuperacion por correo, restablecer via deep link.
2. Proyectos de analisis (lista, crear, cerrar).
3. Compras internacionales y nacionales con calculo DTA (Ad Valorem, ISC, IGV, IPM, percepcion, antidumping, compensatorio, SDA).
4. Ventas internacionales y nacionales con desglose IGV.
5. Egresos clasificados por tipo (operativo, administrativo, ventas, financiero), planillas con ESSALUD/ONP/AFP.
6. Simulador financiero: Estado de resultados, 6 ratios (margen bruto/operativo/neto, ROS, ROA, ROE), asiento consolidado.
7. Diagnostico IA: Gemini 2.5 Flash entrega score, fortalezas, areas de mejora, recomendaciones.

## PDF

- Detalle de compra
- Estado de resultados / ratios
- Diagnostico IA

Todos via `expo-print` + `expo-sharing`.

## Estructura

```
finanbotai-mobile/
  App.tsx
  index.ts
  app.config.js
  babel.config.js
  eas.json
  package.json
  tsconfig.json
  .env / .env.example
  assets/                  icon, splash, adaptive, favicon (placeholders verdes)
  src/
    contextos/             AutenticacionContext (sesion + cotizacion del dia), CargandoContext
    servicios/             clienteAxios (axios con refresh interceptor), tokenLocal (SecureStore), aiServicio
    hooks/                 useCotizacion, useCotizacionFecha
    navegacion/            PilaPrincipalNav (AppStack vs AuthStack)
    utilitarios/           formatoFecha + 3 plantillas PDF
    estilos/               tema (paleta verde corporativo), compartidos
    componentes/
      ui/                  6 componentes base (ScreenHeader, SectionCard, PrimaryButton, OutlineButton, AppModal, InfoBanner)
      [otros]              AppInput, AppSelectButton, FormRow, LoadingOverlay, CurrencyToggle, DatePickerButton,
                           TipoCambioModal, ProyectoFormModal, CategoriaEgresoPickerModal, IncotermSelectionModal,
                           SelectArancelario, SelectProyecto
    vistas/                25 pantallas
  CLAUDE.md
  README.md
```

## Build con EAS

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android   # APK para pruebas
eas build --profile production --platform android  # AAB para Play Store
```

## Notas

- La paleta legacy (dorada/oscura) fue reemplazada por la verde corporativa (`#0f5132`) y dorada (`#b8860b`).
- El status bar es `light` en headers con gradiente.
- La cotizacion del dia se cachea en `AsyncStorage` por fecha calendario para reducir llamadas al backend.
- Los tokens viven en `expo-secure-store`. La cache en memoria permite que el interceptor de axios lea sincronicamente.
