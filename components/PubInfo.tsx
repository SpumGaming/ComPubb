import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pub } from '../types';
import { formatDistance } from '../utils/bearing';

interface PubInfoProps {
  pub: Pub;
}

export function PubInfo({ pub }: PubInfoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🍺</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>{pub.name}</Text>
        <Text style={styles.distance}>{formatDistance(pub.distanceMeters)} away</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a9d8f',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 162, 97, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9c46a',
    letterSpacing: 0.5,
  },
  distance: {
    fontSize: 16,
    color: '#2a9d8f',
    marginTop: 4,
    fontWeight: '500',
  },
});
