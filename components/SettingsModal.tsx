import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";

export type MapsApp = "default" | "google" | "apple" | "waze";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  compassOffset: number;
  onCompassOffsetChange: (value: number) => void;
  searchRadius: number;
  onSearchRadiusChange: (value: number) => void;
  preferredMapsApp: MapsApp;
  onPreferredMapsAppChange: (app: MapsApp) => void;
}

const MAPS_OPTIONS: { value: MapsApp; label: string; icon: string }[] = [
  { value: "default", label: "System Default", icon: "🗺️" },
  { value: "google", label: "Google Maps", icon: "🌐" },
  { value: "apple", label: "Apple Maps", icon: "🍎" },
  { value: "waze", label: "Waze", icon: "🚗" },
];

export function SettingsModal({
  visible,
  onClose,
  compassOffset,
  onCompassOffsetChange,
  searchRadius,
  onSearchRadiusChange,
  preferredMapsApp,
  onPreferredMapsAppChange,
}: SettingsModalProps) {
  const [localSearchRadius, setLocalSearchRadius] = useState(searchRadius);

  // Sync local state when modal opens
  useEffect(() => {
    if (visible) {
      setLocalSearchRadius(searchRadius);
    }
  }, [visible]);

  const handleClose = () => {
    onSearchRadiusChange(localSearchRadius);
    onClose();
  };

  const adjustOffset = (delta: number) => {
    let newValue = compassOffset + delta;
    // Normalize to -180 to 180 range
    if (newValue > 180) newValue -= 360;
    if (newValue < -180) newValue += 360;
    onCompassOffsetChange(newValue);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Settings</Text>
                  <TouchableOpacity style={styles.closeX} onPress={handleClose}>
                    <Text style={styles.closeXText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Search Radius */}
                <View style={styles.setting}>
                  <Text style={styles.settingLabel}>Search Radius</Text>
                  <Text style={styles.settingHint}>
                    How far to search for pubs
                  </Text>

                  <View style={styles.sliderSection}>
                    <Slider
                      testID="search-radius-slider"
                      style={styles.slider}
                      minimumValue={500}
                      maximumValue={5000}
                      step={100}
                      value={localSearchRadius}
                      onValueChange={setLocalSearchRadius}
                      minimumTrackTintColor="#2a9d8f"
                      maximumTrackTintColor="#4a5568"
                      thumbTintColor="#f4a261"
                    />
                    <View style={styles.sliderValueContainer}>
                      <Text style={styles.sliderValue}>
                        {localSearchRadius < 1000
                          ? `${localSearchRadius}m`
                          : `${(localSearchRadius / 1000).toFixed(1)}km`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>0.5km</Text>
                    <Text style={styles.sliderLabelText}>5km</Text>
                  </View>
                </View>

                {/* Maps App Selection */}
                <View style={styles.setting}>
                  <Text style={styles.settingLabel}>Preferred Maps App</Text>
                  <Text style={styles.settingHint}>
                    Which app to open for directions
                  </Text>

                  <View style={styles.mapsGrid}>
                    {MAPS_OPTIONS.map((option) => {
                      // Hide Apple Maps option on Android
                      if (
                        option.value === "apple" &&
                        Platform.OS === "android"
                      ) {
                        return null;
                      }

                      const isSelected = preferredMapsApp === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.mapsButton,
                            isSelected && styles.mapsButtonSelected,
                          ]}
                          onPress={() => onPreferredMapsAppChange(option.value)}
                        >
                          <Text style={styles.mapsIcon}>{option.icon}</Text>
                          <Text
                            style={[
                              styles.mapsLabel,
                              isSelected && styles.mapsLabelSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkmark}>
                              <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Compass Calibration */}
                <View style={styles.setting}>
                  <Text style={styles.settingLabel}>Compass Calibration</Text>
                  <Text style={styles.settingHint}>
                    Adjust if the arrow doesn't point correctly
                  </Text>

                  <View style={styles.sliderContainer}>
                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => adjustOffset(-15)}
                    >
                      <Text style={styles.adjustButtonText}>-15°</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.adjustButtonSmall}
                      onPress={() => adjustOffset(-5)}
                    >
                      <Text style={styles.adjustButtonTextSmall}>-5°</Text>
                    </TouchableOpacity>

                    <View style={styles.valueContainer}>
                      <Text style={styles.valueText}>{compassOffset}°</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.adjustButtonSmall}
                      onPress={() => adjustOffset(5)}
                    >
                      <Text style={styles.adjustButtonTextSmall}>+5°</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => adjustOffset(15)}
                    >
                      <Text style={styles.adjustButtonText}>+15°</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.resetOffsetButton}
                    onPress={() => onCompassOffsetChange(180)}
                  >
                    <Text style={styles.resetOffsetText}>
                      Reset to Default (180°)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#2a9d8f",
  },
  scrollView: {},
  scrollContent: {
    padding: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#f4a261",
    textAlign: "center",
  },
  closeX: {
    position: "absolute",
    right: 0,
    padding: 4,
  },
  closeXText: {
    fontSize: 18,
    color: "#6b7280",
  },
  setting: {
    marginBottom: 32,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e9c46a",
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  sliderSection: {
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValueContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  sliderValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    backgroundColor: "#0f0f1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#6b7280",
  },
  mapsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mapsButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  mapsButtonSelected: {
    backgroundColor: "rgba(42, 157, 143, 0.3)",
    borderColor: "#2a9d8f",
  },
  mapsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapsLabel: {
    fontSize: 13,
    color: "#a8a8b3",
    textAlign: "center",
    fontWeight: "500",
  },
  mapsLabelSelected: {
    color: "#2a9d8f",
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#2a9d8f",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  adjustButton: {
    backgroundColor: "#2a9d8f",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  adjustButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  adjustButtonSmall: {
    backgroundColor: "rgba(42, 157, 143, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  adjustButtonTextSmall: {
    color: "#2a9d8f",
    fontSize: 12,
    fontWeight: "600",
  },
  valueContainer: {
    backgroundColor: "#0f0f1a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  valueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  resetOffsetButton: {
    marginTop: 16,
    alignItems: "center",
  },
  resetOffsetText: {
    color: "#6b7280",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  closeButton: {
    backgroundColor: "#e76f51",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
