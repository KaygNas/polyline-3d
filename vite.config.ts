/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  root: 'playground',
  plugins: [vue(), glsl()],
  test: {
    root: './',
    globals: true,
  },
})
