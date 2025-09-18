import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../Axiosinstance";
import { Box, CircularProgress, Typography, Button, Paper } from "@mui/material";
import { toast } from "react-toastify";

const LogoutAllDevices= () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    axiosInstance
      .get(`/auth/confirm-logout-all?token=${token}`)
      .then(() => {
        toast.success("You’ve been logged out from all devices.", {
          position: "bottom-right",
        });
        setStatus("success");
      })
      .catch(() => {
        toast.error("Link expired or invalid.", { position: "bottom-right" });
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Verifying logout request...
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Successfully Logged Out
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You’ve been logged out from all active devices.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}>
              Back to Login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              Invalid or Expired Link
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The logout confirmation link is no longer valid.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}>
              Back to Login
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default LogoutAllDevices;