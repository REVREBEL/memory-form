# Memory Form - Quick Reference

A cheat sheet for common tasks and configurations.

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Environment Setup

```env
# .env file (create in project root)
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here
WEBFLOW_API_HOST=https://api.webflow.com
```

---

## 📦 Configuration Locations

| What | Where | Line |
|------|-------|------|
| Collection ID | `src/pages/index.astro` | ~5 |
| Button text | Component props | - |
| Button variant | Component props | - |
| API endpoint | `src/pages/api/memory.ts` | - |
| Types | `src/lib/memory-form-types.ts` | - |
| Utils | `src/lib/memory-form-utils.ts` | - |
| CMS client | `src/lib/memory-cms-api.ts` | - |

---

## 🎨 Button Variants

```tsx
<MemoryFormWrapper
  buttonVariant="Ocean Teal"  // or:
  // "Warm Sandston"
  // "Warm Sandston Outline"
  // "Slate Navy"
  // "Slate Navy Outline"
  // "Ocean Teal Outline"
  // "Rustwood Red"
  // "Rustwood Outline"
/>
```

---

## 📝 Component Usage

### Basic Usage
```tsx
import { MemoryFormWrapper } from '../components/MemoryFormWrapper';

<MemoryFormWrapper
  client:only="react"
  collectionId="507f1f77bcf86cd799439011"
  buttonText="Share a Memory"
  buttonVariant="Ocean Teal"
/>
```

### With Callbacks
```tsx
<MemoryFormWrapper
  client:only="react"
  collectionId="507f1f77bcf86cd799439011"
  onSuccess={(item) => console.log('Created:', item.id)}
  onError={(error) => console.error('Error:', error)}
/>
```

---

## 🗃️ Required CMS Fields

### System Fields (built-in)
- `name` - Plain Text
- `slug` - Plain Text

### Custom Fields (must create)
```
first-name      → Plain Text
last-name       → Plain Text
email           → Email
memory          → Long Text
memory-date     → Date/Time
location        → Plain Text
tag-1           → Plain Text
tag-2           → Plain Text
tag-3           → Plain Text
photo           → Image
video           → Video
video-link      → Plain Text
content-link    → Plain Text
```

⚠️ **Slugs must match exactly!**

---

## 🔗 API Endpoint

### POST `/api/memory`

**Required Fields:**
- `collection-id`
- `name`
- `email`
- `memory`
- `memory-date`

**Optional Fields:**
- `item-id` (for updates)
- `slug` (auto-generated if empty)
- All other custom fields

**Response:**
```json
{
  "success": true,
  "message": "Memory created successfully",
  "data": { ... }
}
```

---

## 🛠️ Common Tasks

### Change Button Text
```tsx
<MemoryFormWrapper
  buttonText="Add Your Memory"
/>
```

### Change Button Color
```tsx
<MemoryFormWrapper
  buttonVariant="Slate Navy"
/>
```

### Use Multiple Buttons
```tsx
{/* Header button */}
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  buttonText="Share"
  buttonVariant="Ocean Teal Outline"
/>

{/* Hero button */}
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  buttonText="Get Started"
  buttonVariant="Slate Navy"
/>
```

### Add Success Callback
```tsx
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  onSuccess={(item) => {
    // Redirect to memory page
    window.location.href = `/memories/${item.fieldData.slug}`;
  }}
/>
```

### Handle Errors
```tsx
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  onError={(error) => {
    // Send to error tracking
    trackError(error);
    // Show notification
    showToast(error.message);
  }}
/>
```

---

## 🎯 Field ID Mapping

| Form Field | Field ID | CMS Field |
|------------|----------|-----------|
| First Name | `first-name` | `first-name` |
| Last Name | `last-name` | `last-name` |
| Email | `email` | `email` |
| Memory | `memory` | `memory` |
| Date | `memory-date` | `memory-date` |
| Location | `location` | `location` |
| Tag 1 | `tag-1` | `tag-1` |
| Tag 2 | `tag-2` | `tag-2` |
| Tag 3 | `tag-3` | `tag-3` |
| Content Link | `content-link` | `content-link` |

---

## 🔍 Debugging

### Check API Token
```bash
# In dev tools console
console.log(import.meta.env.WEBFLOW_CMS_SITE_API_TOKEN)
```

### Test API Endpoint
```bash
curl -X POST http://localhost:4321/api/memory \
  -F "collection-id=YOUR_ID" \
  -F "name=Test" \
  -F "email=test@example.com" \
  -F "memory=Test memory" \
  -F "memory-date=2024-01-15"
```

### Enable Debug Logging
Add to `src/lib/memory-cms-api.ts`:
```typescript
console.log('Creating item with payload:', payload);
```

---

## 📊 Validation Rules

| Field | Rule |
|-------|------|
| Name | Required, not empty |
| Email | Required, valid email format |
| Memory | Required, not empty |
| Date | Required, valid date |
| Video Link | Optional, must be valid URL if provided |
| Content Link | Optional, must be valid URL if provided |

---

## 🎨 CSS Variables

### Colors
```css
var(--background)
var(--foreground)
var(--primary)
var(--secondary)
var(--muted)
var(--accent)
var(--destructive)
var(--border)
```

### Fonts
```css
var(--body-font)
var(--heading-font)
var(--button-font)
```

### Usage
```css
.my-element {
  color: var(--foreground);
  background: var(--background);
  font-family: var(--body-font);
}
```

⚠️ **Never hardcode colors or fonts!**

---

## 🔐 Security Checklist

- [ ] API token in `.env` only
- [ ] `.env` in `.gitignore`
- [ ] No tokens in client code
- [ ] CMS API only on server
- [ ] Form validation enabled
- [ ] Error messages don't leak data

---

## 🚨 Common Errors

### "Missing token"
→ Check `.env` file exists and has correct variable name

### "Collection ID required"
→ Set `COLLECTION_ID` in `index.astro`

### "Failed to create item"
→ Verify field slugs match CMS exactly

### "Invalid email"
→ Email must be valid format (user@domain.com)

### "Network error"
→ Check dev server is running and API is accessible

---

## 📁 File Locations

```
Key Files:
├── src/pages/index.astro              # Home page
├── src/components/MemoryFormWrapper.tsx # Main component
├── src/pages/api/memory.ts            # API endpoint
├── src/lib/memory-form-types.ts       # Types
├── src/lib/memory-form-utils.ts       # Utils
├── src/lib/memory-cms-api.ts          # CMS client
└── .env                                # Config (create this)

Documentation:
├── README.md                           # Overview
├── MASTER_GUIDE.md                     # Full docs
├── docs/setup-guide.md                 # Setup
└── docs/api-examples.md                # API docs
```

---

## 🎓 Learning Resources

- [Webflow CMS API](https://developers.webflow.com/data/reference)
- [Astro Docs](https://docs.astro.build)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 💡 Tips & Tricks

### Auto-format dates
The API automatically converts dates to ISO 8601:
```
"2024-01-15" → "2024-01-15T00:00:00.000Z"
```

### Auto-generate slugs
Leave slug empty to auto-generate from name:
```
"My Memory" → "my-memory"
"NEW YEAR!" → "new-year"
```

### Update existing items
Include `item-id` in form data:
```html
<input type="hidden" name="item-id" value="66a123..." />
```

### Multiple instances
You can use multiple `MemoryFormWrapper` components on the same page with different props.

### Custom styling
Wrap in a div with custom classes:
```tsx
<div className="custom-wrapper">
  <MemoryFormWrapper {...props} />
</div>
```

---

## 🔄 Quick Workflows

### Add New Field to Form

1. Add field to CMS collection (e.g., `category`)
2. Update types:
   ```typescript
   // src/lib/memory-form-types.ts
   interface MemoryFormValues {
     // ...
     category?: string;
   }
   ```
3. Update CMS payload builder:
   ```typescript
   // src/lib/memory-cms-api.ts
   category: formData.get('category') as string || undefined
   ```
4. Add input to form component
5. Test create/update

### Change Required Fields

Edit validation:
```typescript
// src/lib/memory-form-utils.ts
if (!location || location.trim() === '') {
  errors.push('Location is required');
}
```

### Add Custom Validation

```typescript
// src/lib/memory-form-utils.ts
export function validateMemoryForm(formData: FormData) {
  const errors: string[] = [];
  
  // Your custom validation
  const memory = formData.get('memory') as string;
  if (memory.length < 50) {
    errors.push('Memory must be at least 50 characters');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

**Keep this handy! 📌**

*Memory Form Quick Reference v1.0*
