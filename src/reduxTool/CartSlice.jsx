/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createSlice } from "@reduxjs/toolkit";
import { getDeliveryUnitChf, getPickupUnitChf } from "../utils/productPrices";

/** Summen immer aus den Zeilen ableiten — verhindert Drift (z. B. doppelter Gesamtpreis). */
function syncTotalsFromItems(state) {
  let totalItems = 0;
  let totalPrice = 0;
  let totalPriceWithoutDelivery = 0;
  for (const item of state.items) {
    totalItems += Number(item.quantity) || 0;
    totalPrice += Number(item.totalPrice) || 0;
    totalPriceWithoutDelivery += Number(item.totalPriceWithoutDelivery) || 0;
  }
  state.totalItems = totalItems;
  state.totalPrice = totalPrice;
  state.totalPriceWithoutDelivery = totalPriceWithoutDelivery;
}

export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    totalPriceWithoutDelivery: 0,
  },
  reducers: {
    addMeal: (state, action) => {
      try {
        const meal = action.payload.meal;
        const rawQty = Number.parseInt(String(action.payload.quantity ?? 1), 10);
        const qty =
          Number.isFinite(rawQty) && rawQty >= 1 ? Math.min(rawQty, 99) : 1;
        // console.log("meal", meal);
        meal.extensions = action.payload.selectedExtensions || [];
        let priceOfTopings = 0;
        if (meal.extensions.length > 0) {
          priceOfTopings = meal.extensions.reduce((acc, obj) => {
            return acc + obj.price;
          }, 0);
        }
        const unitDelivery = getDeliveryUnitChf(meal) + priceOfTopings;
        const unitPickup = getPickupUnitChf(meal) + priceOfTopings;
        const arraysEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        const exist = state.items.find(
          (x) =>
            x.productId === meal.id &&
            arraysEqual(x.extensions, meal.extensions)
        );
        if (exist) {
          exist.quantity += qty;
          exist.totalPrice += unitDelivery * qty;
          exist.totalPriceWithoutDelivery += unitPickup * qty;
        } else {
          state.items.push({
            productId: meal.id,
            quantity: qty,
            price: getDeliveryUnitChf(meal),
            pickup_Price: getPickupUnitChf(meal),
            totalPrice: unitDelivery * qty,
            totalPriceWithoutDelivery: unitPickup * qty,
            name: meal.name,
            photoName: meal.photoName,
            offerNr: meal.offerNr,
            description1: meal.description1,
            description2: meal.description2,
            description3: meal.description3,
            extensions: meal.extensions,
          });
        }
        syncTotalsFromItems(state);
      } catch (err) {
        console.log("error in add meal", err);
      }
    },

    deleteMeal: (state, action) => {
      try {
        const meal = action.payload;
        const arraysEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        const exist = state.items.find(
          (x) =>
            x.productId === meal.productId &&
            arraysEqual(x.extensions, meal.extensions)
        );
        if (!exist) return;

        let priceOfTopings = 0;
        if (meal.extensions.length > 0) {
          priceOfTopings = meal.extensions.reduce((acc, obj) => {
            return acc + obj.price;
          }, 0);
        }
        if (exist.quantity > 1) {
          exist.quantity--;
          exist.totalPrice -= meal.price + priceOfTopings;
          exist.totalPriceWithoutDelivery -= meal.pickup_Price + priceOfTopings;
        } else if (exist.quantity === 1) {
          const arraysNotEqual = (a, b) =>
            JSON.stringify(a) !== JSON.stringify(b);
          state.items = state.items.filter(
            (x) =>
              x.productId !== meal.productId ||
              (x.productId === meal.productId &&
                arraysNotEqual(x.extensions, meal.extensions))
          );
        }
        syncTotalsFromItems(state);
      } catch (err) {
        console.log("error in delete item", err);
      }
    },

    removeMeal: (state, action) => {
      try {
        const meal = action.payload;
        const exist = state.items.find(
          (x) =>
            x.productId === meal.productId &&
            JSON.stringify(x.extensions) === JSON.stringify(meal.extensions)
        );
        if (!exist) return;

        state.items = state.items.filter(
          (x) =>
            x.productId !== meal.productId ||
            JSON.stringify(x.extensions) !== JSON.stringify(meal.extensions)
        );
        syncTotalsFromItems(state);
      } catch (err) {
        console.log("can't remove this meal", err);
      }
    },

    addMealFromCart: (state, action) => {
      const meal = action.payload;
      const arraysEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const exist = state.items.find(
        (x) =>
          x.productId === meal.productId &&
          arraysEqual(x.extensions, meal.extensions)
      );
      if (!exist) return;

      let priceOfTopings = 0;
      if (meal.extensions?.length > 0) {
        priceOfTopings = meal.extensions.reduce((acc, obj) => {
          return acc + obj.price;
        }, 0);
      }
      exist.quantity++;
      exist.totalPrice += meal.price + priceOfTopings;
      exist.totalPriceWithoutDelivery += meal.pickup_Price + priceOfTopings;
      syncTotalsFromItems(state);
    },
    clearCart: (state, action) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.totalPriceWithoutDelivery = 0;
    }
  },
});

export const { addMeal, deleteMeal, removeMeal, addMealFromCart, clearCart } =
  CartSlice.actions;
export default CartSlice.reducer;
