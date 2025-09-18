import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, IconButton, Typography, TextField, FormControl,
    InputLabel, Select, MenuItem, Button, Box, Alert, InputAdornment, Fade, Grid, Paper, alpha, Zoom, Slide
} from '@mui/material';
import {
    Visibility, VisibilityOff, AdminPanelSettings, Close, Person, Email, VpnKey, Badge
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for better customization
const GradientDialogTitle = styled(DialogTitle)(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2, 3),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
    color: theme.palette.common.white,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: theme.shadows[2],
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    background: theme.palette.background.paper,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.spacing(1),
        transition: 'all 0.3s ease',
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
    },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
}));

const GradientButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(1.2, 2),
    borderRadius: theme.spacing(1.5),
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)',
    },
}));

const OutlineButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.grey[400],
    color: theme.palette.text.secondary,
    padding: theme.spacing(1.2, 2),
    borderRadius: theme.spacing(1.5),
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

const AdminProfileForm = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        hrCode: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', formData);

            // Show success message
            setAlert({
                show: true,
                message: 'Admin profile created successfully!',
                severity: 'success'
            });

            setIsSubmitting(false);

            // Hide alert after 3 seconds and close modal
            setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
                handleClose();
            }, 3000);
        }, 1500);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            name: '',
            email: '',
            role: '',
            hrCode: '',
            password: ''
        });
        setAlert({ show: false, message: '', severity: 'success' });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'visible',
                    background: 'transparent'
                }
            }}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
        >
            <AnimatedPaper elevation={0}>
                <GradientDialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AdminPanelSettings sx={{ mr: 2.5, fontSize: 28 }} />
                        <Typography variant="h6" component="span" fontWeight="600">
                            Create Admin Profile
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: alpha('#fff', 0.1)
                            }
                        }}
                    >
                        <Close />
                    </IconButton>
                </GradientDialogTitle>

                <DialogContent sx={{ p: 0, mt: 2 }}>
                    <Fade in={open} timeout={800}>
                        <Box>
                            {alert.show && (
                                <Zoom in={alert.show}>
                                    <Alert
                                        severity={alert.severity}
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2,
                                            alignItems: 'center',
                                            boxShadow: 1
                                        }}
                                        icon={false}
                                    >
                                        <Typography variant="body2" fontWeight="500">
                                            {alert.message}
                                        </Typography>
                                    </Alert>
                                </Zoom>
                            )}

                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            fullWidth
                                            label="Full Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Person color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <StyledTextField
                                            fullWidth
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Role</InputLabel>
                                            <StyledSelect
                                                name="role"
                                                value={formData.role}
                                                label="Role"
                                                onChange={handleChange}
                                                required
                                            >
                                                <MenuItem value="ADMIN">Admin</MenuItem>
                                            </StyledSelect>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <StyledTextField
                                            fullWidth
                                            label="HR Code"
                                            name="hrCode"
                                            value={formData.hrCode}
                                            onChange={handleChange}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Badge color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }} />
                                            
                                    </Grid>
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            fullWidth
                                            label="Password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <VpnKey color="primary" />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }} />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                    <OutlineButton
                                        onClick={handleClose}
                                        fullWidth
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </OutlineButton>
                                    <GradientButton
                                        type="submit"
                                        fullWidth
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create Admin'}
                                    </GradientButton>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                </DialogContent>
            </AnimatedPaper>
        </Dialog>
    );
};

export default AdminProfileForm;