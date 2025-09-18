
import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';


const PointNotifications = () => {

const [notifications, setNotifications] = useState([]);
const client = useRef(null);

// Get the email ID of the logged-in user (from localStorage, sessionStorage, or backend)
const email = localStorage.getItem('username'); // Retrieve the email after login
console.log(email,"email")
useEffect(() => {
  if (!email) {
    console.error('Email not found. Please log in first.');
    return;
  }

  client.current = new Client({
    brokerURL: 'wss://w0vhrv2j-8080.inc1.devtunnels.ms/ws',  // WebSocket URL (ensure it's correct)
    onConnect: () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to the user-specific queue using the email ID
      client.current.subscribe(`/queue/${email}`, (message) => {
        console.log("Received message: ", message.body);
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          message.body,  // Assuming the message is a string or already parsed
        ]);
      });
    },
    onStompError: (error) => {
      console.error('STOMP error:', error);
    },
  });

  // Connect to the WebSocket server
  client.current.activate();

  // Cleanup function to deactivate the client when the component unmounts
  return () => {
    if (client.current) {
      client.current.deactivate();
    }
  };
}, [email]);

return (
  <div>
    <h1>Notifications</h1>
    <ul>
      {notifications.map((notification, index) => (
        <li key={index}>{notification}</li>
      ))}
    </ul>
  </div>
);
};

export default PointNotifications;