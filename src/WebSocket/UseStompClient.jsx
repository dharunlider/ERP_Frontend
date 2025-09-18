// hooks/useStompClient.js
import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const SOCKET_URL = 'wss://g235w1zz-8083.inc1.devtunnels.ms/ws';

export const useStompClient = (topic, onMessage) => {
  const stompClient = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: SOCKET_URL, // ✅ Use brokerURL instead of webSocketFactory
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`Websocket Connected`);
        client.subscribe(topic, (message) => {
          if (message.body) {
            onMessage(JSON.parse(message.body));
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, [topic, onMessage]);

  return stompClient;
};