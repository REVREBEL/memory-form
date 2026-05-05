/**
 * Memory Form Button Embed - Entry Point
 * 
 * Minimal bundle that only includes:
 * - Webflow component styles (DevLink)
 * - CSS variables from Webflow design system
 * - React + necessary components
 * 
 * Does NOT include Tailwind, Radix UI, or shadcn (not needed for pure Webflow components)
 */

// Import ONLY the minimal styles needed for Webflow components
import './embed-styles.css';

// Export the mount function
export { mountMemoryFormButtonWrapper } from './memory-button-wrapper';
export { default } from './memory-button-wrapper';
