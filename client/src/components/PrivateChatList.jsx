import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Badge, Typography } from '@mui/material';
import { deepOrange } from '@mui/material/colors';

function PrivateChatList({ users, currentUserId, openPrivateChat, unread }) {
  console.log('PrivateChatList users:', users, 'currentUserId:', currentUserId);
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Direct Messages
      </Typography>
      <List dense>
        {users.filter(u => u.id !== currentUserId).map(user => (
          <ListItem key={user.id} disablePadding>
            <ListItemButton onClick={() => {
              console.log('Clicked user:', user); // Debug log
              openPrivateChat(user);
            }} sx={{ borderRadius: 1 }}>
              <ListItemAvatar>
                <Badge
                  color="secondary"
                  badgeContent={unread[user.id] > 0 ? unread[user.id] : null}
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar sx={{ bgcolor: deepOrange[400] }}>{user.username[0]?.toUpperCase()}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText primary={user.username} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default PrivateChatList; 