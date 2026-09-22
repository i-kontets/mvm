import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  plugins: [react(), svgr()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api-local': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-local/, ''),
      },
    },
  },
});
