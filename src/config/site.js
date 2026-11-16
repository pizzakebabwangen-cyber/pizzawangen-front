/**
 * EINZIGE QUELLE fuer Name, Adresse, Telefon, Oeffnungs- und Lieferzeiten.
 * Reines ESM ohne import.meta/JSX, damit es sowohl von der App als auch vom Build
 * (vite.config.js, scripts/prerender.mjs) importiert werden kann.
 * Aenderungen hier wirken auf: JSON-LD, Meta-Tags, Footer-Defaults, FAQ, Reservation, Impressum, Vorab-HTML.
 */

export const SITE = {
  name: "Wangen Pizza Kebab",
  alternateNames: ["Pizza Wangen", "pizzawangen.ch"],
  url: "https://www.pizzawangen.ch",
  email: "info@pizzawangen.ch",
  phoneDisplay: "055 460 33 66",
  phoneE164: "+41554603366",
  address: {
    street: "Zürcherstrasse 3",
    postalCode: "8855",
    locality: "Wangen SZ",
    country: "CH",
  },
  // Geprueft: Geocoding der Adresse "Zürcherstrasse 3, 8855 Wangen" (OpenStreetMap) ergibt 47.19119 / 8.89481
  // und stimmt mit dem Maps-Embed (Location.jsx) ueberein. Der alte JSON-LD-Wert (47.2038 / 8.8390) lag ca. 4,7 km daneben.
  geo: { latitude: 47.191179, longitude: 8.894814 },
  // Kurzlink zum Google-Eintrag (derselbe wie "Jetzt bewerten" auf der Startseite).
  mapsUrl: "https://maps.app.goo.gl/QrjZMVqjguiuBh1Z7",
  priceRange: "CHF 7–22",
  logoPath: "/logo.png",
  ogImage: { path: "/home/hero-salami.jpg", width: 1280, height: 854, alt: "Pizza mit Salami, Oliven und Chili auf einem Holzbrett" },
  sameAs: [
    "https://www.facebook.com/profile.php?id=100079034319158",
    "https://www.instagram.com/wangen.pizza.kebab/",
  ],
  areaServed: [
    "Wangen SZ", "Lachen SZ", "Siebnen", "Galgenen", "Tuggen",
    "Nuolen", "Buttikon", "Schübelbach", "Reichenburg", "Altendorf",
  ],
  servesCuisine: ["Pizza", "Kebab", "Döner", "Pide", "Tacos"],
};

/** Restaurant-Oeffnungszeiten. */
export const OPENING_HOURS = [
  { key: "1", label: "Mo. – Do.", days: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "11:00", closes: "22:00" },
  { key: "2", label: "Fr. – Sa.", days: ["Friday", "Saturday"], opens: "11:00", closes: "23:00" },
  { key: "3", label: "So.", days: ["Sunday"], opens: "11:00", closes: "22:00" },
];

/** Lieferzeiten (ein oder zwei Fenster pro Tagesgruppe). */
export const DELIVERY_HOURS = [
  { key: "1", label: "Mo. – Do.", windows: [["10:30", "13:30"], ["16:00", "21:30"]] },
  { key: "2", label: "Fr. – Sa.", windows: [["10:30", "22:30"]] },
  { key: "3", label: "So.", windows: [["10:30", "21:30"]] },
];

/** Textform wie bisher im Footer: "11:00 - 22:00 Uhr" bzw. "10:30 - 13:30 Uhr 16:00 - 21:30 Uhr". */
export const openText = (h) => `${h.opens} - ${h.closes} Uhr`;
export const deliveryText = (d) => d.windows.map(([a, b]) => `${a} - ${b} Uhr`).join(" ");

/** Fliesstext fuer Reservation/FAQ: "Mo. – Do. 11:00 - 22:00 Uhr, Fr. – Sa. ..., So. ..." */
export const openingHoursSentence = () =>
  OPENING_HOURS.map((h) => `${h.label} ${openText(h)}`).join(", ");

export const addressLine = () =>
  `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}`;
