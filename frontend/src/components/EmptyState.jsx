import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

const EmptyState = ({ icon, title, message, actionText, onActionClick }) => {
  const IconComponent = icon || NoteAddIcon;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        m: 'auto',
        height: '50vh',
        color: 'text.secondary',
      }}
    >
      <IconComponent sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography>{message}</Typography>
      {actionText && onActionClick && (
        <Button variant="contained" sx={{ mt: 3 }} onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
