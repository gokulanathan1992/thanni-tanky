import { Canvas, Group, Path, RoundedRect, Skia, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Colors from '../colors';

const TANK_WIDTH = 300;
const TANK_HEIGHT = 200;
const TANK_BORDER_WIDTH = 3;
const TANK_PADDING = 10;

const styles = StyleSheet.create({
  canvas: {
    height: TANK_HEIGHT,
    width: TANK_WIDTH,
  },
  container: {
    height: TANK_HEIGHT,
    width: TANK_WIDTH,
    position: 'relative',
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  percentText: {
    fontSize: 32,
    fontWeight: 'bold',
    opacity: 0.75,
  },
});

const WaterTank = ({ waterLevel = 0 }) => {
  const [animatedLevel, setAnimatedLevel] = React.useState(0);
  const [waveOffset, setWaveOffset] = React.useState(0);

  // Animate water level
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedLevel((prev) => {
        const diff = waterLevel - prev;
        if (Math.abs(diff) < 0.5) return waterLevel;
        return prev + diff * 0.1; // Smooth animation
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [waterLevel]);

  // Animate wave
  React.useEffect(() => {
    const interval = setInterval(() => {
      setWaveOffset((prev) => (prev + 2) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Calculate water height from bottom
  const waterHeight = (animatedLevel / 100) * (TANK_HEIGHT - 2 * TANK_PADDING);
  const waterY = TANK_HEIGHT - TANK_PADDING - waterHeight;

  // Create simple wave path (will be clipped by tank border)
  const createWavePath = () => {
    const path = Skia.Path.Make();
    const waveHeight =  waterLevel === 100 ? 0 : 4;
    const waveWidth = 10;
    const startY = waterY;

    // Start from left edge
    path.moveTo(0, startY);

    // Draw wave curves across the full width
    for (let x = 0; x <= TANK_WIDTH; x += waveWidth) {
      const offsetRadians = ((waveOffset + x) * Math.PI) / 180;
      const y = startY + Math.sin(offsetRadians) * waveHeight;
      path.lineTo(x, y);
    }

    // Ensure we end exactly at the right edge with proper wave calculation
    const finalOffsetRadians = ((waveOffset + TANK_WIDTH) * Math.PI) / 180;
    const finalY = startY + Math.sin(finalOffsetRadians) * waveHeight;
    path.lineTo(TANK_WIDTH, finalY);

    // Complete the rectangle to fill below the wave
    path.lineTo(TANK_WIDTH, TANK_HEIGHT);
    path.lineTo(0, TANK_HEIGHT);
    path.close();

    return path;
  };

  const wavePath = createWavePath();

  // Create clip path for tank boundaries with rounded corners
  const clipPath = Skia.Path.Make();
  clipPath.addRRect({
    rect: {
      x: TANK_PADDING + TANK_BORDER_WIDTH / 2,
      y: TANK_PADDING + TANK_BORDER_WIDTH / 2,
      width: TANK_WIDTH - 2 * TANK_PADDING - TANK_BORDER_WIDTH,
      height: TANK_HEIGHT - 2 * TANK_PADDING - TANK_BORDER_WIDTH,
    },
    rx: 10,
    ry: 10,
  });

  // Font handling for text
  const percentText = `${Math.round(animatedLevel)}%`;
  let font = null;
  let textX = TANK_WIDTH / 2 - 30; // Approximate center for web fallback
  const fontSize = 32;
  const textY = TANK_HEIGHT / 2 + fontSize / 3;

  // Only use matchFont on native platforms
  if (Platform.OS !== 'web') {
    const fontFamily = Platform.select({ ios: 'Helvetica', android: 'Roboto', default: 'Arial' });
    try {
      font = matchFont({ fontFamily, fontSize, fontWeight: 'bold' });
      if (font) {
        const textWidth = font.measureText(percentText).width;
        textX = (TANK_WIDTH - textWidth) / 2;
      }
    } catch (error) {
      console.warn('Font matching failed:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Tank border */}
          <RoundedRect
            x={TANK_PADDING}
            y={TANK_PADDING}
            width={TANK_WIDTH - 2 * TANK_PADDING}
            height={TANK_HEIGHT - 2 * TANK_PADDING}
            r={10}
            style="stroke"
            strokeWidth={TANK_BORDER_WIDTH}
            color={Colors.tankBorder}
          />

        {/* Water fill with wave - clipped to tank boundaries */}
        {animatedLevel > 0 && (
          <Group clip={clipPath}>
            <Path
              path={wavePath}
              color={Colors.water}
              opacity={0.8}
            />
            {/* Second layer for depth effect */}
            <Path
              path={wavePath}
              color={Colors.water}
              opacity={0.4}
            />
          </Group>
        )}

          {/* Percentage text - only on native platforms with font */}
          {font && (
            <SkiaText
              x={textX}
              y={textY}
              text={percentText}
              font={font}
              color={Colors.textInWater}
            />
          )}
        </Group>
      </Canvas>

      {/* Text overlay for web (since Skia text doesn't work on web) */}
      {Platform.OS === 'web' && (
        <View style={styles.textOverlay}>
          <Text
            style={[
              styles.percentText,
              {
                color: Colors.textInWater,
              },
            ]}
          >
            {percentText}
          </Text>
        </View>
      )}
    </View>
  );
};

export default WaterTank;
