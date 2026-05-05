import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration for building the standalone embed bundle
 * 
 * This creates a SINGLE self-contained JavaScript file that includes ALL CSS.
 * No separate CSS file needed - everything is inlined.
 * 
 * Output goes to public/memory-embed-bundle.js (not memory-embed.js)
 * The memory-embed.js is served dynamically by Astro with collection ID injected.
 * 
 * Build with: npm run build:embed
 */
export default defineConfig({
  plugins: [
    react(),
    
    // Plugin to inline CSS into JS
    {
      name: 'inline-css',
      apply: 'build',
      enforce: 'post',
      generateBundle(options, bundle) {
        // Find CSS files and inline them
        const cssFiles: string[] = [];
        
        for (const [fileName, file] of Object.entries(bundle)) {
          if (fileName.endsWith('.css') && file.type === 'asset') {
            cssFiles.push(fileName);
            
            // Get CSS content
            const cssContent = file.source.toString();
            
            // Find the main JS file and prepend CSS injection code
            for (const [jsFileName, jsFile] of Object.entries(bundle)) {
              if (jsFileName.endsWith('.js') && jsFile.type === 'chunk') {
                // Prepend CSS injection code to the JS bundle
                const cssInjectionCode = `
(function() {
  if (typeof document !== 'undefined') {
    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(cssContent)};
    style.setAttribute('data-memory-form-embed', 'true');
    document.head.appendChild(style);
  }
})();
`;
                jsFile.code = cssInjectionCode + jsFile.code;
              }
            }
          }
        }
        
        // Remove CSS files from bundle (they're now inlined)
        cssFiles.forEach(fileName => {
          delete bundle[fileName];
        });
      },
    },
  ],
  
  define: {
    // Define process.env for browser environment
    'process.env': '{}',
    'process.env.NODE_ENV': '"production"',
    
    // Define import.meta.env values used in the app
    'import.meta.env.BASE_URL': '"/memory-form"',
    'import.meta.env.COLLECTION_ID': '""',
    'import.meta.env.MODE': '"production"',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    'import.meta.env.SSR': 'false',
  },
  
  build: {
    // Output to public directory so it's served by Astro
    outDir: 'public',
    emptyOutDir: false, // Don't delete other files in public/
    
    // Don't split CSS - we'll inline it
    cssCodeSplit: false,
    
    lib: {
      // Entry point is the embed wrapper
      entry: path.resolve(__dirname, 'embed/memory-button-wrapper.ts'),
      
      // Output as UMD (Universal Module Definition) for browser compatibility
      name: 'MemoryFormEmbed',
      formats: ['umd'],
      
      // Output as memory-embed-bundle.js (will be wrapped by memory-embed.js endpoint)
      fileName: () => 'memory-embed-bundle.js',
    },
    
    rollupOptions: {
      // Don't externalize anything - bundle everything
      external: [],
      
      output: {
        // Use named exports
        exports: 'named',
        
        // Make sure React and ReactDOM are included
        globals: {},
        
        // Inline all assets
        inlineDynamicImports: true,
        
        // Single chunk
        manualChunks: undefined,
      },
    },
    
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
      },
    },
    
    // Generate sourcemaps for debugging
    sourcemap: true,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Don't use publicDir during build
  publicDir: false,
});
