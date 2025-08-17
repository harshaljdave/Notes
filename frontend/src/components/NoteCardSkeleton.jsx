import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const NoteCardSkeleton = () => {
  return (
    <Card sx={{ height: '250px' }}>
      <CardContent>
        <Skeleton variant="text" sx={{ fontSize: '2rem' }} width="80%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={80} sx={{ mt: 2 }} />
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Skeleton variant="text" width="50%" />
      </Box>
    </Card>
  );
};

export default NoteCardSkeleton;
