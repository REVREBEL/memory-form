/**
 * Memory Retrieval API Route
 * 
 * POST /api/memory-retrieve
 * Requires slug, email, and edit-code for security
 */

import type { APIRoute } from 'astro';
import { findMemoryByCredentials } from '../../lib/memory-cms-api';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { collectionId, slug, email, editCode } = body;
    
    if (!collectionId || !slug || !email || !editCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required credentials'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const memory = await findMemoryByCredentials(
      collectionId,
      slug.trim(),
      email.trim().toLowerCase(),
      editCode.trim().toUpperCase(),
      locals
    );
    
    if (!memory) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid credentials'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, data: memory }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Memory retrieval error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
