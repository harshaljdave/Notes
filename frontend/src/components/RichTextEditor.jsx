import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, Button, Paper, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ display: 'flex', flexWrap: 'wrap', p: 1, mb: 1 }}>
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        variant={editor.isActive('bold') ? 'contained' : 'text'}
      >
        <FormatBoldIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        variant={editor.isActive('italic') ? 'contained' : 'text'}
      >
        <FormatItalicIcon />
      </Button>
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive('bulletList') ? 'contained' : 'text'}
      >
        <FormatListBulletedIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive('orderedList') ? 'contained' : 'text'}
      >
        <FormatListNumberedIcon />
      </Button>
    </Paper>
  );
};

const RichTextEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose', // You can add custom styling via CSS
      },
    },
  });

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 1 }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default RichTextEditor;