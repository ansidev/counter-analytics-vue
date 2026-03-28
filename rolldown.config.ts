import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

export default defineConfig({
  input: 'src/index.ts',
  external: ['vue'],
  plugins: [dts()],
  output: [
    {
      dir: 'dist',
      format: 'es',
      entryFileNames: 'index.js',
      cleanDir: true,
    },
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: 'index.cjs',
    },
  ],
})
