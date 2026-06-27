/** Barzahlung: Bestell-JSON bis «Bestellen» auf der Payment-Seite — erst dann POST /api/Cart/order. */
export const PENDING_CASH_CHECKOUT_KEY = "wangen_pendingCashCheckout";

export function savePendingCashCheckout(obj) {
  try {
    sessionStorage.setItem(PENDING_CASH_CHECKOUT_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

export function readPendingCashCheckout() {
  try {
    const raw = sessionStorage.getItem(PENDING_CASH_CHECKOUT_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v || typeof v !== "object" || !v.payload) return null;
    return v;
  } catch {
    return null;
  }
}

export function clearPendingCashCheckout() {
  try {
    sessionStorage.removeItem(PENDING_CASH_CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}
