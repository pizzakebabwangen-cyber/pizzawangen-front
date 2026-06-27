import { isDeliveryOrPreorder } from "./isDeliveryOrPreorder.js";

export const DELIVERY_POSTCODE_STORAGE_KEY = "wangen-delivery-postcode";

export const extractFourDigitPlz = (value) => {
  const match = String(value || "").match(/\d{4}/);
  return match ? match[0] : "";
};

export const getCartTotalForDeliveryMinimum = (items, deliveryMethod) => {
  if (!Array.isArray(items)) return 0;
  const useDeliveryPrice = isDeliveryOrPreorder(deliveryMethod);
  return items.reduce((sum, item) => {
    const lineTotal = useDeliveryPrice
      ? item?.totalPrice
      : item?.totalPriceWithoutDelivery;
    return sum + Number(lineTotal || 0);
  }, 0);
};

export const getMinimumOrderForPlz = (deliveryData, plz) => {
  const cleanPlz = extractFourDigitPlz(plz);
  if (!cleanPlz || !Array.isArray(deliveryData)) return null;

  const area = deliveryData.find(
    (row) => String(row?.postBox ?? row?.PostBox ?? "").trim() === cleanPlz
  );
  if (!area) return null;

  const minimum = Number(area.orderAb ?? area.OrderAb ?? 0);
  return Number.isFinite(minimum) && minimum > 0 ? minimum : null;
};

export const getDeliveryMinimumBlock = ({
  deliveryData,
  deliveryMethod,
  items,
  postcode,
}) => {
  if (!isDeliveryOrPreorder(deliveryMethod)) return null;

  const cleanPlz =
    extractFourDigitPlz(postcode) ||
    (typeof localStorage !== "undefined"
      ? extractFourDigitPlz(localStorage.getItem(DELIVERY_POSTCODE_STORAGE_KEY))
      : "");
  const minimum = getMinimumOrderForPlz(deliveryData, cleanPlz);
  if (!minimum) return null;

  const total = getCartTotalForDeliveryMinimum(items, deliveryMethod);
  if (total > 0 && total < minimum) {
    return {
      plz: cleanPlz,
      total,
      minimum,
      missing: minimum - total,
    };
  }

  return null;
};
