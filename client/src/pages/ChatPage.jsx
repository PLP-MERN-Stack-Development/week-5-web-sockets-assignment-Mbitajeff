import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Divider, TextField, Button, Avatar, Badge, List, ListItem, ListItemAvatar, ListItemText, Drawer, Snackbar } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import RoomList from '../components/RoomList';
import PrivateChatList from '../components/PrivateChatList';
import PrivateChatWindow from '../components/PrivateChatWindow';
import { useSocket } from '../socket/socket';

function ChatPage({ username }) {
  const {
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    systemMessages,
    privateChats,
    unread,
    createRoom,
    joinRoom,
    setCurrentRoom,
    setUnread,
  } = useSocket();
  const [input, setInput] = useState('');
  const [openPrivate, setOpenPrivate] = useState(null); // user object
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    connect(username);
    return () => disconnect();
    // eslint-disable-next-line
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, systemMessages, currentRoom]);

  // Open private chat window
  const openPrivateChat = (user) => {
    console.log('Opening private chat with:', user); // Debug log
    setOpenPrivate(user);
    setUnread((prev) => ({ ...prev, [user.id]: 0 }));
  };
  // Close private chat window
  const closePrivateChat = () => setOpenPrivate(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  // Get current user id
  const currentUser = users.find(u => u.username === username);

  // Messages for current room
  const roomMessages = [
    ...systemMessages,
    ...messages.filter(msg => msg.room === currentRoom || !msg.room),
  ];

  // Private chat messages
  const privateMessages = openPrivate ? (privateChats[openPrivate.id] || []) : [];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 260, boxSizing: 'border-box', bgcolor: 'background.paper' },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            joinRoom={joinRoom}
            createRoom={createRoom}
            unread={unread}
          />
          <Divider />
          <PrivateChatList
            users={users}
            currentUserId={currentUser?.id}
            openPrivateChat={openPrivateChat}
            unread={unread}
          />
          <Box sx={{ flex: 1 }} />
          <Divider />
          <Box sx={{ p: 2, fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: deepPurple[500], mx: 'auto', width: 32, height: 32, mb: 1 }}>
              {username[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2">Logged in as <b>{username}</b></Typography>
          </Box>
        </Box>
      </Drawer>
      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Paper elevation={0} sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f9f9f9' }}>
          {roomMessages.map(msg => (
            <Box key={msg.id} sx={{ mb: 2 }}>
              {msg.system ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  {msg.message}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: deepPurple[200], mr: 1 }}>
                    {msg.sender?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                    {msg.sender || 'Anonymous'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                    {msg.message}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', ml: 'auto' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Paper>
        {/* Typing Indicator */}
        <Box sx={{ minHeight: 24, pl: 3 }}>
          {typingUsers.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {typingUsers.join(', ')} typing...
            </Typography>
          )}
        </Box>
        {/* Message Input */}
        <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', p: 2, borderTop: '1px solid #eee', bgcolor: 'background.paper' }}>
          <TextField
            value={input}
            onChange={handleInput}
            placeholder={`Message #${currentRoom}`}
            fullWidth
            size="small"
            sx={{ mr: 2 }}
            autoFocus
          />
          <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 100 }}>
            Send
          </Button>
        </Box>
      </Box>
      {/* Private Chat Window */}
      {openPrivate && (
        <PrivateChatWindow
          user={openPrivate}
          messages={privateMessages}
          onSend={sendPrivateMessage}
          onClose={closePrivateChat}
        />
      )}
      {/* Snackbar for notifications (future use) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default ChatPage; 