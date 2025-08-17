import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Toast from './Toast';

const Layout = ({ children }) => {
  return (
    <Box>
      <Navbar />
      <main>{children}</main>
      <Toast />
    </Box>
  );
};

export default Layout;
