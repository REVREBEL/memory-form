/**
 * Memory Form Types
 * 
 * Type definitions for the Memory Form application
 */

export interface MemoryFormValues {
  // System/Meta fields
  name: string;
  slug: string;
  collectionId: string;
  localeId?: string;
  itemId?: string;
  archived: boolean;
  draft: boolean;
  
  // Custom fields (matching CMS schema)
  'memory-name': string;
  'first-name': string;
  'last-name': string;
  'email-address': string; // CMS field name
  'edit-code': string;
  memory: string;
  'memory-date': string;
  location: string;
  'tag-1'?: string;
  'tag-2'?: string;
  'tag-3'?: string;
  photo?: string;
  video?: string;
  'video-link'?: string;
  'content-link'?: string;
}

export interface CmsItemPayload {
  fieldData: {
    name: string;
    slug: string;
    'memory-name'?: string;
    'first-name'?: string;
    'last-name'?: string;
    'email-address'?: string; // CMS field name
    'edit-code'?: string;
    memory?: string;
    'memory-date'?: string;
    location?: string;
    'tag-1'?: string;
    'tag-2'?: string;
    'tag-3'?: string;
    photo?: string;
    video?: string;
    'video-link'?: string;
    'content-link'?: string;
  };
  isArchived?: boolean;
  isDraft?: boolean;
}

export interface CmsItemResponse {
  id: string;
  cmsLocaleId?: string;
  lastPublished?: string;
  lastUpdated?: string;
  createdOn?: string;
  isArchived?: boolean;
  isDraft?: boolean;
  fieldData: {
    name: string;
    slug: string;
    [key: string]: any;
  };
}

export interface MemoryFormConfig {
  collectionId: string;
  localeId?: string;
  buttonText?: string;
  buttonVariant?: "Warm Sandston" | "Warm Sandston Outline" | "Slate Navy" | "Slate Navy Outline" | "Ocean Teal" | "Ocean Teal Outline" | "Rustwood Red" | "Rustwood Outline";
  onSuccess?: (item: CmsItemResponse) => void;
  onError?: (error: Error) => void;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
}
