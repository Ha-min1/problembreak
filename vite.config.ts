// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 또는 true (모든 네트워크 인터페이스 개방)
    port: 5173,
  }
});
