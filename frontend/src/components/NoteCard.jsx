import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Tag from './Tag';

const NoteCard = ({ note }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/note/${note.id}`);
  };

  // Function to strip HTML tags for a plain text preview
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <Card 
      sx={{ 
        height: '250px', // Set a fixed height for all cards
        display: 'flex', 
        flexDirection: 'column', 
        cursor: 'pointer',
        width: '100%', // Ensure card fills its grid container
        minWidth: 0, // Prevents content from expanding the card width
        '&:hover': {
          boxShadow: 6, // Add a subtle shadow on hover
        }
      }} 
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Typography 
          variant="h5" 
          component="div"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
          }}
        >
          {note.title}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {new Date(note.created_on).toLocaleDateString()}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: '4',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '80px', // Reserve space for 4 lines of text
            wordBreak: 'break-word', // Break long words to prevent overflow
          }}
        >
          {stripHtml(note.content)}
        </Typography>
      </CardContent>
      <Box sx={{ p: 2, pt: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {note.tags && note.tags.map((tag) => (
          <Tag key={tag.id} label={tag.name} />
        ))}
      </Box>
    </Card>
  );
};

export default NoteCard;
