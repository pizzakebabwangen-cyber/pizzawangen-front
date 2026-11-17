/**
 * FAQ-Inhalt: eine Quelle fuer die Seite (FaqSection.jsx) und das FAQPage-JSON-LD (seo.js).
 * Reines ESM ohne JSX, damit auch der Build (Node) es importieren kann.
 */
import { SITE, OPENING_HOURS, addressLine } from "./site.js";
import { DEFAULT_COMPANY_HOURS } from "../constants/companyHours.js";

export const FAQ_ITEMS = [
  {
    q: "Wo liefert Wangen Pizza Kebab?",
    a: "Wir liefern nach Wangen SZ, Lachen, Siebnen, Galgenen, Tuggen, Nuolen, Reichenburg, Buttikon, Schübelbach und Altendorf. Alle PLZ und Mindestbestellwerte stehen weiter unten unter «Liefergebiete».",
  },
  {
    q: "Was sind Ihre Öffnungszeiten?",
    a: `Mo–Do: ${DEFAULT_COMPANY_HOURS.openTime1}, Fr–Sa: ${DEFAULT_COMPANY_HOURS.openTime2}, So: ${DEFAULT_COMPANY_HOURS.openTime3}.`,
  },
  {
    q: "Lieferung oder Abholung?",
    a: "Beides ist möglich. Beim Bestellen auf pizzawangen.ch wählen Sie «Liefern» oder «Abholen».",
  },
  {
    q: "Wie bestelle ich online?",
    a: "Öffnen Sie unser Menü unter /menue, wählen Sie Ihre Gerichte, legen Sie sie in den Warenkorb und schliessen Sie die Bestellung ab.",
  },
  {
    q: "Gibt es Wertgutscheine?",
    a: "Ja. Gutscheine können Sie direkt auf unserer Website unter «Gutscheine» bestellen.",
  },
  {
    q: "Wie erreiche ich das Restaurant?",
    a: `Telefon: ${SITE.phoneDisplay}, E-Mail: ${SITE.email}, Adresse: ${addressLine()}.`,
  },
];

/** Kurze FAQ fuer die Startseite (Liefergebiet, Halal, Oeffnungszeiten, Zahlung). Gleiche Quelle fuer Seite und FAQPage-JSON-LD. */
const homeAreaList = `${SITE.areaServed.slice(0, -1).join(", ")} und ${SITE.areaServed.at(-1)}`;
/** "Mo.–Do. 11:00–22:00 Uhr, Fr.–Sa. 11:00–23:00 Uhr, So. 11:00–22:00 Uhr" */
const homeHoursSentence = OPENING_HOURS.map(
  (h) => `${h.label.replace(/\s*–\s*/, "–")} ${h.opens}–${h.closes} Uhr`
).join(", ");

export const HOME_FAQ_ITEMS = [
  {
    q: "In welche Orte liefert der Pizza-Kurier?",
    a: `Wir liefern nach ${homeAreaList}. Alternativ können Sie Ihre Bestellung bei uns in ${SITE.address.locality} abholen.`,
  },
  {
    q: "Ist das Fleisch Halal?",
    a: "Ja, unser Kebab- und Pouletfleisch ist 100 % Halal.",
  },
  {
    q: "Wie sind die Öffnungszeiten?",
    a: `${homeHoursSentence}.`,
  },
  {
    q: "Wie kann ich bezahlen?",
    a: "Sie können bar bezahlen oder online per Kreditkarte, TWINT oder PostFinance.",
  },
];
