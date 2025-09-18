// src/Network/NetworkStatusFallBackPage.js
import React from 'react';
import { useNetworkStatus } from './NetworkStatusContext';
import { Box, Typography, Button, Paper, Stack, Fade } from '@mui/material';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import { keyframes } from '@mui/system';

// Bouncing Animation for the Retry Button
const bounce = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const NetworkStatusFallBackPage = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'url(https://images.unsplash.com/photo-1565376052-c115410659ec) no-repeat center center fixed',
        backgroundSize: 'cover',
        position: 'relative',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Fade in={!isOnline} timeout={1000}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: 400,
            width: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Fade in={!isOnline} timeout={1500}>
              <SignalWifiOffIcon color="error" sx={{ fontSize: 64 }} />
            </Fade>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Oops! You're Offline
            </Typography>
            <Typography variant="body1" color="text.secondary">
              It seems like you're not connected to the internet. Please check your connection and try again.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                animation: `${bounce} 1s infinite`, // Add bounce animation to the button
              }}
            >
              Retry
            </Button>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default NetworkStatusFallBackPage;
