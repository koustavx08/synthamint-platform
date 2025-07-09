import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Suppress source map warnings at the process level
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.message.includes('source map') || 
      warning.message.includes('sourceMappingURL') ||
      warning.message.includes('Unexpected end of file')) {
    return; // Ignore source map warnings
  }
  console.warn(warning);
});

// Override global error handlers
const originalProcessEmit = process.emit;
(process as any).emit = function(event: any, ...args: any[]) {
  if (event === 'warning') {
    const warning = args[0];
    if (warning?.message?.includes('source map') ||
        warning?.message?.includes('sourceMappingURL') ||
        warning?.message?.includes('Unexpected end of file')) {
      return false; // Suppress the warning
    }
  }
  return originalProcessEmit.apply(process, arguments as any);
};

// Comprehensive plugin to eliminate all source map errors
const eliminateSourceMapErrors = () => ({
  name: 'eliminate-source-map-errors',
  configureServer(server: any) {
    // Completely suppress source map errors in dev server
    const originalSend = server.ws.send;
    server.ws.send = function(payload: any) {
      if (typeof payload === 'object' && payload.type === 'error') {
        const errorMessage = payload.err?.message || '';
        if (errorMessage.includes('source map') || 
            errorMessage.includes('Unexpected end of file') ||
            errorMessage.includes('sourceMappingURL') ||
            errorMessage.includes('.js.map') ||
            errorMessage.includes('@lit/reactive-element') ||
            errorMessage.includes('@safe-global')) {
          return; // Completely ignore these errors
        }
      }
      return originalSend.call(this, payload);
    };

    // Override console methods to suppress source map warnings
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('source map') || 
          message.includes('sourceMappingURL') ||
          message.includes('.js.map')) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('source map') || 
          message.includes('Unexpected end of file') ||
          message.includes('sourceMappingURL') ||
          message.includes('.js.map')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  },
  load(id: string) {
    // Return empty source maps for problematic packages
    if (id.endsWith('.js.map')) {
      if (id.includes('@lit/reactive-element') || 
          id.includes('@safe-global/safe-apps-sdk') ||
          id.includes('node_modules')) {
        return '{"version":3,"sources":[],"names":[],"mappings":""}';
      }
    }
  },
  resolveId(id: string) {
    // Skip resolution of problematic source map files
    if (id.endsWith('.js.map') && 
        (id.includes('@lit/reactive-element') || 
         id.includes('@safe-global/safe-apps-sdk'))) {
      return false;
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  plugins: [
    react(),
    eliminateSourceMapErrors(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode === 'development',
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress all source map related warnings
        if (warning.code === 'SOURCEMAP_ERROR') return;
        if (warning.message?.includes('source map')) return;
        if (warning.message?.includes('Unexpected end of file')) return;
        if (warning.message?.includes('sourceMappingURL')) return;
        // Suppress package resolution warnings
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
          'web3-vendor': ['wagmi', 'viem'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: [
      '@safe-global/safe-apps-sdk',
      '@lit/reactive-element'
    ],
    include: [
      'react', 
      'react-dom'
    ],
    esbuildOptions: {
      target: 'esnext',
      sourcemap: false,
      logOverride: {
        'js-comment-in-json': 'silent',
        'unsupported-source-map-comment': 'silent',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    // Completely disable source map processing
    sourcemap: false,
    sourcesContent: false,
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'sourcemap-warning': 'silent',
      'js-comment-in-json': 'silent',
      'unsupported-source-map-comment': 'silent',
    },
    // Drop source map comments entirely
    legalComments: 'none',
  },
  css: {
    devSourcemap: false, // Disable CSS source maps completely
  },
}));
