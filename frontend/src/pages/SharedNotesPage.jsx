import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

const SharedNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        setStatus('loading');
        const response = await axios.get('/api/notes/shared/');
        setNotes(response.data);
        setStatus('succeeded');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch shared notes');
        setStatus('failed');
      }
    };
    fetchSharedNotes();
  }, []);

  let content;

  if (status === 'loading') {
    content = <CircularProgress />;
  } else if (status === 'succeeded') {
    content = (
      <Grid container spacing={2}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard note={note} />
            </Grid>
          ))
        ) : (
          <Typography sx={{ m: 2 }}>No notes have been shared with you.</Typography>
        )}
      </Grid>
    );
  } else if (status === 'failed') {
    content = <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>
        Shared With Me
      </Typography>
      {content}
    </Container>
  );
};

export default SharedNotesPage;
