/**
 * Integration tests for App.tsx
 *
 * Covers the two user-facing requirements:
 *  1. Changing the slider radius causes the Overpass API to be called with the new value.
 *  2. Changing the preferred maps app causes the correct URL to be opened.
 */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

import App from '../App';
import { fetchNearbyPubs } from '../services/pubService';

// ---------------------------------------------------------------------------
// Mock hooks
//
// IMPORTANT: useLocation must return a STABLE `location` reference.
// If it returned a new `{ latitude, longitude }` object on every call,
// useCallback([location, searchRadius]) would recreate `fetchPubs` on every
// render, triggering useEffect infinitely (loading → fetch → loading → …).
// The factory closure below ensures the same object is reused every call.
// ---------------------------------------------------------------------------
jest.mock('../hooks/useLocation', () => {
  const stableLocation = { latitude: 51.5, longitude: -0.1 };
  return {
    useLocation: () => ({
      location: stableLocation,
      error: null,
      loading: false,
      refresh: jest.fn(),
    }),
  };
});

jest.mock('../hooks/useCompass', () => ({
  useCompass: () => ({ heading: 0, error: null }),
}));

// ---------------------------------------------------------------------------
// Mock the pub service
// ---------------------------------------------------------------------------
jest.mock('../services/pubService');
const mockFetchNearbyPubs = fetchNearbyPubs as jest.MockedFunction<typeof fetchNearbyPubs>;

const MOCK_PUB = {
  id: 1,
  name: 'The Test Pub',
  latitude: 51.501,
  longitude: -0.101,
  distanceMeters: 150,
};

// ---------------------------------------------------------------------------
// Mock Linking
// ---------------------------------------------------------------------------
const mockCanOpenURL = jest.spyOn(Linking, 'canOpenURL');
const mockOpenURL = jest.spyOn(Linking, 'openURL');

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
  mockFetchNearbyPubs.mockResolvedValue([MOCK_PUB]);
  // Return true so the app-specific URL (not the web fallback) is used by default
  mockCanOpenURL.mockResolvedValue(true);
  mockOpenURL.mockResolvedValue(undefined);

  // Make Platform.select behave as if running on iOS so we can predict
  // which URL variant getMapsUrl() produces.
  jest.spyOn(Platform, 'select').mockImplementation((spec: any) => spec.ios ?? spec.default);
});

// Wait until the main compass screen is visible (pub loaded, loading gone)
async function waitForMainScreen(getByText: ReturnType<typeof render>['getByText']) {
  await waitFor(() => getByText('The Test Pub'), { timeout: 3000 });
}

// ---------------------------------------------------------------------------
// 1. Search radius → API call
// ---------------------------------------------------------------------------
describe('search radius', () => {
  it('calls the API with the default 1500 m radius on startup', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockFetchNearbyPubs).toHaveBeenCalledWith(51.5, -0.1, 1500);
    });
  });

  it('calls the API again with the updated radius after the slider is moved and settings are closed', async () => {
    const { getByText, getByTestId } = render(<App />);
    await waitForMainScreen(getByText);

    // Open settings modal
    fireEvent.press(getByText('⚙️'));

    // Move the slider to 3000 m
    const slider = getByTestId('search-radius-slider');
    act(() => slider.props.onValueChange(3000));

    // Close modal – this is when the new radius is committed to App state
    fireEvent.press(getByText('Done'));

    await waitFor(() => {
      expect(mockFetchNearbyPubs).toHaveBeenCalledWith(51.5, -0.1, 3000);
    });
  });

  it('does not re-fetch when settings are closed without changing the radius', async () => {
    const { getByText } = render(<App />);
    await waitForMainScreen(getByText);

    const initialCallCount = mockFetchNearbyPubs.mock.calls.length;

    fireEvent.press(getByText('⚙️'));
    fireEvent.press(getByText('Done'));

    // Allow any potential async state updates to settle
    await act(async () => {});

    expect(mockFetchNearbyPubs).toHaveBeenCalledTimes(initialCallCount);
  });
});

// ---------------------------------------------------------------------------
// 2. Maps app selection → correct URL opened
// ---------------------------------------------------------------------------
describe('maps app selection', () => {
  async function selectMapAndTapButton(
    getByText: ReturnType<typeof render>['getByText'],
    mapOptionLabel: string,
  ) {
    await waitForMainScreen(getByText);

    // Open settings, pick a map app, close
    fireEvent.press(getByText('⚙️'));
    fireEvent.press(getByText(mapOptionLabel));
    fireEvent.press(getByText('Done'));
    await act(async () => {});

    // Tap the Maps action button on the main screen
    fireEvent.press(getByText('Maps'));

    // Wait for the async Linking call
    await waitFor(() => expect(mockOpenURL).toHaveBeenCalled());
  }

  it('opens a Google Maps URL when Google Maps is selected', async () => {
    const { getByText } = render(<App />);
    await selectMapAndTapButton(getByText, 'Google Maps');

    expect(mockOpenURL.mock.calls[0][0]).toContain('comgooglemaps');
  });

  it('opens a Waze URL when Waze is selected', async () => {
    const { getByText } = render(<App />);
    await selectMapAndTapButton(getByText, 'Waze');

    expect(mockOpenURL.mock.calls[0][0]).toContain('waze://');
  });

  it('opens an Apple Maps URL when Apple Maps is selected', async () => {
    const { getByText } = render(<App />);
    await selectMapAndTapButton(getByText, 'Apple Maps');

    expect(mockOpenURL.mock.calls[0][0]).toContain('maps://app');
  });

  it('falls back to a Google Maps web URL when the device cannot open the native app', async () => {
    mockCanOpenURL.mockResolvedValue(false);

    const { getByText } = render(<App />);
    await selectMapAndTapButton(getByText, 'Waze');

    expect(mockOpenURL.mock.calls[0][0]).toContain('google.com/maps');
  });

  it('includes the pub coordinates in the URL', async () => {
    const { getByText } = render(<App />);
    await selectMapAndTapButton(getByText, 'Waze');

    const url: string = mockOpenURL.mock.calls[0][0];
    expect(url).toContain('51.501');
    expect(url).toContain('-0.101');
  });
});
