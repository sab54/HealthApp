// __mocks__/expo-linear-gradient.js
import React from 'react';
import { View } from 'react-native';

// Replace LinearGradient with a simple View for snapshot stability
export const LinearGradient = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};
