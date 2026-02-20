/**
 * Mock for @react-native-community/slider.
 * Renders as a plain View and forwards all props so tests can:
 *   - find it by testID
 *   - call onValueChange / onSlidingComplete via element.props
 */
import React from 'react';
import { View } from 'react-native';

export default function MockSlider(props: any) {
  const {
    style,
    minimumValue: _min,
    maximumValue: _max,
    step: _step,
    minimumTrackTintColor: _minColor,
    maximumTrackTintColor: _maxColor,
    thumbTintColor: _thumb,
    ...rest
  } = props;
  return <View style={style} {...rest} />;
}
