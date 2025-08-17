import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Modal, Box, Typography, TextField, Button, CircularProgress, FormControl, 
  InputLabel, Select, MenuItem, Chip 
} from '@mui/material';
import { fetchFolders } from '../redux/foldersSlice';
import { fetchTags } from '../redux/tagsSlice';
import RichTextEditor from './RichTextEditor';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600, // Increased width for the editor
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CreateNoteModal = ({ open, handleClose, handleSave, loading }) => {
  const dispatch = useDispatch();
  const { folders } = useSelector((state) => state.folders);
  const { tags } = useSelector((state) => state.tags);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (open) {
      dispatch(fetchFolders());
      dispatch(fetchTags());
    }
  }, [open, dispatch]);

  const onSave = () => {
    handleSave({ title, content, folder_id: selectedFolder, tags: selectedTags });
    // Reset form state
    setTitle('');
    setContent('');
    setSelectedFolder('');
    setSelectedTags([]);
  };

  const handleTagClick = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
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
          sx={{ mb: 2 }}
        />
        <RichTextEditor content={content} onUpdate={setContent} />
        <FormControl fullWidth size="small" sx={{ mt: 2, mb: 2 }}>
          <InputLabel>Add to Folder (Optional)</InputLabel>
          <Select
            value={selectedFolder}
            label="Add to Folder (Optional)"
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {folders.map(folder => (
              <MenuItem key={folder.id} value={folder.id}>{folder.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Tags (Optional)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {tags.map(tag => (
            <Chip
              key={tag.id}
              label={tag.tag}
              onClick={() => handleTagClick(tag.tag)}
              color={selectedTags.includes(tag.tag) ? 'primary' : 'default'}
              variant="outlined"
            />
          ))}
        </Box>
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
