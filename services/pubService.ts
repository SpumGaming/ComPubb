import { Pub } from '../types';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { [key: string]: string };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const FETCH_TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch nearby pubs directly from OpenStreetMap's Overpass API
 */
export async function fetchNearbyPubs(
  latitude: number,
  longitude: number,
  radiusMeters: number = 1500
): Promise<Pub[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="pub"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="pub"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="bar"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="bar"](around:${radiusMeters},${latitude},${longitude});
    );
    out center;
  `;

  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  };

  let lastError: Error = new Error('Unknown error');
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
    try {
      const response = await fetchWithTimeout(OVERPASS_API_URL, options);
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }
      const data: OverpassResponse = await response.json();

      return data.elements
        .map((element) => {
          const lat = element.lat ?? element.center?.lat;
          const lon = element.lon ?? element.center?.lon;

          if (lat === undefined || lon === undefined) {
            return null;
          }

          const name = element.tags?.name ?? 'Unknown Pub';
          const distance = calculateDistance(latitude, longitude, lat, lon);

          return {
            id: element.id,
            name,
            latitude: lat,
            longitude: lon,
            distanceMeters: distance,
          };
        })
        .filter((pub): pub is Pub => pub !== null)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
