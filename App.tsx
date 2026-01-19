import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocation } from './hooks/useLocation';
import { useCompass } from './hooks/useCompass';
import { fetchNearbyPubs } from './services/pubService';
import { CompassArrow } from './components/CompassArrow';
import { CompassRing } from './components/CompassRing';
import { PubInfo } from './components/PubInfo';
import { StatusMessage } from './components/StatusMessage';
import { calculateBearing } from './utils/bearing';
import { Pub } from './types';

const SEARCH_RADIUS = 1500; // meters

export default function App() {
  const { location, error: locationError, loading: locationLoading, refresh: refreshLocation } = useLocation();
  const { heading, error: compassError } = useCompass();
  
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);

  const closestPub = pubs.length > 0 ? pubs[0] : null;

  const fetchPubs = useCallback(async () => {
    if (!location) return;

    setPubsLoading(true);
    setPubsError(null);

    try {
      const nearbyPubs = await fetchNearbyPubs(
        location.latitude,
        location.longitude,
        SEARCH_RADIUS
      );
      setPubs(nearbyPubs);
    } catch (err) {
      setPubsError('Failed to find nearby pubs. Check your connection.');
    } finally {
      setPubsLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      fetchPubs();
    }
  }, [location, fetchPubs]);

  const handleRefresh = async () => {
    await refreshLocation();
  };

  // Calculate the arrow rotation
  const getArrowRotation = () => {
    if (!location || !closestPub) return 0;

    const bearingToPub = calculateBearing(
      location.latitude,
      location.longitude,
      closestPub.latitude,
      closestPub.longitude
    );

    // Subtract device heading to get relative direction
    // Add 180 to correct for magnetometer orientation
    return bearingToPub - heading + 180;
  };

  // Render loading state
  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <StatusMessage type="loading" message="Getting your location..." />
      </SafeAreaView>
    );
  }

  // Render location error
  if (locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <StatusMessage type="error" message={locationError} onRetry={refreshLocation} />
      </SafeAreaView>
    );
  }

  // Render pubs loading
  if (pubsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <StatusMessage type="loading" message="Searching for nearby pubs..." />
      </SafeAreaView>
    );
  }

  // Render pubs error
  if (pubsError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <StatusMessage type="error" message={pubsError} onRetry={fetchPubs} />
      </SafeAreaView>
    );
  }

  // Render no pubs found
  if (pubs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Pub Compass</Text>
          <Text style={styles.subtitle}>🍻</Text>
        </View>
        <StatusMessage 
          type="empty" 
          message={`No pubs found within ${SEARCH_RADIUS / 1000}km. Try a different location!`} 
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pub Compass</Text>
        <Text style={styles.subtitle}>🍻</Text>
      </View>

      {/* Compass */}
      <View style={styles.compassContainer}>
        <CompassRing size={300} />
        <View style={styles.arrowOverlay}>
          <CompassArrow rotation={getArrowRotation()} size={180} />
        </View>
      </View>

      {/* Pub Info */}
      {closestPub && (
        <View style={styles.pubInfoContainer}>
          <Text style={styles.pubLabel}>Nearest Pub</Text>
          <PubInfo pub={closestPub} />
          {pubs.length > 1 && (
            <Text style={styles.moreText}>
              +{pubs.length - 1} more pub{pubs.length > 2 ? 's' : ''} nearby
            </Text>
          )}
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshIcon}>🔄</Text>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      {/* Compass error indicator */}
      {compassError && (
        <View style={styles.compassWarning}>
          <Text style={styles.compassWarningText}>⚠️ Compass unavailable</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f4a261',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 24,
    marginTop: 4,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  arrowOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pubInfoContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  pubLabel: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.2)',
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a9d8f',
  },
  refreshIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  refreshText: {
    color: '#2a9d8f',
    fontSize: 16,
    fontWeight: '600',
  },
  compassWarning: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  compassWarningText: {
    color: '#f4a261',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
