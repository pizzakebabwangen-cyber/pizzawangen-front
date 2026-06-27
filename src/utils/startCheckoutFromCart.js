import axios from "axios";
import { isDeliveryOrPreorder } from "./isDeliveryOrPreorder.js";
import { mapCartItemsForApi } from "./mapCartItemsForApi.js";
import {
  persistVisitorIdFromApiResponse,
  setCheckoutUnlockedFlag,
} from "./checkoutVisitorStorage.js";

export async function startCheckoutFromCart({ cartItems, deliveryMethod, server }) {
  const endpoint = isDeliveryOrPreorder(deliveryMethod)
    ? `${server}/api/Cart/cart/add`
    : `${server}/api/Cart/pickup_cart/add`;

  const response = await axios.post(
    endpoint,
    {
      items: mapCartItemsForApi(cartItems),
      replaceExistingItems: true,
    },
    { withCredentials: true }
  );

  persistVisitorIdFromApiResponse(response.data);
  setCheckoutUnlockedFlag();

  return response.data;
}
