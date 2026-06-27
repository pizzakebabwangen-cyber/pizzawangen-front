import { createSlice } from "@reduxjs/toolkit";

export const DeliverySlice = createSlice({
  name: "deliverMethod",
  initialState: {
    deliverMethod: null,
  },
  reducers: {
    handleDeliveryMethod: (state,action) => {
      state.deliverMethod = action.payload;
    },
  },
});


export default DeliverySlice.reducer;
export const { handleDeliveryMethod } = DeliverySlice.actions;