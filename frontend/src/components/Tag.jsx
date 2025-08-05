import React from 'react';
import Chip from '@mui/material/Chip';

const Tag = ({ label }) => {
  return <Chip label={label} size="small" sx={{ marginRight: 1, marginBottom: 1 }} />;
};

export default Tag;
