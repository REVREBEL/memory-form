// Base URL handling for both server and client contexts
// In Astro server context, import.meta.env.BASE_URL is available
// In client-only React components, it may not be, so we provide safe defaults

function getBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && 
      typeof import.meta.env !== 'undefined' && 
      import.meta.env.BASE_URL) {
    return import.meta.env.BASE_URL.replace(/\/$/, '');
  }
  return '';
}

export const baseUrl = getBaseUrl();
