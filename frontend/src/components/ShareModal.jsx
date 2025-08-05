import React, { useEffect, useState } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, List, ListItem, ListItemText, 
  IconButton, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ShareModal = ({ open, handleClose, noteId }) => {
  const [sharedUsers, setSharedUsers] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');

  useEffect(() => {
    if (open) {
      const fetchSharedUsers = async () => {
        try {
          setStatus('loading');
          const response = await axios.get(`/api/notes/${noteId}/share/`);
          setSharedUsers(response.data);
          setStatus('succeeded');
        } catch (err) {
          setError('Failed to load sharing information.');
          setStatus('failed');
        }
      };
      fetchSharedUsers();
    }
  }, [open, noteId]);

  const handleShare = async () => {
    try {
      setError(null);
      const response = await axios.post(`/api/notes/${noteId}/share/`, { email, permission });
      
      const existingUserIndex = sharedUsers.findIndex(u => u.email === response.data.email);
      if (existingUserIndex > -1) {
        // Update existing user's permission in the list
        const updatedUsers = [...sharedUsers];
        updatedUsers[existingUserIndex] = response.data;
        setSharedUsers(updatedUsers);
      } else {
        // Add new user to the list
        setSharedUsers([...sharedUsers, response.data]);
      }
      
      setEmail('');
      setPermission('view');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share note.');
    }
  };

  const handleRemoveAccess = async (userEmail) => {
    try {
      await axios.delete(`/api/notes/${noteId}/share/`, { data: { email: userEmail } });
      setSharedUsers(sharedUsers.filter(user => user.email !== userEmail));
    } catch (err) {
      setError('Failed to remove access.');
    }
  };

  const handlePermissionChange = async (email, newPermission) => {
    try {
      const response = await axios.post(`/api/notes/${noteId}/share/`, { email, permission: newPermission });
      const updatedUsers = sharedUsers.map(u => u.email === email ? response.data : u);
      setSharedUsers(updatedUsers);
    } catch (err) {
      setError('Failed to update permission.');
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Share Note</Typography>
        
        <Typography sx={{ mt: 2 }}>Currently shared with:</Typography>
        {status === 'loading' && <CircularProgress size={24} />}
        {status === 'succeeded' && (
          <List dense>
            {sharedUsers.length > 0 ? sharedUsers.map(user => (
              <ListItem
                key={user.email}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select 
                        value={user.permission} 
                        onChange={(e) => handlePermissionChange(user.email, e.target.value)}
                      >
                        <MenuItem value="view">View</MenuItem>
                        <MenuItem value="edit">Edit</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton edge="end" onClick={() => handleRemoveAccess(user.email)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText primary={user.email} />
              </ListItem>
            )) : <ListItem><ListItemText primary="Not shared with anyone." /></ListItem>}
          </List>
        )}

        <Typography sx={{ mt: 2 }}>Share with new user:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <TextField
            label="Email Address"
            variant="outlined"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Permission</InputLabel>
            <Select value={permission} label="Permission" onChange={(e) => setPermission(e.target.value)}>
              <MenuItem value="view">View</MenuItem>
              <MenuItem value="edit">Edit</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleShare}>Share</Button>
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Modal>
  );
};

export default ShareModal;
