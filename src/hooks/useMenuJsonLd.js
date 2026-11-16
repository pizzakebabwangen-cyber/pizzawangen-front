import { useEffect } from "react";
import { SITE } from "../config/site.js";
import { sortProductsForMenu } from "../utils/sortProductsForMenu";
import { getDeliveryUnitChf } from "../utils/productPrices";

const SCRIPT_ID = "menu-jsonld";
const EXCLUDED_CATEGORIES = ["Offers", "Bonus"]; // wie die Suche in Menue.jsx
const START_DELAY_MS = 2000; // erst nach dem ersten Rendern, damit Bestell-Anfragen Vorrang haben

const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

const toMenuItem = (product) => {
  const name = clean(product?.name);
  const price = getDeliveryUnitChf(product); // Lieferpreis (Feld Price)
  if (!name || !(price > 0)) return null;
  const item = {
    "@type": "MenuItem",
    name,
    offers: { "@type": "Offer", price: price.toFixed(2), priceCurrency: "CHF" },
  };
  const description = clean(product?.description);
  if (description) item.description = description;
  return item;
};

/** Menu > MenuSection (Kategorie) > MenuSection (Unterkategorie) > MenuItem. Gibt null zurueck, wenn nichts Brauchbares da ist. */
export function buildMenuJsonLd(categories, productsBySubId) {
  const sections = [];
  for (const cat of categories) {
    if (EXCLUDED_CATEGORIES.includes(cat?.name)) continue;
    const subs = (cat.subCategory || [])
      .map((sc) => ({
        "@type": "MenuSection",
        name: clean(sc.name),
        hasMenuItem: (productsBySubId.get(sc.id) || []).map(toMenuItem).filter(Boolean),
      }))
      .filter((s) => s.name && s.hasMenuItem.length > 0);
    if (subs.length === 0) continue;
    if (subs.length === 1) {
      sections.push({ "@type": "MenuSection", name: clean(cat.name) || subs[0].name, hasMenuItem: subs[0].hasMenuItem });
    } else {
      sections.push({ "@type": "MenuSection", name: clean(cat.name), hasMenuSection: subs });
    }
  }
  if (sections.length === 0) return null;
  const menuId = `${SITE.url}/menue#menu`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Restaurant", "@id": `${SITE.url}/#restaurant`, hasMenu: { "@id": menuId } },
      {
        "@type": "Menu",
        "@id": menuId,
        name: "Speisekarte",
        url: `${SITE.url}/menue`,
        inLanguage: "de-CH",
        hasMenuSection: sections,
      },
    ],
  };
}

/**
 * Setzt auf /menue ein Menu-JSON-LD aus den vorhandenen Produktdaten (nur Lesezugriffe auf dieselben
 * API-Endpunkte wie die Menue-Suche). Beeinflusst weder Warenkorb noch Bestellung; bei Fehlern passiert nichts.
 * Das Script wird beim Verlassen der Seite wieder entfernt.
 */
export default function useMenuJsonLd(categories, server) {
  useEffect(() => {
    if (!Array.isArray(categories) || categories.length === 0) return undefined;
    let cancelled = false;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const subs = categories
          .filter((cat) => !EXCLUDED_CATEGORIES.includes(cat?.name))
          .flatMap((cat) => cat.subCategory || [])
          .filter((sc) => sc?.id);
        const results = await Promise.all(
          subs.map(async (sc) => {
            try {
              const response = await fetch(
                `${server}/api/Product/GetAllProductsBySubCategoryId?id=${sc.id}`,
                { signal: controller.signal }
              );
              const data = await response.json();
              return [sc.id, sortProductsForMenu(data?.data || [])];
            } catch {
              return [sc.id, []];
            }
          })
        );
        if (cancelled) return;
        const graph = buildMenuJsonLd(categories, new Map(results));
        if (!graph) return;
        let el = document.getElementById(SCRIPT_ID);
        if (!el) {
          el = document.createElement("script");
          el.type = "application/ld+json";
          el.id = SCRIPT_ID;
          document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(graph).replace(/</g, "\\u003c");
      } catch {
        /* JSON-LD ist optional: Fehler ignorieren */
      }
    }, START_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [categories, server]);
}
