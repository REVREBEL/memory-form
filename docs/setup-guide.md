# Memory Form - Setup Guide

This guide will walk you through setting up the Memory Form application in your Webflow Cloud environment.

---

## Prerequisites

- Webflow account with access to CMS
- Webflow site with a CMS collection for memories
- Webflow API access token
- Node.js 18+ installed (for local development)

---

## Step 1: Create CMS Collection

### 1.1 Create Collection in Webflow

1. Go to your Webflow site's CMS
2. Create a new Collection named **"Memories"** (or any name you prefer)
3. Add the following fields:

### Required System Fields
These are included by default:
- ✓ Name (Plain Text)
- ✓ Slug (Plain Text)

### Custom Fields to Add

| Field Name | Field Slug | Field Type | Required |
|------------|------------|------------|----------|
| First Name | `first-name` | Plain Text | No |
| Last Name | `last-name` | Plain Text | No |
| Email | `email` | Email | Yes |
| Memory | `memory` | Long Text | Yes |
| Memory Date | `memory-date` | Date/Time | Yes |
| Location | `location` | Plain Text | No |
| Tag 1 | `tag-1` | Plain Text | No |
| Tag 2 | `tag-2` | Plain Text | No |
| Tag 3 | `tag-3` | Plain Text | No |
| Photo | `photo` | Image | No |
| Video | `video` | Video | No |
| Video Link | `video-link` | Plain Text | No |
| Content Link | `content-link` | Plain Text | No |

**IMPORTANT**: Field slugs must match exactly as shown above for the app to work correctly.

### 1.2 Get Collection ID

1. In Webflow Designer, go to CMS Collections
2. Select your Memories collection
3. Note the Collection ID from the URL or collection settings
4. It will be a 24-character string like: `507f1f77bcf86cd799439011`

---

## Step 2: Get Webflow API Token

### 2.1 Generate Site API Token

1. Go to Webflow Site Settings
2. Navigate to **Integrations** → **API Access**
3. Generate a new **Site API Token**
4. Copy the token (you won't be able to see it again)

**Permissions Required**:
- ✓ Read CMS items
- ✓ Write CMS items
- ✓ Update CMS items

### 2.2 Store Token Securely

Never commit your API token to version control!

---

## Step 3: Configure the Application

### 3.1 Set Environment Variables

Create a `.env` file in the project root:

```env
# Webflow CMS API Token (Required)
WEBFLOW_CMS_SITE_API_TOKEN=your_site_api_token_here

# Webflow API Host (Optional - for development)
WEBFLOW_API_HOST=https://api.webflow.com
```

### 3.2 Update Collection ID

Edit `src/pages/index.astro` and set your collection ID:

```typescript
// Line ~5
const COLLECTION_ID = '507f1f77bcf86cd799439011'; // Replace with your actual collection ID

// Optional: If using multiple locales
const LOCALE_ID = undefined; // or 'your_locale_id_here'
```

### 3.3 Verify Configuration

Check that:
- [ ] `.env` file exists with valid API token
- [ ] Collection ID is set in `index.astro`
- [ ] Collection ID is a 24-character string
- [ ] CMS collection has all required fields with correct slugs

---

## Step 4: Install Dependencies

```bash
npm install
```

This will install:
- Astro framework
- React and React DOM
- Webflow API SDK
- iconoir-react (icon library)
- All UI dependencies (shadcn, Radix UI)

---

## Step 5: Local Development

### 5.1 Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:4321`

### 5.2 Test the Memory Form

1. Open `http://localhost:4321` in your browser
2. Click the **"Share a Memory"** button
3. Fill out the form with test data:
   - Name: Test User
   - Email: test@example.com
   - Memory: This is a test memory
   - Memory Date: Select today's date
4. Click **"Submit Memory"**
5. You should see a success message with the item ID

### 5.3 Verify in Webflow CMS

1. Go to your Webflow site's CMS
2. Open the Memories collection
3. You should see the newly created item
4. Verify all fields were saved correctly

---

## Step 6: Troubleshooting Setup

### Issue: "Missing WEBFLOW_CMS_SITE_API_TOKEN"

**Solution**:
- Verify `.env` file exists in project root
- Check that the variable name is exactly `WEBFLOW_CMS_SITE_API_TOKEN`
- Ensure no spaces around the `=` sign
- Restart the dev server after creating/updating `.env`

### Issue: "Collection ID is required"

**Solution**:
- Check that `COLLECTION_ID` is set in `src/pages/index.astro`
- Verify it's a valid 24-character MongoDB ObjectId
- Ensure no extra spaces or quotes

### Issue: "Failed to create memory item"

**Solution**:
- Verify API token has write permissions
- Check that collection exists and is accessible
- Ensure all required fields exist in the collection
- Verify field slugs match exactly (e.g., `first-name`, not `firstName`)

### Issue: Form validation errors

**Solution**:
- Check that these fields are filled:
  - Name (hidden field, may need to be set via JavaScript)
  - Email
  - Memory
  - Memory Date
- Ensure email is in valid format
- Ensure memory date is a valid date

### Issue: "Network error" or timeout

**Solution**:
- Check that dev server is running
- Verify API endpoint is accessible at `/api/memory`
- Check browser console for CORS or network errors
- Ensure Webflow API is reachable (not blocked by firewall)

---

## Step 7: Testing Checklist

Before deploying, test the following:

### Basic Functionality
- [ ] Modal opens when clicking "Share a Memory" button
- [ ] All form fields are visible and editable
- [ ] Form validation works (try submitting empty form)
- [ ] Success message appears after submission
- [ ] Modal closes automatically after success
- [ ] Item appears in Webflow CMS

### Data Validation
- [ ] Email validation works (try invalid email)
- [ ] Date validation works (try invalid date)
- [ ] URL validation works (try invalid URL in video-link)
- [ ] Required field validation works

### Slug Generation
- [ ] Slug auto-generates from name
- [ ] Slug is lowercase with hyphens
- [ ] Special characters are removed from slug

### Create vs Update
- [ ] New items are created (no item-id)
- [ ] Existing items can be updated (with item-id)

### Error Handling
- [ ] Network errors show user-friendly message
- [ ] Validation errors are displayed clearly
- [ ] Console logs detailed errors for debugging

---

## Step 8: Deployment to Webflow Cloud

### 8.1 Set Environment Variables in Webflow

1. Go to Webflow Cloud dashboard
2. Select your app
3. Go to **Settings** → **Environment Variables**
4. Add: `WEBFLOW_CMS_SITE_API_TOKEN` with your token

### 8.2 Deploy

```bash
npm run build
```

Then deploy through Webflow Cloud interface or CLI.

### 8.3 Verify Production

1. Visit your deployed app URL
2. Test form submission in production
3. Verify items are created in CMS
4. Check error handling works correctly

---

## Step 9: Customization (Optional)

### Change Button Text

Edit `src/pages/index.astro`:

```tsx
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  buttonText="Add Your Story"  // Custom text
  buttonVariant="Slate Navy"    // Change color
/>
```

### Change Button Colors

Available variants:
- `Warm Sandston`
- `Warm Sandston Outline`
- `Slate Navy`
- `Slate Navy Outline`
- `Ocean Teal` (default)
- `Ocean Teal Outline`
- `Rustwood Red`
- `Rustwood Outline`

### Add Success/Error Callbacks

```tsx
<MemoryFormWrapper
  collectionId={COLLECTION_ID}
  onSuccess={(item) => {
    console.log('Memory saved:', item);
    // Custom success logic
  }}
  onError={(error) => {
    console.error('Error:', error);
    // Custom error handling
  }}
/>
```

### Customize Page Design

Edit `src/pages/index.astro` to change:
- Hero section content
- Features section
- CTA section
- Page layout

**Remember**: Use only Webflow CSS variables for colors and fonts!

---

## Step 10: Maintenance

### Update CMS Schema

If you need to add or modify fields:

1. Update CMS collection in Webflow
2. Update types in `src/lib/memory-form-types.ts`
3. Update field mapping in `src/lib/memory-cms-api.ts`
4. Update validation in `src/lib/memory-form-utils.ts`
5. Update form field IDs in `src/components/MemoryFormWrapper.tsx`
6. Test thoroughly before deploying

### Update Devlink Components

If Webflow components are updated:

1. Re-sync from Webflow Designer
2. Components regenerate in `src/site-components/`
3. Check for breaking changes in props
4. Update `MemoryFormWrapper.tsx` if needed
5. Test all form functionality

### Monitor API Usage

- Check Webflow API rate limits
- Monitor CMS item creation/updates
- Review error logs regularly
- Set up alerts for failures

---

## Resources

- [Webflow CMS API Documentation](https://developers.webflow.com/data/reference)
- [Webflow Cloud Documentation](https://developers.webflow.com/webflow-cloud/intro)
- [Astro Documentation](https://docs.astro.build)
- [Project MASTER_GUIDE.md](../MASTER_GUIDE.md)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#step-6-troubleshooting-setup) section
2. Review browser console for errors
3. Check server logs for API errors
4. Verify CMS collection configuration
5. Consult MASTER_GUIDE.md for detailed documentation

---

*Last Updated: 2024*
*Memory Form Application v1.0*
