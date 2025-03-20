import React, { useState } from 'react';
import axios from 'axios';

function SendRequest({ currentUser, users }) {
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");

  const sendRequest = async () => {
    if (!toUser) {
      alert("Please select a recipient");
      return;
    }
    try {
      const res = await axios.post('https://backend-phi-rouge.vercel.app/api/connection-request', { 
        fromUser: currentUser, 
        toUser, 
        message 
      });
      console.log(res.data);
      alert('Connection request sent!');
      setMessage("");
      setToUser("");
    } catch (err) {
      console.error('Error sending connection request:', err);
      alert('Error sending connection request');
    }
  };

  const availableUsers = users.filter(user => user.id !== currentUser);

  return (
    <div>
      <h2>Send Connection Request</h2>
      <div>
        <label>Recipient: </label>
        <select value={toUser} onChange={(e) => setToUser(e.target.value)}>
          <option value="">Select a user</option>
          {availableUsers.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Message: </label>
        <textarea
          placeholder="Optional Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        ></textarea>
      </div>
      <button onClick={sendRequest}>Send Request</button>
    </div>
  );
}

export default SendRequest;
