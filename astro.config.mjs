import {defineConfig} from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Patches node_modules/vite/dist/client/client.mjs
function patchViteErrorOverlay() {
  return {
    name: 'patch-vite-error-overlay',
    transform(code, id) {
      if (id.includes('vite/dist/client/client.mjs')) {
        return code.replace(
          /const editorLink = this\.createLink\(`Open in editor\${[^}]*}\`, void 0\);[\s\S]*?codeHeader\.appendChild\(editorLink\);/g,
          ''
        );
      }
    },
  };
}

/**
 * Vite plugin to completely exclude Webflow components from build
 */
function excludeWebflowComponents() {
  return {
    name: 'exclude-webflow-components',
    resolveId(id) {
      // Exclude any imports of Webflow* components
      if (id.includes('/site-components/Webflow')) {
        return {
          id: 'virtual:webflow-stub',
          external: false,
        };
      }
    },
    load(id) {
      // Return empty stub for excluded components
      if (id === 'virtual:webflow-stub') {
        return 'export default {};';
      }
    },
    transform(code, id) {
      // Skip transformation of Webflow components entirely
      if (id.includes('/site-components/Webflow')) {
        return {
          code: 'export default {};',
          map: null,
        };
      }
    },
  };
}

/**
 * Astro integration to inject development-only scripts
 */
function injectDevScript(options = {}) {
  const {scriptPath} = options;

  if (!scriptPath) {
    throw new Error('injectDevScript requires a scriptPath');
  }

  return {
    name: 'inject-dev-script',
    hooks: {
      'astro:config:setup': ({injectScript, command, logger}) => {
        if (command === 'dev') {
          logger.info(`Injecting dev script: ${scriptPath}`);

          // Inject as ES module
          injectScript('page', `import "${scriptPath}";`);
        }
      },
    },
  };
}

// Determine base path based on environment
// In production (Webflow Cloud), use /memory-form
// In development, use root /
const getBasePath = () => {
  // Check for BASE_URL env var first (can be set in .env or wrangler)
  if (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/') {
    return import.meta.env.BASE_URL;
  }
  
  // Default to /memory-form for production builds
  // Use root / for development
  if (process.env.NODE_ENV === 'production' || process.argv.includes('build')) {
    return '/memory-form';
  }
  
  return '/';
};

const basePath = getBasePath();

// https://astro.build/config
export default defineConfig({
  base: basePath,
  
  // Also configure assets to use the same base path
  build: {
    assetsPrefix: basePath !== '/' ? basePath : undefined,
  },
  
  output: 'server',
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 3000,
    host: true, // Listen on all network interfaces (0.0.0.0)
    strictPort: true,
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    injectDevScript({scriptPath: '/generated/dev-only.js'}),
  ],
  vite: {
    plugins: [tailwindcss(), patchViteErrorOverlay()],
    server: {
      watch: {
        usePolling: true, // Enable polling for file watching in Docker
        interval: 1000,
        ignored: [
          '**/lost+found/**',
          '**/dist/**',
          '**/node_modules/**',
          '**/src/site-components/**',
          '**/src/site-components/Webflow*.jsx',
          '**/src/site-components/Webflow*.js',
          '**/src/site-components/Webflow*.tsx',
          '**/src/site-components/Webflow*.ts',
        ],
      },
    },
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : undefined,
    },
  },
  security: {
    // Disable CSRF origin checking for FormData submissions
    // Cloudflare Workers provides its own security layer
    checkOrigin: false,
  },
});
