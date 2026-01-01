import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Suppress React DevTools semver error for React 19
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Invalid argument not valid semver')
  ) {
    return; // Suppress this specific error
  }
  originalError.apply(console, args);
};

// Load CanvasKit from CDN - more reliable for development
const CanvasKitVersion = '0.40.0';

LoadSkiaWeb({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CanvasKitVersion}/bin/full/${file}`,
}).then(async () => {
  renderRootComponent(App);
}).catch((error) => {
  console.error('Failed to load Skia:', error);
});

