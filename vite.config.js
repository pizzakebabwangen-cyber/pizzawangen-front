import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// VITE_BASE in .env: "/" = Domain-Root, "/site1/" = Unterordner
// Nach Änderung: npm run build erneut ausführen.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = env.VITE_BASE || '/'
  if (!base.startsWith('/')) base = '/' + base
  if (!base.endsWith('/')) base += '/'

  return {
    plugins: [react()],
    base,
  }
})
