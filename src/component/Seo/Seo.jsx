import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveSeo } from "../../config/seo.js";

const setMeta = (selector, attr, key, value) => {
  let el = document.head.querySelector(selector);
  if (!value) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement(attr === "link" ? "link" : "meta");
    if (attr === "link") el.setAttribute("rel", key);
    else el.setAttribute(key.startsWith("og:") ? "property" : "name", key);
    document.head.appendChild(el);
  }
  el.setAttribute(attr === "link" ? "href" : "content", value);
};

/**
 * Aktualisiert bei jeder Navigation Titel, Description, Canonical, og:* und robots.
 * Die Erstanfrage liefert dieselben Werte bereits im Vorab-HTML (scripts/prerender.mjs);
 * diese Komponente haelt sie bei SPA-Navigation konsistent. Rendert nichts.
 */
const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeo(pathname);
    document.title = seo.title;
    setMeta('meta[name="description"]', "meta", "description", seo.description);
    setMeta('meta[name="robots"]', "meta", "robots", seo.robots);
    setMeta('link[rel="canonical"]', "link", "canonical", seo.canonical);
    setMeta('meta[property="og:url"]', "meta", "og:url", seo.canonical);
    setMeta('meta[property="og:title"]', "meta", "og:title", seo.canonical ? seo.title : "");
    setMeta('meta[property="og:description"]', "meta", "og:description", seo.canonical ? seo.description : "");
    setMeta('meta[name="twitter:title"]', "meta", "twitter:title", seo.canonical ? seo.title : "");
    setMeta('meta[name="twitter:description"]', "meta", "twitter:description", seo.canonical ? seo.description : "");
  }, [pathname]);

  return null;
};

export default Seo;
