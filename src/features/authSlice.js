import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from '../api/axios';

// Ambil user & token dari localStorage saat refresh
const savedUser = JSON.parse(localStorage.getItem("user"));
const savedToken = localStorage.getItem("token");

const initialState = {
  user: savedUser || null,
  token: savedToken || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// const api = axios.create({
//   baseURL: 'https://navnotif.up.railway.app',
//   withCredentials: true
// });


export const LoginUser = createAsyncThunk(
  "user/LoginUser",
  async (user, thunkAPI) => {
    try {
      const response = await api.post(
        "/api/auth/login",
        {
          email: user.email,
          password: user.password,
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkAPI.rejectWithValue(error.response.data.msg);
      }
    }
  }
);


export const RegisterUser = createAsyncThunk(
  "user/RegisterUser",
  async (user, thunkAPI) => {
    try {
      const response = await api.post(
        "/api/auth/register",
        {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return thunkAPI.rejectWithValue(error.response.data.msg);
      }
    }
  }
);

// ===============================
//  GET USER DETAIL
// ===============================
// export const getUserDetail = createAsyncThunk(
//   "user/getUserDetail",
//   async (_, thunkAPI) => {
//     try {
//       const response = await api.get("/api/auth/me");
//       return response.data;
//     } catch (error) {
//       if (error.response) {
//         return thunkAPI.rejectWithValue(error.response.data.msg);
//       }
//     }
//   }
// );
export const getUserDetail = createAsyncThunk(
  "user/getUserDetail",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        "/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      if (error.response) {
        return thunkAPI.rejectWithValue(error.response.data.message);
      }

      return thunkAPI.rejectWithValue("Network Error");
    }
  }
);



export const LogOut = createAsyncThunk("user/Logout", async () => {
  await api.post("/api/auth/logout");
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(LoginUser.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(LoginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;

      state.user = action.payload.user;
      state.token = action.payload.token;

      // SIMPAN KE LOCAL STORAGE
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    });

    builder.addCase(LoginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
    });

    // Register
    builder.addCase(RegisterUser.fulfilled, (state, action) => {
      state.isSuccess = true;
      state.message = action.payload.msg;
    });

    // Get user detail
    builder.addCase(getUserDetail.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Logout
    builder.addCase(LogOut.fulfilled, (state) => {
      state.user = null;
      state.token = null;

      // HAPUS LOCAL STORAGE
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;