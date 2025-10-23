
import React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Colors from '../colors';

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 200,
    borderWidth: 2,
    borderColor: Colors.tankBorder,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
  },
  innerTextView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.text,
    fontSize: 20,
    marginBottom: 10,
  },
  water: {
    width: '100%',
    backgroundColor: Colors.water,
    position: 'absolute',
    bottom: 0,
  },
});

const WaterTank = ({ waterLevel = 0 }) => {
  const waterHeight = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(waterHeight, {
      toValue: waterLevel,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [waterHeight, waterLevel]);

  const waterStyle = {
    backgroundColor: Colors.water,
    height: waterHeight.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 200],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.water, waterStyle]} />
      <View style={styles.innerTextView}>
        <Text style={styles.text}>{`${waterLevel}%`}</Text>
      </View>
    </View>
  );
};

export default WaterTank;
