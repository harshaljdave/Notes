import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/check_auth/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post('api/login/', credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  const response = await axios.post('/api/logout/');
  return response.data;
});

const initialState = {
  isAuthenticated: false,
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = action.payload.error;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'idle'; // Explicitly reset status
        state.error = null;
      });
  },
});

export default authSlice.reducer;
