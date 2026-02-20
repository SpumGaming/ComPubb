import { fetchNearbyPubs } from '../../services/pubService';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Replace the global fetch with a Jest mock before each test
const mockFetch = jest.fn();
global.fetch = mockFetch;

function respondWith(elements: object[] = []) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ elements }),
  });
}

/** The body is sent as `data=<url-encoded query>` – decode it for readable assertions. */
function getDecodedBody(callIndex = 0): string {
  const raw: string = mockFetch.mock.calls[callIndex][1].body;
  return decodeURIComponent(raw);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchNearbyPubs – query construction', () => {
  it('sends a POST to the Overpass API', async () => {
    respondWith();
    await fetchNearbyPubs(51.5, -0.1, 1500);
    expect(mockFetch).toHaveBeenCalledWith(
      OVERPASS_URL,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('includes the search radius in the query body', async () => {
    respondWith();
    await fetchNearbyPubs(51.5, -0.1, 2000);

    expect(getDecodedBody()).toContain('around:2000');
  });

  it('uses the default radius of 1500 m when none is provided', async () => {
    respondWith();
    await fetchNearbyPubs(51.5, -0.1);

    expect(getDecodedBody()).toContain('around:1500');
  });

  it('embeds the latitude and longitude in the query', async () => {
    respondWith();
    await fetchNearbyPubs(51.5074, -0.1278, 1500);

    const body = getDecodedBody();
    expect(body).toContain('51.5074');
    expect(body).toContain('-0.1278');
  });

  it('searches for both "pub" and "bar" amenities', async () => {
    respondWith();
    await fetchNearbyPubs(51.5, -0.1, 1500);

    const body = getDecodedBody();
    expect(body).toContain('"amenity"="pub"');
    expect(body).toContain('"amenity"="bar"');
  });
});

describe('fetchNearbyPubs – response parsing', () => {
  it('maps node elements to Pub objects', async () => {
    respondWith([
      { id: 42, lat: 51.501, lon: -0.101, tags: { name: 'The Crown' } },
    ]);

    const pubs = await fetchNearbyPubs(51.5, -0.1, 1500);

    expect(pubs).toHaveLength(1);
    expect(pubs[0]).toMatchObject({
      id: 42,
      name: 'The Crown',
      latitude: 51.501,
      longitude: -0.101,
    });
  });

  it('uses center coordinates for way elements', async () => {
    respondWith([
      { id: 7, center: { lat: 51.502, lon: -0.102 }, tags: { name: 'The Bell' } },
    ]);

    const pubs = await fetchNearbyPubs(51.5, -0.1, 1500);

    expect(pubs[0].latitude).toBeCloseTo(51.502);
    expect(pubs[0].longitude).toBeCloseTo(-0.102);
  });

  it('falls back to "Unknown Pub" when there is no name tag', async () => {
    respondWith([{ id: 1, lat: 51.501, lon: -0.101 }]);

    const pubs = await fetchNearbyPubs(51.5, -0.1, 1500);

    expect(pubs[0].name).toBe('Unknown Pub');
  });

  it('sorts results by distance (nearest first)', async () => {
    respondWith([
      { id: 1, lat: 51.51, lon: -0.11, tags: { name: 'Far Pub' } },   // further
      { id: 2, lat: 51.501, lon: -0.101, tags: { name: 'Near Pub' } }, // closer
    ]);

    const pubs = await fetchNearbyPubs(51.5, -0.1, 1500);

    expect(pubs[0].name).toBe('Near Pub');
    expect(pubs[1].name).toBe('Far Pub');
  });

  it('drops elements that have no coordinate data', async () => {
    respondWith([
      { id: 1, tags: { name: 'Ghost Pub' } }, // no lat/lon/center
      { id: 2, lat: 51.501, lon: -0.101, tags: { name: 'Real Pub' } },
    ]);

    const pubs = await fetchNearbyPubs(51.5, -0.1, 1500);

    expect(pubs).toHaveLength(1);
    expect(pubs[0].name).toBe('Real Pub');
  });
});

describe('fetchNearbyPubs – error handling', () => {
  it('retries 3 times in total and then throws', async () => {
    // Replace setTimeout with a 0-ms version so retry delays don't slow down the test.
    // Microtasks (Promise resolution) still have priority, so fetchWithTimeout's
    // abort is always cleared before it fires.
    const realSetTimeout = global.setTimeout;
    global.setTimeout = ((cb: TimerHandler, _ms?: number, ...args: unknown[]) =>
      realSetTimeout(cb, 0, ...args)) as typeof global.setTimeout;

    try {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchNearbyPubs(51.5, -0.1, 1500)).rejects.toThrow('Overpass API error');
      // 1 original attempt + MAX_RETRIES (2) = 3 total calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    } finally {
      global.setTimeout = realSetTimeout;
    }
  });
});
