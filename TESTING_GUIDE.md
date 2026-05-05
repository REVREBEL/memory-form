# Memory Form - Complete Testing Guide

## 🎯 Overview

This guide will help you test all functionality of the Memory Form application, including:
- Upload buttons (photo & video)
- Form submission
- CMS integration
- Embed functionality

## 📋 Prerequisites

Before testing, ensure you have:
1. ✅ Cloudflare R2 bucket configured with binding name `WEBFLOW_CLOUD_MEDIA`
2. ✅ Webflow CMS collection ID set in environment variable `MEMORY_JOURNAL_COLLECTION_ID`
3. ✅ Webflow API token set in environment variable `WEBFLOW_CMS_SITE_API_TOKEN`
4. ✅ Dev server running (`npm run dev`)

## 🧪 Test Scenarios

### 1. Test Upload Buttons in Development

#### Start Dev Server
```bash
npm run dev
```

#### Open Test Pages
- Main page: http://localhost:3000/
- Embed test: http://localhost:3000/test-embed

#### Test Photo Upload
1. Click "Share a Memory" button
2. In the form modal, find the "Photo Uploads" section
3. Click anywhere in the photo upload area
4. **Expected**: File picker opens
5. Select an image file (JPG, PNG, GIF, WEBP)
6. **Expected**: 
   - If > 1MB: Shows "Compressing image..." message
   - Shows "Uploading..." with spinner
   - Shows "✓ Photo uploaded: filename.jpg"
   - Shows "Remove" button
7. Click "Remove" to clear the upload
8. **Expected**: Returns to default upload state

#### Test Video Upload
1. In the same form, find the "Video Uploads" section
2. Click anywhere in the video upload area
3. **Expected**: File picker opens
4. Select a video file (MP4, MOV, AVI, WEBM)
5. **Expected**:
   - Shows "Uploading..." with spinner
   - Shows "✓ Video uploaded: filename.mp4"
   - Shows "Remove" button
6. Click "Remove" to clear the upload
7. **Expected**: Returns to default upload state

#### Common Issues & Fixes

**Problem**: File picker doesn't open
- Check browser console for errors
- Verify `PhotoUploadButton` and `VideoUploadButton` are imported
- Check that upload button slots are passed to `MemoryForm`

**Problem**: Upload fails
- Check Network tab in DevTools
- Verify `/api/upload` endpoint is working
- Confirm R2 bucket binding is configured

**Problem**: Icons don't show
- Check that Iconoir icons are imported
- Verify `embed-styles.css` includes Webflow component styles

### 2. Test Form Submission

#### Fill Required Fields
1. **Memory Name**: "A Day at the Beach"
2. **First Name**: "John"
3. **Last Name**: "Doe"
4. **Email**: "john@example.com"
5. **Memory**: "We spent the whole day building sandcastles..."
6. **Date**: "June 2020" or "06/15/2020"

#### Optional Fields
7. **Location**: "Malibu Beach, CA"
8. **Tags**: Add 1-3 tags
9. **Photo**: Upload an image
10. **Video**: Upload a video or paste a YouTube/Vimeo link

#### Submit
1. Click "Submit Memory"
2. **Expected**:
   - Loading overlay appears
   - "Saving your memory..." message
   - Success message: "✓ Memory saved successfully!"
   - Modal closes after 2 seconds

#### Verify in CMS
1. Go to your Webflow CMS collection
2. Find the newly created item
3. Verify all fields are populated correctly
4. Check that photo/video URLs are present

### 3. Test Embed Version

#### Build Embed Bundle
```bash
npm run build:embed
```

**Expected Output**:
```
public/memory-embed.js  1,170.70 kB │ gzip: 217.41 kB
✓ built in 4.12s
```

#### Test Auto-initialization
1. Open http://localhost:3000/test-embed
2. **Expected**: 3 buttons render automatically
   - "Share a Memory" (Ocean Teal)
   - "Add Your Story" (Slate Navy)
   - "Post a Memory" (Rustwood Red)

3. Click each button
4. **Expected**: Modal opens with form
5. Test upload buttons in each modal
6. **Expected**: All upload functionality works

#### Test Manual Initialization
Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Manual Test</title>
</head>
<body>
  <div id="my-button"></div>
  
  <script src="http://localhost:3000/memory-embed.js"></script>
  <script>
    window.mountMemoryFormButtonWrapper(
      document.getElementById('my-button'),
      {
        collectionId: 'YOUR_COLLECTION_ID',
        buttonText: 'Custom Button',
        buttonVariant: 'Ocean Teal',
        baseUrl: 'http://localhost:3000'
      }
    );
  </script>
</body>
</html>
```

Open in browser and test all functionality.

### 4. Test Production Deploy

#### Deploy to Webflow Cloud
1. Build the app:
   ```bash
   npm run build
   npm run build:embed
   ```

2. Deploy via Webflow Cloud CLI or dashboard

3. Verify environment variables are set in production:
   - `MEMORY_JOURNAL_COLLECTION_ID`
   - `WEBFLOW_CMS_SITE_API_TOKEN`
   - `WEBFLOW_API_HOST` (if using custom host)

#### Test Embedded Version on Webflow Page

1. Add embed code to a Webflow static page:
```html
<div 
  data-memory-button
  data-collection-id="YOUR_COLLECTION_ID"
  data-base-url="https://yourdomain.com/memory-form"
  data-button-text="Share a Memory"
  data-button-variant="Ocean Teal"
></div>
<script src="https://yourdomain.com/memory-form/memory-embed.js"></script>
```

2. Publish the page

3. Test all functionality:
   - Button renders correctly
   - Modal opens
   - Upload buttons work
   - Form submits successfully

#### Check Logs
1. Go to Cloudflare Workers dashboard
2. View logs for your worker
3. Verify no errors during:
   - Upload requests
   - Form submissions
   - CMS API calls

## 🐛 Debugging Checklist

### Upload Buttons Not Working

- [ ] Check browser console for JavaScript errors
- [ ] Verify `PhotoUploadButton` and `VideoUploadButton` are in bundle
- [ ] Confirm `imageUploadFieldImageUploadSlot` and `videoUploadFieldVideoUploadSlot` props are passed
- [ ] Check that `baseUrl` prop is correct
- [ ] Verify R2 bucket binding exists

### Form Submission Fails

- [ ] Check Network tab for API errors
- [ ] Verify `collection_id` is being sent
- [ ] Confirm all required fields are filled
- [ ] Check that field names match CMS schema
- [ ] Verify API token has write permissions

### Embed Bundle Issues

- [ ] Rebuild embed: `npm run build:embed`
- [ ] Check bundle size (should be ~1.2MB uncompressed)
- [ ] Verify `memory-embed.js` is accessible
- [ ] Check that `data-collection-id` and `data-base-url` are set
- [ ] Confirm CORS headers allow cross-origin requests

### Upload Compression Issues

- [ ] Check that `browser-image-compression` is installed
- [ ] Verify file size limits (1.5MB images, 10MB videos)
- [ ] Test with different image formats (JPG, PNG, WEBP)
- [ ] Check compression settings in `PhotoUploadButton`

## ✅ Test Checklist

Before marking as complete, verify:

### Development
- [ ] Photo upload button shows icon
- [ ] Photo upload button opens file picker
- [ ] Photo compression works (for files > 1MB)
- [ ] Photo upload succeeds
- [ ] Photo remove button works
- [ ] Video upload button shows icon
- [ ] Video upload button opens file picker
- [ ] Video upload succeeds
- [ ] Video remove button works
- [ ] Form validation works
- [ ] Form submission succeeds
- [ ] Success message displays
- [ ] Modal closes after submission

### Embed
- [ ] Auto-initialization works
- [ ] Manual initialization works
- [ ] Multiple buttons on same page work
- [ ] Upload buttons work in embed
- [ ] Form submission works in embed
- [ ] Custom button text works
- [ ] Custom button variants work

### Production
- [ ] Deploy succeeds
- [ ] Environment variables are set
- [ ] Upload buttons work on production
- [ ] Form submission works on production
- [ ] CMS items are created correctly
- [ ] No CORS errors
- [ ] No console errors

## 📊 Success Metrics

After testing, you should see:
- ✅ 0 JavaScript errors in console
- ✅ 100% upload success rate
- ✅ 100% form submission success rate
- ✅ All CMS fields populated correctly
- ✅ Images compressed to ~1MB or less
- ✅ Page load time < 3 seconds

## 🆘 Getting Help

If you encounter issues:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Review this testing guide
4. Check `UPLOAD_BUTTONS_FIX.md` for common issues
5. Review Cloudflare Workers logs
6. Check Webflow CMS API documentation

## 📝 Notes

- Image compression targets ~1MB (uses `browser-image-compression`)
- Server enforces 1.5MB limit for images, 10MB for videos
- Upload endpoint: `/api/upload`
- Supported image formats: JPG, PNG, GIF, WEBP
- Supported video formats: MP4, MOV, AVI, WEBM
- All uploads go to Cloudflare R2 bucket with binding `WEBFLOW_CLOUD_MEDIA`
