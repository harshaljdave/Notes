import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Notes
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">Notes</Button>
          <Button color="inherit" component={RouterLink} to="/folders">Folders</Button>
          <Button color="inherit" component={RouterLink} to="/shared">Shared</Button>
          <Button color="inherit" component={RouterLink} to="/favorites">Favorites</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
