/**
 * Upload Utilities
 * 
 * Helper functions for uploading files to Cloudflare R2
 * 
 * Size Limits:
 * - Images: 1.5MB max (client compresses to ~1MB first)
 * - Videos: 10MB max
 */

export interface UploadResponse {
  success: boolean;
  data?: {
    fileName: string;
    url: string;
    type: string;
    size: number;
    originalName: string;
  };
  error?: string;
}

/**
 * Upload a file to Cloudflare R2 storage
 * @param file - The file to upload
 * @param type - The file type ('photo' or 'video')
 * @param baseUrl - The base URL for API calls
 * @returns Upload response with URL
 */
export async function uploadFile(
  file: File,
  type: 'photo' | 'video',
  baseUrl: string = ''
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    const result: UploadResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload file'
    };
  }
}

/**
 * Validate file type and size before upload
 */
export function validateFile(
  file: File,
  type: 'photo' | 'video'
): { valid: boolean; error?: string } {
  // Size limits per type
  const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB
  const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
  
  const ALLOWED_TYPES = {
    photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg']
  };

  const MAX_SIZE = type === 'photo' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  // Check file type
  if (!ALLOWED_TYPES[type].includes(file.type)) {
    return {
      valid: false,
      error: `Invalid ${type} type. Allowed: ${ALLOWED_TYPES[type].join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxSizeMB = (MAX_SIZE / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `File too large: ${sizeMB}MB. Max: ${maxSizeMB}MB${type === 'photo' ? '. Image should be compressed automatically.' : ''}`
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
