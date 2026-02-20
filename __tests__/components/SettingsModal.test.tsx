import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SettingsModal } from '../../components/SettingsModal';

// Default props used across tests
const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  compassOffset: 180,
  onCompassOffsetChange: jest.fn(),
  searchRadius: 1500,
  onSearchRadiusChange: jest.fn(),
  preferredMapsApp: 'default' as const,
  onPreferredMapsAppChange: jest.fn(),
};

function renderModal(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<SettingsModal {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Search radius slider
// ---------------------------------------------------------------------------
describe('search radius slider', () => {
  it('displays the current search radius', () => {
    const { getByText } = renderModal({ searchRadius: 1500 });
    expect(getByText('1.5km')).toBeTruthy();
  });

  it('updates the displayed value as the slider moves', () => {
    const { getByTestId, getByText } = renderModal({ searchRadius: 1500 });

    const slider = getByTestId('search-radius-slider');
    act(() => slider.props.onValueChange(3000));

    expect(getByText('3.0km')).toBeTruthy();
  });

  it('commits the new radius to the parent when the modal closes', () => {
    const onSearchRadiusChange = jest.fn();
    const onClose = jest.fn();

    const { getByTestId, getByText } = renderModal({
      searchRadius: 1500,
      onSearchRadiusChange,
      onClose,
    });

    // Move the slider to 2500 m
    const slider = getByTestId('search-radius-slider');
    act(() => slider.props.onValueChange(2500));

    // Close the modal via the Done button
    fireEvent.press(getByText('Done'));

    expect(onSearchRadiusChange).toHaveBeenCalledWith(2500);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not propagate the radius until the modal is closed', () => {
    const onSearchRadiusChange = jest.fn();

    const { getByTestId } = renderModal({ searchRadius: 1500, onSearchRadiusChange });

    const slider = getByTestId('search-radius-slider');
    act(() => slider.props.onValueChange(4000));

    // Radius has not been committed yet
    expect(onSearchRadiusChange).not.toHaveBeenCalled();
  });

  it('displays sub-1000 m values in metres', () => {
    const { getByTestId, getByText } = renderModal({ searchRadius: 1500 });

    const slider = getByTestId('search-radius-slider');
    act(() => slider.props.onValueChange(800));

    expect(getByText('800m')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Maps app selection
// ---------------------------------------------------------------------------
describe('maps app selection', () => {
  it('calls onPreferredMapsAppChange when an option is tapped', () => {
    const onPreferredMapsAppChange = jest.fn();
    const { getByText } = renderModal({ onPreferredMapsAppChange });

    fireEvent.press(getByText('Google Maps'));

    expect(onPreferredMapsAppChange).toHaveBeenCalledWith('google');
  });

  it('calls onPreferredMapsAppChange with "waze" for Waze', () => {
    const onPreferredMapsAppChange = jest.fn();
    const { getByText } = renderModal({ onPreferredMapsAppChange });

    fireEvent.press(getByText('Waze'));

    expect(onPreferredMapsAppChange).toHaveBeenCalledWith('waze');
  });

  it('calls onPreferredMapsAppChange with "apple" for Apple Maps', () => {
    const onPreferredMapsAppChange = jest.fn();
    const { getByText } = renderModal({ onPreferredMapsAppChange });

    fireEvent.press(getByText('Apple Maps'));

    expect(onPreferredMapsAppChange).toHaveBeenCalledWith('apple');
  });

  it('calls onPreferredMapsAppChange with "default" for System Default', () => {
    const onPreferredMapsAppChange = jest.fn();
    // Start with google selected so pressing System Default is meaningful
    const { getByText } = renderModal({
      preferredMapsApp: 'google',
      onPreferredMapsAppChange,
    });

    fireEvent.press(getByText('System Default'));

    expect(onPreferredMapsAppChange).toHaveBeenCalledWith('default');
  });
});

// ---------------------------------------------------------------------------
// Compass calibration
// ---------------------------------------------------------------------------
describe('compass calibration', () => {
  it('adjusts the offset by +15 when the +15° button is pressed', () => {
    const onCompassOffsetChange = jest.fn();
    const { getByText } = renderModal({ compassOffset: 180, onCompassOffsetChange });

    fireEvent.press(getByText('+15°'));

    // 180 + 15 = 195, but normalised to -180..180 range → -165
    expect(onCompassOffsetChange).toHaveBeenCalledWith(-165);
  });

  it('adjusts the offset by -5 when the -5° button is pressed', () => {
    const onCompassOffsetChange = jest.fn();
    const { getByText } = renderModal({ compassOffset: 180, onCompassOffsetChange });

    fireEvent.press(getByText('-5°'));

    expect(onCompassOffsetChange).toHaveBeenCalledWith(175);
  });

  it('resets the offset to 180 when Reset is pressed', () => {
    const onCompassOffsetChange = jest.fn();
    const { getByText } = renderModal({ compassOffset: 90, onCompassOffsetChange });

    fireEvent.press(getByText('Reset to Default (180°)'));

    expect(onCompassOffsetChange).toHaveBeenCalledWith(180);
  });
});
