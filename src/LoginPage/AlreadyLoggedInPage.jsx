import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Button,
  Divider,
  Box
} from "@mui/material";

const AlreadyLoggedInPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message, device, email, password } = location.state || {};

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom color="error">
          Session Conflict
        </Typography>

        <Typography variant="body1" gutterBottom>
          {message || "You are already logged in from another device or browser."}
        </Typography>

        {device && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Active Session Details:
            </Typography>
            <Typography variant="body2"><strong>User-Agent:</strong> {device.userAgent || "Unknown"}</Typography>
            <Typography variant="body2"><strong>IP Address:</strong> {device.ipAddress || "Unknown"}</Typography>
            <Typography variant="body2"><strong>Session ID:</strong> {device.sessionId || "N/A"}</Typography>
            <Typography variant="body2"><strong>Login Time:</strong> {device.loginTime || "N/A"}</Typography>
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>

          <Button
            variant="outlined"
            color="warning"
            sx={{ ml: 2 }}
            onClick={() => {
              navigate("/login", {
                state: {
                  force: true,
                  email,
                  password,
                  conflictDevice: device,
                }
              });
            }}
          >
            Kick out and Continue
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AlreadyLoggedInPage;
