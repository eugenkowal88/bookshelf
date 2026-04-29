import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// To deploy to GitHub Pages at https://USERNAME.github.io/REPO-NAME/,
// set base to '/REPO-NAME/'. For a custom domain or root deploy, use '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
