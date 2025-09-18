import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../Axiosinstance";
import { toast } from 'react-toastify';
import { CircularProgress } from "@mui/material";


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);       // <-- FIXED
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("hiihihi")
    try {
      const response = await axios.post("user/forgot", null, {
        params: { email },
      });

      if (response.status === 200) {
        toast.success("Reset link sent to your email.");
      }
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  // Responsive Design Breakpoints
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90vh",
        backgroundColor: "rgb(227, 242, 253)",
        p: 2,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row", // Image on top if small screen
          maxWidth: "90vw",
          width: isSmallScreen ? "100%" : "900px",
          minHeight: "500px",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
        }}
      >
        {/* Box 1: Image Section - Moves to Top on Small Screens */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: "url('/images/Forpwimg.png')", // Corrected path
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            p: 5,
            minHeight: isSmallScreen ? "250px" : "auto", // Ensure image height is maintained on mobile
          }}
        />

        {/* Box 2: Form Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center", // Center the form content
            p: isSmallScreen ? 3 : 5,
            background: "white",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 3,
              textAlign: "center",
              fontSize: isSmallScreen ? "1.5rem" : "1.75rem",
              fontFamily: "Marquis",
            }}
          >
            FORGOT PASSWORD
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              textAlign: "center",
              fontFamily: "Marquis",
              fontSize: "1rem",
            }}
          >
            Enter your email address to receive a password reset link.
          </Typography>

          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          
          <Button
            disabled={loading}
            onClick={handleSubmit}
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
            variant="contained"
            color="primary"
          >
            {loading ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ color: "white", mr: 1 }}
                />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>


          <Typography
            variant="body2"
            sx={{
              mt: 2,
              textAlign: "center",
              color: "primary",
              fontFamily: "Marquis",
              fontSize: "1rem",
            }}
          >
            Remember your password?{" "}
            <Button
              onClick={() => navigate("/login")}
              sx={{
                textDecoration: "none",
                color: "primary",
                fontWeight: "bold",
                marginLeft: "5px",
                padding: "0",
                fontSize: "inherit",
                background: "none",
                border: "none",
                fontFamily: "Marquis",
              }}
            >
              Login
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
