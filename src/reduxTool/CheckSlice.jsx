/* eslint-disable react-refresh/only-export-components */
import { createSlice } from "@reduxjs/toolkit";

export const CheckSlice=createSlice({
    name:"checkSlice",
    initialState:{
        isCheck:false,
    },
    reducers:{
        handleCheck:(state)=>{
            state.isCheck=!state.isCheck;
        }
    }
})


export default CheckSlice.reducer;
export const { handleCheck } = CheckSlice.actions;