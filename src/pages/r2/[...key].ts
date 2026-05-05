/**
 * R2 File Serving Route
 * 
 * GET /r2/{key}
 * Serves files from Cloudflare R2 storage (Webflow Cloud Media)
 * 
 * Following Webflow Cloud's Object Storage pattern:
 * https://developers.webflow.com/webflow-cloud/storing-data/object-storage
 * 
 * This route handles public access to uploaded files stored in R2.
 * Files are accessed via: /r2/photo/{filename} or /r2/video/{filename}
 */

import type { APIRoute } from 'astro';
import type { R2Bucket, R2Object } from '@cloudflare/workers-types';

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Get R2 bucket from locals runtime env
    const env = (locals as any)?.runtime?.env;
    const bucket = env?.WEBFLOW_CLOUD_MEDIA as R2Bucket;
    
    if (!bucket) {
      return new Response('R2 storage not configured', { status: 500 });
    }

    // Get the file key from params (everything after /r2/)
    const key = params.key;
    
    if (!key) {
      return new Response('File key not provided', { status: 400 });
    }

    console.log(`📥 Fetching R2 object: ${key}`);

    // Fetch the object from R2
    const object = await bucket.get(key);

    if (!object) {
      console.log(`❌ File not found: ${key}`);
      return new Response('File not found', { status: 404 });
    }

    // Get the file content
    const body = await object.arrayBuffer();

    // Get content type from httpMetadata or fall back to octet-stream
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';

    console.log(`✅ Serving file: ${key} (${(object.size / 1024 / 1024).toFixed(2)}MB, ${contentType})`);

    // Return the file with appropriate headers
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': object.etag,
        ...(object.httpMetadata?.contentDisposition && {
          'Content-Disposition': object.httpMetadata.contentDisposition
        })
      }
    });

  } catch (error: any) {
    console.error('❌ R2 fetch error:', error);
    return new Response(`Failed to fetch file: ${error.message}`, { status: 500 });
  }
};
