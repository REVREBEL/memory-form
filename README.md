# Memory Form Application

A Webflow Cloud application that enables users to share and preserve their precious memories through an intuitive form interface, with seamless integration to Webflow CMS.

![Memory Form](https://img.shields.io/badge/Webflow-Cloud-4353FF?style=for-the-badge&logo=webflow)
![Built with Astro](https://img.shields.io/badge/Astro-5.0-FF5D01?style=for-the-badge&logo=astro)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)

---

## 🌟 Features

- **📝 Interactive Form**: Beautiful modal form for capturing memories
- **🎨 Webflow Design System**: Uses native Webflow components and styles
- **💾 CMS Integration**: Automatic storage in Webflow CMS
- **🏷️ Smart Tagging**: Organize memories with up to 3 custom tags
- **📸 Media Support**: Upload photos and link to videos
- **📍 Location Tracking**: Capture where memories took place
- **📅 Date Handling**: Automatic date formatting and validation
- **🔄 Create & Update**: Support for both new entries and updates
- **✨ Auto-Slugification**: Automatic URL-safe slug generation
- **✅ Validation**: Client and server-side validation
- **🌙 Dark Mode**: Full dark mode support via Webflow variables
- **📱 Responsive**: Works perfectly on all device sizes

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Webflow account with CMS access
- Webflow API token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memory-form
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create a `.env` file:
   ```env
   WEBFLOW_CMS_SITE_API_TOKEN=your_token_here
   ```

4. **Set Collection ID**
   
   Edit `src/pages/index.astro`:
   ```typescript
   const COLLECTION_ID = 'your_collection_id_here';
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:4321
   ```

---

## 📚 Documentation

- **[Setup Guide](docs/setup-guide.md)** - Complete setup instructions
- **[API Examples](docs/api-examples.md)** - Request/response examples
- **[Master Guide](MASTER_GUIDE.md)** - Comprehensive technical documentation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         User Interface              │
│  (Webflow Devlink Components)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     MemoryFormWrapper.tsx           │
│  • Modal state management           │
│  • Form submission logic            │
│  • Success/error handling           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      API Route (/api/memory)        │
│  • Form validation                  │
│  • Data transformation              │
│  • Slug generation                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Webflow CMS API Client          │
│  • Create/update operations         │
│  • Error handling                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Webflow CMS                   │
│  • Data persistence                 │
│  • Content management               │
└─────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
memory-form/
├── docs/
│   ├── setup-guide.md          # Setup instructions
│   └── api-examples.md         # API documentation
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn UI components
│   │   └── MemoryFormWrapper.tsx  # Main wrapper component
│   ├── lib/
│   │   ├── base-url.ts         # Base URL configuration
│   │   ├── memory-form-types.ts   # TypeScript types
│   │   ├── memory-form-utils.ts   # Utility functions
│   │   └── memory-cms-api.ts   # CMS API client
│   ├── pages/
│   │   ├── api/
│   │   │   └── memory.ts       # API endpoint
│   │   └── index.astro         # Home page
│   ├── site-components/        # Webflow Devlink components
│   │   ├── DevLinkProvider.jsx
│   │   ├── MemoryFormButton.jsx
│   │   ├── MemoryForm.jsx
│   │   └── global.css
│   └── styles/
│       └── global.css          # Global styles
├── .env                        # Environment variables (create this)
├── MASTER_GUIDE.md             # Technical documentation
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

```env
# Required: Your Webflow site API token
WEBFLOW_CMS_SITE_API_TOKEN=your_token_here

# Optional: Custom API host (for development)
WEBFLOW_API_HOST=https://api.webflow.com
```

### Collection ID

Set in `src/pages/index.astro`:

```typescript
const COLLECTION_ID = '507f1f77bcf86cd799439011'; // Your collection ID
const LOCALE_ID = undefined; // Optional locale ID
```

### CMS Collection Schema

Your Webflow CMS collection must have these fields:

**System Fields** (built-in):
- `name` (Plain Text)
- `slug` (Plain Text)

**Custom Fields** (must be created):
- `first-name` (Plain Text)
- `last-name` (Plain Text)
- `email` (Email)
- `memory` (Long Text)
- `memory-date` (Date/Time)
- `location` (Plain Text)
- `tag-1`, `tag-2`, `tag-3` (Plain Text)
- `photo` (Image)
- `video` (Video)
- `video-link` (Plain Text)
- `content-link` (Plain Text)

⚠️ **Field slugs must match exactly** as shown above.

---

## 🎨 Customization

### Button Text & Variant

```tsx
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  buttonText="Share Your Story"
  buttonVariant="Slate Navy"
/>
```

### Available Button Variants

- `Warm Sandston`
- `Warm Sandston Outline`
- `Slate Navy` 
- `Slate Navy Outline`
- `Ocean Teal` (default)
- `Ocean Teal Outline`
- `Rustwood Red`
- `Rustwood Outline`

### Callbacks

```tsx
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  onSuccess={(item) => {
    console.log('Memory created:', item.id);
    // Your custom logic
  }}
  onError={(error) => {
    console.error('Error:', error.message);
    // Your custom error handling
  }}
/>
```

---

## 📡 API Reference

### POST `/api/memory`

Creates or updates a memory item.

**Request** (FormData):
```
collection-id: string (required)
name: string (required)
email: string (required)
memory: string (required)
memory-date: string (required)
item-id: string (optional, for updates)
[...other fields]
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Memory created successfully",
  "data": {
    "id": "...",
    "fieldData": { ... },
    "createdOn": "...",
    "lastUpdated": "..."
  }
}
```

**Error Response** (400/500):
```json
{
  "success": false,
  "errors": ["Error message 1", "Error message 2"]
}
```

See [API Examples](docs/api-examples.md) for detailed documentation.

---

## 🧪 Testing

### Local Testing

1. Start dev server: `npm run dev`
2. Open `http://localhost:4321`
3. Click "Share a Memory"
4. Fill out form and submit
5. Check Webflow CMS for new item

### Testing Checklist

- [ ] Modal opens/closes correctly
- [ ] Form validation works
- [ ] Success message displays
- [ ] Error handling works
- [ ] Item appears in CMS
- [ ] Slug auto-generation works
- [ ] Date formatting correct
- [ ] URL validation works

---

## 🚢 Deployment

### Build

```bash
npm run build
```

### Deploy to Webflow Cloud

1. Set environment variables in Webflow Cloud dashboard
2. Deploy through Webflow Cloud interface
3. Verify production environment

### Environment Variables (Production)

Set in Webflow Cloud:
- `WEBFLOW_CMS_SITE_API_TOKEN`

---

## 🐛 Troubleshooting

### "Missing WEBFLOW_CMS_SITE_API_TOKEN"
- Check `.env` file exists
- Verify variable name is correct
- Restart dev server

### "Failed to create memory item"
- Verify API token has CMS write permissions
- Check collection ID is correct
- Ensure all required fields exist in CMS
- Verify field slugs match exactly

### Form submission hangs
- Check browser console for errors
- Verify API endpoint is accessible
- Check network tab for failed requests

See [Setup Guide](docs/setup-guide.md) for more troubleshooting.

---

## 📝 Form Fields Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | String | Yes | Display name (auto-generated if not provided) |
| Email | Email | Yes | Validated email format |
| Memory | Text | Yes | The memory story/description |
| Memory Date | Date | Yes | When it happened |
| First Name | String | No | Person's first name |
| Last Name | String | No | Person's last name |
| Location | String | No | Where it happened |
| Tag 1-3 | String | No | Categorization tags |
| Photo | Image | No | Photo upload |
| Video | Video | No | Video upload |
| Video Link | URL | No | External video link |
| Content Link | URL | No | External content link |

---

## 🛡️ Security

- ✅ API tokens stored in environment variables only
- ✅ Server-side validation and sanitization
- ✅ CMS API only accessed from server routes
- ✅ No sensitive data exposed to client
- ✅ CORS protection via Astro middleware
- ✅ Input validation (XSS prevention)

---

## 🔄 Updates & Maintenance

### Updating CMS Schema

1. Update Webflow CMS collection
2. Update `src/lib/memory-form-types.ts`
3. Update field mappings in `src/lib/memory-cms-api.ts`
4. Update validation in `src/lib/memory-form-utils.ts`
5. Test thoroughly

### Updating Devlink Components

1. Re-sync from Webflow Designer
2. Components auto-regenerate
3. Check for breaking changes
4. Update wrapper component if needed

---

## 📜 License

This project is part of the Webflow Cloud ecosystem.

---

## 🤝 Contributing

This is a Webflow Cloud application. Follow the Webflow Cloud development guidelines.

---

## 📞 Support

- **Documentation**: See [MASTER_GUIDE.md](MASTER_GUIDE.md)
- **API Reference**: See [API Examples](docs/api-examples.md)
- **Setup Help**: See [Setup Guide](docs/setup-guide.md)
- **Webflow**: https://developers.webflow.com

---

## 🎯 Key Features in Detail

### Auto-Slugification
Automatically generates URL-safe slugs from memory names:
- Converts to lowercase
- Replaces spaces with hyphens
- Removes special characters

### Smart Validation
- Client-side validation for instant feedback
- Server-side validation for security
- Email format checking
- Date format validation
- URL format validation

### Create & Update
- Leave `item-id` empty to create new memories
- Provide `item-id` to update existing memories
- Automatic detection of create vs update mode

### Error Handling
- User-friendly error messages
- Detailed console logging for debugging
- Graceful failure handling
- Network error recovery

---

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## ⚡ Performance

- Server-side rendering with Astro
- Minimal client JavaScript
- Optimized for Cloudflare Workers
- Fast CMS API integration

---

**Built with ❤️ for Webflow Cloud**

*Last Updated: 2024*
