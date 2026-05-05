# Memory Form - Quick Start Guide

## ⚡ Fastest Way to Get Started

### For Developers (React Component)

```tsx
import { MemoryFormWrapper } from './components/MemoryFormWrapper';

<MemoryFormWrapper
  client:only="react"
  collectionId={import.meta.env.MEMORY_JOURNAL_COLLECTION_ID}
  baseUrl="/memory-form"
  buttonText="Share a Memory"
  buttonVariant="Ocean Teal"
/>
```

### For End Users (Embed)

```html
<!-- Just add these two lines! -->
<div data-memory-button></div>
<script src="/memory-form/memory-embed.js"></script>
```

**That's it!** Collection ID is auto-detected. ✨

---

## 🎨 Customize the Button

```html
<div data-memory-button
  data-button-text="Your Custom Text"
  data-button-variant="Ocean Teal">
</div>
```

**Available Variants:**
- `Ocean Teal` • `Slate Navy` • `Warm Sandston` • `Rustwood Red`
- Add `Outline` for outline versions: `Ocean Teal Outline`

---

## 🚀 Test It

Visit: `/memory-form/test-embed`

See all button variants and test the form!

---

## 🔧 Required Environment Variables

```bash
# .env file
MEMORY_JOURNAL_COLLECTION_ID=your_collection_id_here
WEBFLOW_CMS_SITE_API_TOKEN=your_api_token_here
```

Plus R2 bucket binding: `WEBFLOW_CLOUD_MEDIA`

---

## 📚 Full Documentation

- **Setup**: `docs/setup-guide.md`
- **API Reference**: `docs/api-examples.md`
- **Embed Guide**: `EMBED_USAGE.md`
- **Complete Guide**: `MASTER_GUIDE.md`

---

## ⚠️ Troubleshooting

**Button doesn't appear?**
- Check console (F12) for errors
- Verify `MEMORY_JOURNAL_COLLECTION_ID` is set
- Try adding collection ID manually:
  ```html
  <meta name="memory-form:collection-id" content="YOUR_ID">
  ```

**Form doesn't submit?**
- Check R2 bucket is configured
- Verify API token has write permissions
- Check network tab for error details

---

## 🎯 Key Features

✅ Photo & video uploads (compressed automatically)  
✅ Character counter (5000 char limit)  
✅ Auto-generated slugs  
✅ 3-factor edit authentication  
✅ Dark mode support  
✅ Responsive design  
✅ Zero configuration embed  

---

**Need more help?** Check the full docs or open the test page!
