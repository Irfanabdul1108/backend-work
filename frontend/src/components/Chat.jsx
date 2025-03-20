import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

function Chat({ connectionRequestId, currentUser, otherUser, users }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create a socket connection for this conversation
    const newSocket = io('https://backend-phi-rouge.vercel.app');

    setSocket(newSocket);
    newSocket.on('newMessage', (msg) => {
      if (msg.connectionRequest === connectionRequestId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    newSocket.emit('joinRoom', connectionRequestId);
    return () => newSocket.disconnect();
  }, [connectionRequestId]);


  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`https://backend-phi-rouge.vercel.app/api/chat/${connectionRequestId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.on('newMessage', (msg) => {
        if (msg.connectionRequest === connectionRequestId) {
          setMessages(prev => [...prev, msg]);
        }
      });
    }
    return () => {
      if (socket) socket.off('newMessage');
    };
  }, [connectionRequestId, socket]);


  
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const newChatMessage = {
      _id: Date.now().toString(),
      connectionRequest: connectionRequestId,
      sender: currentUser,
      message: newMessage
    };
    setMessages(prev => [...prev, newChatMessage]);
    setNewMessage('');
    try {
      await axios.post('https://backend-phi-rouge.vercel.app/api/chat/send', {
        connectionRequest: connectionRequestId,
        sender: currentUser,
        message: newMessage
      });
    } catch (err) {
      console.error('Error sending chat message:', err);
    }

  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : id;
  };

  return (
    <div>
      <h2>Chat</h2>
      <div style={{
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '300px', 
        overflowY: 'scroll'
      }}>
        {messages.map(msg => (
          <p
            key={msg._id}
            style={{
              textAlign: msg.sender === currentUser ? 'right' : 'left',
              backgroundColor: msg.sender === currentUser ? '#d1ffd1' : '#f1f1f1',
              padding: '5px',
              borderRadius: '5px',
              maxWidth: '60%',
              margin: msg.sender === currentUser ? '5px auto 5px 5px' : '5px 5px 5px auto'
            }}
          >
            <strong>{msg.sender === currentUser ? 'You' : getUserName(otherUser)}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <textarea
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        placeholder="Type your message here..."
      />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}

export default Chat;
