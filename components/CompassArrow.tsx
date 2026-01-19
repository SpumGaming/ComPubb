import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CompassArrowProps {
  rotation: number;
  size?: number;
}

export function CompassArrow({ rotation, size = 200 }: CompassArrowProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.arrow, { transform: [{ rotate: `${rotation}deg` }] }]}>
        <Svg width={size * 0.6} height={size * 0.8} viewBox="0 0 100 140">
          <Defs>
            <LinearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#f4a261" />
              <Stop offset="50%" stopColor="#e76f51" />
              <Stop offset="100%" stopColor="#9d4238" />
            </LinearGradient>
            <LinearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#c45d3a" />
              <Stop offset="100%" stopColor="#7a2e24" />
            </LinearGradient>
          </Defs>
          {/* Arrow main body - left side */}
          <Path
            d="M50 0 L15 100 L50 80 Z"
            fill="url(#arrowGradient)"
          />
          {/* Arrow main body - right side (darker) */}
          <Path
            d="M50 0 L85 100 L50 80 Z"
            fill="url(#shadowGradient)"
          />
          {/* Arrow tail - left */}
          <Path
            d="M50 80 L15 100 L35 140 L50 120 Z"
            fill="#2a9d8f"
          />
          {/* Arrow tail - right */}
          <Path
            d="M50 80 L85 100 L65 140 L50 120 Z"
            fill="#1e7a6d"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
