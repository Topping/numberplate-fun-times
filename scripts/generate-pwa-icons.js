/**
 * A simple script to generate PWA icons
 * This is a basic implementation - in a production app,
 * you would want to use proper branded icons
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// A very simple SVG for the app icons
const generateSVG = (size, color = '#1976d2') => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  <rect x="10%" y="20%" width="80%" height="30%" fill="${color}" rx="5"/>
  <rect x="30%" y="60%" width="40%" height="20%" fill="${color}" rx="5"/>
  <text x="50%" y="40%" font-family="Arial" font-size="${size/8}px" fill="white" text-anchor="middle" dominant-baseline="middle">NP</text>
</svg>
`;

// Define the icons to generate
const icons = [
  { name: 'favicon.ico', size: 32, svg: generateSVG(32) },
  { name: 'apple-touch-icon.png', size: 180, svg: generateSVG(180) },
  { name: 'masked-icon.svg', size: 512, svg: generateSVG(512, '#000000') },
  { name: 'pwa-192x192.png', size: 192, svg: generateSVG(192) },
  { name: 'pwa-512x512.png', size: 512, svg: generateSVG(512) },
];

// Write the SVG files
icons.forEach(icon => {
  const filePath = path.join(publicDir, icon.name);
  const fileContent = icon.svg;
  fs.writeFileSync(filePath, fileContent);
  console.log(`Generated ${icon.name}`);
});

console.log('PWA icons generated successfully!'); 