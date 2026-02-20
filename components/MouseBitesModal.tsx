import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

const DRUG_OPTIONS = [
  "Medicine Drug",
  "Stupid Drug",
  "More Mouse Bites",
  "I too am in this dropdown list",
];

interface MouseBitesModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MouseBitesModal({ visible, onClose }: MouseBitesModalProps) {
  const [selectedDrug, setSelectedDrug] = useState(DRUG_OPTIONS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Mouse Bites</Text>
                <TouchableOpacity style={styles.closeX} onPress={onClose}>
                  <Text style={styles.closeXText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.question}>
                What drug should the patient receive
              </Text>

              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setDropdownOpen((o) => !o)}
              >
                <Text style={styles.dropdownButtonText}>{selectedDrug}</Text>
                <Text style={styles.dropdownChevron}>
                  {dropdownOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {DRUG_OPTIONS.map((option) => {
                    const isSelected = selectedDrug === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedDrug(option);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemLabel,
                            isSelected && styles.dropdownItemLabelSelected,
                          ]}
                        >
                          {option}
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
    borderWidth: 1,
    borderColor: "#2a9d8f",
    padding: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  question: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
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
    flex: 1,
    marginRight: 8,
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
});
