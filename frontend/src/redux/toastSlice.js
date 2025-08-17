import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  message: '',
  severity: 'success', // 'success' | 'error' | 'warning' | 'info'
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast(state, action) {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    hideToast(state) {
      state.open = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
