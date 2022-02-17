/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    root: 'tests',
    resolve: {
      extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
    },
    testTimeout: 2000,
    globals: true
  }
})
