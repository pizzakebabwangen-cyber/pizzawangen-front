import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { usePostData } from "../hooks/usePostDate"


const initialState = {
    // Registeruser: [],
    // loginUser: [],
    // isloading: false,
    // error: null,
    // forget: [],
    // reset: [], 
    // contact:[],
    userData:{},
}

export const RegisterPage = createAsyncThunk(
    "registerUser",
    async (userData, thunkAPI) => {
        try {
            const resp = await usePostData("/api/Auth/Register", userData)
            return resp
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)
export const LoginPage = createAsyncThunk(
    "LoginUser",
    async (userData, thunkAPI) => {
        try {
            const resp = await usePostData("/api/Auth/Login", userData)
            return resp
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)
export const ForgetPasswrod = createAsyncThunk(
    "forgetPassword",
    async (email, thunkAPI) => {
        try {
            const resp = await usePostData(`/api/Auth/ForgetPassword/${encodeURIComponent(email)}`)
            return resp
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)
export const ResetPasswrod = createAsyncThunk(
    "ResetPassword",
    async (data, thunkAPI) => {
        try {
            const resp = await usePostData("/api/Auth/ResetPassword", data)
            return resp
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

export const sendContact=createAsyncThunk(
    "contact",
    async(data,thunkAPI)=>{
        try{
            const resp = await usePostData("/api/Auth/ResetPassword", data);
            return resp
        }catch(error){
              return thunkAPI.rejectWithValue(error);
        }
    }
)

// export const getUserData=createAsyncThunk(
//   "getUserData",
//   async(data,thunkAPI)=>{
//       try{
//           const resp = await usePostData("/api/Auth/GetUserData", data);
//           return resp
//       }catch(error){
//             return thunkAPI.rejectWithValue(error);
//       }
//   }
// )

const AuthSlice = createSlice({
    name: "authentication",
    initialState,
    reducers: {
      setUserData:(state,action)=>{
        state.userData=action.payload
      }
    },
    extraReducers: (builder) => {
        builder
          // .register Page
          .addCase(RegisterPage.pending, (state) => {
            state.isloading = true;
          })
          .addCase(RegisterPage.fulfilled, (state, action) => {
            state.Registeruser = action.payload;
            state.status = action.payload.status;
            state.isloading = false;
            state.error = null;
          })
          .addCase(RegisterPage.rejected, (state, action) => {
            state.error = action.payload.response.data;
            state.isloading = false;
          })

          // .login Page
          .addCase(LoginPage.pending, (state) => {
            state.isloading = true;
          })
          .addCase(LoginPage.fulfilled, (state, action) => {
            state.loginUser = action.payload;
            state.status = action.payload.status;
            state.isloading = false;
            state.error = null;
          })
          .addCase(LoginPage.rejected, (state, action) => {
            state.error = action.payload.response.data;
            state.isloading = false;
          })

          // .Forget password
          .addCase(ForgetPasswrod.pending, (state) => {
            state.isloading = true;
          })
          .addCase(ForgetPasswrod.fulfilled, (state, action) => {
            state.forget = action.payload;
            state.status = action.payload.status;
            state.isloading = false;
            state.error = null;
          })
          .addCase(ForgetPasswrod.rejected, (state, action) => {
            state.error = action.payload;
            state.isloading = false;
          })

          // .reset password
          .addCase(ResetPasswrod.pending, (state) => {
            state.isloading = true;
          })
          .addCase(ResetPasswrod.fulfilled, (state, action) => {
            state.reset = action.payload;
            state.status = action.payload.status;
            state.isloading = false;
            state.error = null;
          })
          .addCase(ResetPasswrod.rejected, (state, action) => {
            state.error = action.payload;
            state.isloading = false;
          })
          // sendContact
          .addCase(sendContact.pending, (state) => {
            state.isloading = true;
          })
          .addCase(sendContact.fulfilled, (state, action) => {
            state.contact = action.payload;
            state.status = action.payload.status;
            state.isloading = false;
            state.error = null;
          })
          .addCase(sendContact.rejected, (state, action) => {
            state.error = action.payload;
            state.isloading = false;
          });

    }
})
export const { setUserData  } =
  AuthSlice.actions;
export default AuthSlice.reducer