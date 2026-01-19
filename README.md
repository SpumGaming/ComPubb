# 🍺 Pub Compass

A self-contained mobile app that points you towards the nearest pub! Uses your phone's location and compass to guide you to your next drink.

## How It Works

1. 📍 Gets your GPS location
2. 🔍 Queries OpenStreetMap for nearby pubs (via Overpass API)
3. 🧭 Uses your phone's compass to point you in the right direction
4. 🍻 Shows the name and distance to the nearest pub

**No backend required** - the app calls OpenStreetMap's free public API directly.

## Tech Stack

- **React Native** + **Expo SDK 54** (TypeScript)
- **OpenStreetMap / Overpass API** for pub data
- **expo-location** for GPS
- **expo-sensors** for compass (magnetometer)

## Prerequisites

- [Node.js 20+](https://nodejs.org/) (v20.19.4 or later recommended)
- [Expo Go](https://expo.dev/client) app on your phone (SDK 54 compatible)

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd ComPubb

# Install dependencies
npm install

# Start the development server
npx expo start
```

Then scan the QR code with:
- **Android**: Expo Go app
- **iOS**: Camera app (redirects to Expo Go)

### Troubleshooting

If you see SDK version mismatch errors, make sure your Expo Go app is updated to support SDK 54.

If you see package version warnings, run:
```bash
npx expo install --fix
```

## Project Structure

```
ComPubb/
├── App.tsx                 # Main app component
├── components/
│   ├── CompassArrow.tsx    # Directional arrow SVG
│   ├── CompassRing.tsx     # Decorative compass ring
│   ├── PubInfo.tsx         # Pub name & distance display
│   └── StatusMessage.tsx   # Loading/error states
├── hooks/
│   ├── useLocation.ts      # GPS location hook
│   └── useCompass.ts       # Magnetometer hook (with smoothing)
├── services/
│   └── pubService.ts       # Overpass API client
├── utils/
│   └── bearing.ts          # Geo calculations (bearing, distance)
└── types/
    └── index.ts            # TypeScript interfaces
```

## Features

- 🧭 **Real compass** - Uses device magnetometer with smoothed readings
- 📍 **GPS location** - High accuracy positioning
- 🍻 **Pub discovery** - Finds pubs & bars within 1.5km via OpenStreetMap
- 📏 **Distance display** - Shows how far in meters/km
- 🔄 **Refresh** - Update location anytime
- 🌙 **Dark theme** - Easy on the eyes at night

## Notes

- **Physical device required** - The compass uses the magnetometer which isn't available on simulators/emulators
- **Location permissions** - The app will request location access on first launch
- **Data source** - Pub locations come from OpenStreetMap, so coverage depends on local mapping activity

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

See [Expo EAS Build docs](https://docs.expo.dev/build/introduction/) for more details.

## Future Ideas

- [ ] List view of all nearby pubs
- [ ] Pub details (opening hours, phone, website)
- [ ] Open in Maps for turn-by-turn navigation
- [ ] Favorites / visited tracking
- [ ] Filter by distance radius
- [ ] Offline caching

## License

MIT
