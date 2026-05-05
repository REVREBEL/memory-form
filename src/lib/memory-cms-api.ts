/**
 * Memory Form CMS API
 * 
 * API client for interacting with the Webflow CMS to create
 * and update memory items in the collection.
 * 
 * IMPORTANT: This file should only be used on the server side.
 * Never import or use this in client components.
 */

import { WebflowClient } from 'webflow-api';
import type { CmsItemPayload, CmsItemResponse } from './memory-form-types';

/**
 * Initialize the Webflow client with credentials
 */
export function getWebflowClient(locals?: any): WebflowClient | null {
  const token = 
    locals?.runtime?.env?.WEBFLOW_CMS_SITE_API_WRITE_TOKEN || 
    import.meta.env.WEBFLOW_CMS_SITE_API_WRITE_TOKEN;
  
  if (!token) {
    console.error('Missing WEBFLOW_CMS_SITE_API_WRITE_TOKEN');
    return null;
  }
  
  const baseUrl = 
    locals?.runtime?.env?.WEBFLOW_API_HOST || 
    import.meta.env.WEBFLOW_API_HOST;
  
  return new WebflowClient({
    accessToken: token,
    ...(baseUrl && { baseUrl })
  });
}

/**
 * Generate a random 10-digit slug
 */
export function generateRandomSlug(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Generate a random 6-character edit code (alphanumeric)
 */
export function generateEditCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get the next sequential memory_id by querying the highest current value
 */
export async function getNextMemoryId(
  collectionId: string,
  locals?: any
): Promise<number> {
  const client = getWebflowClient(locals);
  
  if (!client) {
    throw new Error('Failed to initialize Webflow client');
  }
  
  try {
    // Fetch all items to find the highest memory-id
    let allItems: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    
    while (hasMore) {
      const response = await client.collections.items.listItems(collectionId, {
        limit,
        offset
      });
      
      allItems = allItems.concat(response.items || []);
      hasMore = (response.items?.length || 0) === limit;
      offset += limit;
    }
    
    // Find the highest memory-id value
    let maxId = 0;
    for (const item of allItems) {
      const memoryId = item.fieldData?.['memory-id'];
      if (typeof memoryId === 'number' && memoryId > maxId) {
        maxId = memoryId;
      }
    }
    
    const nextId = maxId + 1;
    console.log(`📊 Next memory_id: ${nextId} (current max: ${maxId})`);
    
    return nextId;
  } catch (error: any) {
    console.error('Error getting next memory_id:', error);
    // If there's an error, start from 1
    return 1;
  }
}

/**
 * Determine memory card size based on image dimensions
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns One of: "1x1", "2x3", or "3x2"
 */
export function determineCardSize(width: number, height: number): string {
  const aspectRatio = width / height;
  
  // Square or near-square (within 10% tolerance)
  if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
    return '1x1';
  }
  
  // Portrait orientation
  if (aspectRatio < 0.9) {
    return '2x3';
  }
  
  // Landscape orientation
  return '3x2';
}

/**
 * Clean fieldData object by removing undefined, null, and empty string values
 */
function cleanFieldData(fieldData: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(fieldData)) {
    // Only include values that are not undefined, null, or empty strings
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
      console.log(`  ✅ Including field "${key}":`, typeof value === 'string' ? value.substring(0, 50) : value);
    } else {
      console.log(`  ❌ Excluding field "${key}": ${value === undefined ? 'undefined' : value === null ? 'null' : 'empty'}`);
    }
  }
  
  return cleaned;
}

/**
 * Create a new CMS item
 */
export async function createMemoryItem(
  collectionId: string,
  payload: CmsItemPayload,
  locals?: any
): Promise<CmsItemResponse> {
  const client = getWebflowClient(locals);
  
  if (!client) {
    throw new Error('Failed to initialize Webflow client');
  }
  
  try {
    // Clean the fieldData before sending
    console.log('🧹 Cleaning fieldData...');
    const cleanedFieldData = cleanFieldData(payload.fieldData);
    
    console.log('📤 Creating CMS item with cleaned fieldData:', JSON.stringify(cleanedFieldData, null, 2));
    
    const response = await client.collections.items.createItem(collectionId, {
      fieldData: cleanedFieldData,
      isArchived: payload.isArchived || false,
      isDraft: payload.isDraft || false
    });
    
    return response as CmsItemResponse;
  } catch (error: any) {
    console.error('Error creating memory item:', error);
    console.error('Original payload:', JSON.stringify(payload, null, 2));
    throw new Error(error.message || 'Failed to create memory item');
  }
}

/**
 * Update an existing CMS item
 */
export async function updateMemoryItem(
  collectionId: string,
  itemId: string,
  payload: CmsItemPayload,
  locals?: any
): Promise<CmsItemResponse> {
  const client = getWebflowClient(locals);
  
  if (!client) {
    throw new Error('Failed to initialize Webflow client');
  }
  
  try {
    // Clean the fieldData before sending
    console.log('🧹 Cleaning fieldData...');
    const cleanedFieldData = cleanFieldData(payload.fieldData);
    
    console.log('📤 Updating CMS item with cleaned fieldData:', JSON.stringify(cleanedFieldData, null, 2));
    
    const response = await client.collections.items.updateItem(
      collectionId,
      itemId,
      {
        fieldData: cleanedFieldData,
        isArchived: payload.isArchived,
        isDraft: payload.isDraft
      }
    );
    
    return response as CmsItemResponse;
  } catch (error: any) {
    console.error('Error updating memory item:', error);
    throw new Error(error.message || 'Failed to update memory item');
  }
}

/**
 * Get a live CMS item by ID
 */
export async function getMemoryItem(
  collectionId: string,
  itemId: string,
  locals?: any
): Promise<CmsItemResponse> {
  const client = getWebflowClient(locals);
  
  if (!client) {
    throw new Error('Failed to initialize Webflow client');
  }
  
  try {
    const response = await client.collections.items.getItemLive(
      collectionId,
      itemId
    );
    
    return response as CmsItemResponse;
  } catch (error: any) {
    console.error('Error fetching memory item:', error);
    throw new Error(error.message || 'Failed to fetch memory item');
  }
}

/**
 * Find a memory item by slug, email, and edit code
 * Used for the edit functionality - requires all three for security
 */
export async function findMemoryByCredentials(
  collectionId: string,
  slug: string,
  email: string,
  editCode: string,
  locals?: any
): Promise<CmsItemResponse | null> {
  const client = getWebflowClient(locals);
  
  if (!client) {
    throw new Error('Failed to initialize Webflow client');
  }
  
  try {
    const response = await client.collections.items.listItems(collectionId, {
      limit: 100
    });
    
    const items = response.items || [];
    const matchingItem = items.find(
      (item: any) => 
        item.fieldData?.slug === slug && 
        item.fieldData?.email === email &&
        item.fieldData?.['edit-code'] === editCode.toUpperCase()
    );
    
    return matchingItem as CmsItemResponse || null;
  } catch (error: any) {
    console.error('Error finding memory item:', error);
    throw new Error(error.message || 'Failed to find memory item');
  }
}

/**
 * Helper function to safely get form field value
 * Returns undefined if value is null, undefined, or empty string
 */
function getFieldValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key) as string | null;
  if (!value || value.trim() === '') {
    console.log(`  ℹ️ Field "${key}" is empty or null`);
    return undefined;
  }
  console.log(`  ✅ Field "${key}" has value:`, value.substring(0, 100));
  return value.trim();
}

/**
 * Build CMS payload from form data
 * 
 * CORRECT FIELD MAPPINGS for Collection "Memories" (693a599cb78b2b97a36ef963):
 * - memory_name → name (REQUIRED)
 * - slug → slug (REQUIRED)
 * - first_name → first-name
 * - last_name → last-name
 * - email → email
 * - memory_detail → memory-detail
 * - memory_date → memory-date
 * - memory_location → memory-location
 * - memory_tag_1 → memory-tag-1
 * - memory_tag_2 → memory-tag-2
 * - memory_tag_3 → memory-tag-3
 * - photo → photo
 * - video → video
 * - content_link → content-link
 * - edit_code → edit-code
 * - memory_card_size → memory-card-size (AUTO-GENERATED from image dimensions)
 * - memory_id → memory-id (AUTO-GENERATED sequence number)
 * - profile_image → profile-image
 * - active → active (AUTO-SET to true for new items)
 * 
 * IMPORTANT: Only includes fields that have actual values.
 * Empty strings or undefined values are omitted entirely.
 */
export function buildCmsPayload(formData: FormData): CmsItemPayload {
  console.log('🏗️ Building CMS payload...');
  
  const name = getFieldValue(formData, 'name');
  const slug = getFieldValue(formData, 'slug');
  
  if (!name || !slug) {
    throw new Error('Required fields "name" and "slug" must have values');
  }
  
  const archived = formData.get('archived') === 'true' || formData.get('archived') === '1';
  const draft = formData.get('draft') === 'true' || formData.get('draft') === '1';
  
  // Start with required fields only
  const fieldData: Record<string, any> = {
    name,
    slug
  };
  
  console.log('📋 Processing optional fields...');
  
  // Add optional fields only if they have values
  const firstName = getFieldValue(formData, 'first-name');
  if (firstName) fieldData['first-name'] = firstName;
  
  const lastName = getFieldValue(formData, 'last-name');
  if (lastName) fieldData['last-name'] = lastName;
  
  const email = getFieldValue(formData, 'email');
  if (email) fieldData['email'] = email;
  
  const editCode = getFieldValue(formData, 'edit-code');
  if (editCode) fieldData['edit-code'] = editCode;
  
  const memoryDetail = getFieldValue(formData, 'memory-detail');
  if (memoryDetail) fieldData['memory-detail'] = memoryDetail;
  
  const memoryDate = getFieldValue(formData, 'memory-date');
  if (memoryDate) fieldData['memory-date'] = memoryDate;
  
  const memoryLocation = getFieldValue(formData, 'memory-location');
  if (memoryLocation) fieldData['memory-location'] = memoryLocation;
  
  const tag1 = getFieldValue(formData, 'memory-tag-1');
  if (tag1) fieldData['memory-tag-1'] = tag1;
  
  const tag2 = getFieldValue(formData, 'memory-tag-2');
  if (tag2) fieldData['memory-tag-2'] = tag2;
  
  const tag3 = getFieldValue(formData, 'memory-tag-3');
  if (tag3) fieldData['memory-tag-3'] = tag3;
  
  console.log('📸 Processing media fields...');
  const photo = getFieldValue(formData, 'photo');
  if (photo) {
    fieldData['photo'] = photo;
    console.log('  ✅ Photo URL found:', photo);
  }
  
  const video = getFieldValue(formData, 'video');
  if (video) {
    fieldData['video'] = video;
    console.log('  ✅ Video URL found:', video);
  }
  
  const videoLink = getFieldValue(formData, 'video-link');
  if (videoLink) fieldData['video-link'] = videoLink;
  
  const contentLink = getFieldValue(formData, 'content-link');
  if (contentLink) fieldData['content-link'] = contentLink;
  
  // Auto-generated fields (these should be set by the API, not form)
  const cardSize = getFieldValue(formData, 'memory-card-size');
  if (cardSize) fieldData['memory-card-size'] = cardSize;
  
  const memoryIdStr = getFieldValue(formData, 'memory-id');
  if (memoryIdStr) {
    const memoryId = parseInt(memoryIdStr, 10);
    if (!isNaN(memoryId)) {
      fieldData['memory-id'] = memoryId;
    }
  }
  
  const profileImage = getFieldValue(formData, 'profile-image');
  if (profileImage) fieldData['profile-image'] = profileImage;
  
  const active = formData.get('active');
  if (active !== null && active !== '') {
    fieldData['active'] = active === 'true' || active === '1';
  }
  
  console.log('📦 Built CMS payload fieldData (before cleaning):', JSON.stringify(fieldData, null, 2));
  
  return {
    fieldData: fieldData as any,
    isArchived: archived,
    isDraft: draft
  };
}
