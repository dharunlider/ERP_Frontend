// Constants/NotificationContext.js
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

//custom hooks
export const useNotification = () => useContext(NotificationContext);


//provider component
export const NotificationProvider = ({ children }) => {
  const [unseenCount, setUnseenCount] = useState(0);

  return (
    <NotificationContext.Provider value={{ unseenCount, setUnseenCount }}>
      {children}
    </NotificationContext.Provider>
  );
};