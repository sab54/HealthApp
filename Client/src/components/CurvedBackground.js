import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CurvedBackground = ({ translateY }) => (
  <Animated.View
    style={[
      styles.container,
      { transform: [{ translateY }] },
    ]}
  >
    {/* Outer gradient */}
    <LinearGradient
      colors={['#e6e6fa', '#ffffff']}
      style={styles.gradient}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 1 }}
    />

    {/* Middle lavender glow */}
    <View style={styles.lavenderGlow} />

    {/* Inner white core */}
    <View style={styles.whiteCore} />
  </Animated.View>
);

export default CurvedBackground;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 400,
    height: 400,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 200,
  },
  lavenderGlow: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#e6e6fa',
    opacity: 0.5,
  },
  whiteCore: {
    position: 'absolute',
    top: 100,
    left: 100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    opacity: 0.8,
  },
});
