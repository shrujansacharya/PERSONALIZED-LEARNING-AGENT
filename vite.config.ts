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

  // 👇 ADDED: Proxy configuration to fix the 404 (Not Found) error
  server: {
    proxy: {
      // Proxy requests starting with '/api' to your Node.js backend on port 5001
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false, // Set to true if your backend uses HTTPS
      },
    },
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