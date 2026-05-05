/**
 * File Upload API Route
 * 
 * POST /api/upload
 * Uploads photos and videos to Cloudflare R2 storage (Webflow Cloud Media)
 * Returns public URL for the uploaded file
 * 
 * Following Webflow Cloud's Object Storage pattern:
 * https://developers.webflow.com/webflow-cloud/storing-data/object-storage
 * 
 * Webflow Cloud automatically provides:
 * - R2 bucket binding: WEBFLOW_CLOUD_MEDIA
 * - Public access through: env.ASSETS.fetch()
 * - Automatic serving at: /r2/{key}
 * 
 * File Size Limits:
 * - Images: 1.5MB max (client compresses to ~1MB, server allows 1.5MB buffer)
 * - Videos: 10MB max
 */

import type { APIRoute } from 'astro';
import type { R2Bucket } from '@cloudflare/workers-types';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mpeg'];

// File size limits
const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB (buffer for compression variance)
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB absolute max

/**
 * Extract image dimensions from the file
 * Returns { width, height } or null if unable to determine
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    // Convert file to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    
    // Create an image element to load the file
    // Note: This works in Workers because we're using the same Image API
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    // Use the Image constructor if available (Cloudflare Workers supports this)
    if (typeof Image !== 'undefined') {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = dataUrl;
      });
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to extract image dimensions:', error);
    return null;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get R2 bucket from locals runtime env (Webflow Cloud pattern)
    const env = (locals as any)?.runtime?.env;
    const bucket = env?.WEBFLOW_CLOUD_MEDIA as R2Bucket;
    
    if (!bucket) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'R2 storage not configured. WEBFLOW_CLOUD_MEDIA binding not found.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'photo' or 'video'
    
    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No file provided'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const isPhoto = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    
    if (!isPhoto && !isVideo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type matches the declared type
    if (fileType === 'photo' && !isPhoto) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'File type mismatch: expected photo'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (fileType === 'video' && !isVideo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'File type mismatch: expected video'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size based on type
    const maxSize = isPhoto ? MAX_IMAGE_SIZE : (isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE);
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      return new Response(
        JSON.stringify({
          success: false,
          error: `File too large: ${sizeMB}MB. Max size for ${fileType}s is ${maxSizeMB}MB. ${isPhoto ? 'Please ensure image compression is enabled.' : ''}`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract image dimensions if it's a photo
    let dimensions: { width: number; height: number } | null = null;
    if (isPhoto) {
      dimensions = await getImageDimensions(file);
      if (dimensions) {
        console.log(`📐 Image dimensions: ${dimensions.width}x${dimensions.height}`);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'bin';
    const key = `${fileType}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert file to ArrayBuffer for R2
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to R2 using Webflow Cloud's recommended pattern
    const result = await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        ...(dimensions && {
          width: dimensions.width.toString(),
          height: dimensions.height.toString()
        })
      }
    });

    if (!result) {
      throw new Error('Upload failed due to precondition');
    }

    // According to Webflow Cloud docs, R2 files are served through /r2/{key}
    // But for CMS image fields, we need to provide the FULL public URL
    // Webflow Cloud serves them at: {app-base-url}/r2/{key}
    
    // Get the base URL from the request
    const url = new URL(request.url);
    const origin = url.origin;
    const pathname = url.pathname;
    
    // Extract the base path (everything before /api/upload)
    const basePath = pathname.replace(/\/api\/upload$/, '');
    
    // Construct the full public URL
    const publicUrl = `${origin}${basePath}/r2/${key}`;
    
    console.log(`✅ File uploaded successfully: ${key} (${(result.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`📍 Public URL: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          key: result.key,
          url: publicUrl,
          type: file.type,
          size: result.size,
          originalName: file.name,
          uploaded: result.uploaded,
          ...(dimensions && { dimensions })
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to upload file'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
