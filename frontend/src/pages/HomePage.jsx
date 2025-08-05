import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, CircularProgress, Alert, Fab, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotes, createNote } from '../redux/notesSlice';
import NoteCard from '../components/NoteCard';
import CreateNoteModal from '../components/CreateNoteModal';
import TagManagementModal from '../components/TagManagementModal';

const HomePage = () => {
  const dispatch = useDispatch();
  const { notes, status, error } = useSelector((state) => state.notes);
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotes());
    }
  }, [status, dispatch]);

  const handleOpenCreateNoteModal = () => setCreateNoteModalOpen(true);
  const handleCloseCreateNoteModal = () => setCreateNoteModalOpen(false);

  const handleSaveNote = async (noteData) => {
    setCreateLoading(true);
    try {
      await dispatch(createNote(noteData)).unwrap();
      handleCloseCreateNoteModal();
    } catch (e) {
      console.error("Failed to create note: ", e);
    } finally {
      setCreateLoading(false);
    }
  };

  let content;

  if (status === 'loading') {
    content = <CircularProgress />;
  } else if (status === 'succeeded') {
    content = (
      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <NoteCard note={note} />
          </Grid>
        ))}
      </Grid>
    );
  } else if (status === 'failed') {
    content = <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4">
          My Notes
        </Typography>
        <Button variant="outlined" onClick={() => setTagModalOpen(true)}>
          Manage Tags
        </Button>
      </Box>
      {content}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenCreateNoteModal}
      >
        <AddIcon />
      </Fab>
      <CreateNoteModal 
        open={createNoteModalOpen}
        handleClose={handleCloseCreateNoteModal}
        handleSave={handleSaveNote}
        loading={createLoading}
      />
      <TagManagementModal 
        open={tagModalOpen}
        handleClose={() => setTagModalOpen(false)}
      />
    </Container>
  );
};

export default HomePage;
