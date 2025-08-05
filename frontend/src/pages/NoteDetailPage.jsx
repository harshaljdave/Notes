import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNoteById, updateNote, deleteNote, resetStatus } from '../redux/noteDetailSlice';
import { 
  Container, Typography, Box, CircularProgress, Alert, Paper, Chip, Button, 
  TextField, Fab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';
import FolderIcon from '@mui/icons-material/Folder';
import { toggleFavorite } from '../redux/favoritesSlice';
import { fetchTags } from '../redux/tagsSlice';
import ShareModal from '../components/ShareModal';
import ManageFoldersModal from '../components/ManageFoldersModal';

const NoteDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { note, status, error } = useSelector((state) => state.noteDetail);
  const { favoriteNoteIds } = useSelector((state) => state.favorites);
  const allTags = useSelector((state) => state.tags.tags);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [foldersModalOpen, setFoldersModalOpen] = useState(false);

  const isFavorited = favoriteNoteIds.includes(note?.id);

  useEffect(() => {
    if (id) {
      dispatch(fetchNoteById(id));
    }
    return () => {
      dispatch(resetStatus());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags.map(t => t.name));
    }
  }, [note]);

  const handleEditClick = () => {
    dispatch(fetchTags());
    setIsEditing(true);
  };

  const handleSave = async () => {
    await dispatch(updateNote({ id, title, content, tags: selectedTags })).unwrap();
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags.map(t => t.name));
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch(deleteNote(id))
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch((e) => {
        console.error("Failed to delete note: ", e);
      });
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite({ noteId: note.id, isFavorited }));
  };

  const handleTagClick = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  let pageContent;

  if (status === 'loading' || status === 'idle') {
    pageContent = (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  } else if (status === 'succeeded') {
    pageContent = (
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {isEditing ? (
          <>
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              variant="outlined"
              multiline
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mb: 2 }}
            />
            {note.is_owner && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {allTags.map(tag => (
                    <Chip
                      key={tag.id}
                      label={tag.tag}
                      onClick={() => handleTagClick(tag.tag)}
                      color={selectedTags.includes(tag.tag) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} sx={{ mr: 1 }}>Cancel</Button>
              <Button onClick={handleSave} variant="contained">Save</Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {note.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Last updated by {note.edited_by || '...'} on {new Date(note.edit_time).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleToggleFavorite}>
                  {isFavorited ? <StarIcon color="warning" /> : <StarBorderIcon />}
                </IconButton>
                {note.is_owner && (
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<FolderIcon />}
                      onClick={() => setFoldersModalOpen(true)}
                      sx={{ mr: 1 }}
                    >
                      Folders
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<ShareIcon />}
                      onClick={() => setShareModalOpen(true)}
                      sx={{ mr: 1 }}
                    >
                      Share
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => setOpenDeleteDialog(true)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            {note.is_owner && (
              <Box sx={{ my: 2 }}>
                {note.tags.map((tag) => (
                  <Chip key={tag.id} label={tag.name} sx={{ mr: 1 }} />
                ))}
              </Box>
            )}
            <Typography variant="body1" sx={{ mt: 3, whiteSpace: 'pre-wrap' }}>
              {note.content}
            </Typography>
          </>
        )}
      </Paper>
    );
  } else if (status === 'failed') {
    pageContent = <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="md">
      {pageContent}
      {status === 'succeeded' && note.permission === 'edit' && !isEditing && (
        <Fab
          color="secondary"
          aria-label="edit"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleEditClick}
        >
          <EditIcon />
        </Fab>
      )}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete this note?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to permanently delete this note? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {note && (
        <>
          <ShareModal 
            open={shareModalOpen}
            handleClose={() => setShareModalOpen(false)}
            noteId={note.id}
          />
          <ManageFoldersModal
            open={foldersModalOpen}
            handleClose={() => setFoldersModalOpen(false)}
            noteId={note.id}
          />
        </>
      )}
    </Container>
  );
};

export default NoteDetailPage;
