/**
 * Mock for react-native-svg.
 * SVG primitives are replaced with plain Views/Text so Jest doesn't
 * need a native SVG renderer.
 */
import React from 'react';
import { View, Text as RNText } from 'react-native';

const passChildren = ({ children }: { children?: React.ReactNode }) => (
  <View>{children}</View>
);

export const Svg = passChildren;
export const G = passChildren;
export const Defs = passChildren;
export const LinearGradient = passChildren;
export const RadialGradient = passChildren;
export const Stop = () => <View />;
export const Path = () => <View />;
export const Circle = () => <View />;
export const Line = () => <View />;
export const Text = ({ children }: { children?: React.ReactNode }) => (
  <RNText>{children}</RNText>
);

export default Svg;
