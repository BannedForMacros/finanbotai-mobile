export default {
  expo: {
    name: 'FinanBotAI',
    slug: 'finanbotai-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'finanbotai',
    userInterfaceStyle: 'light',
    primaryColor: '#0f5132',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0f5132'
    },
    ios: {
      bundleIdentifier: 'pe.finanbotai.app',
      supportsTablet: true
    },
    android: {
      package: 'pe.finanbotai.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0f5132'
      },
      softwareKeyboardLayoutMode: 'pan'
    },
    plugins: [
      'expo-secure-store'
    ],
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4002'
    }
  }
};
