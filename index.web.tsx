import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Load CanvasKit from CDN - more reliable for development
const CanvasKitVersion = '0.40.0';

LoadSkiaWeb({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CanvasKitVersion}/bin/full/${file}`,
}).then(async () => {
  renderRootComponent(App);
}).catch((error) => {
  console.error('Failed to load Skia:', error);
});

