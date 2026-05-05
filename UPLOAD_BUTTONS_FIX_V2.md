# Upload Buttons Fix - Duplicate Content Issue

## Problem
Upload buttons (Photo and Video) were rendering their icons and text 2-3 times, stacking on top of each other in production.

## Root Cause
The upload button components were rendering **complete UI elements** (labels, icons, borders) but the Webflow `MemoryForm` component already has its own default upload UI that renders alongside the slot content. This created duplicate/stacked content:

- Webflow default upload area (label + icon)
- + Our React component (label + icon + functionality)
- = Duplicated/stacked content

## Solution
Simplified the upload button components to **only handle functionality** and status overlays, letting Webflow's existing upload styling serve as the base:

### New Component Structure:
1. **Hidden file input** - handles file selection
2. **Hidden value input** - stores uploaded URL for form submission
3. **Clickable overlay** - positioned absolutely to cover Webflow's upload area
4. **Status overlay** - only shows when there's activity (compressing, uploading, success, error)

### Key Changes:
- ✅ Removed duplicate label/icon rendering from React components
- ✅ Used absolute positioning for overlays
- ✅ Webflow's default upload UI is always visible as the base
- ✅ Status messages appear on top only when needed
- ✅ Click handling works on the entire Webflow upload area

## Files Modified
- `src/components/PhotoUploadButton.tsx` - Simplified to overlay-only approach
- `src/components/VideoUploadButton.tsx` - Simplified to overlay-only approach

## Testing
1. Hard refresh your production site: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Click on the upload areas - should trigger file picker
3. Upload should show status overlay on top of Webflow styling
4. No more duplicate/stacked content

## Technical Details
The Webflow `MemoryForm` component structure:
```jsx
<div className="form_input-upload">
  {/* This is where our slot content goes */}
  {imageUploadFieldImageUploadSlot}
</div>
<div className="form-input_image-upload">
  {/* Webflow's default content (label + icon with is-hidden class) */}
  <label className="input_label is-upload is-hidden">...</label>
  <div className="upload_inner-border">
    {/* Icon HTML */}
  </div>
</div>
```

Our new approach: Only render functional overlays in the slot, let Webflow's base UI show through.
