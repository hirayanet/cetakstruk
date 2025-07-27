# PWA Icons

Folder ini berisi icon-icon untuk PWA (Progressive Web App).

## Required Icons:
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Shortcut Icons:
- bca-shortcut.png
- bri-shortcut.png
- mapping-shortcut.png

## How to Generate:
1. Create a 512x512 base icon with "Cetak Struk" branding
2. Use online tools like https://realfavicongenerator.net/
3. Or use tools like ImageMagick to resize:
   ```bash
   convert icon-512x512.png -resize 192x192 icon-192x192.png
   ```

## Design Guidelines:
- Use blue theme (#3b82f6) to match app
- Include "HRY" or printer/receipt icon
- Make sure it's readable at small sizes
- Consider maskable icon requirements for Android

## Temporary Solution:
For now, you can use the vite.svg as placeholder or create simple colored squares with text.
