import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ✅ Moved define to the root level
  define: {
    'process.env': {},
  },

  // ✅ optimizeDeps is separate
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
});
