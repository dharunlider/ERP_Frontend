// src/contexts/NetworkStatusContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for network status
const NetworkStatusContext = createContext();

// Create a provider component to share the network status
export const NetworkStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update the status when the user goes online or offline
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  useEffect(() => {
    // Add event listeners to detect changes in network status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// Custom hook to access the network status
export const useNetworkStatus = () => {
  return useContext(NetworkStatusContext);
};
