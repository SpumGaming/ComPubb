import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocation } from "./hooks/useLocation";
import { useCompass } from "./hooks/useCompass";
import { fetchNearbyPubs } from "./services/pubService";
import { CompassArrow } from "./components/CompassArrow";
import { CompassRing } from "./components/CompassRing";
import { PubInfo } from "./components/PubInfo";
import { StatusMessage } from "./components/StatusMessage";
import { SettingsModal, MapsApp } from "./components/SettingsModal";
import { MouseBitesModal } from "./components/MouseBitesModal";
import { calculateBearing } from "./utils/bearing";
import { Pub } from "./types";

export default function App() {
  const {
    location,
    error: locationError,
    loading: locationLoading,
    refresh: refreshLocation,
  } = useLocation();
  const { heading, error: compassError } = useCompass();

  const [pubs, setPubs] = useState<Pub[]>([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);
  const [visitedPubIds, setVisitedPubIds] = useState<Set<number>>(new Set());
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [mouseBitesVisible, setMouseBitesVisible] = useState(false);
  const [compassOffset, setCompassOffset] = useState(180);
  const [searchRadius, setSearchRadius] = useState(1500); // Default 1.5km
  const [preferredMapsApp, setPreferredMapsApp] = useState<MapsApp>("default");

  // Filter out visited pubs
  const availablePubs = useMemo(
    () => pubs.filter((pub) => !visitedPubIds.has(pub.id)),
    [pubs, visitedPubIds],
  );

  const closestPub = availablePubs.length > 0 ? availablePubs[0] : null;

  const markAsVisited = () => {
    if (closestPub) {
      setVisitedPubIds((prev) => new Set([...prev, closestPub.id]));
    }
  };

  const resetVisited = () => {
    setVisitedPubIds(new Set());
  };

  const getMapsUrl = (latitude: number, longitude: number): string => {
    switch (preferredMapsApp) {
      case "google":
        // Google Maps with walking directions
        return (
          Platform.select({
            ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=walking`,
            android: `google.navigation:q=${latitude},${longitude}&mode=w`,
            default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`,
          }) ||
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
        );

      case "apple":
        // Apple Maps (iOS only)
        return `maps://app?daddr=${latitude},${longitude}&dirflg=w`;

      case "waze":
        // Waze
        return `waze://?ll=${latitude},${longitude}&navigate=yes`;

      case "default":
      default:
        // System default with walking directions
        return (
          Platform.select({
            ios: `maps://app?daddr=${latitude},${longitude}&dirflg=w`,
            android: `google.navigation:q=${latitude},${longitude}&mode=w`,
            default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`,
          }) ||
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
        );
    }
  };

  const openInMaps = () => {
    if (!closestPub) return;

    const { latitude, longitude } = closestPub;
    const url = getMapsUrl(latitude, longitude);

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web with walking directions
          return Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`,
          );
        }
      })
      .catch(() => {
        // Final fallback
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`,
        );
      });
  };

  const fetchPubs = useCallback(async () => {
    if (!location) return;

    setPubsLoading(true);
    setPubsError(null);

    try {
      const nearbyPubs = await fetchNearbyPubs(
        location.latitude,
        location.longitude,
        searchRadius,
      );
      setPubs(nearbyPubs);
    } catch (err) {
      setPubsError("Failed to find nearby pubs. Check your connection.");
    } finally {
      setPubsLoading(false);
    }
  }, [location, searchRadius]);

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
      closestPub.longitude,
    );

    // Subtract device heading to get relative direction
    // Add compassOffset to correct for magnetometer orientation (adjustable in settings)
    return bearingToPub - heading + compassOffset;
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
        <StatusMessage
          type="error"
          message={locationError}
          onRetry={refreshLocation}
        />
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
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>Pub Compass</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <SettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          compassOffset={compassOffset}
          onCompassOffsetChange={setCompassOffset}
          searchRadius={searchRadius}
          onSearchRadiusChange={setSearchRadius}
          preferredMapsApp={preferredMapsApp}
          onPreferredMapsAppChange={setPreferredMapsApp}
        />
        <StatusMessage
          type="empty"
          message={`No pubs found within ${searchRadius < 1000 ? `${searchRadius}m` : `${(searchRadius / 1000).toFixed(1)}km`}. Try increasing the search radius in settings!`}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  // Render all pubs visited
  if (availablePubs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Pub Compass</Text>
        </View>
        <View style={styles.completedContainer}>
          <Text style={styles.completedIcon}>🎉</Text>
          <Text style={styles.completedText}>
            You've visited all {pubs.length} pubs nearby!
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetVisited}>
            <Text style={styles.resetButtonText}>Start New Pub Crawl</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Pub Compass</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setMouseBitesVisible(true)}>
          <Text style={styles.subtitle}>🍻</Text>
        </TouchableOpacity>
      </View>

      <MouseBitesModal
        visible={mouseBitesVisible}
        onClose={() => setMouseBitesVisible(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        compassOffset={compassOffset}
        onCompassOffsetChange={setCompassOffset}
        searchRadius={searchRadius}
        onSearchRadiusChange={setSearchRadius}
        preferredMapsApp={preferredMapsApp}
        onPreferredMapsAppChange={setPreferredMapsApp}
      />

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
          <View style={styles.pubLabelRow}>
            <Text style={styles.pubLabel}>Nearest Pub</Text>
            {visitedPubIds.size > 0 && (
              <TouchableOpacity onPress={resetVisited}>
                <Text style={styles.resetLink}>
                  Reset ({visitedPubIds.size} visited)
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <PubInfo pub={closestPub} />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.beenThereButton}
              onPress={markAsVisited}
            >
              <Text style={styles.beenThereIcon}>✓</Text>
              <Text style={styles.beenThereText}>Been There</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.openMapsButton}
              onPress={openInMaps}
            >
              <Text style={styles.openMapsIcon}>🗺️</Text>
              <Text style={styles.openMapsText}>Maps</Text>
            </TouchableOpacity>
          </View>

          {availablePubs.length > 1 && (
            <Text style={styles.moreText}>
              +{availablePubs.length - 1} more pub
              {availablePubs.length > 2 ? "s" : ""} to go
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
    backgroundColor: "#0f0f1a",
  },
  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontWeight: "800",
    color: "#f4a261",
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 24,
    marginTop: 4,
  },
  compassContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  arrowOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  pubInfoContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  pubLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pubLabel: {
    fontSize: 14,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  resetLink: {
    fontSize: 12,
    color: "#e76f51",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  beenThereButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e76f51",
    paddingVertical: 12,
    borderRadius: 10,
  },
  beenThereIcon: {
    fontSize: 14,
    color: "#fff",
    marginRight: 6,
    fontWeight: "bold",
  },
  beenThereText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  openMapsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(42, 157, 143, 0.3)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a9d8f",
  },
  openMapsIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  openMapsText: {
    color: "#2a9d8f",
    fontSize: 14,
    fontWeight: "600",
  },
  moreText: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  completedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completedText: {
    fontSize: 20,
    color: "#e9c46a",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: "#2a9d8f",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(42, 157, 143, 0.2)",
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a9d8f",
  },
  refreshIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  refreshText: {
    color: "#2a9d8f",
    fontSize: 16,
    fontWeight: "600",
  },
  compassWarning: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  compassWarningText: {
    color: "#f4a261",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
