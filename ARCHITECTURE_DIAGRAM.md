# Memory Form Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Entry Points                              │
├─────────────────────────────────────────────────────────────┤
│  1. Main App (index.astro)                                  │
│     - Uses: MemoryFormWrapper                               │
│     - Build: Astro SSR → Cloudflare Workers                │
│                                                              │
│  2. Embed (memory-embed.js)                                 │
│     - Uses: MemoryFormButtonWrapper                         │
│     - Build: Vite → Standalone JS bundle                    │
│     - Auto-initializes via data-memory-button               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Components                            │
├─────────────────────────────────────────────────────────────┤
│  MemoryFormWrapper / MemoryFormButtonWrapper                │
│  ├── DevLinkProvider (Webflow context)                      │
│  │   └── MemoryFormButton (Webflow component)              │
│  │       └── Triggers modal on click                        │
│  │                                                           │
│  └── Modal/Dialog                                           │
│      └── MemoryForm (Webflow component)                     │
│          ├── Text inputs (name, email, etc.)                │
│          ├── Textarea (memory detail)                       │
│          ├── Date input                                     │
│          ├── Tag inputs                                     │
│          │                                                   │
│          ├── imageUploadFieldImageUploadSlot               │
│          │   └── PhotoUploadButton ✨ NEW                   │
│          │       ├── Iconoir icon (media-image-plus)        │
│          │       ├── File input (hidden)                    │
│          │       ├── Click handler                          │
│          │       └── Upload to /api/upload                  │
│          │                                                   │
│          └── videoUploadFieldVideoUploadSlot               │
│              └── VideoUploadButton ✨ NEW                   │
│                  ├── Iconoir icon (media-video-plus)        │
│                  ├── File input (hidden)                    │
│                  ├── Click handler                          │
│                  └── Upload to /api/upload                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Endpoints                             │
├─────────────────────────────────────────────────────────────┤
│  /api/upload (POST)                                         │
│  ├── Validates file type & size                             │
│  ├── Uploads to Cloudflare R2                               │
│  │   └── Binding: WEBFLOW_CLOUD_MEDIA                       │
│  └── Returns: { url, filename }                             │
│                                                              │
│  /api/memory (POST)                                         │
│  ├── Validates required fields                              │
│  ├── Generates slug from name                               │
│  ├── Parses date (multiple formats)                         │
│  ├── Calls Webflow Data API                                 │
│  │   └── Creates/updates CMS item                           │
│  └── Returns: { success, data }                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                            │
├─────────────────────────────────────────────────────────────┤
│  Cloudflare R2                                              │
│  └── Stores uploaded photos & videos                        │
│                                                              │
│  Webflow CMS                                                │
│  └── Stores memory items                                    │
└─────────────────────────────────────────────────────────────┘
```

## Upload Button Data Flow

```
User clicks upload area
         │
         ▼
PhotoUploadButton.onClick()
         │
         ├─> Opens file picker
         │
         ▼
User selects file
         │
         ▼
PhotoUploadButton.handleFileChange()
         │
         ├─> Check file size
         │
         ├─> If > 1MB: Compress image
         │   └─> browser-image-compression
         │       └─> Target: ~1MB
         │
         ▼
Upload to API
         │
         ├─> POST /api/upload
         │   └─> FormData with file
         │
         ▼
API validates & uploads
         │
         ├─> Check file type
         ├─> Check size (max 1.5MB)
         ├─> Generate unique filename
         │
         ▼
Upload to R2
         │
         ├─> PUT to Cloudflare R2
         ├─> Bucket: WEBFLOW_CLOUD_MEDIA
         │
         ▼
Return URL
         │
         ├─> { success: true, url, filename }
         │
         ▼
Update UI
         │
         ├─> Show success message
         ├─> Display filename
         ├─> Add hidden input with URL
         └─> Show remove button
```

## The Fix (Before vs After)

### ❌ BEFORE (Broken)
```tsx
// embed/MemoryFormButtonWrapper.tsx
<MemoryForm
  submitButtonText="Submit Memory"
  // ... other props
  // ❌ Missing upload slots!
/>
```

**Result**: 
- Webflow form tried to render slots
- But received `undefined`
- React showed `<ForwardRef />` placeholder
- No icons, no click handlers

### ✅ AFTER (Fixed)
```tsx
// embed/MemoryFormButtonWrapper.tsx
import { PhotoUploadButton } from '../src/components/PhotoUploadButton';
import { VideoUploadButton } from '../src/components/VideoUploadButton';

<MemoryForm
  submitButtonText="Submit Memory"
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

**Result**:
- Proper React components render
- Icons show (Iconoir)
- Click handlers work
- File uploads succeed

## Embed System Overview

```
Static Webflow Page
         │
         ├─> <div data-memory-button 
         │        data-collection-id="..."
         │        data-base-url="..."
         │        data-button-text="..."
         │        data-button-variant="..." />
         │
         ├─> <script src="/memory-embed.js"></script>
         │
         ▼
Auto-initialization
         │
         ├─> memory-button-wrapper.ts
         │   └─> Finds all [data-memory-button]
         │   └─> Reads data attributes
         │   └─> Calls mountMemoryFormButtonWrapper()
         │
         ▼
React renders
         │
         ├─> MemoryFormButtonWrapper
         │   ├─> Button (from data-button-text)
         │   └─> Modal with form
         │       └─> Upload buttons (NOW WORKING! ✨)
         │
         ▼
User submits form
         │
         ├─> POST to data-base-url/api/memory
         │   └─> With collection_id from data attribute
         │
         ▼
Success!
```

## File Size Breakdown

```
memory-embed.js (1,170 KB uncompressed)
├─── React (200 KB)
├─── React DOM (250 KB)
├─── Webflow Components (300 KB)
│    ├─── MemoryForm
│    ├─── MemoryFormButton
│    └─── DevLinkProvider
├─── Upload Components (50 KB) ✨ NEW
│    ├─── PhotoUploadButton
│    ├─── VideoUploadButton
│    └─── browser-image-compression
├─── Iconoir Icons (20 KB)
└─── Other (350 KB)

Gzipped: 217 KB ✨ (Good!)
```

## Key Design Decisions

1. **Separate Builds**
   - Main app: Astro SSR → Cloudflare Workers
   - Embed: Vite → Standalone bundle
   - Why: Embed needs to work on any static page

2. **Slot-based Architecture**
   - Webflow components use slots for custom content
   - Upload buttons injected as React elements
   - Allows full React functionality within Webflow components

3. **Auto-initialization**
   - Use data attributes for configuration
   - MutationObserver for dynamic content
   - No manual JavaScript required

4. **Compression Strategy**
   - Client-side compression (browser-image-compression)
   - Target ~1MB for images
   - Server enforces hard limits (1.5MB)
   - Keeps R2 storage costs low

5. **Design System**
   - Pure Webflow CSS variables
   - No Tailwind in embed
   - Iconoir for consistent icons
   - Follows Webflow brand guidelines
