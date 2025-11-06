import { Canvas, Group, LinearGradient, Path, RoundedRect, Skia, Text as SkiaText, matchFont, vec } from '@shopify/react-native-skia';
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
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 10,
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
    zIndex: 100,
  },
  textOverlay2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1000,
  },
  percentText: {
    fontSize: 32,
    fontWeight: 'bold',
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

  // Calculate wave offset at center for web/Android text clipping
  const waveHeightValue = waterLevel === 100 ? 0 : 4;
  const centerWaveOffset = ((waveOffset + TANK_WIDTH / 2) * Math.PI) / 180;
  const centerWaveY = waterY + Math.sin(centerWaveOffset) * waveHeightValue;

  // Generate SVG path for wave clipping on web/Android
  const generateWaveClipPath = () => {
    const waveWidth = 10;
    let pathData = `M 0 ${waterY}`;
    
    // Draw wave curves
    for (let x = 0; x <= TANK_WIDTH; x += waveWidth) {
      const offsetRadians = ((waveOffset + x) * Math.PI) / 180;
      const y = waterY + Math.sin(offsetRadians) * waveHeightValue;
      pathData += ` L ${x} ${y}`;
    }
    
    // Ensure we end at the right edge
    const finalOffsetRadians = ((waveOffset + TANK_WIDTH) * Math.PI) / 180;
    const finalY = waterY + Math.sin(finalOffsetRadians) * waveHeightValue;
    pathData += ` L ${TANK_WIDTH} ${finalY}`;
    
    // Complete the path to bottom
    pathData += ` L ${TANK_WIDTH} ${TANK_HEIGHT} L 0 ${TANK_HEIGHT} Z`;
    
    return pathData;
  };

  const waveClipPath = generateWaveClipPath();

  // Font handling for text
  const percentText = `${Math.round(animatedLevel)}%`;
  let font = null;
  let textX = TANK_WIDTH / 2 - 30; // Approximate center for web fallback
  const fontSize = 32;
  const textY = TANK_HEIGHT / 2 + fontSize / 3;

  // Only use matchFont on iOS (Android will use Text overlay)
  if (Platform.OS === 'ios') {
    const fontFamily = 'Helvetica';
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
      {/* SVG clip path definition for web text clipping */}
      {Platform.OS === 'web' && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id="waveClipGradient" clipPathUnits="userSpaceOnUse">
              <path d={waveClipPath} />
            </clipPath>
          </defs>
        </svg>
      )}
      
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

        {/* Percentage text (base layer) - only on iOS with font */}
        {font && (
          <SkiaText
            x={textX}
            y={textY}
            text={percentText}
            font={font}
            color={Colors.textInWater}
          />
        )}

        {/* Water fill with gradient - clipped to tank boundaries (all platforms) */}
        {animatedLevel > 0 && (
          <Group clip={clipPath} opacity={0.8}>
            <Path path={createWavePath()}>
              <LinearGradient
                start={vec(0, TANK_HEIGHT)}
                end={vec(0, waterY)}
                colors={[Colors.water, Colors.waterLight]}
              />
            </Path>
            {/* Water level text in light color - clipped by wave path (iOS only) */}
            {Platform.OS === 'ios' && font && (
              <SkiaText
                x={textX}
                y={textY}
                text={percentText}
                font={font}
                color={Colors.waterLight}
              />
            )}
          </Group>
        )}
        </Group>
      </Canvas>

      {/* Text overlay for web and Android (fallback for Skia text issues) */}
      {(Platform.OS === 'web' || Platform.OS === 'android') && (
        <View style={styles.textOverlay}>
          <Text
            style={[
              styles.percentText,
              {
                color: Colors.textAboveWater,
              },
            ]}
          >
            {percentText}
          </Text>
        </View>
      )}
      {/* Text overlay for web - clipped by wave animation with SVG */}
      {Platform.OS === 'web' && (
        <View 
          style={[
            styles.textOverlay2,
            {
              clipPath: 'url(#waveClipGradient)',
              WebkitClipPath: 'url(#waveClipGradient)',
            } as any
          ]}
        >
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

      {/* Text overlay for Android - clipped by straight line (SVG not supported) */}
      {Platform.OS === 'android' && (
        <View style={styles.textOverlay2}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: animatedLevel > 0 ? centerWaveY : TANK_HEIGHT,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -centerWaveY + TANK_HEIGHT / 2 - fontSize / 2 - 5,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}
            >
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
          </View>
        </View>
      )}
    </View>
  );
};

export default WaterTank;
