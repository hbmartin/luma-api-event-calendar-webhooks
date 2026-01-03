import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // eslint-disable-next-line code-complete/enforce-meaningful-names
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  target: 'es2023',
  platform: 'neutral',
  external: ['zod'],
  clean: true,
  treeshake: true,
  minify: false,
  splitting: false,
  metafile: false,
})
