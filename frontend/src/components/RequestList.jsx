import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RequestList({ userId, setSelectedConnectionId, users, socket }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`https://backend-phi-rouge.vercel.app/api/connection-requests/${userId}`);
        setRequests(res.data);
      } catch (err) {
        console.error('Error fetching connection requests:', err);
      }
    };

    fetchRequests();

    // Listen for new connection requests in real time
    if (socket) {
      socket.on('newConnectionRequest', (newRequest) => {
        // Check if this request is for the current user
        if (newRequest.toUser === userId) {
          setRequests(prev => [newRequest, ...prev]);
        }
      });
    }
    return () => {
      if (socket) socket.off('newConnectionRequest');
    };
  }, [userId, socket]);

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : id;
  };

  const acceptRequest = async (requestId, fromUser, toUser) => {
    try {
      await axios.post('https://backend-phi-rouge.vercel.app/api/connection-request/accept', { requestId });
      setRequests(requests.filter(req => req._id !== requestId));
      const otherUserId = userId === fromUser ? toUser : fromUser;
      setSelectedConnectionId({ id: requestId, otherUser: otherUserId });
    } catch (err) {
      console.error('Error accepting connection request:', err);
    }
  };

  return (
    <div>
      <h2>Incoming Connection Requests</h2>
      {requests.length === 0 && <p>No connection requests found.</p>}
      {requests.map(request => (
        <div key={request._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <p>
            <strong>From:</strong> {getUserName(request.fromUser)} &nbsp;
            <strong>To:</strong> {getUserName(request.toUser)}
          </p>
          {request.message && <p><strong>Message:</strong> {request.message}</p>}
          <button onClick={() => acceptRequest(request._id, request.fromUser, request.toUser)}>
            Accept &amp; Chat
          </button>
        </div>
      ))}
    </div>
  );
}

export default RequestList;
