import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNoteById, updateNote, deleteNote, resetStatus } from '../redux/noteDetailSlice';
import { 
  Container, Typography, Box, CircularProgress, Alert, Paper, Chip, Button, 
  TextField, Fab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';
import FolderIcon from '@mui/icons-material/Folder';
import ArchiveIcon from '@mui/icons-material/Archive';
import { toggleFavorite } from '../redux/favoritesSlice';
import { fetchTags } from '../redux/tagsSlice';
import ShareModal from '../components/ShareModal';
import ManageFoldersModal from '../components/ManageFoldersModal';
import { showToast } from '../redux/toastSlice';
import axios from 'axios';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import RichTextEditor from '../components/RichTextEditor';
import DOMPurify from 'dompurify';

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
  const [originalEditTime, setOriginalEditTime] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [foldersModalOpen, setFoldersModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const isFavorited = favoriteNoteIds.includes(note?.id);
  const isDirty = note ? title !== note.title || content !== note.content || JSON.stringify(selectedTags.sort()) !== JSON.stringify(note.tags.map(t => t.name).sort()) : false;

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
      setOriginalEditTime(note.edit_time);
    }
  }, [note]);

  const handleEditClick = () => {
    dispatch(fetchTags());
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateNote({ 
        id, 
        title, 
        content, 
        tags: selectedTags, 
        edit_time: originalEditTime 
      })).unwrap();
      setIsEditing(false);
      dispatch(showToast({ message: 'Note updated successfully', severity: 'success' }));
    } catch (e) {
      dispatch(showToast({ message: e.error || 'Failed to update note', severity: 'error' }));
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setConfirmCancelOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmCancel = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags.map(t => t.name));
    }
    setConfirmCancelOpen(false);
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch(deleteNote(id))
      .unwrap()
      .then(() => {
        navigate('/');
        dispatch(showToast({ message: 'Note deleted', severity: 'info' }));
      })
      .catch((e) => {
        dispatch(showToast({ message: 'Failed to delete note', severity: 'error' }));
      });
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite({ noteId: note.id, isFavorited }));
  };

  const handleToggleArchive = async () => {
    try {
      const response = await axios.post(`/api/notes/${note.id}/archive/`);
      dispatch(showToast({ message: response.data.is_archived ? 'Note archived' : 'Note unarchived', severity: 'success' }));
      dispatch(fetchNoteById(id));
    } catch (error) {
      dispatch(showToast({ message: 'Failed to update archive status', severity: 'error' }));
    }
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
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="text" sx={{ fontSize: '3rem' }} width="70%" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 3 }} />
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
            <RichTextEditor content={content} onUpdate={setContent} />
            {note.is_owner && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Tags</Typography>
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, // Stacks vertically on extra-small screens
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' } 
            }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {note.title}
                </Typography>
                {note.is_archived && (
                  <Chip label="Archived" color="warning" sx={{ mb: 1 }} />
                )}
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Last updated by {note.edited_by || '...'} on {new Date(note.edit_time).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap', // Allow buttons to wrap
                gap: 1, 
                mt: { xs: 2, md: 0 } // Add margin top on small screens
              }}>
                <IconButton onClick={handleToggleFavorite}>
                  {isFavorited ? <StarIcon color="warning" /> : <StarBorderIcon />}
                </IconButton>
                {note.is_owner && (
                  <>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={note.is_archived ? <UnarchiveIcon /> : <ArchiveIcon />}
                      onClick={handleToggleArchive}
                    >
                      {note.is_archived ? 'Unarchive' : 'Archive'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<FolderIcon />}
                      onClick={() => setFoldersModalOpen(true)}
                    >
                      Folders
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={() => setShareModalOpen(true)}
                    >
                      Share
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
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
                  <Chip key={tag.id} label={tag.name} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            )}
            <Box 
              component="div"
              className="prose"
              sx={{ mt: 3 }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }} 
            />
          </>
        )}
      </Paper>
    );
  } else if (status === 'failed') {
    pageContent = <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="lg">
      {pageContent}
      {status === 'succeeded' && note.permission === 'edit' && !isEditing && !note.is_archived && (
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
      <Dialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to discard them?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOpen(false)}>Keep Editing</Button>
          <Button onClick={confirmCancel} color="error">Discard</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NoteDetailPage;