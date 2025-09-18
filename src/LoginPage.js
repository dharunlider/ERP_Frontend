import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./Axiosinstance";
import { useUser } from "./Contexts/Usercontext";
import {
  Box, Paper, Typography, TextField, Button, InputAdornment, IconButton,
  useMediaQuery, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';



const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictDevice, setConflictDevice] = useState(null);


  const navigate = useNavigate();
  const { setUserId, fetchUser } = useUser();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 5 && password.length <= 20;
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    let newErrors = {};
    if (!username) {
      newErrors.username = "Email is required";
    } else if (!validateEmail(username)) {
      newErrors.username = "Invalid email format (example@domain.com)";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be 5-20 characters long";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const response = await axiosInstance.post("auth/login", {
          email: username,
          password: password,
        });
        console.log("Response:", response.data);
        if (response.status === 200) {
          // localStorage.setItem("username", response.data.username);
          const userIdFromBackend = response.data.referenceId;
          sessionStorage.setItem("userId", JSON.stringify(userIdFromBackend));
          setUserId(userIdFromBackend);
          toast.success("Login successful!", {
            position: "bottom-right",
            autoClose: 3000,
          });
        
          await fetchUser();

          if (userIdFromBackend) {
            // sessionStorage.setItem("userId", JSON.stringify(referenceId));
            // setUserId(referenceId);
            await fetchUser();
          }


          navigate("/SideNav");
        }
      }
      catch (error) {
        let message;

        if (error.response?.status === 409) {
          setConflictDevice(error.response?.data?.device || {});
          setShowConflictDialog(true);
          return;
        }
        else if (error.response?.status === 429) {
          message = error.response?.data?.details ||
            error.response?.data?.message ||
            "Too many login attempts. Please try again later.";
        }
        else {
          message =
            error.response?.data?.details ||
            error.response?.data?.message ||
            "Login failed. Incorrect Password or Email, Try again!";
        }

        // Assign to password field or general error
        setErrors({
          password: message, // 👈 Show near password field
        });

        toast.error(message, {
          position: "bottom-right",
          autoClose: 3000,
        });

        console.error("Login failed:", message);
      }
      finally {
        setLoading(false); // 👈 Stop spinner
      }
    }
  };
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRequestLogoutAllDevices = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("auth/request-logout-all", {
        email: username,
        password: password,
      }); // ⬅️ backend will email the UUID link
      toast.success("Logout link sent to your email", {
        position: "bottom-right",
        autoClose: 4000,
      });
      setShowConflictDialog(false);
    } catch (error) {
      toast.error("Failed to send logout link. Try again.", {
        position: "bottom-right",
      });
      console.error("Logout all request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));


  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "rgb(227, 242, 253)",
        p: 2,
      }}
    >


      <Paper
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          maxWidth: "90vw",
          width: isSmallScreen ? "100%" : "900px",
          minHeight: "500px",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        {/* Close Icon */}
        <IconButton
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1,
            color: "text.primary",
          }}
          onClick={() => navigate("/")}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>


        {/* Image Section */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: "url('/images/lpimg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            p: 5,
            minHeight: isSmallScreen ? "250px" : "auto",
          }}
        />

        {/* Form Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
            LOGIN
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username/Email"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              required
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              required
              sx={{ mt: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password */}
            <Typography
              variant="body2"
              sx={{ mt: 1, textAlign: "right", fontFamily: "Marquis" }}
            >
              <Button
                onClick={() => navigate("/forgot-password")}
                sx={{
                  textDecoration: "none",
                  color: "primary",
                  marginLeft: "5px",
                  padding: "0",
                  fontSize: "bold",
                  background: "none",
                  border: "none",
                  fontFamily: "Marquis",
                }}
              >
                Forgot Password
              </Button>
            </Typography>

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: isSmallScreen ? "0.9rem" : "1rem",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Create Account */}
          <Typography
            variant="body2"
            color="primary"
            sx={{
              mt: 2,
              textAlign: "center",
              color: "gray",
              fontSize: isSmallScreen ? "0.85rem" : "1rem",
              fontFamily: "Marquis",
            }}
          >
            Don't have an account?
            <Button
              onClick={() => navigate("/signup")}
              sx={{
                textDecoration: "none",
                color: "#1976d2",
                fontWeight: "bold",
                marginLeft: "5px",
                padding: "0",
                fontSize: "inherit",
                background: "none",
                border: "none",
                fontFamily: "Marquis",
              }}
            >
              Create Account
            </Button>

          </Typography>
        </Box>
      </Paper>


      <Dialog
        open={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1.5 }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#1976d2", // 🔵 Blue color
            color: "white",
            fontWeight: "bold",
            fontSize: "1.25rem",
            px: 3,
            py: 2
          }}
        >
          Session Conflict Detected
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "info.main" }}>
            Your account is currently active on another device or browser. Please sign out from the other session to continue here.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Device Details:
            </Typography>

            <Box sx={{ display: "grid", rowGap: 1.2 }}>
              <Typography variant="body2">
                <strong>IP Address:</strong> {conflictDevice?.ipAddress || "Unknown"}
              </Typography>
              <Typography variant="body2">
                <strong>User-Agent:</strong>{" "}
                <Box component="span" sx={{ wordBreak: "break-word" }}>
                  {conflictDevice?.userAgent || "Unknown"}
                </Box>
              </Typography>
              <Typography variant="body2">
                <strong>Session ID:</strong> {conflictDevice?.sessionId || "N/A"}
              </Typography>




            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleRequestLogoutAllDevices}
            variant="contained"
            color="error"
          >
            Logout from All Devices
          </Button>
          <Button
            onClick={() => setShowConflictDialog(false)}
            variant="outlined"
            color="primary" // 🔵 Matches the blue theme
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>




    </Box>
  );
};

export default LoginPage;

