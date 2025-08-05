import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFolders, createFolder, deleteFolder } from '../redux/foldersSlice';
import { 
  Container, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const FoldersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { folders, status, error } = useSelector((state) => state.folders);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFolders());
    }
  }, [status, dispatch]);

  const handleCreateFolder = async () => {
    if (folderName.trim()) {
      await dispatch(createFolder({ name: folderName })).unwrap();
      setFolderName('');
      setCreateDialogOpen(false);
    }
  };

  const handleDeleteClick = (folder) => {
    setSelectedFolder(folder);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedFolder) {
      await dispatch(deleteFolder(selectedFolder.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedFolder(null);
    }
  };

  let content;

  if (status === 'loading') {
    content = <CircularProgress />;
  } else if (status === 'succeeded') {
    content = (
      <List>
        {folders.map((folder) => (
          <ListItem 
            key={folder.id}
            button 
            onClick={() => navigate(`/folders/${folder.id}`)}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(folder); }}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText 
              primary={folder.name} 
              secondary={`Created on ${new Date(folder.created_on).toLocaleDateString()}`} 
            />
          </ListItem>
        ))}
      </List>
    );
  } else if (status === 'failed') {
    content = <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4">
          Folders
        </Typography>
        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
          Create Folder
        </Button>
      </Box>
      {content}
      {/* Create Folder Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create a new folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Folder Name"
            type="text"
            fullWidth
            variant="standard"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder}>Create</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Folder Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the folder "<b>{selectedFolder?.name}</b>"? This will also remove all notes from this folder. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FoldersPage;
