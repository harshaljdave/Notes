import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFavoriteIds = createAsyncThunk('favorites/fetchFavoriteIds', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/favorites/ids/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const toggleFavorite = createAsyncThunk('favorites/toggleFavorite', async ({ noteId, isFavorited }, { rejectWithValue }) => {
  try {
    if (isFavorited) {
      await axios.delete(`/api/notes/${noteId}/favorite/`);
    } else {
      await axios.post(`/api/notes/${noteId}/favorite/`);
    }
    return noteId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  favoriteNoteIds: [],
  status: 'idle',
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoriteIds.fulfilled, (state, action) => {
        state.favoriteNoteIds = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const noteId = action.payload;
        if (state.favoriteNoteIds.includes(noteId)) {
          state.favoriteNoteIds = state.favoriteNoteIds.filter(id => id !== noteId);
        } else {
          state.favoriteNoteIds.push(noteId);
        }
      });
  },
});

export default favoritesSlice.reducer;
