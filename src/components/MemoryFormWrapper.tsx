/**
 * Memory Form Wrapper - Astro Page Version
 * 
 * This is a wrapper that renders the Memory Form Button + Modal
 * for use within Astro pages (not the embed).
 * 
 * Includes character counting functionality and R2 upload integration.
 */

import { useState, useEffect, useRef } from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { MemoryFormButton } from '../site-components/MemoryFormButton';
import { MemoryForm } from '../site-components/MemoryForm';
import { PhotoUploadButton } from './PhotoUploadButton';
import { VideoUploadButton } from './VideoUploadButton';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { generateSlug } from '../lib/memory-form-utils';
import type { CmsItemResponse } from '../lib/memory-form-types';

interface MemoryFormWrapperProps {
  collectionId: string;
  localeId?: string;
  buttonText?: string;
  buttonVariant?: 'Ocean Teal' | 'Slate Navy';
  baseUrl?: string; // Added: base URL for API calls
  onSuccess?: (data: CmsItemResponse) => void;
  onError?: (error: Error) => void;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: CmsItemResponse;
  error?: string;
  errors?: string[];
  details?: string;
}

export function MemoryFormWrapper({
  collectionId,
  localeId,
  buttonText = 'Share a Memory',
  buttonVariant = 'Ocean Teal',
  baseUrl = '', // Default to empty string for relative paths
  onSuccess,
  onError,
}: MemoryFormWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    itemData?: CmsItemResponse;
  }>({ type: null, message: '' });

  const containerRef = useRef<HTMLDivElement>(null);
  const maxChars = 5000;

  // Log the collection ID on mount for debugging
  useEffect(() => {
    console.log('🔍 MemoryFormWrapper initialized with collectionId:', collectionId);
  }, [collectionId]);

  // Character counter effect
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Small delay to ensure the form is fully rendered
    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      const textarea = containerRef.current.querySelector('textarea[name="memory_detail"]') as HTMLTextAreaElement;
      const charCountLabel = containerRef.current.querySelector('.message-input_characters_count strong') as HTMLElement;

      if (!textarea || !charCountLabel) {
        console.warn('Character counter: Could not find textarea or label');
        return;
      }

      // Function to update character count
      const updateCharCount = () => {
        const count = textarea.value.length;
        charCountLabel.textContent = `CHARACTERS: ${count} / ${maxChars}`;
        
        // Get CSS variable values from the document
        const styles = getComputedStyle(document.documentElement);
        
        // Visual feedback when approaching limit using Webflow colors
        if (count > maxChars * 0.9) {
          // 90%+: Use destructive color from Webflow design system
          const destructiveColor = styles.getPropertyValue('--_apps---colors--destructive').trim();
          charCountLabel.style.color = destructiveColor || '#D9534F';
        } else if (count > maxChars * 0.75) {
          // 75%+: Use primary color from Webflow design system
          const primaryColor = styles.getPropertyValue('--_apps---colors--primary').trim();
          charCountLabel.style.color = primaryColor || '#C98769';
        } else {
          // Default: Use muted-foreground from Webflow design system
          charCountLabel.style.color = '';
        }
      };

      // Set initial count
      updateCharCount();

      // Add event listener
      textarea.addEventListener('input', updateCharCount);

      // Cleanup
      return () => {
        textarea.removeEventListener('input', updateCharCount);
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Form submission handler - attached to the Webflow form element
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      const form = containerRef.current.querySelector('form[name="wf-form-Share-Your-Memory"]') as HTMLFormElement;
      if (!form) {
        console.warn('Could not find Webflow form element');
        return;
      }

      const handleSubmit = async (event: Event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: '' });

        try {
          const formData = new FormData(form);

          console.log('📤 Form submission starting...');
          console.log('📋 Using collectionId from props:', collectionId);

          // ALWAYS use the collection ID from props - ignore any form values
          formData.set('collection_id', collectionId);
          console.log('✅ Set collection_id to:', collectionId);

          if (localeId) {
            formData.set('locale_id', localeId);
            console.log('✅ Set locale_id to:', localeId);
          }

          // Auto-generate slug from name if not provided
          const name = formData.get('memory_name') as string;
          let slug = formData.get('slug') as string;
          if (name && (!slug || slug.trim() === '')) {
            slug = generateSlug(name);
            formData.set('slug', slug);
            console.log('✅ Generated slug:', slug);
          }

          // Debug: Log all form data
          console.log('📋 Final form data:');
          for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
              console.log(`  ${key}: ${value}`);
            } else {
              console.log(`  ${key}: [File]`);
            }
          }

          const response = await fetch(`${baseUrl}/api/memory`, {
            method: 'POST',
            body: formData,
          });

          const result: ApiResponse = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.errors?.join(', ') ||
                result.error ||
                'Failed to submit memory'
            );
          }

          setSubmitStatus({
            type: 'success',
            message: result.message || 'Memory saved successfully!',
            itemData: result.data,
          });

          if (onSuccess && result.data) {
            onSuccess(result.data);
          }

          form.reset();

          setTimeout(() => {
            handleCloseModal();
          }, 2000);
        } catch (error: any) {
          console.error('❌ Form submission error:', error);

          setSubmitStatus({
            type: 'error',
            message:
              error?.message || 'An error occurred while saving your memory',
          });

          if (onError) {
            onError(error);
          }
        } finally {
          setIsSubmitting(false);
        }
      };

      form.addEventListener('submit', handleSubmit);

      return () => {
        form.removeEventListener('submit', handleSubmit);
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isOpen, collectionId, localeId, baseUrl, onSuccess, onError]);

  const handleOpenModal = () => {
    // Reset all state when opening
    setIsOpen(true);
    setSubmitStatus({ type: null, message: '' });
    setIsSubmitting(false);
    
    // Reset form after it renders
    setTimeout(() => {
      if (containerRef.current) {
        const form = containerRef.current.querySelector('form[name="wf-form-Share-Your-Memory"]') as HTMLFormElement;
        if (form) {
          form.reset();
        }
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    // Reset state when closing
    setSubmitStatus({ type: null, message: '' });
    setIsSubmitting(false);
  };

  return (
    <DevLinkProvider>
      {/* Trigger Button */}
      <div onClick={handleOpenModal} style={{ cursor: 'pointer' }}>
        <MemoryFormButton
          buttonButtonText={buttonText}
          variant={buttonVariant}
        />
      </div>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        }
      }}>
        <DialogContent className="!w-[95vw] !max-w-[1000px] !h-[95vh] !p-0 overflow-y-auto">
          {/* Accessible (but visually hidden) title for Radix + screen readers */}
          <DialogTitle className="sr-only">
            Share a Memory
          </DialogTitle>
  		  <DialogDescription className="sr-only">
    	    Use this form to share a memory, story, or message. Required fields include your name, email, memory, and date.
  		  </DialogDescription>
          
          <div ref={containerRef} className="h-full">
            {/* Success Message */}
            {submitStatus.type === 'success' && (
              <div style={{
                backgroundColor: 'var(--_apps---colors--background-forms)',
                border: `1px solid var(--_apps---colors--border)`,
                borderRadius: 'var(--_apps---sizes--radius)',
                padding: '1rem',
                margin: '1rem'
              }}>
                <p style={{ 
                  color: 'var(--_apps---colors--foreground)',
                  fontFamily: 'var(--_apps---typography--body-font)',
                  fontWeight: 600
                }}>
                  ✓ {submitStatus.message}
                </p>
                {submitStatus.itemData && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--_apps---colors--muted-foreground)',
                    fontFamily: 'var(--_apps---typography--body-font)'
                  }}>
                    <p>Item ID: {submitStatus.itemData.id}</p>
                    <p>Slug: {submitStatus.itemData.fieldData?.slug}</p>
                    {submitStatus.itemData.createdOn && (
                      <p>
                        Created:{' '}
                        {new Date(
                          submitStatus.itemData.createdOn
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {submitStatus.type === 'error' && (
              <div style={{
                backgroundColor: 'var(--_apps---colors--background-forms)',
                border: `1px solid var(--_apps---colors--destructive)`,
                borderRadius: 'var(--_apps---sizes--radius)',
                padding: '1rem',
                margin: '1rem'
              }}>
                <p style={{ 
                  color: 'var(--_apps---colors--destructive)',
                  fontFamily: 'var(--_apps---typography--body-font)',
                  fontWeight: 600
                }}>
                  ✗ {submitStatus.message}
                </p>
              </div>
            )}

            {/* Form - No wrapper form element, uses the Webflow form directly */}
            <MemoryForm
              submitButtonText={
                isSubmitting ? 'Submitting...' : 'Submit Memory'
              }
              submitButtonColorVariant={buttonVariant}
              memoryNameFieldFormInputId="memory_name"
              firstNameFieldFormInputId="first_name"
              lastNameFieldFormInputId="last_name"
              emailFormFieldFormInputId="email"
              memoryDetailFieldFormInputId="memory_detail"
              memoryDateFieldFormInputId="memory_date"
              memoryLocationFieldFormInputId="memory_location"
              tag1FieldFormInputId="memory_tag_1"
              tag2FieldFormInputId="memory_tag_2"
              tag3FieldFormInputId="memory_tag_3"
              contentFromLinkFieldId="content_link"
              submitButtonSubmitButtonId="submit-button"
              imageUploadFieldImageUploadSlot={
                <PhotoUploadButton 
                  baseUrl={baseUrl}
                  inputName="photo"
                />
              }
              videoUploadFieldVideoUploadSlot={
                <VideoUploadButton 
                  baseUrl={baseUrl}
                  inputName="video"
                />
              }
            />
          </div>

          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: 'var(--_apps---colors--primary)' }}
                />
                <p 
                  className="text-sm"
                  style={{ 
                    color: 'var(--_apps---colors--muted-foreground)',
                    fontFamily: 'var(--_apps---typography--body-font)'
                  }}
                >
                  Saving your memory...
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DevLinkProvider>
  );
}
