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
  Linking,
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
  const [availableMapsApps, setAvailableMapsApps] = useState<typeof MAPS_OPTIONS>([]);
  const [mapsDropdownOpen, setMapsDropdownOpen] = useState(false);

  // Sync local state and detect available map apps when modal opens
  useEffect(() => {
    if (!visible) return;

    setLocalSearchRadius(searchRadius);
    setMapsDropdownOpen(false);

    const detectApps = async () => {
      const available: typeof MAPS_OPTIONS = [
        { value: "default", label: "System Default", icon: "🗺️" },
      ];

      if (Platform.OS === "ios") {
        // Apple Maps is always present on iOS
        available.push({ value: "apple", label: "Apple Maps", icon: "🍎" });
      }

      try {
        const googleScheme =
          Platform.OS === "ios"
            ? "comgooglemaps://"
            : "geo:0,0";
        if (await Linking.canOpenURL(googleScheme)) {
          available.push({ value: "google", label: "Google Maps", icon: "🌐" });
        }
      } catch {}

      try {
        if (await Linking.canOpenURL("waze://")) {
          available.push({ value: "waze", label: "Waze", icon: "🚗" });
        }
      } catch {}

      setAvailableMapsApps(available);
    };

    detectApps();
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

                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setMapsDropdownOpen((o) => !o)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {availableMapsApps.find((o) => o.value === preferredMapsApp)?.icon ?? "🗺️"}
                      {"  "}
                      {availableMapsApps.find((o) => o.value === preferredMapsApp)?.label ?? "System Default"}
                    </Text>
                    <Text style={styles.dropdownChevron}>
                      {mapsDropdownOpen ? "▲" : "▼"}
                    </Text>
                  </TouchableOpacity>

                  {mapsDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {availableMapsApps.map((option) => {
                        const isSelected = preferredMapsApp === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.dropdownItem,
                              isSelected && styles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                              onPreferredMapsAppChange(option.value);
                              setMapsDropdownOpen(false);
                            }}
                          >
                            <Text style={styles.dropdownItemIcon}>{option.icon}</Text>
                            <Text
                              style={[
                                styles.dropdownItemLabel,
                                isSelected && styles.dropdownItemLabelSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                            {isSelected && (
                              <Text style={styles.dropdownTick}>✓</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    borderWidth: 1,
    borderColor: "#2a9d8f",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  dropdownChevron: {
    color: "#2a9d8f",
    fontSize: 12,
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#2a9d8f",
    borderRadius: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(42, 157, 143, 0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(42, 157, 143, 0.2)",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(42, 157, 143, 0.2)",
  },
  dropdownItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  dropdownItemLabel: {
    flex: 1,
    fontSize: 15,
    color: "#a8a8b3",
    fontWeight: "500",
  },
  dropdownItemLabelSelected: {
    color: "#2a9d8f",
    fontWeight: "600",
  },
  dropdownTick: {
    color: "#2a9d8f",
    fontSize: 16,
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
