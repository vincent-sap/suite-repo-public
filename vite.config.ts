import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nojekyll',
      closeBundle() { fs.writeFileSync('docs/.nojekyll', '') },
    },
  ],
  base: '/signavio-experience/suite-replica/',
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        // Split heavy libraries into their own chunks so pages that don't use
        // them (most of the app) don't pay for them in the initial load.
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'charts'
          if (id.includes('node_modules/@xyflow')) return 'flow'
          // BPMN diagram viewer (repository previews) — pulls in mxgraph (~1MB)
          if (id.includes('node_modules/bpmn-visualization')) return 'bpmn'
          if (id.includes('node_modules/mxgraph')) return 'bpmn'
          // Rich-text editor (comments etc. via uixtension)
          if (id.includes('node_modules/@tiptap')) return 'editor'
          if (id.includes('node_modules/prosemirror')) return 'editor'
          // Markdown rendering
          if (id.includes('node_modules/react-markdown')) return 'markdown'
          if (id.includes('node_modules/marked')) return 'markdown'
          if (id.includes('node_modules/turndown')) return 'markdown'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
