import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Name the lazily-loaded Supabase client so it is recognisable in the
        // build output and in scripts/check-budget.mjs (it is not on the
        // first-load path; see src/lib/supabase.js).
        manualChunks(id) {
          if (id.includes('node_modules/@supabase/')) return 'supabase';
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 5001}`
    }
  }
});
