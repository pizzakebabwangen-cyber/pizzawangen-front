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