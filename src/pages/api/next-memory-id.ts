/**
 * Next Memory ID API Route
 * 
 * GET /api/next-memory-id?collectionId=xxx
 * - Returns the next sequential memory_id for the collection
 * - Used when opening the form to pre-populate the next ID
 */

import type { APIRoute } from 'astro';
import { getNextMemoryId } from '../../lib/memory-cms-api';

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const collectionId = url.searchParams.get('collectionId');
    
    if (!collectionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'collectionId parameter is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const nextId = await getNextMemoryId(collectionId, locals);
    
    return new Response(
      JSON.stringify({
        success: true,
        memoryId: nextId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Next Memory ID API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to get next memory ID'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
