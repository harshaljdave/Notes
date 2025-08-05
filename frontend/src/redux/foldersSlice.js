import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFolders = createAsyncThunk('folders/fetchFolders', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/folders/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createFolder = createAsyncThunk('folders/createFolder', async (folderData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/folders/', folderData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteFolder = createAsyncThunk('folders/deleteFolder', async (folderId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/folders/${folderId}/`);
    return folderId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  folders: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.folders = action.payload;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || 'Failed to fetch folders';
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.unshift(action.payload);
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(folder => folder.id !== action.payload);
      });
  },
});

export default foldersSlice.reducer;
