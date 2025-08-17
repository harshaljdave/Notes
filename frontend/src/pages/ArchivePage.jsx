import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { showToast } from '../redux/toastSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ArchivePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');

  const fetchArchivedNotes = async () => {
    try {
      setStatus('loading');
      const response = await axios.get('/api/notes/archived/');
      setNotes(response.data);
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
    }
  };

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  const handleUnarchive = async (noteId) => {
    try {
      await axios.post(`/api/notes/${noteId}/archive/`);
      dispatch(showToast({ message: 'Note unarchived', severity: 'success' }));
      fetchArchivedNotes(); // Refresh the list
    } catch (error) {
      dispatch(showToast({ message: 'Failed to unarchive note', severity: 'error' }));
    }
  };

  let content;
  if (status === 'loading') {
    content = <CircularProgress />;
  } else if (status === 'succeeded') {
    content = (
      <List>
        {notes.length > 0 ? (
          notes.map((note) => (
            <ListItem
              key={note.id}
              secondaryAction={
                <Button edge="end" onClick={() => handleUnarchive(note.id)}>
                  Unarchive
                </Button>
              }
            >
              <ListItemText 
                primary={note.title} 
                secondary={`Created on ${new Date(note.created_on).toLocaleDateString()}`} 
                onClick={() => navigate(`/note/${note.id}`)}
                sx={{ cursor: 'pointer' }}
              />
            </ListItem>
          ))
        ) : (
          <Typography>You have no archived notes.</Typography>
        )}
      </List>
    );
  } else {
    content = <Alert severity="error">Failed to load archived notes.</Alert>;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ my: 4 }}>
        Archived Notes
      </Typography>
      {content}
    </Container>
  );
};

export default ArchivePage;
