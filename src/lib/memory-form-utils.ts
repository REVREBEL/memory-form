/**
 * Memory Form Utilities
 * 
 * Validation and helper functions for the memory form.
 */

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate memory form data
 * 
 * Validates the required fields for creating/updating a memory item.
 * Field names should match the CMS slugs (hyphenated versions).
 * 
 * Based on collection: Memory Journals (693a599cb78b2b97a36ef963)
 * Required fields:
 * - name (maps from memory_name)
 * - email
 * - memory-detail (maps from memory_detail)
 * - memory-date (maps from memory_date)
 */
export function validateMemoryForm(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Validate name (required) - CMS slug: name
  const name = formData.get('name') as string;
  if (!name || name.trim() === '') {
    errors.name = 'Memory name is required';
  }
  
  // Validate email (required) - CMS slug: email
  const email = formData.get('email') as string;
  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate memory detail (required) - CMS slug: memory-detail
  const memoryDetail = formData.get('memory-detail') as string;
  if (!memoryDetail || memoryDetail.trim() === '') {
    errors['memory-detail'] = 'Memory detail is required';
  }
  
  // Validate memory date (required) - CMS slug: memory-date
  // NOTE: Date validation is flexible - will be formatted in API route
  const memoryDate = formData.get('memory-date') as string;
  if (!memoryDate || memoryDate.trim() === '') {
    errors['memory-date'] = 'Memory date is required';
  }
  // Don't validate format here - let formatDate handle it
  
  // Validate collection ID (required)
  const collectionId = formData.get('collection-id') as string;
  if (!collectionId || collectionId.trim() === '') {
    errors['collection-id'] = 'Collection ID is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date to YYYY-MM-DD format
 * Accepts various input formats:
 * - "June 1971" → "1971-06-01"
 * - "June 01, 1971" → "1971-06-01"
 * - "06-01-1971" → "1971-06-01"
 * - "06/01/1971" → "1971-06-01"
 * - "1971-06-01" → "1971-06-01" (already formatted)
 * 
 * If day is missing, defaults to the 1st of the month.
 */
export function formatDate(dateInput: string): string | null {
  try {
    if (!dateInput || dateInput.trim() === '') {
      return null;
    }
    
    const trimmed = dateInput.trim();
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Month name formats: "June 1971" or "June 01, 1971"
    const monthNameMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})?[,\s]*(\d{4})$/);
    if (monthNameMatch) {
      const [, monthName, day, year] = monthNameMatch;
      const monthMap: Record<string, string> = {
        january: '01', jan: '01',
        february: '02', feb: '02',
        march: '03', mar: '03',
        april: '04', apr: '04',
        may: '05',
        june: '06', jun: '06',
        july: '07', jul: '07',
        august: '08', aug: '08',
        september: '09', sep: '09', sept: '09',
        october: '10', oct: '10',
        november: '11', nov: '11',
        december: '12', dec: '12'
      };
      
      const month = monthMap[monthName.toLowerCase()];
      if (month) {
        const dayPadded = day ? String(day).padStart(2, '0') : '01';
        return `${year}-${month}-${dayPadded}`;
      }
    }
    
    // Slash format: "06/01/1971" or "6/1/1971"
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, month, day, year] = slashMatch;
      const monthPadded = String(month).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      return `${year}-${monthPadded}-${dayPadded}`;
    }
    
    // Dash format: "06-01-1971" or "6-1-1971"
    const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dashMatch) {
      const [, month, day, year] = dashMatch;
      const monthPadded = String(month).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      return `${year}-${monthPadded}-${dayPadded}`;
    }
    
    // Just month and year: "June 1971" (no day)
    const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const [, monthName, year] = monthYearMatch;
      const monthMap: Record<string, string> = {
        january: '01', jan: '01',
        february: '02', feb: '02',
        march: '03', mar: '03',
        april: '04', apr: '04',
        may: '05',
        june: '06', jun: '06',
        july: '07', jul: '07',
        august: '08', aug: '08',
        september: '09', sep: '09', sept: '09',
        october: '10', oct: '10',
        november: '11', nov: '11',
        december: '12', dec: '12'
      };
      
      const month = monthMap[monthName.toLowerCase()];
      if (month) {
        return `${year}-${month}-01`;
      }
    }
    
    // Numeric month/year: "06/1971" or "6-1971"
    const monthYearNumMatch = trimmed.match(/^(\d{1,2})[\/-](\d{4})$/);
    if (monthYearNumMatch) {
      const [, month, year] = monthYearNumMatch;
      const monthPadded = String(month).padStart(2, '0');
      return `${year}-${monthPadded}-01`;
    }
    
    // Try native Date parsing as last resort
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate a URL-safe slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagsString: string): string[] {
  if (!tagsString || tagsString.trim() === '') {
    return [];
  }
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');
}

/**
 * Format tags as comma-separated string
 */
export function formatTags(tags: string[]): string {
  return tags.filter(tag => tag.trim() !== '').join(', ');
}
