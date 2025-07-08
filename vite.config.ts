import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom plugin to completely suppress source map errors
const suppressSourceMapPlugin = () => ({
  name: 'suppress-source-map-errors',
  configureServer(server) {
    // Override the error handler to filter out source map errors
    const originalSend = server.ws.send;
    server.ws.send = function(payload) {
      if (typeof payload === 'object' && payload.type === 'error') {
        const errorMessage = payload.err?.message || '';
        if (errorMessage.includes('source map') || 
            errorMessage.includes('Unexpected end of file in source map') ||
            errorMessage.includes('sourceMappingURL')) {
          return; // Don't send source map errors to client
        }
      }
      return originalSend.call(this, payload);
    };
  },
  load(id) {
    // Skip loading problematic source map files
    if (id.endsWith('.js.map') && 
        (id.includes('@lit/reactive-element') || 
         id.includes('@safe-global/safe-apps-sdk'))) {
      return '{}'; // Return empty source map
    }
  },
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
    suppressSourceMapPlugin(),
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
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress all source map related warnings
        if (warning.code === 'SOURCEMAP_ERROR') return;
        if (warning.message?.includes('source map')) return;
        if (warning.message?.includes('Unexpected end of file')) return;
        if (warning.message?.includes('sourceMappingURL')) return;
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    exclude: [
      '@safe-global/safe-apps-sdk',
      '@lit/reactive-element'
    ],
    include: ['react', 'react-dom'],
    esbuildOptions: {
      // Completely ignore source map annotations
      ignoreAnnotations: true,
      sourcemap: false,
    },
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    // Disable source map processing entirely for problematic packages
    sourcemap: false,
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'sourcemap-warning': 'silent',
    },
  },
  css: {
    devSourcemap: false, // Disable CSS source maps to avoid issues
  },
}));
