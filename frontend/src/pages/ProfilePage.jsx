import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, Paper } from '@mui/material';
import axios from 'axios';
import { showToast } from '../redux/toastSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/profile/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirmation: confirmation,
      });
      dispatch(showToast({ message: 'Password changed successfully', severity: 'success' }));
      // Clear fields
      setOldPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ my: 4 }}>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">User Information</Typography>
        <Typography><strong>Username:</strong> {user.username}</Typography>
        <Typography><strong>Email:</strong> {user.email}</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Change Password</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="old_password"
            label="Old Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="new_password"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmation"
            label="Confirm New Password"
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
