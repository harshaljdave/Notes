import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Breadcrumbs, Link } from '@mui/material';
import axios from 'axios';
import NoteCard from '../components/NoteCard';

const FolderDetailPage = () => {
  const { id } = useParams();
  const [folderData, setFolderData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFolderNotes = async () => {
      try {
        setStatus('loading');
        const response = await axios.get(`/api/folders/${id}/notes/`);
        setFolderData(response.data);
        setStatus('succeeded');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch notes');
        setStatus('failed');
      }
    };
    fetchFolderNotes();
  }, [id]);

  let content;

  if (status === 'loading') {
    content = <CircularProgress />;
  } else if (status === 'succeeded') {
    content = (
      <Grid container spacing={2}>
        {folderData.notes.length > 0 ? (
          folderData.notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard note={note} />
            </Grid>
          ))
        ) : (
          <Typography sx={{ m: 2 }}>This folder is empty.</Typography>
        )}
      </Grid>
    );
  } else if (status === 'failed') {
    content = <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Breadcrumbs aria-label="breadcrumb" sx={{ my: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/folders">
          Folders
        </Link>
        <Typography color="text.primary">{folderData?.folder_name || '...'}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {folderData?.folder_name}
      </Typography>
      {content}
    </Container>
  );
};

export default FolderDetailPage;
