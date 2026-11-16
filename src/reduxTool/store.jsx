import { configureStore } from '@reduxjs/toolkit';

// import AuthReducer from "./AuthSlice"
import cartReducer from "./CartSlice"; 
import AuthReducer from "./AuthContext"
import authReducer from "./AuthSlice"
import checkReducer from "./CheckSlice";
import deliveryReducer from "./DeliverySlice"

const DELIVERY_STORAGE_KEY = "wangen-deliver-method";

function readStoredDeliverMethod() {
  try {
    const v = localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (v === "delivery" || v === "vorbestellung" || v === "collect") return v;
  } catch {
    /* ignore */
  }
  return null;
}

const CART_STORAGE_KEY = "wangen-cart";
const CART_MAX_AGE_MS = 24 * 60 * 60 * 1000; // gespeicherten Warenkorb nach 24 Stunden verwerfen (Preise/Angebot koennen sich aendern)

/** Warenkorb aus localStorage laden (nur gueltige Zeilen); undefined = leer starten. */
function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.savedAt || Date.now() - parsed.savedAt > CART_MAX_AGE_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return undefined;
    }
    const items = (Array.isArray(parsed.cart?.items) ? parsed.cart.items : []).filter(
      (it) =>
        it &&
        typeof it.productId === "number" &&
        Number.isInteger(it.quantity) &&
        it.quantity >= 1 &&
        Array.isArray(it.extensions) &&
        Number.isFinite(Number(it.totalPrice)) &&
        Number.isFinite(Number(it.totalPriceWithoutDelivery))
    );
    if (items.length === 0) return undefined;
    return {
      items,
      totalItems: items.reduce((s, it) => s + it.quantity, 0),
      totalPrice: items.reduce((s, it) => s + Number(it.totalPrice), 0),
      totalPriceWithoutDelivery: items.reduce((s, it) => s + Number(it.totalPriceWithoutDelivery), 0),
    };
  } catch {
    return undefined;
  }
}

const storedCart = readStoredCart();
export const store = configureStore({
  reducer: {
    Auth: AuthReducer,
    cart: cartReducer,
    auth: authReducer,
    checkSlice: checkReducer,
    delivery: deliveryReducer,
    // contact:contactReducer,
  },
  preloadedState: {
    delivery: { deliverMethod: readStoredDeliverMethod() },
    ...(storedCart ? { cart: storedCart } : {}),
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: false,
  //   }),
});

let lastPersistedDeliver = store.getState().delivery.deliverMethod;
store.subscribe(() => {
  const m = store.getState().delivery.deliverMethod;
  if (m === lastPersistedDeliver) return;
  lastPersistedDeliver = m;
  try {
    if (m) localStorage.setItem(DELIVERY_STORAGE_KEY, m);
    else localStorage.removeItem(DELIVERY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
});

// Warenkorb bei jeder Aenderung speichern. Leert der Shop den Warenkorb (clearCart), wird auch der Speicher geleert.
let lastPersistedCart = store.getState().cart;
store.subscribe(() => {
  const cart = store.getState().cart;
  if (cart === lastPersistedCart) return;
  lastPersistedCart = cart;
  try {
    if (Array.isArray(cart.items) && cart.items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), cart }));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
});