import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

export default defineConfig([
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: { dir: 'dist', entryFileNames: 'index.js', format: 'esm' },
  },
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: { dir: 'dist', entryFileNames: 'index.cjs', format: 'cjs' },
  },
  {
    input: 'src/index.ts',
    external: ['vue'],
    plugins: [dts()],
    output: { dir: 'dist', format: 'esm' },
  },
])
