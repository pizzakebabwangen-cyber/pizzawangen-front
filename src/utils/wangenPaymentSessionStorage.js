import { clearPendingCashCheckout } from "./wangenPendingCashCheckout.js";

/** Leert die Zahlungs-Session erst bei Abschluss / PostFinance-Redirect — nicht beim Mount der Payment-Seite (Reload, Zurück, StrictMode). */
export function clearWangenCheckoutPaymentSession() {
  try {
    sessionStorage.removeItem("wangen_paymentResponse");
    sessionStorage.removeItem("wangen_voucherCheckout");
    clearPendingCashCheckout();
  } catch (_) {}
}
