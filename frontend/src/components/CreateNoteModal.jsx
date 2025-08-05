import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';

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

const CreateNoteModal = ({ open, handleClose, handleSave, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const onSave = () => {
    handleSave({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-note-modal-title"
    >
      <Box sx={style}>
        <Typography id="create-note-modal-title" variant="h6" component="h2">
          Create a New Note
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="Title"
          type="text"
          fullWidth
          variant="standard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          id="content"
          label="Content"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button onClick={onSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateNoteModal;
