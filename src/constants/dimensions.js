// src/constants/dimensions.js
import { Dimensions, Platform, StatusBar } from 'react-native';
  
const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const DIMENSIONS = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  
  // Safe area (considering status bar and navigation)
  safeAreaHeight: Platform.OS === 'ios' ? height - 44 - 34 : height - StatusBar.currentHeight,
  
  // Common spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  // Component sizes
  button: {
    height: 48,
    minWidth: 100,
  },
  
  input: {
    height: 48,
    fontSize: 16,
  },
  
  header: {
    height: Platform.OS === 'ios' ? 88 : 56 + StatusBar.currentHeight,
  },
  
  tabBar: {
    height: Platform.OS === 'ios' ? 83 : 60,
  },
  
  // Avatar sizes
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },
  
  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },
};

 