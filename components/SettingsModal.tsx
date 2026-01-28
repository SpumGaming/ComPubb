import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  compassOffset: number;
  onCompassOffsetChange: (value: number) => void;
}

export function SettingsModal({
  visible,
  onClose,
  compassOffset,
  onCompassOffsetChange,
}: SettingsModalProps) {
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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>Settings</Text>

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
                  <Text style={styles.resetOffsetText}>Reset to Default (180°)</Text>
                </TouchableOpacity>
              </View>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2a9d8f',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f4a261',
    textAlign: 'center',
    marginBottom: 24,
  },
  setting: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9c46a',
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustButton: {
    backgroundColor: '#2a9d8f',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  adjustButtonSmall: {
    backgroundColor: 'rgba(42, 157, 143, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  adjustButtonTextSmall: {
    color: '#2a9d8f',
    fontSize: 12,
    fontWeight: '600',
  },
  valueContainer: {
    backgroundColor: '#0f0f1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  valueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  resetOffsetButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resetOffsetText: {
    color: '#6b7280',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#e76f51',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
