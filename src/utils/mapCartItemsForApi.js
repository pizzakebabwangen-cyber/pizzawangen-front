/** API erwartet CartItemDto — gleiche Abbildung wie im Warenkorb vor cart/add. */
export const mapCartItemsForApi = (items) =>
  (Array.isArray(items) ? items : []).map((it) => ({
    productId: typeof it.productId === "number" ? it.productId : 0,
    quantity: Number(it.quantity || 1),
    extensions: Array.isArray(it.extensions) ? it.extensions : [],
    isWertgutschein: false,
    wertgutscheinBetragChf: null,
  }));
