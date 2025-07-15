import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
    background: { default: '#f4f6fa' },
  },
});

function App() {
  const [username, setUsername] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!username ? (
        <LoginPage onLogin={setUsername} />
      ) : (
        <ChatPage username={username} />
      )}
    </ThemeProvider>
  );
}

export default App; 