/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";


export const AuthContext =createSlice({
    name:"auth",
    initialState:{
        isCheckedOut:false,
    },
    reducers:{
        successCheckOut:(state,action)=>{
            state.isCheckedOut=true;
        },
        FailedCheckOut:(state,action)=>{
            state.isCheckedOut=false;
        },
    }
})

export const {successCheckOut,FailedCheckOut}=AuthContext.actions;
export default AuthContext.reducer;
