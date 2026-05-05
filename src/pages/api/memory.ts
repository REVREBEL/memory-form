/**
 * Memory Form API Route
 * 
 * Handles creation and updating of memory items in the Webflow CMS.
 * Collection: Memory Journals (693a599cb78b2b97a36ef963)
 * 
 * POST /api/memory
 * - Creates a new memory item or updates an existing one
 * - Validates form data
 * - Auto-generates: memory_id, active, memory-card-size
 * - Returns the created/updated item with metadata (including slug and edit code for edit link)
 */

import type { APIRoute } from 'astro';
import { 
  createMemoryItem, 
  updateMemoryItem, 
  buildCmsPayload,
  generateRandomSlug,
  generateEditCode,
  getNextMemoryId,
  determineCardSize
} from '../../lib/memory-cms-api';
import { 
  validateMemoryForm, 
  formatDate 
} from '../../lib/memory-form-utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse form data
    const formData = await request.formData();
    
    console.log('📥 Received form data:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    // MAP FORM FIELDS TO CMS FIELD SLUGS
    // The CMS uses hyphenated slugs that are derived from the displayNames
    // For example: displayName "memory_name" → slug "name" (special case)
    //              displayName "first_name" → slug "first-name"
    //              displayName "memory_detail" → slug "memory-detail"
    
    // 1. Map memory_name to name (CMS slug: name, required)
    const memoryName = formData.get('memory_name') as string;
    if (memoryName) {
      formData.set('name', memoryName.trim());
      console.log('✅ Mapped memory_name → name:', memoryName);
    }
    
    // 2. Map memory_detail to memory-detail (CMS slug: memory-detail)
    const memoryDetail = formData.get('memory_detail') as string;
    if (memoryDetail) {
      formData.set('memory-detail', memoryDetail.trim());
      console.log('✅ Mapped memory_detail → memory-detail');
    }
    
    // 3. Map memory_date to memory-date (CMS slug: memory-date)
    const memoryDate = formData.get('memory_date') as string;
    if (memoryDate) {
      formData.set('memory-date', memoryDate.trim());
      console.log('✅ Mapped memory_date → memory-date:', memoryDate);
    }
    
    // 4. Map memory_location to memory-location (CMS slug: memory-location)
    const memoryLocation = formData.get('memory_location') as string;
    if (memoryLocation) {
      formData.set('memory-location', memoryLocation.trim());
      console.log('✅ Mapped memory_location → memory-location');
    }
    
    // 5. Map collection_id to collection-id
    const collectionId = formData.get('collection_id') as string;
    if (collectionId) {
      formData.set('collection-id', collectionId.trim());
      console.log('✅ Mapped collection_id → collection-id:', collectionId);
    }
    
    // 6. Map first_name to first-name (CMS slug: first-name)
    const firstName = formData.get('first_name') as string;
    if (firstName) {
      formData.set('first-name', firstName.trim());
      console.log('✅ Mapped first_name → first-name');
    }
    
    // 7. Map last_name to last-name (CMS slug: last-name)
    const lastName = formData.get('last_name') as string;
    if (lastName) {
      formData.set('last-name', lastName.trim());
      console.log('✅ Mapped last_name → last-name');
    }
    
    // 8. Email field stays as 'email' (CMS slug: email)
    const email = formData.get('email') as string;
    if (email) {
      formData.set('email', email.trim());
      console.log('✅ Email field: email');
    }
    
    // 9. Map tag fields (CMS slugs: memory-tag-1, memory-tag-2, memory-tag-3)
    const tag1 = formData.get('memory_tag_1') as string;
    if (tag1) {
      formData.set('memory-tag-1', tag1.trim());
      console.log('✅ Mapped memory_tag_1 → memory-tag-1');
    }
    
    const tag2 = formData.get('memory_tag_2') as string;
    if (tag2) {
      formData.set('memory-tag-2', tag2.trim());
      console.log('✅ Mapped memory_tag_2 → memory-tag-2');
    }
    
    const tag3 = formData.get('memory_tag_3') as string;
    if (tag3) {
      formData.set('memory-tag-3', tag3.trim());
      console.log('✅ Mapped memory_tag_3 → memory-tag-3');
    }
    
    // 10. Map content_link to content-link (CMS slug: content-link)
    const contentLink = formData.get('content_link') as string;
    if (contentLink) {
      formData.set('content-link', contentLink.trim());
      console.log('✅ Mapped content_link → content-link');
    }
    
    console.log('📤 Form data after mapping:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    // Validate required fields (using mapped field names)
    const validation = validateMemoryForm(formData);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({
          success: false,
          errors: validation.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Extract collection and item information
    const mappedCollectionId = formData.get('collection-id') as string;
    const itemId = formData.get('item-id') as string;
    
    // Generate random 10-digit slug and 6-character edit code for new items
    let slug = formData.get('slug') as string;
    let editCode = formData.get('edit-code') as string;
    let memoryId: number | null = null;
    
    if (!itemId || itemId.trim() === '') {
      // NEW ITEM - Generate all auto-fields
      
      // 1. Generate slug and edit code
      slug = generateRandomSlug();
      editCode = generateEditCode();
      formData.set('slug', slug);
      formData.set('edit-code', editCode);
      console.log('✅ Generated credentials for new item:', { slug, editCode });
      
      // 2. Set active = true for new items
      formData.set('active', 'true');
      console.log('✅ Set active = true for new item');
      
      // 3. Generate next sequential memory_id
      try {
        memoryId = await getNextMemoryId(mappedCollectionId, locals);
        formData.set('memory-id', memoryId.toString());
        console.log(`✅ Generated memory_id: ${memoryId}`);
      } catch (error) {
        console.error('⚠️ Failed to generate memory_id:', error);
        // Continue without memory_id if it fails
      }
      
      // 4. Determine memory-card-size from photo dimensions (if photo uploaded)
      const photoDimensions = formData.get('photo_dimensions') as string;
      if (photoDimensions) {
        try {
          const dims = JSON.parse(photoDimensions);
          const cardSize = determineCardSize(dims.width, dims.height);
          formData.set('memory-card-size', cardSize);
          console.log(`✅ Auto-set memory-card-size: ${cardSize} (${dims.width}x${dims.height})`);
        } catch (error) {
          console.error('⚠️ Failed to parse photo dimensions:', error);
          // Default to 1x1 if we can't determine
          formData.set('memory-card-size', '1x1');
          console.log('⚠️ Defaulted memory-card-size to 1x1');
        }
      } else {
        // No photo uploaded, default to 1x1
        formData.set('memory-card-size', '1x1');
        console.log('ℹ️ No photo dimensions, defaulted memory-card-size to 1x1');
      }
    }
    
    // Format date field (already mapped to memory-date)
    const mappedMemoryDate = formData.get('memory-date') as string;
    if (mappedMemoryDate) {
      const formattedDate = formatDate(mappedMemoryDate);
      if (formattedDate) {
        formData.set('memory-date', formattedDate);
        console.log('✅ Formatted date:', formattedDate);
      }
    }
    
    // Build CMS payload
    const payload = buildCmsPayload(formData);
    
    // Create or update item
    let response;
    if (itemId && itemId.trim() !== '') {
      // Update existing item
      response = await updateMemoryItem(mappedCollectionId, itemId, payload, locals);
    } else {
      // Create new item
      response = await createMemoryItem(mappedCollectionId, payload, locals);
    }
    
    // Extract the user's email for the edit link
    const userEmail = formData.get('email') as string;
    
    // Return success response with credentials for edit functionality
    return new Response(
      JSON.stringify({
        success: true,
        data: response,
        credentials: {
          slug: slug,
          email: userEmail,
          editCode: editCode
        },
        message: itemId ? 'Memory updated successfully' : 'Memory created successfully',
        editInfo: {
          message: 'Save these credentials to edit your memory later:',
          instructions: 'You will need all three pieces of information to edit your memory',
          slug: slug,
          email: userEmail,
          editCode: editCode,
          editUrl: `${new URL(request.url).origin}/edit?slug=${slug}`
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Memory API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
