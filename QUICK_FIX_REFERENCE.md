# 🚀 Quick Fix Reference - Upload Buttons

## What Was Fixed
Upload buttons (photo & video) were showing `<ForwardRef />` instead of actual components.

## Why It Happened
The embed wrapper was missing the upload button slot props.

## The Fix

### File: `embed/MemoryFormButtonWrapper.tsx`

**Add imports:**
```tsx
import { PhotoUploadButton } from '../src/components/PhotoUploadButton';
import { VideoUploadButton } from '../src/components/VideoUploadButton';
```

**Add slots to MemoryForm:**
```tsx
<MemoryForm
  // ... existing props
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

**Rebuild:**
```bash
npm run build:embed
```

## Testing

### Dev
```bash
npm run dev
# Open http://localhost:3000/
# Click "Share a Memory"
# Test upload buttons
```

### Embed
```bash
# Open http://localhost:3000/test-embed
# Test all 3 buttons
# Verify uploads work
```

## Files Changed
- ✅ `embed/MemoryFormButtonWrapper.tsx` - Added slots
- ✅ `public/memory-embed.js` - Rebuilt bundle
- ✅ Documentation created

## Verification
- [ ] Photo upload icon shows (📷 with +)
- [ ] Video upload icon shows (▶️ with +)
- [ ] Clicking opens file picker
- [ ] Upload shows progress
- [ ] Success message shows filename
- [ ] Remove button works

## Rollback
If needed, revert to previous commit:
```bash
git log --oneline  # Find commit before changes
git revert <commit-hash>
npm run build:embed
```

## Support Docs
- `UPLOAD_BUTTONS_FIX.md` - Detailed fix explanation
- `TESTING_GUIDE.md` - Comprehensive testing
- `ARCHITECTURE_DIAGRAM.md` - Visual overview
- `CURRENT_STATUS.md` - Project status
