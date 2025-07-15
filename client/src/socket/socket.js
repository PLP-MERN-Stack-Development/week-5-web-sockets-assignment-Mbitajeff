// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState(['General']);
  const [currentRoom, setCurrentRoom] = useState('General');
  const [systemMessages, setSystemMessages] = useState([]);
  const [privateChats, setPrivateChats] = useState({}); // { userId: [messages] }
  const [unread, setUnread] = useState({}); // { room: count, userId: count }

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message to current room
  const sendMessage = (message) => {
    socket.emit('send_message', { message });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Room management
  const createRoom = (roomName) => {
    socket.emit('create_room', roomName);
  };
  const joinRoom = (roomName) => {
    socket.emit('join_room', roomName);
    setCurrentRoom(roomName);
    setMessages([]); // clear messages for new room
    setSystemMessages([]);
    setUnread((prev) => ({ ...prev, [roomName]: 0 }));
  };
  const leaveRoom = (roomName) => {
    socket.emit('leave_room', roomName);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };
    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
      // Unread count for other rooms
      if (message.room && message.room !== currentRoom) {
        setUnread((prev) => ({ ...prev, [message.room]: (prev[message.room] || 0) + 1 }));
      }
    };
    const onPrivateMessage = (message) => {
      setPrivateChats((prev) => {
        const arr = prev[message.senderId] || [];
        return { ...prev, [message.senderId]: [...arr, message] };
      });
      // Unread count for private
      if (message.senderId) {
        setUnread((prev) => ({ ...prev, [message.senderId]: (prev[message.senderId] || 0) + 1 }));
      }
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };
    const onUserJoined = (user) => {
      setSystemMessages((prev) => [
        ...prev,
        { id: Date.now(), system: true, message: `${user.username} joined the chat`, timestamp: new Date().toISOString() },
      ]);
    };
    const onUserLeft = (user) => {
      setSystemMessages((prev) => [
        ...prev,
        { id: Date.now(), system: true, message: `${user.username} left the chat`, timestamp: new Date().toISOString() },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Room events
    const onRoomList = (roomList) => {
      setRooms(roomList);
    };
    const onSystemMessage = (msg) => {
      setSystemMessages((prev) => [
        ...prev,
        { id: Date.now(), system: true, message: msg, timestamp: new Date().toISOString() },
      ]);
    };

    // Notification events
    const onNotifyMessage = (message) => {
      if (message.room && message.room !== currentRoom) {
        setUnread((prev) => ({ ...prev, [message.room]: (prev[message.room] || 0) + 1 }));
      }
    };
    const onNotifyPrivate = (message) => {
      if (message.senderId) {
        setUnread((prev) => ({ ...prev, [message.senderId]: (prev[message.senderId] || 0) + 1 }));
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_list', onRoomList);
    socket.on('system_message', onSystemMessage);
    socket.on('notify_message', onNotifyMessage);
    socket.on('notify_private', onNotifyPrivate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_list', onRoomList);
      socket.off('system_message', onSystemMessage);
      socket.off('notify_message', onNotifyMessage);
      socket.off('notify_private', onNotifyPrivate);
    };
  }, [currentRoom]);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    systemMessages,
    privateChats,
    unread,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    createRoom,
    joinRoom,
    leaveRoom,
    setCurrentRoom,
    setUnread,
  };
};

export default socket; 