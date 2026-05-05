# Memory Form - Deployment Checklist

Use this checklist to ensure your Memory Form application is properly configured before deployment.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] `.env` file created with valid `WEBFLOW_CMS_SITE_API_TOKEN`
- [ ] API token has CMS read/write permissions
- [ ] `.env` is in `.gitignore` (verify it won't be committed)
- [ ] Environment variables documented for team

### 2. Webflow CMS Collection

- [ ] Collection created in Webflow CMS
- [ ] Collection ID obtained (24-character string)
- [ ] All required fields added to collection:
  - [ ] `name` (Plain Text) - System field
  - [ ] `slug` (Plain Text) - System field
  - [ ] `first-name` (Plain Text)
  - [ ] `last-name` (Plain Text)
  - [ ] `email` (Email)
  - [ ] `memory` (Long Text)
  - [ ] `memory-date` (Date/Time)
  - [ ] `location` (Plain Text)
  - [ ] `tag-1` (Plain Text)
  - [ ] `tag-2` (Plain Text)
  - [ ] `tag-3` (Plain Text)
  - [ ] `photo` (Image)
  - [ ] `video` (Video)
  - [ ] `video-link` (Plain Text)
  - [ ] `content-link` (Plain Text)
- [ ] Field slugs match exactly (no camelCase, use kebab-case)
- [ ] Required fields marked as required in CMS

### 3. Application Configuration

- [ ] Collection ID set in `src/pages/index.astro`
- [ ] Locale ID set if using multiple locales
- [ ] Button text customized (if desired)
- [ ] Button variant selected
- [ ] Success/error callbacks implemented (if needed)

### 4. Testing

#### Local Testing
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] App loads at `http://localhost:4321`
- [ ] "Share a Memory" button visible and clickable
- [ ] Modal opens when button clicked
- [ ] All form fields visible and editable

#### Form Functionality
- [ ] Required field validation works
- [ ] Email validation works (try invalid email)
- [ ] Date picker works
- [ ] All input fields accept data
- [ ] Submit button clickable

#### Submission Testing
- [ ] Form submits successfully with valid data
- [ ] Success message displays
- [ ] Item ID shown in success message
- [ ] Modal closes automatically after success
- [ ] Item appears in Webflow CMS
- [ ] All field values saved correctly

#### Error Handling
- [ ] Empty form shows validation errors
- [ ] Invalid email shows error
- [ ] Invalid URL shows error
- [ ] Network errors display user-friendly message
- [ ] Errors logged to console for debugging

#### Slug Generation
- [ ] Slug auto-generates when not provided
- [ ] Special characters removed from slug
- [ ] Spaces converted to hyphens
- [ ] Slug is lowercase

#### Update Functionality
- [ ] Can update existing item (with item-id)
- [ ] Updated data saves correctly
- [ ] lastUpdated timestamp updates

### 5. Code Quality

- [ ] TypeScript types defined for all data structures
- [ ] No TypeScript errors (`npm run astro check`)
- [ ] No console errors in browser
- [ ] Code follows project conventions
- [ ] Comments added for complex logic
- [ ] No hardcoded values (use environment variables)

### 6. Security

- [ ] API token not in client-side code
- [ ] CMS API only accessed from server routes
- [ ] Input validation on both client and server
- [ ] Error messages don't leak sensitive info
- [ ] CORS configured properly
- [ ] XSS prevention in place

### 7. Documentation

- [ ] README.md updated with project info
- [ ] MASTER_GUIDE.md complete
- [ ] Setup guide available
- [ ] API documentation complete
- [ ] Team knows how to configure and deploy

### 8. Build

- [ ] Production build succeeds (`npm run build`)
- [ ] No build errors or warnings
- [ ] Output size reasonable
- [ ] All assets included

---

## 🚀 Deployment to Webflow Cloud

### 1. Webflow Cloud Configuration

- [ ] App created in Webflow Cloud dashboard
- [ ] Environment variables set:
  - [ ] `WEBFLOW_CMS_SITE_API_TOKEN`
  - [ ] `WEBFLOW_API_HOST` (if needed)
- [ ] App permissions configured
- [ ] App mounted on correct path

### 2. Deploy

- [ ] Code committed to repository (without .env)
- [ ] Deployment triggered
- [ ] Build succeeds
- [ ] No deployment errors

### 3. Post-Deployment Verification

#### Basic Functionality
- [ ] App loads in production
- [ ] No 404 errors
- [ ] No console errors
- [ ] Styles load correctly
- [ ] Fonts display properly
- [ ] Dark mode works (if applicable)

#### Form Testing
- [ ] Button visible and clickable
- [ ] Modal opens/closes
- [ ] Form fields work
- [ ] Submission succeeds
- [ ] Success message shows
- [ ] Item created in CMS

#### API Integration
- [ ] API endpoint accessible
- [ ] Authentication works
- [ ] CMS items created successfully
- [ ] Error handling works
- [ ] Rate limits not exceeded

#### Performance
- [ ] Page loads quickly (< 3 seconds)
- [ ] Form submission responsive
- [ ] No timeouts
- [ ] Images/assets optimized

### 4. Monitoring

- [ ] Error tracking configured
- [ ] API usage monitored
- [ ] Performance metrics tracked
- [ ] User feedback collected

---

## 🔍 Post-Deployment Testing

### Smoke Tests (Do These First)

1. **Basic Load Test**
   - [ ] Visit production URL
   - [ ] Page loads without errors
   - [ ] All content visible

2. **Button Test**
   - [ ] Click "Share a Memory" button
   - [ ] Modal opens
   - [ ] Form displays

3. **Quick Submission Test**
   - [ ] Fill required fields only:
     - Name: Test User
     - Email: test@example.com
     - Memory: Quick test memory
     - Date: Today
   - [ ] Submit form
   - [ ] Success message appears
   - [ ] Check CMS for new item

### Full Test Suite

#### Test Case 1: Minimum Required Fields
```
Name: John Doe
Email: john@example.com
Memory: This is my first memory.
Date: 2024-01-15
```
- [ ] Submits successfully
- [ ] Slug auto-generated: `john-doe`
- [ ] Item in CMS

#### Test Case 2: All Fields Populated
```
First Name: Jane
Last Name: Smith
Email: jane@example.com
Memory: A wonderful day at the beach with family.
Date: 2024-06-15
Location: Santa Monica
Tag 1: family
Tag 2: beach
Tag 3: summer
Content Link: https://example.com/photo.jpg
```
- [ ] Submits successfully
- [ ] All fields saved correctly
- [ ] Tags properly stored

#### Test Case 3: Validation Errors
```
(Submit empty form)
```
- [ ] Shows validation errors
- [ ] Lists missing required fields
- [ ] Form not submitted

#### Test Case 4: Invalid Email
```
Email: not-an-email
```
- [ ] Shows email validation error
- [ ] Form not submitted

#### Test Case 5: Invalid URL
```
Video Link: not-a-url
```
- [ ] Shows URL validation error
- [ ] Form not submitted

#### Test Case 6: Special Characters in Name
```
Name: John's Memory #1 (2024)
```
- [ ] Submits successfully
- [ ] Slug generated: `johns-memory-1-2024`
- [ ] Special characters removed

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Device Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad)
- [ ] Mobile (iPhone)
- [ ] Mobile (Android)

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
- [ ] All dependencies installed
- [ ] No TypeScript errors
- [ ] No import errors
- [ ] Environment variables available

**Fix:**
```bash
npm install
npm run astro check
npm run build
```

### "Missing API Token" in Production

**Check:**
- [ ] Environment variable set in Webflow Cloud
- [ ] Variable name exactly: `WEBFLOW_CMS_SITE_API_TOKEN`
- [ ] Token is valid and not expired

**Fix:**
1. Go to Webflow Cloud dashboard
2. Settings → Environment Variables
3. Add/update token
4. Redeploy app

### Form Submission Fails

**Check:**
- [ ] API endpoint accessible (`/api/memory`)
- [ ] Network tab for errors
- [ ] Console for JavaScript errors
- [ ] CMS collection exists and accessible

**Fix:**
1. Test API endpoint directly
2. Check CMS collection configuration
3. Verify field slugs match
4. Check API token permissions

### Items Not Appearing in CMS

**Check:**
- [ ] Collection ID correct
- [ ] API token has write permissions
- [ ] Submission returned success
- [ ] Looking at correct collection

**Fix:**
1. Verify collection ID in code matches CMS
2. Check API token permissions
3. Test with Webflow API directly
4. Review API response logs

---

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] No critical errors in logs
- [ ] Form submissions working
- [ ] CMS items being created

### Weekly Checks
- [ ] Review error rates
- [ ] Check API usage/limits
- [ ] Monitor performance metrics
- [ ] Review user feedback

### Monthly Checks
- [ ] Update dependencies
- [ ] Review security
- [ ] Optimize performance
- [ ] Update documentation

---

## 📝 Rollback Plan

If deployment fails:

1. **Immediate Actions**
   - [ ] Revert to previous working version
   - [ ] Notify team
   - [ ] Document the issue

2. **Investigation**
   - [ ] Review error logs
   - [ ] Identify root cause
   - [ ] Test fix locally

3. **Re-deployment**
   - [ ] Fix issue
   - [ ] Test thoroughly
   - [ ] Deploy again
   - [ ] Verify success

---

## ✅ Sign-Off

- [ ] Development team approved
- [ ] QA testing passed
- [ ] Product owner approved
- [ ] Documentation complete
- [ ] Team trained on new features
- [ ] Monitoring configured
- [ ] Support team notified

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

---

*Use this checklist for every deployment to ensure quality and consistency.*

*Memory Form Application v1.0*
