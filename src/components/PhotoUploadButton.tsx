/**
 * Photo Upload Button Component
 * 
 * Handles photo file selection and upload to Cloudflare R2
 * Includes automatic compression to ~1MB for optimal performance
 * Displays upload progress and stores the URL in a hidden input
 * Also extracts and stores image dimensions for auto-sizing memory cards
 * 
 * Designed to work as a slot replacement for Webflow Devlink components
 * Relies on Webflow's existing upload styling - this component only handles functionality
 */

import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadFile, validateFile, formatFileSize } from '../lib/upload-utils';

interface PhotoUploadButtonProps {
  baseUrl?: string;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  inputName?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Extract image dimensions from a file
 */
async function getImageDimensions(file: File): Promise<ImageDimensions | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    
    img.src = url;
  });
}

export function PhotoUploadButton({
  baseUrl = '',
  onUploadComplete,
  onUploadError,
  inputName = 'photo'
}: PhotoUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📷 File selected', event.target.files?.[0]);
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    // Validate file type (but not size yet - we'll compress first)
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please select an image.');
      if (onUploadError) onUploadError('Invalid file type');
      return;
    }

    // Extract original dimensions before compression
    const originalDimensions = await getImageDimensions(file);
    if (originalDimensions) {
      console.log('📐 Original image dimensions:', originalDimensions);
      setImageDimensions(originalDimensions);
    }

    let fileToUpload = file;

    // Compress if needed (target: ~1MB)
    const targetSizeMB = 1;
    if (file.size > targetSizeMB * 1024 * 1024) {
      setCompressing(true);
      
      console.log('📷 Original image:', {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });

      try {
        const options = {
          maxSizeMB: targetSizeMB,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg' as const,
        };

        console.log('🔄 Compressing image...');
        fileToUpload = await imageCompression(file, options);
        
        const reduction = ((1 - fileToUpload.size / file.size) * 100).toFixed(1);
        console.log('✅ Compressed image:', {
          name: fileToUpload.name,
          size: formatFileSize(fileToUpload.size),
          reduction: `${reduction}%`
        });
      } catch (err: any) {
        console.error('❌ Compression error:', err);
        setError('Failed to compress image');
        if (onUploadError) onUploadError('Failed to compress image');
        setCompressing(false);
        return;
      } finally {
        setCompressing(false);
      }
    }

    // Final validation with compressed file
    const validation = validateFile(fileToUpload, 'photo');
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      if (onUploadError) onUploadError(validation.error || 'Invalid file');
      return;
    }

    // Upload file
    setUploading(true);
    console.log('📤 Uploading to:', `${baseUrl}/api/upload`);
    try {
      const result = await uploadFile(fileToUpload, 'photo', baseUrl);
      console.log('📷 Upload result:', result);
      
      if (result.success && result.data) {
        setUploadedUrl(result.data.url);
        if (onUploadComplete) onUploadComplete(result.data.url);
        console.log('✅ Photo uploaded successfully:', result.data.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      const errorMsg = err.message || 'Failed to upload photo';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    console.log('📷 Upload area clicked');
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    console.log('📷 Remove clicked');
    e.preventDefault();
    e.stopPropagation();
    setUploadedUrl('');
    setFileName('');
    setImageDimensions(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* File input - click handled by parent Webflow wrapper */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Hidden input to store URL for form submission */}
      <input
        type="hidden"
        name={inputName}
        value={uploadedUrl}
      />

      {/* Hidden input to store image dimensions for auto-sizing */}
      {imageDimensions && (
        <input
          type="hidden"
          name="photo_dimensions"
          value={JSON.stringify(imageDimensions)}
        />
      )}

      {/* Clickable overlay - positioned absolutely to cover the Webflow upload area */}
      <div 
        onClick={handleClick}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'pointer',
          zIndex: 1
        }}
      />

      {/* Status overlay - shows on top of Webflow content */}
      {(compressing || uploading || uploadedUrl || error) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          textAlign: 'center',
          width: '90%',
          pointerEvents: uploadedUrl ? 'auto' : 'none'
        }}>
          {compressing && (
            <div style={{
              color: 'var(--_apps---colors--muted-foreground)',
              fontSize: '0.875rem',
              fontFamily: 'var(--_apps---typography--body-font)',
            }}>
              Compressing...
            </div>
          )}

          {uploading && !compressing && (
            <div style={{
              color: 'var(--_apps---colors--muted-foreground)',
              fontSize: '0.875rem',
              fontFamily: 'var(--_apps---typography--body-font)',
            }}>
              Uploading...
            </div>
          )}

          {uploadedUrl && !uploading && !compressing && (
            <div style={{
              background: 'var(--_apps---colors--background)',
              padding: '0.75rem',
              borderRadius: 'var(--_apps---sizes--radius)',
              border: '1px solid var(--_apps---colors--border)',
            }}>
              <div style={{ 
                color: 'var(--_apps---colors--primary)',
                fontWeight: 600,
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--_apps---typography--body-font)',
              }}>
                ✓ Photo uploaded
              </div>
              <div style={{
                color: 'var(--_apps---colors--muted-foreground)',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                marginBottom: '0.5rem',
                fontFamily: 'var(--_apps---typography--body-font)',
              }}>
                {fileName}
                {imageDimensions && (
                  <span style={{ display: 'block', marginTop: '0.25rem' }}>
                    {imageDimensions.width} × {imageDimensions.height}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--_apps---colors--destructive)',
                  background: 'var(--_apps---colors--background)',
                  border: '1px solid var(--_apps---colors--destructive)',
                  borderRadius: 'var(--_apps---sizes--radius)',
                  cursor: 'pointer',
                  fontFamily: 'var(--_apps---typography--button-font)',
                  pointerEvents: 'auto'
                }}
              >
                Remove
              </button>
            </div>
          )}

          {error && !uploading && !compressing && (
            <div style={{
              color: 'var(--_apps---colors--destructive)',
              fontSize: '0.75rem',
              fontFamily: 'var(--_apps---typography--body-font)',
              background: 'var(--_apps---colors--background)',
              padding: '0.5rem',
              borderRadius: 'var(--_apps---sizes--radius)',
            }}>
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
}
