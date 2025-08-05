import { configureStore } from '@reduxjs/toolkit';
import notesReducer from './notesSlice';
import authReducer from './authSlice';
import noteDetailReducer from './noteDetailSlice';
import foldersReducer from './foldersSlice';
import favoritesReducer from './favoritesSlice';
import tagsReducer from './tagsSlice';

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    auth: authReducer,
    noteDetail: noteDetailReducer,
    folders: foldersReducer,
    favorites: favoritesReducer,
    tags: tagsReducer,
  },
});
