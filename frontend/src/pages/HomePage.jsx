import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Alert, Fab, Box, Button, Chip, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotes, createNote } from '../redux/notesSlice';
import { fetchTags } from '../redux/tagsSlice';
import { showToast } from '../redux/toastSlice';
import { setSearchTerm } from '../redux/notesSlice';
import NoteCard from '../components/NoteCard';
import CreateNoteModal from '../components/CreateNoteModal';
import TagManagementModal from '../components/TagManagementModal';
import EmptyState from '../components/EmptyState';
import NoteCardSkeleton from '../components/NoteCardSkeleton';

const HomePage = () => {
  const dispatch = useDispatch();
  const { filteredNotes, status, error, searchTerm } = useSelector((state) => state.notes);
  const allTags = useSelector((state) => state.tags.tags);
  const tagsStatus = useSelector((state) => state.tags.status);

  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    // Fetch initial notes and all available tags
    dispatch(fetchNotes());
    if (tagsStatus === 'idle') {
      dispatch(fetchTags());
    }
  }, [dispatch, tagsStatus]);

  useEffect(() => {
    // Refetch notes whenever the selected tags change
    dispatch(fetchNotes(selectedTags));
  }, [selectedTags, dispatch]);

  const handleOpenCreateNoteModal = () => setCreateNoteModalOpen(true);
  const handleCloseCreateNoteModal = () => setCreateNoteModalOpen(false);

  const handleSaveNote = async (noteData) => {
    setCreateLoading(true);
    try {
      await dispatch(createNote(noteData)).unwrap();
      handleCloseCreateNoteModal();
      dispatch(showToast({ message: 'Note created successfully', severity: 'success' }));
    } catch (e) {
      dispatch(showToast({ message: 'Failed to create note', severity: 'error' }));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTagClick = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleSearchChange = (event) => {
    dispatch(setSearchTerm(event.target.value));
  };

  let content;

  if (status === 'loading') {
    content = (
      <Grid container spacing={2}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <NoteCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  } else if (status === 'succeeded') {
    if (filteredNotes.length > 0) {
      content = (
        <Grid container spacing={2}>
          {filteredNotes.map((note) => (
            <Grid size={{ xs: 12, sm:6, md:4 }}  key={note.id}>
              <NoteCard note={note} />
            </Grid>
          ))}
        </Grid>
      );
    } else {
      content = (
        <EmptyState
          title={selectedTags.length > 0 || searchTerm ? "No Notes Found" : "Create Your First Note"}
          message={selectedTags.length > 0 || searchTerm ? "No notes match your filters. Try clearing them." : "Your note list is empty. Get started by creating a new note."}
          actionText={selectedTags.length > 0 ? "Clear Tag Filter" : "Create Note"}
          onActionClick={selectedTags.length > 0 ? () => setSelectedTags([]) : handleOpenCreateNoteModal}
        />
      );
    }
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

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          label="Search Notes"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>Filter by Tags:</Typography>
          {allTags.map(tag => (
            <Chip
              key={tag.id}
              label={tag.tag}
              onClick={() => handleTagClick(tag.tag)}
              color={selectedTags.includes(tag.tag) ? 'primary' : 'default'}
              variant="outlined"
            />
          ))}
          {selectedTags.length > 0 && (
            <Button size="small" onClick={() => setSelectedTags([])}>Clear</Button>
          )}
        </Box>
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