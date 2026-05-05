# Upload Buttons Fix - Complete Guide

## Problem Summary

The photo and video upload buttons were not working properly:
1. **In dev (localhost:3000)**: Icons showed but clicks did nothing
2. **In embedded version**: No icons showing, no click functionality
3. React DevTools showed `<ForwardRef />` components instead of actual upload buttons

## Root Cause

The embed version (`embed/MemoryFormButtonWrapper.tsx`) was missing the upload button slots entirely! The `MemoryForm` component needs to receive:
- `imageUploadFieldImageUploadSlot` prop
- `videoUploadFieldVideoUploadSlot` prop

## Solution Applied

### 1. Updated Upload Button Components

**src/components/PhotoUploadButton.tsx**
- Uses Iconoir `media-image-plus` icon (48px, with + symbol)
- Entire container is clickable with `onClick` handler
- Inner elements have `pointerEvents: 'none'` to prevent blocking
- Shows compression progress, upload status, and remove button
- Uses Webflow design system colors and fonts

**src/components/VideoUploadButton.tsx**
- Uses Iconoir `media-video-plus` icon (48px, with + symbol)
- Same clickable container pattern
- Shows upload progress and status
- Consistent with photo upload styling

### 2. Fixed Embed Wrapper

**embed/MemoryFormButtonWrapper.tsx**
Added the missing imports and slot props:

```tsx
import { PhotoUploadButton } from '../src/components/PhotoUploadButton';
import { VideoUploadButton } from '../src/components/VideoUploadButton';

// ... in the form rendering:
<MemoryForm
  // ... other props
  imageUploadFieldImageUploadSlot={
    <PhotoUploadButton 
      baseUrl={baseUrl}
      inputName="photo"
    />
  }
  videoUploadFieldVideoUploadSlot={
    <VideoUploadButton 
      baseUrl={baseUrl}
      inputName="video"
    />
  }
/>
```

### 3. Rebuilt Embed Bundle

```bash
npm run build:embed
```

New bundle size: **1,170.70 kB** (gzipped: 217.41 kB)

## Testing Instructions

### Test in Development

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/ (note: NOT /memory-form/ in dev)

3. Click "Share a Memory" button

4. Test upload buttons:
   - Click photo upload area → file picker opens
   - Select image → shows compression (if > 1MB) → uploads → shows success
   - Click video upload area → file picker opens
   - Select video → uploads → shows success

### Test in Production (Embedded)

1. Deploy the updated bundle to your server:
   - Upload `public/memory-embed.js` to your hosting

2. On your Webflow static page, ensure embed code is:
   ```html
   <div 
     data-memory-button
     data-collection-id="YOUR_COLLECTION_ID"
     data-base-url="https://yourdomain.com/memory-form"
     data-button-text="Share a Memory"
     data-button-variant="Ocean Teal"
   ></div>
   <script src="https://yourdomain.com/memory-form/memory-embed.js"></script>
   ```

3. Test the upload buttons as above

## Key Changes Summary

| File | Change |
|------|--------|
| `src/components/PhotoUploadButton.tsx` | Added Iconoir icon, click handler, proper structure |
| `src/components/VideoUploadButton.tsx` | Added Iconoir icon, click handler, proper structure |
| `embed/MemoryFormButtonWrapper.tsx` | Added upload button imports and slots |
| `public/memory-embed.js` | Rebuilt with upload components included |

## Visual Features

### Upload Button States

1. **Default**: Shows icon with "Photo Uploads" / "Video Uploads" label
2. **Compressing** (photos only): "Compressing image..."
3. **Uploading**: "Uploading..." spinner
4. **Success**: 
   - ✓ Photo/Video uploaded
   - Filename display
   - Remove button
5. **Error**: Red error message

### Icons Used

- **Photo**: `media-image-plus` (picture frame with +)
- **Video**: `media-video-plus` (video frame with play button and +)
- Size: 48x48px
- Color: Uses `currentColor` from Webflow design system

## Troubleshooting

### "Upload buttons don't show"
- Check browser console for errors
- Verify `public/memory-embed.js` is up to date
- Check that `data-base-url` is correct in embed code

### "File picker doesn't open"
- Check for JavaScript errors in console
- Verify the click event isn't being blocked by parent elements
- Try clicking directly on the upload area (not just the icon)

### "Uploads fail"
- Check Network tab for API errors
- Verify R2 bucket is configured: `WEBFLOW_CLOUD_MEDIA` binding
- Check file size limits (1.5MB images, 10MB videos)

## Next Steps

1. **Test thoroughly** in both dev and production
2. **Monitor** upload success rates in production
3. **Adjust** file size limits if needed
4. **Add** more file type support if requested

## Files to Deploy

When deploying to production, make sure to upload:
- `public/memory-embed.js` (required - the embed bundle)
- Any other updated static files

The Astro app itself (src/) doesn't need redeployment unless you're updating the main app (not just the embed).
