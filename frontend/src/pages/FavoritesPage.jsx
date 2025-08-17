import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

const FavoritesPage = () => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavoriteNotes = async () => {
      try {
        setStatus('loading');
        const response = await axios.get('/api/notes/favorites/');
        setNotes(response.data);
        setStatus('succeeded');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch favorite notes');
        setStatus('failed');
      }
    };
    fetchFavoriteNotes();
  }, []);

  let content;

  if (status === 'loading') {
    content = <CircularProgress />;
  } else if (status === 'succeeded') {
    content = (
      <Grid container spacing={2}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
              <NoteCard note={note} />
            </Grid>
          ))
        ) : (
          <Typography sx={{ m: 2 }}>You have not favorited any notes.</Typography>
        )}
      </Grid>
    );
  } else if (status === 'failed') {
    content = <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>
        Favorite Notes
      </Typography>
      {content}
    </Container>
  );
};

export default FavoritesPage;
