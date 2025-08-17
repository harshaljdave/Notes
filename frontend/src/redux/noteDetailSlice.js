import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNoteById = createAsyncThunk('notes/fetchNoteById', async (noteId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/note/${noteId}/`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateNote = createAsyncThunk('notes/updateNote', async (noteData, { rejectWithValue }) => {
  try {
    const { id, ...data } = noteData;
    const response = await axios.put(`/api/note/${id}/`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (noteId, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/note/${noteId}/`);
    return noteId; // Return the ID on success
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  note: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const noteDetailSlice = createSlice({
  name: 'noteDetail',
  initialState,
  reducers: {
    resetStatus: (state) => {
        state.status = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoteById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNoteById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.note = action.payload;
      })
      .addCase(fetchNoteById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.error;
      })
      // Update Note
      .addCase(updateNote.pending, (state) => {
        // Can be used to show a saving indicator on the form
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.note = action.payload;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = action.payload; // Pass the whole payload
      });
  },
});

export const { resetStatus } = noteDetailSlice.actions;
export default noteDetailSlice.reducer;
