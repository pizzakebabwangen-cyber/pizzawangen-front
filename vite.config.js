import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { ROUTES, resolveSeo, buildHeadBlock, buildNoscript } from './src/config/seo.js'

// Fuellt die Marker in index.html mit den SEO-Tags der Startseite (Dev und Build).
// Die Vorab-HTML-Dateien fuer die uebrigen Routen erzeugt scripts/prerender.mjs nach dem Build.
function seoHtml() {
  return {
    name: 'seo-html',
    transformIndexHtml(html) {
      const home = ROUTES[0]
      return html
        // Funktion statt String: "$$" im Inhalt (priceRange) darf nicht als Ersetzungsmuster gelten.
        .replace('<!--seo:start--><!--seo:end-->', () => `<!--seo:start-->\n    ${buildHeadBlock(resolveSeo(home.path))}\n    <!--seo:end-->`)
        .replace('<!--seo:noscript-start--><!--seo:noscript-end-->', () => `<!--seo:noscript-start-->${buildNoscript(home)}<!--seo:noscript-end-->`)
    },
  }
}

// https://vitejs.dev/config/
// VITE_BASE in .env: "/" = Domain-Root, "/site1/" = Unterordner
// Nach Änderung: npm run build erneut ausführen.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = env.VITE_BASE || '/'
  if (!base.startsWith('/')) base = '/' + base
  if (!base.endsWith('/')) base += '/'

  return {
    plugins: [react(), seoHtml()],
    base,
  }
})
