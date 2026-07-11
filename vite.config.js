import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5175,
    headers: { 'X-Frame-Options': 'ALLOWALL', 'Content-Security-Policy': "frame-ancestors *" },
  },
});
