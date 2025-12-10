# PWA Icons Setup

## 📋 Overview

The PWA manifest is configured to use icons at:
- `public/pwa-192x192.png` (192x192 pixels)
- `public/pwa-512x512.png` (512x512 pixels)

## 🎨 Icon Requirements

### Required Sizes
- **192x192** - Standard app icon
- **512x512** - High-resolution icon (also used as maskable)

### Design Guidelines
- Use the Split Money branding/logo
- Ensure icons are square
- Use transparent background or solid color matching theme (#6200EE)
- Icons should be recognizable at small sizes
- Maskable icons should have safe zone (80% of icon area)

## 🔧 Setup Instructions

1. **Create Icons**
   - Design icons matching the app's branding
   - Export as PNG files with exact dimensions
   - Place in `public/` directory

2. **Verify Manifest**
   - Icons are already configured in `vite.config.ts`
   - Manifest will be generated automatically during build

3. **Test Installation**
   - Build the app: `npm run build`
   - Serve the build: `npm run preview`
   - Test PWA installation on mobile device or Chrome DevTools

## 📝 Current Status

- ✅ Manifest configuration complete
- ⏳ Icons need to be created and added to `public/` directory
- ✅ Icon paths configured in VitePWA plugin

## 🚀 Next Steps

1. Create/design app icons
2. Export as PNG files (192x192 and 512x512)
3. Place in `public/` directory
4. Test PWA installation

---

**Note**: The app will work without icons, but installation prompts may not appear optimally without proper icons.
