//Client/src/components/CurvedBackground.js
/**
 * CurvedBackground.js
 * 
 * This file defines the `CurvedBackground` component, which creates an animated 
 * curved background effect for the UI. The component uses an animated gradient 
 * background, a lavender glow in the middle, and a white core to create a smooth, 
 * layered visual effect. It also supports translation animation based on the `translateY` prop.
 * 
 * Features:
 * - Displays an animated gradient background using `LinearGradient` from `expo-linear-gradient`.
 * - Includes a lavender-colored glow layer to create a soft, glowing effect.
 * - Features a white core for a clean and smooth finish.
 * - Supports vertical translation animation using the `translateY` prop for dynamic effects.
 * 
 * Props:
 * - `translateY`: The animated translation value (used to move the background vertically).
 * 
 * Dependencies:
 * - `react-native`
 * - `expo-linear-gradient`
 * 
 * Author: Sunidhi Abhange
 */

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
