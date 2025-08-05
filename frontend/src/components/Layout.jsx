import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <Box>
      <Navbar />
      <main>{children}</main>
    </Box>
  );
};

export default Layout;
