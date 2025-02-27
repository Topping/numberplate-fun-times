# Numberplate Fun

A cross-platform mobile application for capturing and analyzing numberplates. Take pictures of interesting numberplates, and the app will classify them and assign scores based on their patterns.

## Features

- Camera integration for capturing numberplates
- Gallery view of captured numberplates
- Local storage of images and metadata
- Cross-platform support (iOS, Android, Web)
- Modern, intuitive UI

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

- For iOS:
  ```bash
  npm run ios
  ```

- For Android:
  ```bash
  npm run android
  ```

- For Web:
  ```bash
  npm run web
  ```

## Development

The app is built using:
- React Native with Expo
- TypeScript for type safety
- React Navigation for routing
- Expo Camera for image capture
- AsyncStorage for local data persistence

## Project Structure

```
numberplate-fun/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── App.tsx            # Main application component
└── package.json       # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 