# Memory Form Button Embed

This directory contains the source code for the embeddable Memory Form Button component that uses your Webflow-designed components.

## Building

To build the standalone embed bundle:

```bash
npm run build:embed
```

This creates `public/memory-embed.js` which can be embedded on any webpage.

## Files

- **index.tsx** - Entry point that exports the mount function
- **memory-button-wrapper.ts** - Auto-initialization wrapper with MutationObserver
- **MemoryFormButtonWrapper.tsx** - Main React component that handles the Webflow form
- **embed-styles.css** - Minimal styles for Webflow components (DevLink + CSS variables)

## Architecture

The embed system is optimized for minimal bundle size:

- ✅ **Includes**: React 19, Webflow components (DevLink), CSS variables, form handling
- ❌ **Excludes**: Tailwind, Radix UI, shadcn (not needed for Webflow components)

**Current bundle size**: ~125 KB gzipped

## Usage

### Option 1: Auto-Initialize (Recommended)

Add the script tag and use data attributes:

```html
<!-- Add the embed script -->
<script src="https://your-domain.com/memory-embed.js"></script>

<!-- Button will auto-initialize -->
<div 
  data-memory-button
  data-button-text="Share Your Memory"
  data-button-variant="Ocean Teal"
></div>
```

### Option 2: Manual Initialization

```html
<div id="memory-button"></div>
<script src="https://your-domain.com/memory-embed.js"></script>
<script>
  // Access the global mount function
  window.mountMemoryFormButtonWrapper(
    document.getElementById('memory-button'),
    {
      buttonText: 'Share Your Memory',
      variant: 'Ocean Teal'
    }
  );
</script>
```

### Available Button Variants

- `"Warm Sandston"` / `"Warm Sandston Outline"`
- `"Slate Navy"` (default) / `"Slate Navy Outline"`
- `"Ocean Teal"` / `"Ocean Teal Outline"`
- `"Rustwood Red"` / `"Rustwood Outline"`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `buttonText` | string | No | `"Post a Memory"` | Text displayed on the button |
| `variant` | ButtonVariant | No | `"Slate Navy"` | Button style variant |
| `itemId` | string | No | - | CMS item ID for editing existing memories |

## Complete Documentation

For complete setup, deployment, and troubleshooting guides, see:

- [EMBED_GUIDE.md](../EMBED_GUIDE.md) - Complete usage guide
- [WEBFLOW_EMBED_SNIPPET.md](../WEBFLOW_EMBED_SNIPPET.md) - Webflow-specific instructions
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Common issues and solutions

## Development

The build process uses Vite with React plugin, configured in `vite.embed.config.ts`:

```bash
# Development
npm run dev

# Build embed bundle
npm run build:embed

# Build everything
npm run build:all
```

## How It Works

1. **Auto-initialization**: A MutationObserver watches for `[data-memory-button]` elements
2. **React Mount**: Creates a React root and renders the Webflow button component
3. **Modal State**: Handles opening/closing the form modal
4. **Form Submission**: Submits to your Astro API endpoints at `/api/memory`
5. **Dynamic Cleanup**: Properly unmounts React when elements are removed

## Security

- Uses edit codes for secure memory updates
- Validates all form inputs client-side
- Leverages Webflow CMS permissions server-side
- Environment variables protect API tokens
