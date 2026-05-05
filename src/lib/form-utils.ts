/**
 * Form Utilities
 * Helpers for form validation, slug generation, and data parsing
 */

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a string value to boolean
 */
export function parseBoolean(value: string | boolean | null | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  
  const normalized = String(value).toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * Validate and format ISO date string
 */
export function formatISODate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Validate URL format
 */
export function isValidUrl(value: string | null | undefined): boolean {
  if (!value) return true; // Empty is valid (optional field)
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(value: string | null | undefined): boolean {
  if (!value) return true; // Empty is valid if field is optional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Get form field value by ID or name
 */
export function getFormValue(form: HTMLFormElement, fieldId: string): string {
  const field = form.querySelector(
    `#${fieldId}, [name="${fieldId}"]`
  ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  
  if (!field) return '';
  
  if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    return field.checked ? 'true' : 'false';
  }
  
  return field.value.trim();
}

/**
 * Set form field value by ID or name
 */
export function setFormValue(form: HTMLFormElement, fieldId: string, value: string): void {
  const field = form.querySelector(
    `#${fieldId}, [name="${fieldId}"]`
  ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  
  if (!field) return;
  
  if (field instanceof HTMLInputElement && field.type === 'checkbox') {
    field.checked = parseBoolean(value);
  } else {
    field.value = value;
  }
}

/**
 * Show validation error for a field
 */
export function showFieldError(form: HTMLFormElement, fieldId: string, message: string): void {
  const field = form.querySelector(
    `#${fieldId}, [name="${fieldId}"]`
  ) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  
  if (!field) return;
  
  // Remove existing error
  const existingError = field.parentElement?.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Add error message
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.style.color = 'red';
  errorElement.style.fontSize = '0.875rem';
  errorElement.style.marginTop = '0.25rem';
  errorElement.textContent = message;
  
  field.parentElement?.appendChild(errorElement);
  
  // Add error styling to field
  field.style.borderColor = 'red';
}

/**
 * Clear all field errors
 */
export function clearFieldErrors(form: HTMLFormElement): void {
  const errors = form.querySelectorAll('.field-error');
  errors.forEach(error => error.remove());
  
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach(field => {
    (field as HTMLElement).style.borderColor = '';
  });
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate required fields
 */
export function validateForm(form: HTMLFormElement): ValidationResult {
  const errors: Record<string, string> = {};
  // Required fields
  const memoryName = getFormValue(form, 'memory_name');
  if (!memoryName) {
    errors['memory_name'] = 'Name is required';
  }
  
  const memoryDetail = getFormValue(form, 'memory_detail');
  if (!memoryDetail) {
    errors['memory_detail'] = 'Memory is required';
  }
  
  const memoryDate = getFormValue(form, 'memory_date');
  if (!memoryDate) {
    errors['memory_date'] = 'Memory date is required';
  } else if (!formatISODate(memoryDate)) {
    errors['memory_date'] = 'Invalid date format';
  }
  
  const email = getFormValue(form, 'email');
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }
  
  const collectionId = getFormValue(form, 'collection_id');
  if (!collectionId) {
    errors['collection_id'] = 'Collection ID is required';
  }
  
  // Optional URL validation
  const videoLink = getFormValue(form, 'video_link');
  if (videoLink && !isValidUrl(videoLink)) {
    errors['video_link'] = 'Invalid URL format';
  }
  
  const contentLink = getFormValue(form, 'content_link');
  if (contentLink && !isValidUrl(contentLink)) {
    errors['content_link'] = 'Invalid URL format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
