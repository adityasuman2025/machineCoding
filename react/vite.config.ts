import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { reactScopedCssPlugin } from 'rollup-plugin-react-scoped-css'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    reactScopedCssPlugin()
  ],
  base: "./",
})
