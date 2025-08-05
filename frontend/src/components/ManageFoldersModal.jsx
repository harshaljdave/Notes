import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFolders } from '../redux/foldersSlice';
import { 
  Modal, Box, Typography, Button, List, ListItem, ListItemText, 
  IconButton, CircularProgress, Alert 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ManageFoldersModal = ({ open, handleClose, noteId }) => {
  const dispatch = useDispatch();
  const { folders, status } = useSelector((state) => state.folders);
  const [noteInFolders, setNoteInFolders] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState('idle');

  useEffect(() => {
    if (open) {
      dispatch(fetchFolders());
      
      const fetchNoteFolderStatus = async () => {
        try {
          setLoadingStatus('loading');
          const response = await axios.get(`/api/notes/${noteId}/folders/`);
          setNoteInFolders(response.data);
          setLoadingStatus('succeeded');
        } catch (error) {
          console.error("Failed to fetch note's folder status", error);
          setLoadingStatus('failed');
        }
      };
      fetchNoteFolderStatus();
    }
  }, [open, dispatch, noteId]);

  const handleToggleFolder = async (folderId) => {
    const isNoteInFolder = noteInFolders.includes(folderId);
    try {
      if (isNoteInFolder) {
        await axios.delete(`/api/folders/${folderId}/notes/${noteId}/`);
        setNoteInFolders(noteInFolders.filter(id => id !== folderId));
      } else {
        await axios.post(`/api/folders/${folderId}/notes/${noteId}/`);
        setNoteInFolders([...noteInFolders, folderId]);
      }
    } catch (error) {
      console.error("Failed to update folder status", error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Add/Remove from Folders</Typography>
        
        {(status === 'loading' || loadingStatus === 'loading') && <CircularProgress />}
        
        <List sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
          {folders.map((folder) => {
            const isNoteInFolder = noteInFolders.includes(folder.id);
            return (
              <ListItem
                key={folder.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleToggleFolder(folder.id)}>
                    {isNoteInFolder ? <CheckCircleIcon color="success" /> : <AddCircleOutlineIcon />}
                  </IconButton>
                }
              >
                <ListItemText primary={folder.name} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Modal>
  );
};

export default ManageFoldersModal;
