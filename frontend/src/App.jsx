import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/authSlice';
import { fetchFavoriteIds } from './redux/favoritesSlice';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import FoldersPage from './pages/FoldersPage';
import NoteDetailPage from './pages/NoteDetailPage';
import SharedNotesPage from './pages/SharedNotesPage';
import FolderDetailPage from './pages/FolderDetailPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, status } = useSelector(state => state.auth);

  useEffect(() => {
    // Only check auth status on initial load when status is 'idle'
    if (status === 'idle') {
      dispatch(checkAuth()).then(action => {
        if (action.payload?.isAuthenticated) {
          dispatch(fetchFavoriteIds());
        }
      });
    }
  }, [status, dispatch]);

  // Re-fetch favorites if the user logs in during the session
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavoriteIds());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/note/:id" 
          element={
            <PrivateRoute>
              <NoteDetailPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/folders" 
          element={
            <PrivateRoute>
              <FoldersPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/folders/:id" 
          element={
            <PrivateRoute>
              <FolderDetailPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/shared" 
          element={
            <PrivateRoute>
              <SharedNotesPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/favorites" 
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          } 
        />
        {/* Define other protected routes here later */}
      </Routes>
    </Layout>
  );
}

export default App;
