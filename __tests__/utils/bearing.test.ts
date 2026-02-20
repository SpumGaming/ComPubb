import { calculateBearing, formatDistance } from '../../utils/bearing';

describe('calculateBearing', () => {
  it('returns ~0° heading north', () => {
    const bearing = calculateBearing(0, 0, 1, 0);
    expect(bearing).toBeCloseTo(0, 0);
  });

  it('returns ~90° heading east', () => {
    const bearing = calculateBearing(0, 0, 0, 1);
    expect(bearing).toBeCloseTo(90, 0);
  });

  it('returns ~180° heading south', () => {
    const bearing = calculateBearing(0, 0, -1, 0);
    expect(bearing).toBeCloseTo(180, 0);
  });

  it('returns ~270° heading west', () => {
    const bearing = calculateBearing(0, 0, 0, -1);
    expect(bearing).toBeCloseTo(270, 0);
  });

  it('always returns a value in [0, 360)', () => {
    const cases = [
      [51.5, -0.1, 51.6, -0.2],
      [51.5, -0.1, 51.4, 0.0],
      [-33.9, 151.2, 35.7, 139.7],
    ] as [number, number, number, number][];

    for (const [fromLat, fromLon, toLat, toLon] of cases) {
      const bearing = calculateBearing(fromLat, fromLon, toLat, toLon);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    }
  });

  it('is roughly correct for a known real-world route (London → Paris ≈ 149°)', () => {
    // London (51.5°N, 0.1°W) → Paris (48.9°N, 2.3°E) is roughly south-east
    const bearing = calculateBearing(51.5, -0.1, 48.9, 2.3);
    expect(bearing).toBeGreaterThan(100);
    expect(bearing).toBeLessThan(180);
  });
});

describe('formatDistance', () => {
  it('formats whole-metre values under 1000m', () => {
    expect(formatDistance(1)).toBe('1m');
    expect(formatDistance(500)).toBe('500m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('rounds fractional metres', () => {
    expect(formatDistance(500.4)).toBe('500m');
    expect(formatDistance(500.6)).toBe('501m');
  });

  it('formats 1000m as 1.0km', () => {
    expect(formatDistance(1000)).toBe('1.0km');
  });

  it('formats distances above 1km with one decimal place', () => {
    expect(formatDistance(1500)).toBe('1.5km');
    expect(formatDistance(2750)).toBe('2.8km');
    expect(formatDistance(5000)).toBe('5.0km');
  });
});
