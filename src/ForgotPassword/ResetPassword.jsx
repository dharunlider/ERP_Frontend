import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import { TextField, Button, Typography, Container, Box, CircularProgress } from "@mui/material"; // Material UI components
import axios from "../Axiosinstance";


const ResetPassword = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");  // State for token (user will enter this manually)
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
    
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    
        // Validate token
        if (!token) {
            setError("Please enter a valid token.");
            return;
        }
    
        setLoading(true); // Show loading state
    
        try {
            // Send reset password request with both token and new password as query parameters
            const response = await axios.post("user/reset-password", null, {
                params: {
                    token: token,   // Pass token as query parameter
                    newPassword: newPassword,  // Pass new password as query parameter
                }
            });
    
            // Redirect to login page after successful reset
            if (response.status === 200) {
                navigate("/login");
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Failed to reset password.");
            } else {
                setError("Failed to reset password.");
            }
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };
    

    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Reset Your Password
                </Typography>

                {/* Display error message if any */}
                {error && (
                    <Typography color="error" variant="body2" sx={{ marginBottom: 2 }}>
                        {error}
                    </Typography>
                )}

                {/* Password reset form */}
                <form onSubmit={handlePasswordReset} style={{ width: '100%' }}>
                    {/* Token input field for manual token entry */}
                    <TextField
                        label="Reset Token"
                        variant="outlined"
                        fullWidth
                        value={token}
                        onChange={(e) => setToken(e.target.value)}  // User enters the token here
                        required
                        sx={{ marginBottom: 2 }}
                    />

                    <TextField
                        label="New Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        sx={{ marginBottom: 2 }}
                    />

                    <TextField
                        label="Confirm New Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        sx={{ marginBottom: 2 }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ marginBottom: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default ResetPassword;
