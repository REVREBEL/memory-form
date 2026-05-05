# Zero-Configuration Embed Implementation

## 🎯 Problem Solved

**Before:** Users had to manually configure collection ID and base URL:
```html
<div data-memory-button
  data-collection-id="693a599cb78b2b97a36ef963"
  data-base-url="https://your-site.com/memory-form">
</div>
```

**After:** Just works automatically:
```html
<div data-memory-button></div>
<script src="/memory-form/memory-embed.js"></script>
```

---

## 🔧 How It Works

### 1. Collection ID Auto-Detection

The embed searches for the collection ID in this order:

1. **Element attribute**: `data-collection-id="..."`
2. **Script attribute**: `<script data-collection-id="...">`
3. **Meta tag**: `<meta name="memory-form:collection-id" content="...">`
4. **Global variable**: `window.MEMORY_FORM_COLLECTION_ID`
5. **Server injection** (automatic in production)

### 2. Base URL Auto-Detection

The embed automatically determines the base URL from:

1. **Element attribute**: `data-base-url="..."`
2. **Script location**: Extracted from `<script src="...">`
3. **Fallback**: Current origin + `/memory-form`

### 3. Implementation Details

#### File Structure
```
public/
├── memory-embed.js              # Loader script (lightweight)
└── memory-embed-bundle.js       # Full bundle (auto-generated)

src/
├── layouts/main.astro           # Injects meta tag with collection ID
├── pages/
│   ├── index.astro              # Sets window.MEMORY_FORM_COLLECTION_ID
│   └── test-embed.astro         # Demo page with examples

embed/
└── memory-button-wrapper.ts     # Auto-detection logic
```

#### memory-embed.js (Loader)
```javascript
// 1. Get base URL from script location
var baseUrl = getBaseUrlFromScript();

// 2. Check for collection ID on script tag
if (currentScript.hasAttribute('data-collection-id')) {
  window.MEMORY_FORM_COLLECTION_ID = collectionId;
}

// 3. Load the actual bundle
var script = document.createElement('script');
script.src = baseUrl + '/memory-embed-bundle.js';
document.head.appendChild(script);
```

#### memory-button-wrapper.ts (Bundle)
```typescript
// Auto-detect collection ID from multiple sources
function getCollectionId(): string | null {
  // Method 1: Script tag attribute
  const scriptWithId = document.querySelector('script[data-collection-id]');
  if (scriptWithId) return scriptWithId.getAttribute('data-collection-id');
  
  // Method 2: Meta tag
  const metaTag = document.querySelector('meta[name="memory-form:collection-id"]');
  if (metaTag) return metaTag.getAttribute('content');
  
  // Method 3: Window global
  if (window.MEMORY_FORM_COLLECTION_ID) return window.MEMORY_FORM_COLLECTION_ID;
  
  return null;
}

// Initialize all buttons on page
document.querySelectorAll('[data-memory-button]').forEach(element => {
  const collectionId = element.getAttribute('data-collection-id') || getCollectionId();
  mountMemoryFormButtonWrapper(element, { collectionId });
});
```

---

## 📦 Files Changed

### Core Changes

1. **`embed/memory-button-wrapper.ts`**
   - Added `getCollectionId()` function for auto-detection
   - Added `getBaseUrl()` function for script location detection
   - Updated auto-initialization to use global collection ID
   - Added detailed console logging for debugging

2. **`public/memory-embed.js`**
   - Created lightweight loader script
   - Checks for `data-collection-id` on script tag
   - Sets global `window.MEMORY_FORM_COLLECTION_ID`
   - Loads the actual bundle dynamically

3. **`vite.embed.config.ts`**
   - Changed output filename to `memory-embed-bundle.js`
   - Updated entry point to use `memory-button-wrapper.ts`
   - Kept all CSS inlining and optimization

### Server-Side Injection

4. **`src/layouts/main.astro`**
   - Added meta tag injection:
     ```astro
     <meta name="memory-form:collection-id" content={COLLECTION_ID} />
     ```

5. **`src/pages/index.astro`**
   - Added global variable injection:
     ```astro
     <script is:inline define:vars={{ COLLECTION_ID }}>
       window.MEMORY_FORM_COLLECTION_ID = COLLECTION_ID;
     </script>
     ```

### Documentation

6. **`EMBED_USAGE.md`** - Complete embed guide
7. **`QUICK_START.md`** - Fast getting started guide
8. **`ZERO_CONFIG_EMBED.md`** - This document (implementation details)

### Testing

9. **`src/pages/test-embed.astro`**
   - Comprehensive demo page
   - Shows all button variants
   - Includes debug console output
   - Multiple button examples

---

## 🎯 Usage Examples

### Simplest (Auto-Detection)
```html
<div data-memory-button></div>
<script src="/memory-form/memory-embed.js"></script>
```
✅ Collection ID from environment  
✅ Base URL auto-detected  

### Custom Text & Variant
```html
<div data-memory-button
  data-button-text="Share Your Story"
  data-button-variant="Ocean Teal">
</div>
<script src="/memory-form/memory-embed.js"></script>
```

### Override Collection ID
```html
<div data-memory-button
  data-collection-id="custom-collection-id">
</div>
<script src="/memory-form/memory-embed.js"></script>
```

### External Site Embed
```html
<!-- Set collection ID on script tag -->
<script 
  src="https://your-site.com/memory-form/memory-embed.js"
  data-collection-id="693a599cb78b2b97a36ef963">
</script>

<div data-memory-button></div>
```

### Multiple Buttons
```html
<div data-memory-button data-button-variant="Ocean Teal"></div>
<div data-memory-button data-button-variant="Slate Navy"></div>
<div data-memory-button data-button-variant="Rustwood Red"></div>

<!-- Script only once -->
<script src="/memory-form/memory-embed.js"></script>
```

---

## 🔍 Debug Output

The embed provides detailed console output:

### Success:
```
✅ Memory Form: Collection ID from meta tag: 693a599cb78b2b97a36ef963
📦 Memory Form embed loader initialized
   Base URL: https://your-site.com/memory-form
🔧 Initializing Memory Form Button:
  Collection ID: 693a599cb78b2b97a36ef963
  Base URL: https://your-site.com/memory-form
  Button Text: Share a Memory
  Variant: Ocean Teal
```

### Error:
```
❌ Memory Form Error: Collection ID not found for button. Please add one of:
  1. data-collection-id="YOUR_ID" on the [data-memory-button] element
  2. data-collection-id="YOUR_ID" on the <script> tag
  3. <meta name="memory-form:collection-id" content="YOUR_ID"> in <head>
  4. window.MEMORY_FORM_COLLECTION_ID = "YOUR_ID" in a script before embed
```

---

## 🚀 Production Behavior

When deployed to Webflow Cloud:

1. **Environment Variable**: `MEMORY_JOURNAL_COLLECTION_ID` is set in app settings
2. **Server Injection**: Astro automatically injects it into:
   - Meta tag in `<head>`
   - Global `window` variable
3. **Auto-Detection**: Embed finds it automatically
4. **No Configuration**: Users just drop in the script

---

## 🧪 Testing Checklist

- [x] Auto-detection from meta tag
- [x] Auto-detection from window global
- [x] Override via data attribute
- [x] Override via script attribute
- [x] Multiple buttons on one page
- [x] Dynamic content (MutationObserver)
- [x] All button variants work
- [x] Console logging for debugging
- [x] Error messages are clear
- [x] Base URL auto-detection
- [x] External site embedding

---

## 📊 Bundle Analysis

### Before (with manual config):
- Size: Same (436 KB / 135 KB gzipped)
- Config: Required manual setup
- User friction: High

### After (auto-config):
- Size: Same (436 KB / 135 KB gzipped)
- Config: Automatic detection
- User friction: **Zero** ✨

---

## 🎓 Key Learnings

1. **Progressive Enhancement**: Try multiple detection methods in priority order
2. **Developer Experience**: Simplest possible API (just HTML)
3. **Production Ready**: Works identically in dev and prod
4. **Debugging**: Comprehensive console logging
5. **Flexibility**: Can still override when needed

---

## 🔮 Future Enhancements

Potential improvements (not implemented yet):

1. **CDN Caching**: Serve bundle from CDN with long cache
2. **Version Pinning**: Allow specific version in script URL
3. **Custom Events**: Emit events for form lifecycle
4. **Analytics Integration**: Built-in tracking hooks
5. **A/B Testing**: Multiple variant testing support
6. **Lazy Loading**: Only load when button is visible
7. **Preloading**: `<link rel="preload">` hints

---

## 📝 Migration Guide

### From Old Embed:

**Old (manual config):**
```html
<div data-memory-button
  data-collection-id="693a599cb78b2b97a36ef963"
  data-base-url="https://your-site.com/memory-form">
</div>
```

**New (auto-config):**
```html
<div data-memory-button></div>
```

**Still works!** Old attributes still work for backwards compatibility.

---

## ✅ Success Criteria

- [x] Users don't need to know the collection ID
- [x] Works with just two HTML elements
- [x] Automatic in production (Webflow Cloud)
- [x] Clear error messages if misconfigured
- [x] Full backwards compatibility
- [x] Comprehensive documentation
- [x] Test page with examples
- [x] Debug logging for troubleshooting

---

## 🎉 Summary

The Memory Form embed now requires **zero configuration** for most use cases:

```html
<div data-memory-button></div>
<script src="/memory-form/memory-embed.js"></script>
```

Collection ID and base URL are automatically detected from:
- Server environment variables
- Meta tags
- Script location
- Global variables

Users can still override when needed, but 99% of the time, it just works! ✨
