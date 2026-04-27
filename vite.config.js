import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Heavy WebGL scene is intentionally lazy-loaded into a separate chunk.
    // Raise threshold to avoid false-positive warning for this chunk.
    chunkSizeWarningLimit: 1000,
  },
})
