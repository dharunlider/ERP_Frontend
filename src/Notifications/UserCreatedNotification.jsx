import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import axios from '../Axiosinstance';
import { formatDate } from '../Constants/UtilFunctions';
import { useNotification } from '../Constants/NotificationContext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import {
  Box,
  List,
  Typography,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';

import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const UserCreatedNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const { unseenCount, setUnseenCount } = useNotification();
  const stompClient = useRef(null);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axios.get('notifications/unread');
      const notifications = response.data;
      setNotifications(
        notifications.unreadNotifications.map(notification => ({
          message: notification.message,
          timestamp: notification.timestamp,
          formattedDate: formatDate(notification.timestamp),
          id: notification.id,
          isRead: notification.isRead || false,
        }))
      );
      setUnseenCount(notifications.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
    }
  };

  const markAsRead = async id => {
    try {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnseenCount(prev => prev - 1);

      const response = await axios.patch(`notifications/${id}/read`);
      if (response.status !== 200) throw new Error('Failed to mark as read');
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: false } : n))
      );
      setUnseenCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();

    stompClient.current = new Client({
      brokerURL: 'wss://w0vhrv2j-8080.inc1.devtunnels.ms/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.current.subscribe('/topic/staff', message => {
          const newNotification = {
            message: message.body,
            timestamp: new Date().toISOString(),
            formattedDate: formatDate(new Date().toISOString()),
            id: message.body.id || Math.random(),
            isRead: false,
          };
          setNotifications(prev => [...prev, newNotification]);
          setUnseenCount(prev => prev + 1);
        });
      },
      onStompError: err => console.error('WebSocket error:', err),
    });

    stompClient.current.activate();
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, []);

  return (
    <Box sx={{
      padding: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2 ,
        }}
      >
        <Box width="100%" display="flex" justifyContent="center" alignItems="center" mb={2}>
          <Typography
            variant="h5"
            fontWeight="bold"
            color="white"
            style={{ fontFamily: 'Marquis' }}
          >
            NOTIFICATIONS
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List disablePadding sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
        {notifications.length === 0 ? (
          <Typography
            variant="h5"
            color="white"
            textAlign="center"
            mt={4}
            style={{ fontFamily: 'Marquis' }}
          >
            No New Notifications.
          </Typography>
        ) : (
          notifications.map(notification => (
            <Paper
              key={notification.id}
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 4,
                backgroundColor: notification.isRead ? '#f9f9f9' : '#e3f2fd',
                transition: '0.3s ease',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                },
                height: '75px', // Fixed height for all cards
                display: 'flex',
                flexDirection: 'column'
              }}
              style={{ fontFamily: 'Marquis' }}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flexGrow: 1,
                overflow: 'hidden' // Prevent content from overflowing card
              }}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: 'calc(100% - 40px)', // Leave space for button
                  pr: 1
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    overflow: 'hidden'
                  }}>
                    <NotificationsActiveIcon
                      sx={{
                        fontSize: 20,
                        mr: 1,
                        color: notification.isRead ? 'grey.500' : 'primary.main',
                        flexShrink: 0
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight={500}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // Limit to 2 lines
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.3'
                      }}
                    >
                      {notification.message}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                    label={`Created on: ${notification.formattedDate}`}
                    size="small"
                    variant="filled"
                    sx={{
                      mt: 'auto', // Push to bottom
                      alignSelf: 'flex-start',
                      backgroundColor: 'white',
                      color: '142a4f',
                      fontWeight: 600,
                      borderRadius: '8px',
                      fontSize: '0.70rem',
                      pl: 1,
                      pr: 1.5,
                    }}
                  />
                </Box>

                {!notification.isRead && (
                  <Tooltip title="Mark as Read">
                    <IconButton
                      onClick={() => markAsRead(notification.id)}
                      size="small"
                      sx={{
                        color: 'success.main',
                        '&:hover': {
                          backgroundColor: '#d4edda',
                        },
                        alignSelf: 'flex-start'
                      }}
                    >
                      <MarkEmailReadIcon fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          ))
        )}
      </List>
    </Box>
  );
};

export default UserCreatedNotification;


export const fetchUnreadNotifications = async (setUnseenCount) => {
  try {
    const response = await axios.get('notifications/unread');
    const data = response.data;
    setUnseenCount(data.unreadCount);
  } catch (error) {
    console.error("Failed to fetch initial unseen count:", error.message);
  }
};


