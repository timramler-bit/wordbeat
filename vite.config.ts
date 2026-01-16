import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This ensures assets are linked relatively (e.g. "./assets/...") 
  // which makes it work on GitHub Pages subdirectories.
  base: './',
})