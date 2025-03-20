import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatList({ currentUser, setSelectedConnection, users }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`https://backend-phi-rouge.vercel.app/api/chats/${currentUser}`);
        setChats(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [currentUser]);

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : id;
  };

  const getOtherUser = (chat) => {
    return chat.fromUser === currentUser ? chat.toUser : chat.fromUser;
  };

  return (
    <div>
      <h2>My Chats</h2>
      {chats.length === 0 && <p>No chats available.</p>}
      {chats.map(chat => (
        <div key={chat._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <p>
            <strong>Chat with:</strong> {getUserName(getOtherUser(chat))}
          </p>
          <button onClick={() => setSelectedConnection({ id: chat._id, otherUser: getOtherUser(chat) })}>
            Open Chat
          </button>
        </div>
      ))}
    </div>
  );
}

export default ChatList;
