import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import SendRequest from './components/SendRequest';
import RequestList from './components/RequestList';
import ChatList from './components/ChatList';
import Chat from './components/Chat';

// Sample data for 6 users
const users = [
  { id: "630d7c8c2f9b9c1f88e0d1a1", name: "User1" },
  { id: "630d7c8c2f9b9c1f88e0d1a2", name: "User2" },
  { id: "630d7c8c2f9b9c1f88e0d1a3", name: "User3" },
  { id: "630d7c8c2f9b9c1f88e0d1a4", name: "User4" },
  { id: "630d7c8c2f9b9c1f88e0d1a5", name: "User5" },
  { id: "630d7c8c2f9b9c1f88e0d1a6", name: "User6" }
];

function App() {
  const [currentUser, setCurrentUser] = useState(users[0].id); // Default: User1
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [socket, setSocket] = useState(null);


  return (
    <div>
      <h1>MERN Multiuser Chat App</h1>
      <div style={{ marginBottom: '20px' }}>
        <label>Select Current User: </label>
        <select
          value={currentUser}
          onChange={(e) => {
            setCurrentUser(e.target.value);
            setSelectedConnection(null);
          }}
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      {/* Send connection requests */}
      <SendRequest currentUser={currentUser} users={users} />

      {/* Incoming connection requests (real-time notifications will update this list) */}
      <RequestList userId={currentUser} setSelectedConnectionId={setSelectedConnection} users={users} socket={socket} />

      {/* Optional: A list of accepted chats */}
      <ChatList currentUser={currentUser} setSelectedConnection={setSelectedConnection} users={users} />

      {/* Render Chat if a conversation is selected */}
      {selectedConnection && (
        <Chat
          connectionRequestId={selectedConnection.id}
          currentUser={currentUser}
          otherUser={selectedConnection.otherUser}
          users={users}
        />
      )}
    </div>
  );
}

export default App;
