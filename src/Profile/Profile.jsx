import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import { 
  Box, Button, Divider, Typography, Avatar, TextField, Stack, MenuItem, Modal, IconButton,
  InputAdornment, Paper, Chip, CircularProgress, Alert, Tabs, Tab, useTheme,
} from '@mui/material';
import {
  Email, Phone, Edit, Save, Close, Visibility, VisibilityOff, Person, Public, Lock, Badge,
  CloudUpload, Delete
} from '@mui/icons-material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useUser } from '../Contexts/Usercontext.jsx';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const allCountries = ['India', 'United States', 'Canada', 'United Kingdom', 'Australia'];

// Cloudinary Upload Component
const CloudinaryUpload = ({
  title,
  description,
  onUploadSuccess,
  onRemove,
  existingUrl,
  uploading,
  error,
  inputId,
  accept = ".jpg,.jpeg,.png",
  maxSizeMB = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!validTypes.includes(file.type)) {
      setUploadError('Only JPG and PNG images are allowed');
      return null;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Image size must be less than ${maxSizeMB}MB`);
      return null;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'erp_unsigned_upload');

      const response = await fetch('https://api.cloudinary.com/v1_1/dn8zkmwt1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Upload failed: No secure_url returned');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadToCloudinary(file);
    if (cloudinaryUrl && onUploadSuccess) {
      onUploadSuccess(cloudinaryUrl);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {description}
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mt={1}>
        <Box flex={1}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              component="label"
              htmlFor={inputId}
              startIcon={isUploading || uploading ? <CircularProgress size={16} /> : <CloudUpload />}
              size="small"
              disabled={isUploading || uploading}
            >
              {isUploading || uploading ? 'Uploading...' : existingUrl ? 'Change' : 'Upload'}
              <input
                accept={accept}
                hidden
                id={inputId}
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading || uploading}
              />
            </Button>

            {existingUrl && (
              <Button
                variant="outlined"
                color="error"
                onClick={onRemove}
                startIcon={<Delete />}
                size="small"
                disabled={isUploading || uploading}
              >
                Remove
              </Button>
            )}
          </Box>

          {(error || uploadError) && (
            <Typography color="error" variant="body2" mt={1}>
              {error || uploadError}
            </Typography>
          )}

          {existingUrl && !error && !uploadError && (
            <Typography variant="body2" color="success.main" mt={1}>
              ✓ Successfully uploaded
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const ProfileModal = ({ open, onClose, staffId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const theme = useTheme();
  const { userId } = useUser();

  const [profile, setProfile] = useState({
    hrCode: '',
    name: '',
    email: '',
    gender: '',
    nation: '',
    password: '',
    phone: '',
    profileImage: '',
  });

  useEffect(() => {
    if (open && userId) {
      fetchStaffData();
    }
  }, [open, userId]);

  const fetchStaffData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`staff/staff/${userId}`);
      const staffData = response.data.data || response.data;

      setProfile({
        hrCode: staffData.hrCode || '',
        name: staffData.name || '',
        email: staffData.email || '',
        gender: staffData.gender || '',
        nation: staffData.nation || '',
        password: '',
        phone: staffData.phone || '',
        profileImage: staffData.profileImage || '',
      });
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load staff data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhoneChange = (phone) => {
    setProfile((prev) => ({ ...prev, phone }));
  };

  const handleImageUploadSuccess = async (imageUrl) => {
    setUploadingImage(true);
    setImageError('');
    try {
      // Update profile with new image URL
      const response = await axios.patch(`staff/staffid/${userId}`, {
        profileImage: imageUrl
      });

      setProfile(prev => ({ ...prev, profileImage: imageUrl }));
      setSuccess('Profile image updated successfully!');
    } catch (error) {
      console.error('Error updating profile image:', error);
      setImageError('Failed to update profile image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploadingImage(true);
    try {
      const response = await axios.patch(`staff/staffid/${userId}`, {
        profileImage: ''
      });

      setProfile(prev => ({ ...prev, profileImage: '' }));
      setSuccess('Profile image removed successfully!');
    } catch (error) {
      console.error('Error removing profile image:', error);
      setImageError('Failed to remove profile image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dataToSend = {
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        nation: profile.nation,
        phone: profile.phone,
      };

      if (profile.password.trim() !== '') {
        dataToSend.password = profile.password;
      }

      const response = await axios.patch(`staff/staffid/${userId}`, dataToSend);

      setSuccess(response.data.message || 'Profile updated successfully!');
      setIsEditing(false);
      fetchStaffData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchStaffData();
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setImageError('');
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderField = (label, key, icon, options = null) => {
    return (
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
          width: 40,
          height: 40
        }}>
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          {isEditing ? (
            key === 'nation' ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={profile[key]}
                onChange={handleChange(key)}
                sx={{ mt: 0.5 }}
              />
            ) : options ? (
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={profile[key]}
                onChange={handleChange(key)}
                sx={{ mt: 0.5 }}
              >
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            ) : key === 'password' ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type={showPassword ? 'text' : 'password'}
                value={profile[key]}
                onChange={handleChange(key)}
                sx={{ mt: 0.5 }}
                placeholder="Enter new password to change"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={profile[key]}
                onChange={handleChange(key)}
                sx={{ mt: 0.5 }}
              />
            )
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {key === 'password'
                ? '********'
                : profile[key] || <span style={{ color: theme.palette.text.disabled }}>Not set</span>}
            </Typography>
          )}
        </Box>
      </Stack>
    );
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    borderRadius: 2,
    width: '90%',
    maxWidth: 800,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{
          bgcolor: '#142a4f',
          color: 'primary.contrastText',
          p: 3,
          position: 'relative'
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'primary.contrastText',
            }}
          >
            <Close />
          </IconButton>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              sx={{
                width: 64,
                height: 64,
                bgcolor: profile.profileImage ? 'transparent' : 'primary.light',
                fontSize: '1.5rem'
              }}
              src={profile.profileImage}
            >
              {profile.profileImage ? '' : (profile.name?.[0]?.toUpperCase() || '?')}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {profile.name || 'Staff Profile'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {profile.hrCode && <Chip label={`HR Code: ${profile.hrCode}`} size="small" sx={{ mr: 1, color: "white" }} />}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
          }}
        >
          <Tab label="Personal Info" icon={<Person fontSize="small" />} iconPosition="start" />
          <Tab label="Account" icon={<Lock fontSize="small" />} iconPosition="start" />
          <Tab label="Contact" icon={<Phone fontSize="small" />} iconPosition="start" />
        </Tabs>
        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 3,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50]
        }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {!isLoading && (
            <>
              {activeTab === 0 && (
                <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mb: 3 }}
                  >
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

              
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                    }}
                  >
                    {renderField('Full Name', 'name', <Person sx={{ fontSize: 20, color: '#1976d2' }} />)}
                    {renderField('Gender', 'gender', <Person sx={{ fontSize: 20, color: '#1976d2' }} />, genderOptions)}
                    {renderField('Nationality', 'nation', <Public sx={{ fontSize: 20, color: '#1976d2' }} />, allCountries)}
                  </Box>
                </Paper>
              )}

              {activeTab === 1 && (
                <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    Account Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                    }}
                  >
                    {renderField('HR Code', 'hrCode', <Badge sx={{ fontSize: 20, color: '#1976d2' }} />)}
                    {renderField('Email', 'email', <Email sx={{ fontSize: 20, color: '#1976d2' }}/>)}
                    {renderField('Password', 'password', <Lock sx={{ fontSize: 20, color: '#1976d2' }} />)}
                  </Box>
                </Paper>
              )}

              {activeTab === 2 && (
                <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar>
                      <Phone sx={{ fontSize: 20, color: '#1976d2' }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                      {isEditing ? (
                        <PhoneInput
                          country={'in'}
                          value={profile.phone}
                          onChange={handlePhoneChange}
                          inputStyle={{
                            width: '100%',
                            height: '40px',
                            fontSize: '14px',
                          }}
                          containerStyle={{ width: '100%', marginTop: '4px' }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {profile.phone || <span style={{ color: theme.palette.text.disabled }}>Not set</span>}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              )}
            </>
          )}
        </Box>

        <Box sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: '#142a4f',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCancel}
                startIcon={<Close />}
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfileModal;