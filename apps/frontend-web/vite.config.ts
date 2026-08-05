import { fileURLToPath } from 'node:url'
import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },

  server: {
    port: 5173,
  },

  // Tipos de archivo que se pueden importar en crudo. Nunca agregar .css, .tsx ni .ts.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
