import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import glsl from 'rollup-plugin-glsl'

export default defineConfig({
  input: ['src/index.ts'],
  output: [{ dir: 'lib', format: 'esm', preserveModules: true }],
  plugins: [
    glsl({ include: 'src/**/*.glsl' }),
    esbuild(),
  ],
  external: ['lodash/fp', 'fp-ts/lib/function', 'gl-matrix', 'beam-gl'],
})
