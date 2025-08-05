import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { updateNote, deleteNote } from './noteDetailSlice'; // Import actions

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
  const response = await axios.get('/api/notes/');
  return response.data;
});

export const createNote = createAsyncThunk('notes/createNote', async (noteData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/notes/create/', noteData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  notes: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Create Note
      .addCase(createNote.pending, (state) => {
        // Optionally set a specific loading state for creation
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload); // Add the new note to the beginning of the array
      })
      .addCase(createNote.rejected, (state, action) => {
        // Optionally handle creation error
      })
      // Listen for the update action from the other slice
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      // Listen for the delete action
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(note => note.id !== action.payload);
      });
  },
});

export default notesSlice.reducer;
