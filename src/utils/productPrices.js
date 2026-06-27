/** Einheitliche Liefer- / Abholpreise aus API-Objekten (camelCase / PascalCase / pickupPrice). */

const toFiniteNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function getDeliveryUnitChf(meal) {
  const n = toFiniteNumber(meal?.price ?? meal?.Price);
  return n ?? 0;
}

export function getPickupUnitChf(meal) {
  const candidates = [
    meal?.pickup_Price,
    meal?.pickupPrice,
    meal?.Pickup_Price,
    meal?.PickupPrice,
  ];
  for (const c of candidates) {
    const n = toFiniteNumber(c);
    if (n !== null) return n;
  }
  return getDeliveryUnitChf(meal);
}
