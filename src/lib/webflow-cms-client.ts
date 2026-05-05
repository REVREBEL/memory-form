/**
 * Webflow CMS Client
 * Handles all interactions with the Webflow CMS API
 */

import { WebflowClient } from 'webflow-api';

export interface CmsItemFieldData {
  name: string;
  slug: string;
  'first-name'?: string;
  'last-name'?: string;
  'email-address'?: string;
  memory?: string;
  'memory-date'?: string;
  location?: string;
  'tag-1'?: string;
  'tag-2'?: string;
  'tag-3'?: string;
  photo?: {
    url: string;
    alt?: string;
  };
  'video-link'?: string;
  video?: string;
}

export interface CmsItemResponse {
  id: string;
  fieldData: CmsItemFieldData & {
    _archived?: boolean;
    _draft?: boolean;
  };
  createdOn?: string;
  lastUpdated?: string;
  lastPublished?: string;
}

export interface CreateItemPayload {
  fieldData: CmsItemFieldData;
  isDraft?: boolean;
  isArchived?: boolean;
}

export interface UpdateItemPayload {
  fieldData?: Partial<CmsItemFieldData>;
  isDraft?: boolean;
  isArchived?: boolean;
}

/**
 * Initialize the Webflow client
 */
export function createWebflowClient(token?: string, baseUrl?: string) {
  const accessToken = token || '';
  
  if (!accessToken) {
    throw new Error('Webflow API token is required');
  }

  return new WebflowClient({
    accessToken,
    ...(baseUrl && { baseUrl })
  });
}

/**
 * Create a new CMS item
 */
export async function createCmsItem(
  collectionId: string,
  payload: CreateItemPayload,
  token?: string,
  baseUrl?: string
): Promise<CmsItemResponse> {
  const client = createWebflowClient(token, baseUrl);
  
  const response = await client.collections.items.createItem(collectionId, payload);
  
  return response as CmsItemResponse;
}

/**
 * Update an existing CMS item
 */
export async function updateCmsItem(
  collectionId: string,
  itemId: string,
  payload: UpdateItemPayload,
  token?: string,
  baseUrl?: string
): Promise<CmsItemResponse> {
  const client = createWebflowClient(token, baseUrl);
  
  const response = await client.collections.items.updateItem(
    collectionId,
    itemId,
    payload
  );
  
  return response as CmsItemResponse;
}

/**
 * Get a single CMS item
 */
export async function getCmsItem(
  collectionId: string,
  itemId: string,
  token?: string,
  baseUrl?: string
): Promise<CmsItemResponse> {
  const client = createWebflowClient(token, baseUrl);
  
  const response = await client.collections.items.getItem(collectionId, itemId);
  
  return response as CmsItemResponse;
}
