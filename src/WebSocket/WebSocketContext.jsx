// contexts/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext();

const SOCKET_BASE_URL = 'https://vbk0n794-8083.inc1.devtunnels.ms';
const WS_ENDPOINT = '/ws';

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const subscriptions = useRef(new Map());

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${SOCKET_BASE_URL}${WS_ENDPOINT}`),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('WebSocket connected');
        // Resubscribe to all topics
        subscriptions.current.forEach((callback, topic) => {
          subscriptions.current.set(topic, client.subscribe(topic, callback));
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const subscribe = (topic, callback) => {
    if (stompClient.current && stompClient.current.connected) {
      const subscription = stompClient.current.subscribe(topic, callback);
      subscriptions.current.set(topic, subscription);
      return subscription;
    } else {
      // Store for when connection is established
      subscriptions.current.set(topic, callback);
    }
  };

  const unsubscribe = (topic) => {
    const subscription = subscriptions.current.get(topic);
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
    subscriptions.current.delete(topic);
  };

  const sendMessage = (destination, body) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: `/app${destination}`,
        body: JSON.stringify(body)
      });
    }
  };

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;