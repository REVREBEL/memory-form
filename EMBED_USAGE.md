# Memory Form Embed - Zero Configuration! 🎉

The Memory Form embed **automatically detects** your collection ID and base URL. No manual configuration needed!

---

## 🚀 Quick Start

Add just **two lines** to your HTML:

```html
<!-- Add where you want the button -->
<div data-memory-button></div>

<!-- Add the script once -->
<script src="/memory-form/memory-embed.js"></script>
```

**That's it!** The collection ID is automatically detected from your environment. ✨

---

## 🎨 Customize the Button (Optional)

Control the button text and appearance with data attributes:

```html
<div data-memory-button
  data-button-text="Share Your Story"
  data-button-variant="Ocean Teal">
</div>
```

### Available Button Variants

**Solid Colors:**
- `"Ocean Teal"` (default, teal background)
- `"Slate Navy"` (navy blue background)
- `"Warm Sandston"` (warm beige background)
- `"Rustwood Red"` (rust red background)

**Outline Styles:**
- `"Ocean Teal Outline"` (teal border, transparent background)
- `"Slate Navy Outline"` (navy border, transparent background)
- `"Warm Sandston Outline"` (beige border, transparent background)
- `"Rustwood Outline"` (rust border, transparent background)

---

## 📍 Multiple Buttons

Add as many buttons as you want on one page - only include the script **once**:

```html
<!-- Hero section -->
<div data-memory-button 
  data-button-text="Share a Memory"
  data-button-variant="Ocean Teal">
</div>

<!-- About section -->
<div data-memory-button 
  data-button-text="Tell Your Story"
  data-button-variant="Slate Navy">
</div>

<!-- Footer -->
<div data-memory-button 
  data-button-text="Get Started"
  data-button-variant="Warm Sandston Outline">
</div>

<!-- Script only once -->
<script src="/memory-form/memory-embed.js"></script>
```

---

## 🔧 How Auto-Detection Works

The embed finds your collection ID automatically in this priority order:

### Collection ID Detection:
1. ✅ `data-collection-id` attribute on the button element
2. ✅ `<meta name="memory-form:collection-id" content="...">` in `<head>`
3. ✅ `window.MEMORY_FORM_COLLECTION_ID` global variable
4. ✅ **Server environment variable** (automatic in Webflow Cloud)

### Base URL Detection:
1. ✅ `data-base-url` attribute on the button element
2. ✅ Auto-detected from the script's location
3. ✅ Fallback: current origin + `/memory-form`

---

## 🧪 Test Your Embed

Visit `/memory-form/test-embed` to see all button variants and test the embed:

```
http://localhost:3000/memory-form/test-embed
```

Or in production:
```
https://your-site.com/memory-form/test-embed
```

---

## 🔐 Advanced: Override Collection ID

If you need to use a different collection for a specific button:

```html
<div data-memory-button 
  data-collection-id="YOUR_CUSTOM_COLLECTION_ID"
  data-button-text="Custom Form">
</div>
```

---

## 🌍 Advanced: External Website Embed

Embedding on a site that's NOT hosted on Webflow Cloud:

```html
<!-- Set the base URL to your Webflow app -->
<div data-memory-button 
  data-base-url="https://your-domain.com/memory-form"
  data-button-text="Share a Memory">
</div>

<!-- Load from your Webflow app URL -->
<script src="https://your-domain.com/memory-form/memory-embed.js"></script>
```

Or set a global variable:

```html
<script>
  // Set collection ID globally for all buttons
  window.MEMORY_FORM_COLLECTION_ID = 'YOUR_COLLECTION_ID';
</script>

<div data-memory-button></div>
<script src="https://your-domain.com/memory-form/memory-embed.js"></script>
```

---

## 🐛 Troubleshooting

### Button Doesn't Appear

**Check the console** (F12 in browser):

```javascript
// Should see these messages:
✅ Memory Form: Collection ID from meta tag: 693a599cb78b2b97a36ef963
📦 Memory Form embed loader initialized
🔧 Initializing Memory Form Button
```

**If you see an error:**
```javascript
❌ Collection ID not found
```

**Solutions:**
1. Check that `MEMORY_JOURNAL_COLLECTION_ID` is set in your `.env` file
2. Add a meta tag manually:
   ```html
   <meta name="memory-form:collection-id" content="YOUR_COLLECTION_ID">
   ```
3. Set it as a global variable:
   ```html
   <script>
     window.MEMORY_FORM_COLLECTION_ID = 'YOUR_COLLECTION_ID';
   </script>
   ```

### Form Doesn't Submit

**Check the network tab** (F12 → Network):
- Look for POST to `/memory-form/api/memory`
- Check the response for error messages
- Verify R2 bucket is configured: `WEBFLOW_CLOUD_MEDIA` binding

### Wrong Collection

**Override on the button:**
```html
<div data-memory-button 
  data-collection-id="693a599cb78b2b97a36ef963">
</div>
```

---

## 📦 Bundle Info

- **Size**: 436 KB (135 KB gzipped)
- **Includes**: React, React DOM, all UI components, styles
- **Load Time**: ~200-500ms on fast connections
- **Async**: Won't block page rendering

---

## 🌐 Browser Support

✅ Chrome, Firefox, Safari, Edge (last 2 versions)  
✅ iOS Safari, Chrome Mobile  
✅ Works with Webflow interactions  
✅ Dynamic content compatible (MutationObserver)

---

## 💡 Pro Tips

### Lazy Loading
Only load the script when needed:

```html
<button onclick="loadMemoryForm()">Load Memory Form</button>

<script>
function loadMemoryForm() {
  var script = document.createElement('script');
  script.src = '/memory-form/memory-embed.js';
  document.head.appendChild(script);
  
  // Replace button with actual form button
  var container = document.getElementById('form-container');
  container.innerHTML = '<div data-memory-button></div>';
}
</script>
```

### Custom Events
Listen for form submission:

```javascript
window.addEventListener('memory-form:success', (event) => {
  console.log('Memory saved!', event.detail);
  // Track in analytics, show thank you message, etc.
});

window.addEventListener('memory-form:error', (event) => {
  console.error('Error saving memory:', event.detail);
});
```

### Programmatic Mount
Create buttons dynamically:

```javascript
// Wait for embed to load
window.addEventListener('load', () => {
  const container = document.getElementById('dynamic-button');
  
  window.mountMemoryFormButtonWrapper(container, {
    buttonText: 'Custom Button',
    buttonVariant: 'Ocean Teal'
  });
});
```

---

## 📚 Example Integrations

### WordPress
```html
<!-- In your theme template -->
<div data-memory-button 
  data-button-text="Share Your Memory">
</div>

<?php wp_footer(); ?>
<script src="https://your-site.com/memory-form/memory-embed.js"></script>
```

### Squarespace
```html
<!-- In a Code Block -->
<div data-memory-button 
  data-button-text="Add to Memory Wall">
</div>

<script src="https://your-site.com/memory-form/memory-embed.js"></script>
```

### Webflow (Not Webflow Cloud)
```html
<!-- In Page Settings → Custom Code → Before </body> -->
<div data-memory-button 
  data-button-text="Submit Memory"
  data-base-url="https://your-cloud-app.com/memory-form">
</div>

<script src="https://your-cloud-app.com/memory-form/memory-embed.js"></script>
```

---

## 🚀 Production Deployment

When deployed to Webflow Cloud:
- ✅ Collection ID is **automatically** injected from environment
- ✅ Base URL is **automatically** detected from script location
- ✅ No code changes needed between dev and production!

**Just make sure** `MEMORY_JOURNAL_COLLECTION_ID` is set in your Webflow Cloud app settings.

---

## 📞 Need Help?

1. Check the test page: `/memory-form/test-embed`
2. Open browser console (F12) for debug info
3. Verify environment variables are set
4. Check the [main documentation](./MASTER_GUIDE.md)

---

Made with ❤️ for Webflow Cloud
