/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// User site: https://mojtabarezaei4.github.io/ (repo mojtabarezaei4/mojtabarezaei4.github.io) is served from the root.
// For a custom domain keep base '/' and add public/CNAME.
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
