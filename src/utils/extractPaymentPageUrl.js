/** True if value is a non-empty URL-like string. */
function isNonEmptyUrlString(v) {
  const s = String(v ?? "").trim();
  return s.length > 0 && /^https?:\/\//i.test(s);
}

/**
 * Reads PSP / PostFinance payment URL from various API shapes (camelCase, PascalCase, nested data).
 */
export function extractPaymentPageUrl(root) {
  if (!root || typeof root !== "object") return "";

  const tryVal = (v) => (isNonEmptyUrlString(v) ? String(v).trim() : "");

  const candidates = [
    tryVal(root.paymentPageUrl),
    tryVal(root.PaymentPageUrl),
    tryVal(root.paymentURL),
    tryVal(root.PaymentURL),
    tryVal(root.payment_url),
    tryVal(root.paymentLink),
    tryVal(root.PaymentLink),
  ];
  for (const c of candidates) {
    if (c) return c;
  }

  const d = root.data ?? root.Data;
  if (d && typeof d === "object") {
    const nested = [
      tryVal(d.paymentPageUrl),
      tryVal(d.PaymentPageUrl),
      tryVal(d.paymentURL),
      tryVal(d.PaymentURL),
    ];
    for (const c of nested) {
      if (c) return c;
    }
  }

  const inner = root.result ?? root.Result ?? root.value ?? root.Value;
  if (inner && typeof inner === "object") {
    const fromInner = extractPaymentPageUrl(inner);
    if (fromInner) return fromInner;
  }

  for (const k of Object.keys(root)) {
    if (/payment/i.test(k) && /(url|link)/i.test(k)) {
      const c = tryVal(root[k]);
      if (c) return c;
    }
  }

  return "";
}
