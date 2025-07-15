import React, { useRef, useEffect, useState } from 'react';
import { Paper, Box, Avatar, Typography, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { deepOrange } from '@mui/material/colors';

function PrivateChatWindow({ user, messages, onSend, onClose }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(user.id, input.trim());
      setInput('');
    }
  };

  return (
    <Paper elevation={6} sx={{ position: 'fixed', right: 32, bottom: 32, width: 340, zIndex: 1300, borderRadius: 3, boxShadow: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
        <Avatar sx={{ bgcolor: deepOrange[400], mr: 1 }}>{user.username[0]?.toUpperCase()}</Avatar>
        <Typography variant="subtitle1" sx={{ flex: 1 }}>{user.username}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ height: 240, overflowY: 'auto', p: 2, bgcolor: '#fafafa' }}>
        {messages.map(msg => (
          <Box key={msg.id} sx={{ mb: 1, textAlign: msg.senderId === user.id ? 'left' : 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: msg.senderId === user.id ? 600 : 400 }}>
              {msg.senderId === user.id ? user.username : 'You'}: {msg.message}
              <span style={{ fontSize: 10, color: '#aaa', marginLeft: 8 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', p: 2, borderTop: '1px solid #eee', bgcolor: 'background.paper' }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          fullWidth
          size="small"
          sx={{ mr: 1 }}
          autoFocus
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Paper>
  );
}

export default PrivateChatWindow; 