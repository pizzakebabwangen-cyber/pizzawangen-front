import { OPENING_HOURS, DELIVERY_HOURS, openText, deliveryText } from "../config/site.js";

/**
 * Canonical opening & delivery hours (Arbeitszeiten / Lieferzeiten).
 * Shown in the footer when the API returns no data. Keep in sync with backend / Company DB.
 *
 * Option availability (reference):
 * | Option                    | Restaurant open | Restaurant closed |
 * | Liefern                  | yes             | yes (Vorbestellung) |
 * | so schnell wie möglich   | yes             | no (geschlossen)   |
 * | Vorbestellung            | yes             | yes                |
 * | Abholen                  | yes             | yes                |
 */
// Werte kommen aus src/config/site.js (einzige Quelle, auch fuer JSON-LD und Meta-Tags).
export const DEFAULT_COMPANY_HOURS = {
  openTime1: openText(OPENING_HOURS[0]),
  openTime2: openText(OPENING_HOURS[1]),
  openTime3: openText(OPENING_HOURS[2]),
  delivery1: deliveryText(DELIVERY_HOURS[0]),
  delivery2: deliveryText(DELIVERY_HOURS[1]),
  delivery3: deliveryText(DELIVERY_HOURS[2]),
};
