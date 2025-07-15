import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Badge, TextField, Button, Typography } from '@mui/material';

function RoomList({ rooms, currentRoom, joinRoom, createRoom, unread }) {
  const [newRoom, setNewRoom] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (newRoom.trim() && !rooms.includes(newRoom.trim())) {
      createRoom(newRoom.trim());
      setNewRoom('');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Rooms
      </Typography>
      <List dense>
        {rooms.map(room => (
          <ListItem key={room} disablePadding>
            <ListItemButton
              selected={room === currentRoom}
              onClick={() => joinRoom(room)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText primary={room} />
              {unread[room] > 0 && (
                <Badge color="secondary" badgeContent={unread[room]} sx={{ ml: 1 }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box component="form" onSubmit={handleCreate} sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <TextField
          value={newRoom}
          onChange={e => setNewRoom(e.target.value)}
          placeholder="New room name"
          size="small"
          variant="outlined"
          sx={{ flex: 1 }}
        />
        <Button type="submit" variant="contained" color="primary" size="small">
          Add
        </Button>
      </Box>
    </Box>
  );
}

export default RoomList; 