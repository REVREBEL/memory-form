/**
 * Memory Form Button Wrapper - Pure Webflow Version
 * 
 * Zero dependencies on Tailwind/shadcn/Radix UI
 * Only uses Webflow components + native HTML dialog
 */

import { useState, useEffect, useRef } from 'react';
import { DevLinkProvider } from '../src/site-components/DevLinkProvider';
import { MemoryFormButton } from '../src/site-components/MemoryFormButton';
import { MemoryForm } from '../src/site-components/MemoryForm';
import { PhotoUploadButton } from '../src/components/PhotoUploadButton';
import { VideoUploadButton } from '../src/components/VideoUploadButton';
import { generateSlug } from '../src/lib/memory-form-utils';
import type { CmsItemResponse } from '../src/lib/memory-form-types';

interface MemoryFormWrapperProps {
  collectionId: string;
  localeId?: string;
  buttonText?: string;
  buttonVariant?: 
    | "Warm Sandston"
    | "Warm Sandston Outline" 
    | "Slate Navy"
    | "Slate Navy Outline"
    | "Ocean Teal"
    | "Ocean Teal Outline"
    | "Rustwood Red"
    | "Rustwood Outline";
  baseUrl?: string;
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

export function MemoryFormButtonWrapper({
  collectionId,
  localeId,
  buttonText = 'Share a Memory',
  buttonVariant = 'Ocean Teal',
  baseUrl = '',
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

  const dialogRef = useRef<HTMLDialogElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxChars = 5000;

  // Log the collection ID on mount for debugging
  useEffect(() => {
    console.log('🔍 MemoryFormButtonWrapper initialized with collectionId:', collectionId);
  }, [collectionId]);

  // Native dialog management
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Character counter setup
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      const form = containerRef.current.querySelector('form[name="wf-form-Share-Your-Memory"]') as HTMLFormElement;
      if (!form) {
        console.warn('⚠️ Could not find Webflow form element');
        return;
      }

      // Setup character counter
      const textarea = form.querySelector('textarea[name="memory_detail"]') as HTMLTextAreaElement;
      const charCountLabel = form.querySelector('.message-input_characters_count strong') as HTMLElement;

      if (textarea && charCountLabel) {
        const updateCharCount = () => {
          const count = textarea.value.length;
          charCountLabel.textContent = `CHARACTERS: ${count} / ${maxChars}`;
          
          const styles = getComputedStyle(document.documentElement);
          
          if (count > maxChars * 0.9) {
            const destructiveColor = styles.getPropertyValue('--_apps---colors--destructive').trim();
            charCountLabel.style.color = destructiveColor || '#D9534F';
          } else if (count > maxChars * 0.75) {
            const primaryColor = styles.getPropertyValue('--_apps---colors--primary').trim();
            charCountLabel.style.color = primaryColor || '#C98769';
          } else {
            charCountLabel.style.color = '';
          }
        };

        updateCharCount();
        textarea.addEventListener('input', updateCharCount);

        return () => {
          textarea.removeEventListener('input', updateCharCount);
        };
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Form submission handler
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const timeoutId = setTimeout(() => {
      if (!containerRef.current) return;

      const form = containerRef.current.querySelector('form[name="wf-form-Share-Your-Memory"]') as HTMLFormElement;
      if (!form) {
        console.warn('⚠️ Could not find Webflow form element for submission handler');
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

          // Add collection_id directly from props (no hidden field needed)
          formData.set('collection_id', collectionId);
          console.log('✅ Set collection_id to:', collectionId);
          
          // Add locale_id if provided
          if (localeId) {
            formData.set('locale_id', localeId);
            console.log('✅ Set locale_id to:', localeId);
          }

          // Generate slug from memory-name
          const memoryName = formData.get('memory_name') as string;
          if (memoryName) {
            const slug = generateSlug(memoryName);
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

      {/* Native Dialog Modal */}
      <dialog 
        ref={dialogRef}
        style={{
          width: '95vw',
          maxWidth: '1000px',
          height: '95vh',
          padding: 0,
          border: 'none',
          borderRadius: 'var(--_apps---sizes--radius)',
          backgroundColor: 'var(--_apps---colors--background)',
          overflow: 'auto',
        }}
        onClose={handleCloseModal}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleCloseModal}
          style={{
            position: 'sticky',
            top: '1rem',
            right: '1rem',
            float: 'right',
            width: '2rem',
            height: '2rem',
            border: 'none',
            background: 'var(--_apps---colors--muted)',
            color: 'var(--_apps---colors--foreground)',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            zIndex: 10,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div ref={containerRef} style={{ height: '100%' }}>
          {/* Success Message */}
          {submitStatus.type === 'success' && (
            <div style={{
              backgroundColor: 'var(--_apps---colors--accent)',
              border: '1px solid var(--_apps---colors--border)',
              borderRadius: 'var(--_apps---sizes--radius)',
              padding: '1rem',
              margin: '1rem'
            }}>
              <p style={{ 
                color: 'var(--_apps---colors--foreground)',
                fontFamily: 'var(--_apps---typography--body-font)',
                fontWeight: 600,
                margin: 0
              }}>
                ✓ {submitStatus.message}
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitStatus.type === 'error' && (
            <div style={{
              backgroundColor: 'var(--_apps---colors--secondary)',
              border: '1px solid var(--_apps---colors--destructive)',
              borderRadius: 'var(--_apps---sizes--radius)',
              padding: '1rem',
              margin: '1rem'
            }}>
              <p style={{ 
                color: 'var(--_apps---colors--destructive)',
                fontFamily: 'var(--_apps---typography--body-font)',
                fontWeight: 600,
                margin: 0
              }}>
                ✗ {submitStatus.message}
              </p>
            </div>
          )}

          {/* Form - No hidden collection_id field needed */}
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
            contentLinkFieldFormInputId="content_link"
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
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(245, 241, 235, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--_apps---sizes--radius)',
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}>
              <div 
                className="spinner"
                style={{ 
                  width: '3rem',
                  height: '3rem',
                  border: '3px solid transparent',
                  borderTopColor: 'var(--_apps---colors--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p style={{ 
                fontSize: '0.875rem',
                color: 'var(--_apps---colors--muted-foreground)',
                fontFamily: 'var(--_apps---typography--body-font)',
                margin: 0
              }}>
                Saving your memory...
              </p>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
          }
        `}</style>
      </dialog>
    </DevLinkProvider>
  );
}

// Mount function for embed usage
export function mountMemoryFormButtonWrapper(
  element: HTMLElement,
  props: Omit<MemoryFormWrapperProps, 'collectionId'> & { collectionId?: string }
) {
  // Get collection ID from props or data attribute
  // IMPORTANT: You MUST provide collectionId via props or data-collection-id attribute
  const collectionId = props.collectionId || element.getAttribute('data-collection-id');
  
  if (!collectionId) {
    console.error('❌ Memory Form Error: collectionId is required. Please provide it via props or data-collection-id attribute.');
    throw new Error('collectionId is required for Memory Form');
  }
  
  // Get base URL from data attribute or use current origin + path
  const baseUrl = element.getAttribute('data-base-url') || 
                  (typeof window !== 'undefined' ? window.location.origin + '/memory-form' : '');

  const componentProps: MemoryFormWrapperProps = {
    collectionId,
    localeId: props.localeId,
    buttonText: props.buttonText || 'Share a Memory',
    buttonVariant: props.buttonVariant || 'Ocean Teal',
    baseUrl,
    onSuccess: props.onSuccess,
    onError: props.onError,
  };

  // Dynamic import of React DOM to keep bundle size down
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(element);
    root.render(<MemoryFormButtonWrapper {...componentProps} />);
  });
}
