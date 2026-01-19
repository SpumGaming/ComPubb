import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';

interface UseCompassResult {
  heading: number;
  error: string | null;
}

// Smoothing factor: 0 = no smoothing, 1 = never updates
// 0.85 gives a nice smooth feel while staying responsive
const SMOOTHING_FACTOR = 0.85;

export function useCompass(): UseCompassResult {
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const smoothedHeading = useRef(0);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const subscribe = async () => {
      try {
        const available = await Magnetometer.isAvailableAsync();
        
        if (!available) {
          setError('Compass not available on this device');
          return;
        }

        // Update at 60fps for smooth animation
        Magnetometer.setUpdateInterval(16);
        
        subscription = Magnetometer.addListener((data) => {
          const { x, y } = data;
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          
          // Normalize to 0-360
          if (angle < 0) {
            angle += 360;
          }
          
          // Adjust for device orientation (portrait mode)
          angle = (angle + 90) % 360;
          
          // Apply smoothing with special handling for the 360/0 boundary
          let currentSmoothed = smoothedHeading.current;
          let diff = angle - currentSmoothed;
          
          // Handle wraparound (e.g., going from 350° to 10°)
          if (diff > 180) {
            diff -= 360;
          } else if (diff < -180) {
            diff += 360;
          }
          
          // Low-pass filter
          currentSmoothed = currentSmoothed + diff * (1 - SMOOTHING_FACTOR);
          
          // Normalize result
          if (currentSmoothed < 0) {
            currentSmoothed += 360;
          } else if (currentSmoothed >= 360) {
            currentSmoothed -= 360;
          }
          
          smoothedHeading.current = currentSmoothed;
          setHeading(currentSmoothed);
        });
      } catch (err) {
        setError('Failed to access compass');
      }
    };

    subscribe();

    return () => {
      subscription?.remove();
    };
  }, []);

  return { heading, error };
}
