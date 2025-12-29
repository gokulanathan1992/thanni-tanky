import { Canvas, Circle, Group, Path, Skia, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Colors from '../colors';

const TIMER_SIZE = 150;
const STROKE_WIDTH = 12;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const MAX_TIMER = 20; // Maximum timer in minutes

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: TIMER_SIZE,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 40,
    position: 'relative',
    width: TIMER_SIZE,
  },
  canvas: {
    width: TIMER_SIZE,
    height: TIMER_SIZE,
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
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  labelText: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
});

const CircularTimer = ({ timer = 0, maxTimer = MAX_TIMER }) => {
  const [animatedTimer, setAnimatedTimer] = React.useState(0);

  // Animate timer value
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedTimer((prev) => {
        const diff = timer - prev;
        if (Math.abs(diff) < 0.1) return timer;
        return prev + diff * 0.15; // Smooth animation
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [timer]);

  // Calculate the progress (0 to 1)
  const progress = Math.min(animatedTimer / maxTimer, 1);
  
  // Calculate the angle for the arc (0 to 360 degrees)
  // Start from top (-90 degrees) and go clockwise
  const angle = progress * 360;

  // Create the progress arc path
  const createProgressPath = () => {
    const path = Skia.Path.Make();
    const centerX = TIMER_SIZE / 2;
    const centerY = TIMER_SIZE / 2;
    
    // Start angle at -90 degrees (top of circle)
    const startAngle = -90;
    const sweepAngle = angle;
    
    if (sweepAngle > 0) {
      // Create arc
      path.addArc(
        {
          x: centerX - RADIUS,
          y: centerY - RADIUS,
          width: RADIUS * 2,
          height: RADIUS * 2,
        },
        startAngle,
        sweepAngle
      );
    }
    
    return path;
  };

  // Font handling for Skia text (iOS only)
  const timerText = `${Math.round(animatedTimer)}`;
  let timerFont = null;
  let labelFont = null;
  let timerTextX = TIMER_SIZE / 2;
  let timerTextY = TIMER_SIZE / 2;
  let labelTextX = TIMER_SIZE / 2;
  let labelTextY = TIMER_SIZE / 2 + 20;

  if (Platform.OS === 'ios') {
    const fontFamily = 'Helvetica';
    try {
      timerFont = matchFont({ fontFamily, fontSize: 32, fontWeight: 'bold' });
      labelFont = matchFont({ fontFamily, fontSize: 14 });
      
      if (timerFont) {
        const textWidth = timerFont.measureText(timerText).width;
        timerTextX = (TIMER_SIZE - textWidth) / 2;
      }
      
      if (labelFont) {
        const labelWidth = labelFont.measureText('mins').width;
        labelTextX = (TIMER_SIZE - labelWidth) / 2;
      }
    } catch (error) {
      console.warn('Font matching failed:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Group>
          {/* Background circle (track) */}
          <Circle
            cx={TIMER_SIZE / 2}
            cy={TIMER_SIZE / 2}
            r={RADIUS}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
            color="#E0E0E0"
            opacity={0.3}
          />

          {/* Progress arc */}
          {animatedTimer > 0 && (
            <Path
              path={createProgressPath()}
              style="stroke"
              strokeWidth={STROKE_WIDTH}
              color={Colors.water}
              strokeCap="round"
            />
          )}

          {/* Center text - iOS only with Skia */}
          {Platform.OS === 'ios' && timerFont && labelFont && (
            <>
              <SkiaText
                x={timerTextX}
                y={timerTextY + 5}
                text={timerText}
                font={timerFont}
                color={Colors.text}
              />
              <SkiaText
                x={labelTextX}
                y={labelTextY + 5}
                text={timer > 1 ? 'mins' : 'min'}
                font={labelFont}
                color={Colors.text}
                opacity={0.7}
              />
            </>
          )}
        </Group>
      </Canvas>

      {/* Text overlay for web and Android */}
      {(Platform.OS === 'web' || Platform.OS === 'android') && (
        <View style={styles.textOverlay}>
          <Text style={styles.timerText}>{timer}</Text>
          <Text style={styles.labelText}>{timer > 1 ? 'mins' : 'min'}</Text>
        </View>
      )}
    </View>
  );
};

export default CircularTimer;

