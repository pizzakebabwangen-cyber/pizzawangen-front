const STORAGE_KEY = "wangen-lang";
const SUPPORTED = ["DE", "EN", "FR", "IT"];

const TEXTS = {
  EN: {
    Home: "Home",
    "Menü": "Menu",
    "Angebote & Gutscheine": "Offers & Vouchers",
    Gutscheine: "Vouchers",
    Reservation: "Reservation",
    Kontakt: "Contact",
    Bestellen: "Order",
    Postleitzahl: "Postal code",
    "Postleitzahl unbekannt?": "Postal code unknown?",
    Liefern: "Delivery",
    Abholen: "Pickup",
    "Unser Menü": "Our Menu",
    Liefergebiete: "Delivery areas",
    "Zur Kasse": "Checkout",
    "Bitte Liefer-PLZ im Bestellfenster eingeben.": "Please enter delivery postal code in the order window.",
    "Nur Browsing": "Browse only",
    "Sie müssen eine gueltige Postleitzahl eingeben ....": "You must enter a valid postal code ....",
  },
  FR: {
    Home: "Accueil",
    "Menü": "Menu",
    "Angebote & Gutscheine": "Offres & Bons",
    Gutscheine: "Bons",
    Reservation: "Reservation",
    Kontakt: "Contact",
    Bestellen: "Commander",
    Postleitzahl: "Code postal",
    "Postleitzahl unbekannt?": "Code postal inconnu ?",
    Liefern: "Livraison",
    Abholen: "A emporter",
    "Unser Menü": "Notre menu",
    Liefergebiete: "Zones de livraison",
    "Zur Kasse": "Paiement",
    "Bitte Liefer-PLZ im Bestellfenster eingeben.": "Veuillez saisir le code postal de livraison dans la fenetre de commande.",
    "Nur Browsing": "Navigation uniquement",
    "Sie müssen eine gueltige Postleitzahl eingeben ....": "Vous devez saisir un code postal valide ....",
  },
  IT: {
    Home: "Home",
    "Menü": "Menu",
    "Angebote & Gutscheine": "Offerte & Buoni",
    Gutscheine: "Buoni",
    Reservation: "Prenotazione",
    Kontakt: "Contatto",
    Bestellen: "Ordina",
    Postleitzahl: "CAP",
    "Postleitzahl unbekannt?": "CAP sconosciuto?",
    Liefern: "Consegna",
    Abholen: "Asporto",
    "Unser Menü": "Il nostro menu",
    Liefergebiete: "Zone di consegna",
    "Zur Kasse": "Cassa",
    "Bitte Liefer-PLZ im Bestellfenster eingeben.": "Inserisci il CAP di consegna nella finestra d'ordine.",
    "Nur Browsing": "Solo navigazione",
    "Sie müssen eine gueltige Postleitzahl eingeben ....": "Devi inserire un CAP valido ....",
  },
};

const originalTextByNode = new WeakMap();

export const normalizeLanguage = (lang) => {
  const up = String(lang || "DE").toUpperCase();
  return SUPPORTED.includes(up) ? up : "DE";
};

export const getInitialLanguage = () => {
  const stored = normalizeLanguage(localStorage.getItem(STORAGE_KEY) || "DE");
  localStorage.setItem(STORAGE_KEY, stored);
  localStorage.setItem("lang", stored);
  localStorage.setItem("language", stored);
  localStorage.setItem("i18nextLng", stored.toLowerCase());
  document.documentElement.lang = stored.toLowerCase();
  return stored;
};

const translateText = (text, lang) => {
  if (lang === "DE") return text;
  const table = TEXTS[lang] || {};
  return table[text] || text;
};

export const applyRuntimeLanguage = (lang) => {
  const active = normalizeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, active);
  localStorage.setItem("lang", active);
  localStorage.setItem("language", active);
  localStorage.setItem("i18nextLng", active.toLowerCase());
  document.documentElement.lang = active.toLowerCase();
  // Only walk #root — third-party scripts/widgets on <body> (e.g. Google Merchant, embedded
  // previews like MiniMax) must not have their text nodes rewritten or the UI breaks.
  const root = document.getElementById("root");
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    if (!node || !node.parentElement) continue;
    const tag = node.parentElement.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") continue;
    if (node.parentElement.closest("[data-no-runtime-translate='true']")) continue;

    const raw = node.nodeValue || "";
    const trimmed = raw.trim();
    if (!trimmed) continue;
    // Avoid overriding dynamic UI values (cart counters, prices, etc.).
    if (/^\d+([.,]\d+)?$/.test(trimmed)) continue;

    if (!originalTextByNode.has(node)) {
      originalTextByNode.set(node, raw);
    }
    const originalRaw = originalTextByNode.get(node) || raw;
    const match = originalRaw.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match) continue;
    const translated = translateText(match[2], active);
    node.nodeValue = `${match[1]}${translated}${match[3]}`;
  }

  root.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
    const key = "data-orig-placeholder";
    const original = el.getAttribute(key) ?? (el.getAttribute("placeholder") || "");
    if (!el.hasAttribute(key)) el.setAttribute(key, original);
    const translated = translateText(original, active);
    el.setAttribute("placeholder", translated);
  });
};

