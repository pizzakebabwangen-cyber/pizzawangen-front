/**
 * SEO pro Route: Titel, Description, Canonical, robots, JSON-LD und Vorab-HTML-Textblock.
 * Wird genutzt von: src/components/Seo (Laufzeit bei Navigation), vite.config.js (Startseite im Template)
 * und scripts/prerender.mjs (eine HTML-Datei pro Route). Reines ESM, keine Browser-APIs auf Modulebene.
 */
import {
  SITE, OPENING_HOURS, DELIVERY_HOURS, openText, deliveryText, addressLine,
} from "./site.js";
import { LANDING_PAGES } from "./landing.js";
import { FAQ_ITEMS } from "./faq.js";

const BRAND = SITE.name;
const NAP = `${BRAND}, ${addressLine()}, Tel. ${SITE.phoneDisplay}`;

/** Indexierbare Seiten. `file` = Dateiname des Vorab-HTML im dist-Ordner (Startseite = index.html). */
export const ROUTES = [
  {
    path: "/",
    file: "index.html",
    title: "Pizza, Kebab & Döner in Wangen SZ | Lieferung Lachen, Siebnen",
    description:
      "Wangen Pizza Kebab in Wangen SZ: Pizza, Halal Kebab, Döner, Pide und Gutscheine online bestellen. Lieferung: Wangen, Lachen, Siebnen, Altendorf, Tuggen.",
    h1: "Pizza, Kebab & Pide in Wangen SZ",
    text:
      "Frisch zubereitet: Pizza, Kebab, Döner und Pide bei Wangen Pizza Kebab an der Zürcherstrasse 3 in Wangen SZ. Wir liefern nach Wangen, Lachen, Siebnen, Galgenen, Tuggen, Reichenburg, Buttikon, Schübelbach, Nuolen und Altendorf oder Sie holen Ihre Bestellung bei uns ab.",
    jsonLd: true,
    priority: "1.0",
  },
  {
    path: "/menue",
    file: "menue.html",
    title: `Speisekarte: Pizza, Kebab & Döner bestellen | ${BRAND}`,
    description:
      "Speisekarte von Wangen Pizza Kebab: Pizza, Halal Kebab, Döner, Pide, Teller und Boxen online bestellen. Lieferung: Wangen, Lachen, Siebnen, Altendorf, Tuggen.",
    h1: "Unsere Speisekarte",
    text:
      "Pizza, Kebab, Döner, Pide, Teller und Boxen: Die komplette Speisekarte von Wangen Pizza Kebab. Bestellen Sie online mit Lieferung nach Wangen SZ, Lachen, Siebnen, Altendorf und Tuggen oder zur Abholung.",
    priority: "0.9",
  },
  {
    path: "/angebote",
    file: "angebote.html",
    title: `Wertgutscheine & Angebote | ${BRAND}`,
    description:
      "Wertgutscheine und aktuelle Angebote von Wangen Pizza Kebab in Wangen SZ. Einfach online bestellen und verschenken.",
    h1: "Wertgutscheine & Angebote",
    text: "Wertgutscheine und aktuelle Angebote von Wangen Pizza Kebab in Wangen SZ, bequem online bestellbar.",
    sitemap: false, // bewusst nicht im Sitemap, solange es keine Angebote gibt (Hauptseite fuer Gutscheine: /gutscheine)
    priority: "0.6",
  },
  {
    path: "/gutscheine",
    file: "gutscheine.html",
    title: `Gutscheine verschenken | ${BRAND}`,
    description:
      "Schenken Sie Freude: Wertgutscheine für Pizza, Kebab und mehr bei Wangen Pizza Kebab in Wangen SZ, online bestellen.",
    h1: "Schenken Sie Freude: Gutscheine",
    text: "Der perfekte Gutschein für unsere Gäste: Pizza, Kebab und mehr, einlösbar bei Wangen Pizza Kebab in Wangen SZ.",
    priority: "0.7",
  },
  {
    path: "/restaurant",
    file: "restaurant.html",
    title: `Restaurant in Wangen SZ | ${BRAND}`,
    description:
      "Das Restaurant von Wangen Pizza Kebab an der Zürcherstrasse 3 in Wangen SZ: Bilder, Öffnungszeiten und Anfahrt.",
    h1: "Unser Restaurant in Wangen SZ",
    text: "Besuchen Sie uns an der Zürcherstrasse 3 in 8855 Wangen SZ. Pizza, Kebab und Pide frisch zubereitet.",
    priority: "0.6",
  },
  {
    path: "/reservation",
    file: "reservation.html",
    title: `Tisch reservieren in Wangen SZ | ${BRAND}`,
    description:
      "Tisch reservieren bei Wangen Pizza Kebab in Wangen SZ: online anfragen oder telefonisch unter 055 460 33 66.",
    h1: "Tisch reservieren",
    text: `Reservieren Sie online oder telefonisch unter ${SITE.phoneDisplay} einen Tisch bei ${BRAND} in Wangen SZ.`,
    priority: "0.6",
  },
  {
    path: "/kontakt",
    file: "kontakt.html",
    title: `Kontakt, Öffnungszeiten & Lieferung | ${BRAND}`,
    description:
      "Kontakt, Öffnungszeiten und Liefergebiete von Wangen Pizza Kebab: Zürcherstrasse 3, 8855 Wangen SZ, Tel. 055 460 33 66.",
    h1: "Kontakt",
    text: `${NAP}. Wir liefern nach Wangen SZ, Lachen, Siebnen, Galgenen, Tuggen und Umgebung.`,
    jsonLd: true,
    faqJsonLd: true, // die FAQ steht auf /kontakt (FaqSection)
    priority: "0.8",
  },
  {
    path: "/impressum",
    file: "impressum.html",
    title: `Impressum | ${BRAND}`,
    description: "Impressum von Wangen Pizza Kebab, Zürcherstrasse 3, 8855 Wangen SZ.",
    h1: "Impressum",
    text: NAP,
    priority: "0.2",
  },
  {
    path: "/agb",
    file: "agb.html",
    title: `Allgemeine Geschäftsbedingungen | ${BRAND}`,
    description: "Allgemeine Geschäftsbedingungen (AGB) für Bestellungen bei Wangen Pizza Kebab in Wangen SZ.",
    h1: "Allgemeine Geschäftsbedingungen",
    text: NAP,
    priority: "0.2",
  },
  {
    path: "/datenschutzbestimmungen",
    file: "datenschutzbestimmungen.html",
    title: `Datenschutzbestimmungen | ${BRAND}`,
    description: "Datenschutzbestimmungen von Wangen Pizza Kebab in Wangen SZ.",
    h1: "Datenschutzbestimmungen",
    text: NAP,
    priority: "0.2",
  },
  // Orts- und Gericht-Landingpages (Inhalt: config/landing.js)
  ...LANDING_PAGES.map((p) => ({
    path: p.path,
    file: p.file,
    title: p.title,
    description: p.description,
    h1: p.h1,
    text: p.intro[0],
    breadcrumbName: p.short,
    priority: "0.7",
  })),
];

/** Seiten ohne Indexierung (per meta robots, NICHT per robots.txt, damit Google das noindex sieht). */
export const NOINDEX_PATHS = [
  "/cart", "/cart/checkOut", "/cart/checkOut/payment", "/account", "/login", "/register",
  "/forgetPass", "/resetPassword", "/order-tracking", "/success", "/failed-payment", "/menue-demo",
];

const normalize = (p) => {
  let s = String(p || "/").split("?")[0].split("#")[0];
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s || "/";
};

/** Liefert die SEO-Daten fuer einen Pfad. Unbekannte und private Pfade: noindex, keine Canonical. */
export function resolveSeo(pathname) {
  const p = normalize(pathname);
  const route = ROUTES.find((r) => r.path === p);
  if (route) {
    return { ...route, canonical: SITE.url + (p === "/" ? "/" : p), robots: "index,follow", known: true };
  }
  const isPrivate = NOINDEX_PATHS.some((x) => p === x || p.startsWith(`${x}/`));
  return {
    path: p,
    title: isPrivate ? BRAND : `Seite nicht gefunden | ${BRAND}`,
    description: ROUTES[0].description,
    canonical: null,
    robots: "noindex,follow",
    known: false,
  };
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const daysUrl = (d) => d.map((x) => `https://schema.org/${x}`);

export function buildJsonLd() {
  const restaurant = {
    "@type": "Restaurant",
    "@id": `${SITE.url}/#restaurant`,
    name: SITE.name,
    url: `${SITE.url}/`,
    menu: `${SITE.url}/menue`,
    acceptsReservations: `${SITE.url}/reservation`,
    telephone: SITE.phoneE164,
    email: SITE.email,
    servesCuisine: SITE.servesCuisine,
    priceRange: SITE.priceRange,
    logo: `${SITE.url}${SITE.logoPath}`,
    image: [`${SITE.url}${SITE.ogImage.path}`, `${SITE.url}${SITE.logoPath}`],
    hasMap: SITE.mapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.locality,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude },
    areaServed: SITE.areaServed,
    openingHoursSpecification: OPENING_HOURS.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: SITE.sameAs,
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/menue`,
        inLanguage: "de-CH",
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      deliveryMethod: ["https://schema.org/OnSitePickup", "https://schema.org/DeliveryModeOwnFleet"],
    },
  };
  const website = {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: SITE.alternateNames,
    inLanguage: "de-CH",
    publisher: { "@id": `${SITE.url}/#restaurant` },
  };
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [restaurant, website] }, null, 2);
}

/** Zusaetzliches JSON-LD je Route: BreadcrumbList (Landingpages) und FAQPage (/kontakt). Gibt null zurueck, wenn nichts passt. */
export function buildExtraJsonLd(route) {
  if (route.breadcrumbName) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE.url}/` },
        { "@type": "ListItem", position: 2, name: route.breadcrumbName, item: `${SITE.url}${route.path}` },
      ],
    }, null, 2);
  }
  if (route.faqJsonLd) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }, null, 2);
  }
  return null;
}
/** Kopf-Tags einer Route (ohne GA/Charset/Viewport/Favicon, die bleiben in index.html). */
export function buildHeadBlock(route) {
  const lines = [];
  lines.push(`<title>${esc(route.title)}</title>`);
  lines.push(`<meta name="description" content="${esc(route.description)}" />`);
  lines.push(`<meta name="robots" content="${route.robots}" />`);
  if (route.canonical) {
    const ogImage = `${SITE.url}${SITE.ogImage.path}`;
    lines.push(`<link rel="canonical" href="${route.canonical}" />`);
    lines.push(`<meta property="og:type" content="website" />`);
    lines.push(`<meta property="og:site_name" content="${esc(SITE.name)}" />`);
    lines.push(`<meta property="og:locale" content="de_CH" />`);
    lines.push(`<meta property="og:title" content="${esc(route.title)}" />`);
    lines.push(`<meta property="og:description" content="${esc(route.description)}" />`);
    lines.push(`<meta property="og:url" content="${route.canonical}" />`);
    lines.push(`<meta property="og:image" content="${ogImage}" />`);
    lines.push(`<meta property="og:image:width" content="${SITE.ogImage.width}" />`);
    lines.push(`<meta property="og:image:height" content="${SITE.ogImage.height}" />`);
    lines.push(`<meta property="og:image:alt" content="${esc(SITE.ogImage.alt)}" />`);
    lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
    lines.push(`<meta name="twitter:title" content="${esc(route.title)}" />`);
    lines.push(`<meta name="twitter:description" content="${esc(route.description)}" />`);
    lines.push(`<meta name="twitter:image" content="${ogImage}" />`);
  }
  if (route.jsonLd) lines.push(`<script type="application/ld+json">\n${buildJsonLd()}\n</script>`);
  const extraLd = buildExtraJsonLd(route);
  if (extraLd) lines.push(`<script type="application/ld+json">\n${extraLd}\n</script>`);
  return lines.join("\n    ");
}

/** Kurzer Text fuer <noscript> (kein SSR): Ueberschrift, Absatz, Navigation, NAP und Zeiten. */
export function buildNoscript(route) {
  const hours = OPENING_HOURS.map((h) => `<li>${esc(h.label)} ${esc(openText(h))}</li>`).join("");
  const delivery = DELIVERY_HOURS.map((d) => `<li>${esc(d.label)} ${esc(deliveryText(d))}</li>`).join("");
  const nav = ROUTES.filter((r) => ["/", "/menue", "/gutscheine", "/reservation", "/restaurant", "/kontakt"].includes(r.path))
    .map((r) => `<a href="${r.path}">${esc(r.h1)}</a>`).join(" | ");
  return `<noscript>
      <h1>${esc(route.h1)}</h1>
      <p>${esc(route.text)}</p>
      <p>${nav}</p>
      <p>${esc(SITE.name)}<br>${esc(SITE.address.street)}<br>${esc(SITE.address.postalCode)} ${esc(SITE.address.locality)}<br>Tel. <a href="tel:${SITE.phoneE164}">${esc(SITE.phoneDisplay)}</a></p>
      <p>Öffnungszeiten:</p><ul>${hours}</ul>
      <p>Lieferzeiten:</p><ul>${delivery}</ul>
      <p>Bitte aktivieren Sie JavaScript, um online zu bestellen.</p>
    </noscript>`;
}
