/**
 * Video Upload Button Component
 * 
 * Handles video file selection and upload to Cloudflare R2
 * Supports MP4, MOV, AVI, WebM (max 10MB)
 * Displays upload progress and stores the URL in a hidden input
 * 
 * Designed to work as a slot replacement for Webflow Devlink components
 * Relies on Webflow's existing upload styling - this component only handles functionality
 */

import { useState, useRef } from 'react';
import { uploadFile, validateFile, formatFileSize } from '../lib/upload-utils';

interface VideoUploadButtonProps {
  baseUrl?: string;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  inputName?: string;
}

export function VideoUploadButton({
  baseUrl = '',
  onUploadComplete,
  onUploadError,
  inputName = 'video'
}: VideoUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎥 File selected', event.target.files?.[0]);
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    // Validate file
    const validation = validateFile(file, 'video');
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      if (onUploadError) onUploadError(validation.error || 'Invalid file');
      return;
    }

    console.log('🎥 Selected video:', {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type
    });

    // Upload file
    setUploading(true);
    console.log('📤 Uploading to:', `${baseUrl}/api/upload`);
    try {
      const result = await uploadFile(file, 'video', baseUrl);
      console.log('🎥 Upload result:', result);
      
      if (result.success && result.data) {
        setUploadedUrl(result.data.url);
        if (onUploadComplete) onUploadComplete(result.data.url);
        console.log('✅ Video uploaded successfully:', result.data.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      const errorMsg = err.message || 'Failed to upload video';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    console.log('🎥 Upload area clicked');
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    console.log('🎥 Remove clicked');
    e.preventDefault();
    e.stopPropagation();
    setUploadedUrl('');
    setFileName('');
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
        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Hidden input to store URL for form submission */}
      <input
        type="hidden"
        name={inputName}
        value={uploadedUrl}
      />

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
      {(uploading || uploadedUrl || error) && (
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
          {uploading && (
            <div style={{
              color: 'var(--_apps---colors--muted-foreground)',
              fontSize: '0.875rem',
              fontFamily: 'var(--_apps---typography--body-font)',
            }}>
              Uploading...
            </div>
          )}

          {uploadedUrl && !uploading && (
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
                ✓ Video uploaded
              </div>
              <div style={{
                color: 'var(--_apps---colors--muted-foreground)',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                marginBottom: '0.5rem',
                fontFamily: 'var(--_apps---typography--body-font)',
              }}>
                {fileName}
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

          {error && !uploading && (
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
