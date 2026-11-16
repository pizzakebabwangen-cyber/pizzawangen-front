/**
 * Inhalte der Orts- und Gericht-Landingpages (lokale Suche: Pizza/Kebab/Döner + Ort).
 * Reines ESM ohne Browser-APIs, damit seo.js (Build/Prerender) und die App denselben Text nutzen.
 * Lieferzeiten, Adresse und Telefon kommen NICHT von hier, sondern aus site.js (einzige Quelle).
 * Schweizer Rechtschreibung (ss statt ß).
 */
import { SITE } from "./site.js";

const BRAND = SITE.name;

export const LANDING_PAGES = [
  {
    path: "/pizza-lieferung-lachen",
    file: "pizza-lieferung-lachen.html",
    short: "Pizza Lachen",
    title: `Pizza Lieferung Lachen SZ | ${BRAND}`,
    description:
      "Pizza nach Lachen bestellen: Wangen Pizza Kebab liefert frisch zubereitete Pizza, Kebab und Pide von Wangen SZ nach Lachen. Jetzt online bestellen.",
    h1: "Pizza Lieferung in Lachen",
    intro: [
      "Lust auf Pizza in Lachen? Wangen Pizza Kebab bringt Ihre Bestellung von der Zürcherstrasse 3 in Wangen SZ direkt zu Ihnen nach Lachen.",
      "Unsere Pizza wird frisch zubereitet, für den Teig verwenden wir 100 % italienisches Mehl. Suchen Sie sich in der Speisekarte Ihre Lieblingspizza aus, ergänzen Sie sie mit Kebab, Pide oder einem Teller und bestellen Sie direkt online.",
    ],
    deliveryHeading: "Lieferung nach Lachen",
    deliveryText:
      "Wir liefern nach Lachen zu den unten genannten Lieferzeiten. Den Mindestbestellwert für Ihre Postleitzahl finden Sie unter «Liefergebiete» auf der Kontaktseite. Sie können Ihre Bestellung auch bei uns in Wangen abholen.",
  },
  {
    path: "/pizza-siebnen",
    file: "pizza-siebnen.html",
    short: "Pizza Siebnen",
    title: `Pizza Siebnen: Lieferung & Abholung | ${BRAND}`,
    description:
      "Pizza in Siebnen bestellen: Lieferung oder Abholung bei Wangen Pizza Kebab in Wangen SZ. Salami, Spinat, Rucola und mehr, frisch aus dem Ofen.",
    h1: "Pizza in Siebnen bestellen",
    intro: [
      "Feierabend in Siebnen und keine Lust zu kochen? Bei Wangen Pizza Kebab bestellen Sie Ihre Pizza online, wir liefern sie Ihnen nach Siebnen.",
      "Ob Pizza mit Salami, Spinat oder Rucola: Alles wird frisch zubereitet. Dazu passen Pide, Kebab oder ein Teller, die Sie in derselben Bestellung wählen können.",
    ],
    deliveryHeading: "Lieferung oder Abholung",
    deliveryText:
      "Siebnen gehört zu unserem Liefergebiet. Die Lieferzeiten stehen weiter unten, den Mindestbestellwert für Ihre Postleitzahl sehen Sie unter «Liefergebiete» auf der Kontaktseite. Wer lieber selbst vorbeikommt, holt die Bestellung an der Zürcherstrasse 3 in Wangen SZ ab.",
  },
  {
    path: "/pizza-altendorf",
    file: "pizza-altendorf.html",
    short: "Pizza Altendorf",
    title: `Pizza bestellen in Altendorf SZ | ${BRAND}`,
    description:
      "Pizza, Kebab und Pide nach Altendorf bestellen: Wangen Pizza Kebab aus Wangen SZ liefert frisch zubereitet. Online bestellen oder abholen.",
    h1: "Pizza bestellen in Altendorf",
    intro: [
      "Auch in Altendorf müssen Sie nicht auf frische Pizza verzichten: Wangen Pizza Kebab aus Wangen SZ liefert Ihre Bestellung zu Ihnen nach Hause.",
      "Neben Pizza finden Sie in unserer Speisekarte Kebab im Taschenbrot, Pide, Teller und Boxen. Das Taschenbrot backen wir selbst, und auch die Falafel machen wir bei uns.",
    ],
    deliveryHeading: "Lieferung nach Altendorf",
    deliveryText:
      "Altendorf gehört zu unserem Liefergebiet. Es gelten die unten genannten Lieferzeiten. Den Mindestbestellwert für Ihre Postleitzahl finden Sie unter «Liefergebiete» auf der Kontaktseite, und auf Wunsch holen Sie Ihre Bestellung in Wangen ab.",
  },
  {
    path: "/pizza-tuggen",
    file: "pizza-tuggen.html",
    short: "Pizza Tuggen",
    title: `Pizza bestellen in Tuggen SZ | ${BRAND}`,
    description:
      "Pizza nach Tuggen bestellen: Wangen Pizza Kebab liefert Pizza, Kebab und Pide aus Wangen SZ nach Tuggen. Einfach online bestellen.",
    h1: "Pizza Lieferung nach Tuggen",
    intro: [
      "Von Wangen SZ nach Tuggen: Wangen Pizza Kebab liefert Pizza, Kebab und Pide direkt zu Ihnen.",
      "Bestellen Sie bequem online, zum Beispiel für den Familienabend oder mit Freunden. Eine Freude zum Verschenken sind ausserdem unsere Wertgutscheine, die Sie ebenfalls online bestellen können.",
    ],
    deliveryHeading: "Lieferung nach Tuggen",
    deliveryText:
      "Tuggen gehört zu unserem Liefergebiet. Die Lieferzeiten stehen unten, den Mindestbestellwert für Ihre Postleitzahl sehen Sie unter «Liefergebiete» auf der Kontaktseite. Abholen können Sie jederzeit während der Öffnungszeiten in Wangen.",
  },
  {
    path: "/kebab-wangen",
    file: "kebab-wangen.html",
    short: "Kebab Wangen",
    title: `Kebab in Wangen SZ | ${BRAND}`,
    description:
      "Halal Kebab in Wangen SZ: frisch zubereitet im selbst gebackenen Taschenbrot, dazu hausgemachte Falafel. Online bestellen, abholen oder liefern lassen.",
    h1: "Kebab in Wangen SZ",
    intro: [
      "Bei uns an der Zürcherstrasse 3 in Wangen SZ gibt es Kebab, wie er sein soll: frisch zubereitet und im Taschenbrot, das wir selbst backen.",
      "Wer es vegetarisch mag, probiert unsere Falafel, die wir ebenfalls selbst machen. Kebab, Teller und Boxen bestellen Sie online, holen sie bei uns ab oder lassen sie sich liefern.",
      "Kebab- und Pouletfleisch 100 % Halal",
    ],
    deliveryHeading: "Abholen oder liefern lassen in Wangen",
    deliveryText:
      "Kommen Sie in Wangen vorbei und holen Sie Ihren Kebab frisch ab, oder bestellen Sie ihn online mit Lieferung. Die Liefer- und Öffnungszeiten stehen unten, die Mindestbestellwerte unter «Liefergebiete» auf der Kontaktseite.",
  },
  {
    path: "/doener-wangen",
    file: "doener-wangen.html",
    short: "Döner Wangen",
    title: `Döner in Wangen SZ: Pide & Teller | ${BRAND}`,
    description:
      "Halal Döner in Wangen SZ bestellen: Pide mit Döner, Teller und Boxen bei Wangen Pizza Kebab. Online bestellen, abholen oder liefern lassen.",
    h1: "Döner in Wangen SZ",
    intro: [
      "Sie suchen Döner in Wangen? Bei Wangen Pizza Kebab gibt es ihn zum Beispiel als Pide mit Döner, daneben als Teller oder Box.",
      "Alles wird frisch für Sie zubereitet. Ihre Bestellung geben Sie bequem online auf, und wenn Sie mögen, finden Sie in der Speisekarte auch Pizza und Kebab für den Rest der Runde.",
      "Kebab- und Pouletfleisch 100 % Halal",
    ],
    deliveryHeading: "Döner abholen oder liefern lassen",
    deliveryText:
      "Holen Sie Ihren Döner an der Zürcherstrasse 3 in Wangen SZ ab oder lassen Sie ihn sich liefern. Die Zeiten stehen unten, die Mindestbestellwerte je Ort unter «Liefergebiete» auf der Kontaktseite.",
  },
];
