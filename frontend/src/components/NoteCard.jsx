import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Tag from './Tag';

const NoteCard = ({ note }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/note/${note.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={handleCardClick}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="div">
          {note.title}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {new Date(note.created_on).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" sx={{ 
          display: '-webkit-box',
          '-webkit-line-clamp': '4',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'pre-wrap',
         }}>
          {note.content}
        </Typography>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        {note.tags && note.tags.map((tag) => (
          <Tag key={tag.id} label={tag.name} />
        ))}
      </Box>
    </Card>
  );
};

export default NoteCard;
