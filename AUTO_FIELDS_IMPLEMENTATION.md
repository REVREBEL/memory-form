# Auto-Generated Fields Implementation

## Summary

Three CMS fields are now automatically populated when a user submits a memory:

1. **`memory_id`** - Sequential number (1, 2, 3...)
2. **`active`** - Boolean switch (always set to `true` for new items)
3. **`memory-card-size`** - Option field ("1x1", "2x3", or "3x2")

## Implementation Details

### 1. Memory ID (Sequential Number)

**CMS Field:**
- Slug: `memory-id`
- Type: Number (integer, non-negative)
- Required: No

**How it works:**
- When the form is submitted, the API queries all existing items in the collection
- Finds the highest current `memory_id` value
- Adds 1 to generate the next sequential ID
- If no items exist, starts at 1

**Code Location:**
- Function: `getNextMemoryId()` in `src/lib/memory-cms-api.ts`
- Used in: `src/pages/api/memory.ts` (line ~122)

**Example:**
```typescript
// If collection has items with memory_id: 5, 7, 10
// Next ID will be: 11
```

---

### 2. Active Field (Boolean)

**CMS Field:**
- Slug: `active`
- Type: Switch (boolean)
- Required: No

**How it works:**
- Always set to `true` for new memory submissions
- Allows administrators to later toggle memories as inactive without deleting them
- Can be used for filtering/displaying only active memories

**Code Location:**
- Set in: `src/pages/api/memory.ts` (line ~119)

**Example:**
```typescript
formData.set('active', 'true');
```

---

### 3. Memory Card Size (Auto-Determined)

**CMS Field:**
- Slug: `memory-card-size`
- Type: Option
- Values: "1x1", "2x3", "3x2"
- Required: No

**How it works:**
1. When user uploads a photo, dimensions are extracted (e.g., 1920×1080)
2. Dimensions are stored in a hidden form field: `photo_dimensions`
3. On submit, the API calculates the aspect ratio
4. Determines the appropriate card size:
   - **1x1** - Square images (aspect ratio 0.9 - 1.1)
   - **2x3** - Portrait images (aspect ratio < 0.9)
   - **3x2** - Landscape images (aspect ratio > 1.1)

**Code Locations:**
- Dimension extraction: `PhotoUploadButton.tsx` (line ~46)
- Card size logic: `determineCardSize()` in `src/lib/memory-cms-api.ts`
- Applied in: `src/pages/api/memory.ts` (line ~128)

**Example:**
```typescript
// Photo: 1920×1080 (landscape)
// Aspect ratio: 1920/1080 = 1.78
// Result: "3x2"

// Photo: 1080×1920 (portrait)
// Aspect ratio: 1080/1920 = 0.56
// Result: "2x3"

// Photo: 1000×1000 (square)
// Aspect ratio: 1000/1000 = 1.0
// Result: "1x1"
```

**Fallback:**
- If no photo is uploaded: defaults to "1x1"
- If dimensions can't be determined: defaults to "1x1"

---

## File Changes

### New Files Created:
1. `src/pages/api/next-memory-id.ts` - API endpoint to fetch next sequential ID

### Modified Files:
1. `src/lib/memory-cms-api.ts`
   - Added `getNextMemoryId()` function
   - Added `determineCardSize()` function
   - Updated `buildCmsPayload()` to handle new fields

2. `src/pages/api/memory.ts`
   - Auto-generates `memory_id` for new items
   - Sets `active = true` for new items
   - Determines `memory-card-size` from photo dimensions

3. `src/pages/api/upload.ts`
   - Added `getImageDimensions()` function
   - Returns dimensions in API response

4. `src/components/PhotoUploadButton.tsx`
   - Extracts image dimensions before upload
   - Stores dimensions in hidden field `photo_dimensions`
   - Displays dimensions in success message

5. `embed/MemoryFormButtonWrapper.tsx`
   - Removed hidden `collection_id` field logic
   - Now uses `collectionId` prop directly on submit

---

## Testing Checklist

### Test memory_id:
- [ ] Submit first memory - should get `memory_id: 1`
- [ ] Submit second memory - should get `memory_id: 2`
- [ ] Delete a memory (e.g., #2), submit new one - should get next sequential (not reuse #2)

### Test active:
- [ ] Submit a new memory
- [ ] Check CMS - `active` field should be `true`
- [ ] Manually toggle to `false` in CMS
- [ ] Submit another memory - should be `true` again

### Test memory-card-size:
- [ ] Upload square image (e.g., 1000×1000) - should get "1x1"
- [ ] Upload portrait image (e.g., 1080×1920) - should get "2x3"
- [ ] Upload landscape image (e.g., 1920×1080) - should get "3x2"
- [ ] Submit without photo - should default to "1x1"

---

## API Flow Diagram

```
User Form Submission
        ↓
[PhotoUploadButton extracts dimensions]
        ↓
[Form data sent to /api/memory]
        ↓
┌─────────────────────────────────┐
│  API validates form data        │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  For NEW items only:            │
│  1. Generate slug & edit_code   │
│  2. Set active = true           │
│  3. Get next memory_id          │
│  4. Determine card size         │
└─────────────────────────────────┘
        ↓
[Build CMS payload]
        ↓
[Create item in Webflow CMS]
        ↓
[Return success with credentials]
```

---

## Notes

- **No user input required** - All three fields are automatically populated
- **No form changes needed** - All logic is server-side
- **Backward compatible** - Existing memories without these fields will work fine
- **memory_id sequence** - Continues from highest existing value, never reuses deleted IDs
- **Card size logic** - Uses ±10% tolerance for square detection to account for near-square images

---

## Future Enhancements

Possible improvements:
1. Add API endpoint to get next `memory_id` BEFORE form submission (pre-populate field)
2. Allow manual override of `memory-card-size` via optional form field
3. Add validation to prevent duplicate `memory_id` values (race condition handling)
4. Cache highest `memory_id` to reduce API calls
