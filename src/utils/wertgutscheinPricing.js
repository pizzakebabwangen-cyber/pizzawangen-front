/** Muss mit WangenPizza.Helper.WertgutscheinPricing übereinstimmen (CH). */
export const WERTGUTSCHEIN_BEARBEITUNG_NET_CHF = 5.0;
export const WERTGUTSCHEIN_MWST_SATZ = 0.081;

export function wertgutscheinPortoChf(voucherQuantity) {
  const q = !voucherQuantity || voucherQuantity < 1 ? 1 : voucherQuantity;
  return q >= 10 ? 1.7 : 1.2;
}

export function computeWertgutscheinTotals(faceValueChf, voucherQuantity = 1) {
  const porto = wertgutscheinPortoChf(voucherQuantity);
  const feeNet = WERTGUTSCHEIN_BEARBEITUNG_NET_CHF + porto;
  const mwst = Math.round(feeNet * WERTGUTSCHEIN_MWST_SATZ * 100) / 100;
  const feeBrutto = feeNet + mwst;
  const total = faceValueChf + feeBrutto;
  return { feeNet, mwst, feeBrutto, total };
}
