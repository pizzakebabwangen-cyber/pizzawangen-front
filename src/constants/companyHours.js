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
export const DEFAULT_COMPANY_HOURS = {
  openTime1: "11:00 - 22:00 Uhr",
  openTime2: "11:00 - 23:00 Uhr",
  openTime3: "11:00 - 22:00 Uhr",
  delivery1: "10:30 - 13:30 Uhr 16:00 - 21:30 Uhr",
  delivery2: "10:30 - 22:30 Uhr",
  delivery3: "10:30 - 21:30 Uhr",
};
