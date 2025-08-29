import {  defineConfig} from 'vitest/config';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'effector-use-unit-shape',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['effector', 'effector-react', 'react'],
    },
  },
  plugins: [
    dts({ 
      rollupTypes: true 
    })
  ],
  test: {
    environment: 'jsdom'
  }
})
