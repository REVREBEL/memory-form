/**
 * UI Extension for Memory Form Button
 * Appears in the Webflow Designer sidebar when the button is selected
 * Allows configuration without code
 */

import { useEffect, useState } from 'react';

interface ExtensionProps {
  element: HTMLElement;
  updateProps: (props: Record<string, any>) => void;
  getProps: () => Record<string, any>;
}

export default function MemoryButtonConfig({ element, updateProps, getProps }: ExtensionProps) {
  const [buttonText, setButtonText] = useState('');
  const [variant, setVariant] = useState('primary');
  const [collectionId, setCollectionId] = useState('');
  const [itemId, setItemId] = useState('');

  // Load current props on mount
  useEffect(() => {
    const props = getProps();
    setButtonText(props.buttonText || 'Share a Memory');
    setVariant(props.variant || 'primary');
    // CORRECT COLLECTION ID for Memory Journal
    setCollectionId(props.collectionId || '693a599cb78b2b97a36ef963');
    setItemId(props.itemId || '');
  }, []);

  // Update button text
  const handleButtonTextChange = (value: string) => {
    setButtonText(value);
    updateProps({ buttonText: value });
  };

  // Update variant
  const handleVariantChange = (value: string) => {
    setVariant(value);
    updateProps({ variant: value });
  };

  // Update collection ID
  const handleCollectionIdChange = (value: string) => {
    setCollectionId(value);
    updateProps({ collectionId: value });
  };

  // Update item ID
  const handleItemIdChange = (value: string) => {
    setItemId(value);
    updateProps({ itemId: value });
  };

  return (
    <div className="memory-button-config">
      <h3>Memory Form Button Settings</h3>
      
      <div className="config-section">
        <label htmlFor="button-text">Button Text</label>
        <input
          id="button-text"
          type="text"
          value={buttonText}
          onChange={(e) => handleButtonTextChange(e.target.value)}
          placeholder="Share a Memory"
        />
        <p className="help-text">The text displayed on the button</p>
      </div>

      <div className="config-section">
        <label htmlFor="variant">Button Style</label>
        <select
          id="variant"
          value={variant}
          onChange={(e) => handleVariantChange(e.target.value)}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </select>
        <p className="help-text">The visual style of the button</p>
      </div>

      <div className="config-section">
        <label htmlFor="collection-id">Collection ID</label>
        <input
          id="collection-id"
          type="text"
          value={collectionId}
          onChange={(e) => handleCollectionIdChange(e.target.value)}
          placeholder="693a599cb78b2b97a36ef963"
        />
        <p className="help-text">The CMS collection to save memories to (Memory Journal)</p>
      </div>

      <div className="config-section">
        <label htmlFor="item-id">Item ID (Optional)</label>
        <input
          id="item-id"
          type="text"
          value={itemId}
          onChange={(e) => handleItemIdChange(e.target.value)}
          placeholder="Leave blank for new items"
        />
        <p className="help-text">If set, the form will edit this existing item</p>
      </div>

      <div className="preview-section">
        <h4>Preview</h4>
        <button 
          className={`preview-button preview-button--${variant}`}
          disabled
        >
          {buttonText || 'Share a Memory'}
        </button>
      </div>

      <style>{`
        .memory-button-config {
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .memory-button-config h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .config-section {
          margin-bottom: 1.5rem;
        }

        .config-section label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .config-section input,
        .config-section select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .config-section input:focus,
        .config-section select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .help-text {
          margin: 0.375rem 0 0 0;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .preview-section {
          margin-top: 2rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .preview-section h4 {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
        }

        .preview-button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.5rem;
          border: 2px solid transparent;
          cursor: not-allowed;
          opacity: 0.8;
        }

        .preview-button--primary {
          background-color: #C98769;
          color: #FFFFFF;
        }

        .preview-button--secondary {
          background-color: #E6DCD4;
          color: rgba(55, 61, 54, 0.6);
        }

        .preview-button--outline {
          background-color: transparent;
          color: #C98769;
          border-color: #C98769;
        }

        .preview-button--ghost {
          background-color: transparent;
          color: #29708d;
        }
      `}</style>
    </div>
  );
}
