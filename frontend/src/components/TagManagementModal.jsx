import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTags, createTag, deleteTag } from '../redux/tagsSlice';
import { 
  Modal, Box, Typography, TextField, Button, List, ListItem, ListItemText, 
  IconButton, CircularProgress, Alert 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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

const TagManagementModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { tags, status, error } = useSelector((state) => state.tags);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    if (open) {
      dispatch(fetchTags());
    }
  }, [open, dispatch]);

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      await dispatch(createTag({ tag: newTagName })).unwrap();
      setNewTagName('');
    }
  };

  const handleDeleteTag = (tagId) => {
    dispatch(deleteTag(tagId));
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Manage Tags</Typography>
        
        <Box component="form" sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
          <TextField
            label="New Tag Name"
            variant="outlined"
            size="small"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            sx={{ flexGrow: 1, mr: 1 }}
          />
          <Button variant="contained" onClick={handleCreateTag}>Create</Button>
        </Box>

        {status === 'loading' && <CircularProgress />}
        {status === 'failed' && <Alert severity="error">{error}</Alert>}
        
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {tags.map((tag) => (
            <ListItem
              key={tag.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTag(tag.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={tag.tag} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};

export default TagManagementModal;
