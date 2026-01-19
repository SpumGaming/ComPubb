import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

interface StatusMessageProps {
  type: 'loading' | 'error' | 'empty';
  message: string;
  onRetry?: () => void;
}

export function StatusMessage({ type, message, onRetry }: StatusMessageProps) {
  return (
    <View style={styles.container}>
      {type === 'loading' && (
        <ActivityIndicator size="large" color="#f4a261" style={styles.spinner} />
      )}
      {type === 'error' && <Text style={styles.errorIcon}>⚠️</Text>}
      {type === 'empty' && <Text style={styles.emptyIcon}>🔍</Text>}
      
      <Text style={[styles.message, type === 'error' && styles.errorMessage]}>
        {message}
      </Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  spinner: {
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: '#a8a8b3',
    textAlign: 'center',
    lineHeight: 26,
  },
  errorMessage: {
    color: '#e76f51',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#2a9d8f',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
