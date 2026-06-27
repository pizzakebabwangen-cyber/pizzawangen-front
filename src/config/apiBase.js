/**
 * Eine Basis-URL für alle API-Aufrufe (ohne trailing slash).
 * Gleiche Fallback-Idee wie Footer.jsx, damit kein leeres VITE_SERVER zu falschen Hosts führt.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_SERVER;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/+$/, "");
  }
  return "https://pizzawangen.runasp.net";
}

/**
 * Basis für URLs wie `/Images/...` (wwwroot auf derselben IIS-Site wie der Shop).
 * VITE_SERVER zeigt oft auf admin.* — dann 404, weil Bilder unter der Kunden-Domain erreichbar sind.
 * Optional in .env: VITE_PUBLIC_ORIGIN=https://pizzawangen.ch (oder www)
 */
export function getStaticFilesBaseUrl() {
  const explicit =
    import.meta.env.VITE_PUBLIC_ORIGIN ||
    import.meta.env.VITE_IMAGES_ORIGIN ||
    import.meta.env.VITE_SITE_ORIGIN;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const host = (window.location.hostname || "").toLowerCase();
    if (!host.includes("admin.")) {
      return window.location.origin.replace(/\/+$/, "");
    }
  }
  return getApiBaseUrl();
}

/**
 * Dateiname aus DB (nur Name, z. B. abc.png). Volle URLs oder "Images/…" werden normalisiert.
 */
export function normalizeWebRootImageFileName(photoName) {
  if (photoName == null) return "";
  const s = String(photoName).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  let file = s
    .replace(/^\/+/, "")
    .replace(/^Images\//i, "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .trim();
  try {
    file = decodeURIComponent(file);
  } catch {
    /* DB-Wert evtl. kein gültiges %-Encoding */
  }
  return file.trim();
}

/**
 * Mehrere absolute URLs für wwwroot/Images (apex vs www, API-Host), für <img onError>-Fallback.
 */
export function getWebRootImageUrlCandidates(photoName) {
  const file = normalizeWebRootImageFileName(photoName);
  if (!file) return [];
  if (/^https?:\/\//i.test(file)) return [file];
  const path = `/Images/${encodeURIComponent(file)}`;
  const bases = [];
  const add = (b) => {
    if (typeof b !== "string" || !b.trim()) return;
    const x = b.trim().replace(/\/+$/, "");
    if (x && !bases.includes(x)) bases.push(x);
  };

  const host =
    typeof window !== "undefined"
      ? (window.location.hostname || "").toLowerCase()
      : "";

  if (typeof window !== "undefined" && window.location?.origin) {
    // Produktbilder werden im Admin hochgeladen und liegen unter dem API-Host.
    if (!host.includes("admin.")) {
      add(getApiBaseUrl());
      add(import.meta.env.VITE_IMAGES_ORIGIN);
      add(import.meta.env.VITE_PUBLIC_ORIGIN);
      add(import.meta.env.VITE_SITE_ORIGIN);
      add(window.location.origin.replace(/\/+$/, ""));
    }
    if (host.startsWith("www.") && host.includes("pizzawangen.ch")) {
      add(`${window.location.protocol}//pizzawangen.ch`);
    }
    if (host === "pizzawangen.ch") {
      add(`${window.location.protocol}//www.pizzawangen.ch`);
    }
  }

  add(import.meta.env.VITE_PUBLIC_ORIGIN);
  add(import.meta.env.VITE_IMAGES_ORIGIN);
  add(import.meta.env.VITE_SITE_ORIGIN);
  add(getStaticFilesBaseUrl());
  add(getApiBaseUrl());
  const fb = getApiFallbackBaseUrl();
  if (fb) add(fb);
  if (import.meta.env.VITE_DISABLE_BUILTIN_API_404_FALLBACK !== "true") {
    add("https://pizzawangen.runasp.net");
  }
  return bases.map((b) => `${b}${path}`);
}

/** Zweiter API-Host nur für automatischen Retry (z. B. wenn Haupt-Host noch ohne neuen Endpunkt). */
export function getApiFallbackBaseUrl() {
  const raw = import.meta.env.VITE_SERVER_FALLBACK;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/+$/, "");
  }
  return "";
}

/** Vollständige URL zu einem API-Pfad (path beginnt mit /, z. B. /api/Cart/...). */
export function apiUrl(path, baseOverride) {
  const base =
    typeof baseOverride === "string" && baseOverride.trim()
      ? baseOverride.trim().replace(/\/+$/, "")
      : getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Reihenfolge der API-Hosts für Retry bei 404 (alter Live-Deploy ohne neuen Endpunkt).
 * 1) VITE_SERVER  2) VITE_SERVER_FALLBACK  3) runasp (wie früher im .env)
 * Abschalten: VITE_DISABLE_BUILTIN_API_404_FALLBACK=true
 */
export function getApiBaseCandidatesFor404Retry() {
  const primary = getApiBaseUrl();
  const out = [];
  const seen = new Set();
  const push = (b) => {
    if (typeof b !== "string" || !b.trim()) return;
    const n = b.trim().replace(/\/+$/, "");
    if (seen.has(n)) return;
    seen.add(n);
    out.push(n);
  };
  /* Wenn Frontend + API auf derselben Domain (IIS/eine Site): zuerst Origin versuchen */
  if (
    typeof window !== "undefined" &&
    import.meta.env.VITE_SAME_ORIGIN_API_FIRST === "true" &&
    window.location?.origin
  ) {
    push(window.location.origin);
  }
  push(primary);
  push(getApiFallbackBaseUrl());
  if (import.meta.env.VITE_DISABLE_BUILTIN_API_404_FALLBACK !== "true") {
    push("https://pizzawangen.runasp.net");
  }
  return out;
}
