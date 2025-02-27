# Numberplate Scanner App

A Progressive Web App (PWA) that captures images of numberplates, sends them to a backend API for processing, and displays the extracted text.

## Features

- **Capture Images**: Take photos of numberplates using your device's camera
- **API Integration**: Send captured images to a configurable backend API
- **Gallery View**: Browse and search extracted numberplate text
- **PWA Support**: Works offline and can be installed on mobile devices
- **Cross-Platform**: Functions on both iOS and Android browsers

## Pages

1. **Capture**: Take photos of numberplates and send to the API for processing
2. **Gallery**: View, search, sort, and filter captured numberplate text
3. **Settings**: Configure the backend API endpoint

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. For production build:
   ```bash
   npm run build
   ```

## Deployment

### GitHub Pages

The app is configured for easy deployment to GitHub Pages.

#### Automatic Deployment (GitHub Actions)

1. Push your code to the main branch of your GitHub repository
2. The GitHub Action workflow will automatically build and deploy to the gh-pages branch
3. Your app will be available at `https://[your-username].github.io/numberplate-fun/`

#### Manual Deployment

You can also deploy manually:

```bash
npm run deploy
```

This will build the app and push the built files to the gh-pages branch.

## Backend API Requirements

The app expects the backend API to provide the following endpoint:

- `POST /api/process-plate`: Accepts a form with an image file named 'image' and returns JSON in the format:
  ```json
  {
    "numberplate": "ABC123",
    "confidence": 0.95
  }
  ```

## Configuration

In the Settings page, users can configure:
- The base URL of the backend API

## Technologies Used

- React
- TypeScript
- Vite
- Material UI
- PWA (Progressive Web App) support

## Browser Compatibility

- Chrome (Android/iOS/Desktop)
- Safari (iOS/Desktop)
- Firefox (Android/Desktop)
- Edge (Desktop)

## License

MIT
