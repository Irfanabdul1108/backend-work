import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://backend-phi-rouge.vercel.app';
const API_URL = `${SOCKET_URL}/api/chat`;

function Chat({ connectionRequestId, currentUser, otherUser, users }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const connectionRequestIdRef = useRef(connectionRequestId);

  // Update ref when connectionRequestId changes
  useEffect(() => {
    connectionRequestIdRef.current = connectionRequestId;
  }, [connectionRequestId]);

  // Handle socket connection and messages
  useEffect(() => {
    const initializeSocket = () => {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected');
          socketRef.current.emit('joinRoom', connectionRequestIdRef.current);
        });

        socketRef.current.on('newMessage', (msg) => {
          if (msg.connectionRequest === connectionRequestIdRef.current) {
            setMessages(prev => [...prev, msg]);
          }
        });
      }
    };

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/${connectionRequestId}`);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchMessages();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectionRequestId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    // Optimistic update
    const tempMessage = {
      _id: Date.now().toString(),
      connectionRequest: connectionRequestId,
      sender: currentUser,
      message: newMessage,
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  
    try {
      socketRef.current.emit('sendMessage', {
        connectionRequest: connectionRequestId,
        sender: currentUser,
        message: newMessage
      });
    } catch (err) {
      console.error('Error sending chat message:', err);
      // Rollback optimistic update if needed
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const getUserName = (id) => users.find((u) => u.id === id)?.name || id;

  return (
    <div>
      <h2>Chat</h2>
      <div
        ref={chatContainerRef}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '300px',
          overflowY: 'scroll',
        }}
      >
        {messages.map((msg) => (
          <p
            key={msg._id}
            style={{
              textAlign: msg.sender === currentUser ? 'right' : 'left',
              backgroundColor: msg.sender === currentUser ? '#d1ffd1' : '#f1f1f1',
              padding: '5px',
              borderRadius: '5px',
              maxWidth: '60%',
              margin: msg.sender === currentUser ? '5px auto 5px 5px' : '5px 5px 5px auto',
            }}
          >
            <strong>{msg.sender === currentUser ? 'You' : getUserName(otherUser)}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message here..."
        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
      />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}

export default Chat;