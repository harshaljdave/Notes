import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { updateNote, deleteNote } from './noteDetailSlice'; // Import actions

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (tags = [], { rejectWithValue }) => {
  try {
    let url = '/api/notes/';
    if (tags.length > 0) {
      url += `?tags=${tags.join(',')}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
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
  initialState: {
    allNotes: [], // Holds the original, unfiltered list
    filteredNotes: [], // Holds the notes to be displayed
    status: 'idle',
    error: null,
    searchTerm: '',
  },
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      const lowercasedTerm = state.searchTerm.toLowerCase();
      if (lowercasedTerm) {
        state.filteredNotes = state.allNotes.filter(note => 
          note.title.toLowerCase().includes(lowercasedTerm) || 
          note.content.toLowerCase().includes(lowercasedTerm)
        );
      } else {
        state.filteredNotes = state.allNotes;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allNotes = action.payload;
        state.filteredNotes = action.payload; // Initially, display all notes
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.allNotes.unshift(action.payload);
        state.filteredNotes.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const update = (notes) => {
          const index = notes.findIndex(note => note.id === action.payload.id);
          if (index !== -1) {
            notes[index] = action.payload;
          }
        };
        update(state.allNotes);
        update(state.filteredNotes);
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.allNotes = state.allNotes.filter(note => note.id !== action.payload);
        state.filteredNotes = state.filteredNotes.filter(note => note.id !== action.payload);
      });
  },
});

export const { setSearchTerm } = notesSlice.actions;
export default notesSlice.reducer;
