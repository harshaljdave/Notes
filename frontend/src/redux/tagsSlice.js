import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTags = createAsyncThunk('tags/fetchTags', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/tags/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createTag = createAsyncThunk('tags/createTag', async (tagData, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/tags/', tagData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteTag = createAsyncThunk('tags/deleteTag', async (tagId, { rejectWithValue }) => {
  try {
    // The backend expects a list of tags to delete.
    await axios.delete('/api/tags/', { data: { taglist: [`tag${tagId}`] } });
    return tagId;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const initialState = {
  tags: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || 'Failed to fetch tags';
      })
      .addCase(createTag.fulfilled, (state, action) => {
        // The backend returns { Tag: 'NewTag', pk: 123, Created: 'Tag Created' }
        if (action.payload.Created) {
          state.tags.push({ id: action.payload.pk, tag: action.payload.Tag });
        }
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
      });
  },
});

export default tagsSlice.reducer;
