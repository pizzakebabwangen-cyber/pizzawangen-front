/** Lieferung und Vorbestellung nutzen Lieferpreis; nur Abholung nutzt Abholpreis. */
export function isDeliveryOrPreorder(method) {
  return method === "delivery" || method === "vorbestellung";
}
