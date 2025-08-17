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
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ArchivePage from './pages/ArchivePage';
import ThemeWrapper from './components/ThemeWrapper';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, status } = useSelector(state => state.auth);

  useEffect(() => {
    // Only run checkAuth on initial app load when status is idle
    if (status === 'idle') {
      dispatch(checkAuth());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Fetch favorite IDs only when the user becomes authenticated
    if (isAuthenticated) {
      dispatch(fetchFavoriteIds());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <ThemeWrapper>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/archive" 
            element={
              <PrivateRoute>
                <ArchivePage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Layout>
    </ThemeWrapper>
  );
}

export default App;
