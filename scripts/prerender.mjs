/* eslint-env node */
/**
 * Nach `vite build`: erzeugt aus dist/index.html pro Route eine eigene HTML-Datei mit
 * Titel, Description, Canonical, og:url, JSON-LD (nur Startseite/Kontakt) und kurzem <noscript>-Text.
 * Kein SSR: React startet danach wie bisher und ersetzt den Inhalt.
 *
 *   dist/index.html          Startseite (vom Vite-Plugin gefuellt)
 *   dist/<route>.html        eine Datei pro indexierbare Route (IIS-Rewrite in web.config, siehe public/web.config)
 *   dist/_app.html           Fallback fuer alle uebrigen URLs (private Seiten, unbekannte URLs): meta robots noindex, keine Canonical
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTES, resolveSeo, buildHeadBlock, buildNoscript } from "../src/config/seo.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const shell = readFileSync(resolve(dist, "index.html"), "utf8");

const HEAD_RE = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
const NOSCRIPT_RE = /<!--seo:noscript-start-->[\s\S]*?<!--seo:noscript-end-->/;
if (!HEAD_RE.test(shell) || !NOSCRIPT_RE.test(shell)) {
  console.error("prerender: Marker in dist/index.html fehlen (Vite-Plugin seo-html lief nicht?).");
  process.exit(1);
}

const make = (route, noscript) =>
  shell
    .replace(HEAD_RE, () => `<!--seo:start-->\n    ${buildHeadBlock(route)}\n    <!--seo:end-->`)
    .replace(NOSCRIPT_RE, () => `<!--seo:noscript-start-->${noscript}<!--seo:noscript-end-->`);

const written = [];
for (const r of ROUTES) {
  if (r.file === "index.html") continue;
  writeFileSync(resolve(dist, r.file), make(resolveSeo(r.path), buildNoscript(r)), "utf8");
  written.push(r.file);
}

// Fallback: noindex, ohne Canonical, ohne Inhaltstext.
// Neutraler Titel (der Fallback wird auch fuer /cart, /login usw. ausgeliefert); noindex kommt aus resolveSeo.
const fallbackRoute = resolveSeo("/cart");
writeFileSync(resolve(dist, "_app.html"), make(fallbackRoute, ""), "utf8");
written.push("_app.html");

// Konsistenzpruefungen (nur Warnungen)
const warn = (m) => console.warn(`prerender WARNUNG: ${m}`);
const sitemapPath = resolve(dist, "sitemap.xml");
if (!existsSync(sitemapPath)) warn("dist/sitemap.xml fehlt (public/sitemap.xml).");
else {
  const sm = readFileSync(sitemapPath, "utf8");
  for (const r of ROUTES) if (!sm.includes(`<loc>https://www.pizzawangen.ch${r.path === "/" ? "/" : r.path}</loc>`)) warn(`Route ${r.path} fehlt in sitemap.xml`);
}
if (!existsSync(resolve(dist, "robots.txt"))) warn("dist/robots.txt fehlt (public/robots.txt).");
const wc = existsSync(resolve(dist, "web.config")) ? readFileSync(resolve(dist, "web.config"), "utf8") : "";
for (const f of written) if (!wc.includes(`path="${f}"`)) warn(`web.config hat keinen Cache-Eintrag fuer ${f}`);

console.log(`prerender: ${written.length} Dateien in dist/ geschrieben: ${written.join(", ")}`);
