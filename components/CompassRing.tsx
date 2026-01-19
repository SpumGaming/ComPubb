import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText, Line, Defs, RadialGradient, Stop } from 'react-native-svg';

interface CompassRingProps {
  size?: number;
}

export function CompassRing({ size = 300 }: CompassRingProps) {
  const center = size / 2;
  const radius = (size / 2) - 20;
  const tickRadius = radius - 10;
  const labelRadius = radius - 35;

  const cardinalPoints = [
    { angle: 0, label: 'N' },
    { angle: 90, label: 'E' },
    { angle: 180, label: 'S' },
    { angle: 270, label: 'W' },
  ];

  const getTickPosition = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="ringGradient" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="70%" stopColor="#1a1a2e" />
            <Stop offset="100%" stopColor="#16213e" />
          </RadialGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#ringGradient)"
          stroke="#e76f51"
          strokeWidth={3}
        />
        
        {/* Inner decorative ring */}
        <Circle
          cx={center}
          cy={center}
          r={radius - 50}
          fill="none"
          stroke="#2a9d8f"
          strokeWidth={1}
          strokeDasharray="5,5"
        />
        
        {/* Tick marks */}
        {Array.from({ length: 72 }, (_, i) => {
          const angle = i * 5;
          const isCardinal = angle % 90 === 0;
          const isOrdinal = angle % 45 === 0 && !isCardinal;
          const isMajor = angle % 30 === 0;
          
          const outerPos = getTickPosition(angle, tickRadius);
          const tickLength = isCardinal ? 20 : isOrdinal ? 15 : isMajor ? 10 : 5;
          const innerPos = getTickPosition(angle, tickRadius - tickLength);
          
          return (
            <Line
              key={angle}
              x1={outerPos.x}
              y1={outerPos.y}
              x2={innerPos.x}
              y2={innerPos.y}
              stroke={isCardinal ? '#f4a261' : isOrdinal ? '#e9c46a' : '#4a5568'}
              strokeWidth={isCardinal ? 3 : isOrdinal ? 2 : 1}
            />
          );
        })}
        
        {/* Cardinal labels */}
        {cardinalPoints.map(({ angle, label }) => {
          const pos = getTickPosition(angle, labelRadius);
          return (
            <SvgText
              key={label}
              x={pos.x}
              y={pos.y + 6}
              fill={label === 'N' ? '#e76f51' : '#e9c46a'}
              fontSize={label === 'N' ? 24 : 18}
              fontWeight="bold"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
