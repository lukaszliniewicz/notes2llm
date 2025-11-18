import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  plugins: [viteSingleFile()],
  build: {
    minify: true,
    outDir: '../dist',
    emptyOutDir: true,
  },
})
