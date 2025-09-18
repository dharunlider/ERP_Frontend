import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Grid,
  createTheme,
  ThemeProvider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountCircle,
  Edit,
  Delete,
  CloudUpload,
  Description,
} from "@mui/icons-material";
import { Save, Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import RolePermission from '../RolePermission';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';

// Cloudinary imports
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from '@cloudinary/react';
import { fill } from "@cloudinary/url-gen/actions/resize";

const theme = createTheme({
  typography: {
    fontFamily: '"Marquis"',
  },
});

const Newstaff = ({ onAddStaff, setActiveTab }) => {
  // Initialize Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo'
    }
  });

  const [profileData, setProfileData] = useState({
    hrCode: '',
    name: '',
    email: '',
    password: '',
    Gender: '',
    birthday: '',
    birthplace: '',
    homeTown: '',
    maritalStatus: '',
    nation: '',
    joinDate: '',
    identification: '',
    daysForIdentity: '',
    placeOfIssue: '',
    resident: '',
    currentAddress: '',
    literacy: '',
    status: '',
    jobPosition: '',
    workplace: '',
    Role: '',
    phone: '',
    department: '',
    pancard: '',
    workMode: '',
  });

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [panCardFileName, setPanCardFileName] = useState('');
  const [passportFileName, setPassportFileName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cloudinaryImage, setCloudinaryImage] = useState(null);

  // New state variables for document uploads - storing full URLs instead of just IDs
  const [aadhaarCardProof, setAadhaarCardProof] = useState(null);
  const [uploadedPanCard, setUploadedPanCard] = useState(null);
  const [uploadedPassPort, setUploadedPassPort] = useState(null);
  const [aadhaarCloudinaryUrl, setAadhaarCloudinaryUrl] = useState(null);
  const [panCardCloudinaryUrl, setPanCardCloudinaryUrl] = useState(null);
  const [passportCloudinaryUrl, setPassportCloudinaryUrl] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState({
    aadhaar: false,
    pan: false,
    passport: false
  });
  const [documentError, setDocumentError] = useState({
    aadhaar: '',
    pan: '',
    passport: ''
  });

  const [loading, setLoading] = useState({
    departments: true,
    roles: true,
    jobPositions: true,
    workplaces: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await axios.get('/departments/all-departments');
        setDepartments(deptResponse.data);

        // Fetch roles
        const rolesResponse = await axios.get('/roles/get-all-role-names');
        setRoles(rolesResponse.data);

        // Fetch job positions
        const jobPositionsResponse = await axios.get('/job-positions');
        setJobPositions(jobPositionsResponse.data);

        // Fetch workplaces
        const workplacesResponse = await axios.get('/work-places');
        setWorkplaces(workplacesResponse.data);

        setLoading({
          departments: false,
          roles: false,
          jobPositions: false,
          workplaces: false
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data. Please try again.');
        setLoading({
          departments: false,
          roles: false,
          jobPositions: false,
          workplaces: false
        });
      }
    };

    fetchData();
  }, []);

  // Generic function to upload documents to Cloudinary and return full URL
  const uploadDocumentToCloudinary = async (file, documentType) => {
    if (!file) return null;

    // Check if it's a document (PDF, image, etc.)
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!validTypes.includes(file.type)) {
      setDocumentError(prev => ({
        ...prev,
        [documentType]: 'Only PDF, JPEG, and PNG files are allowed'
      }));
      return null;
    }

    // Check file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      setDocumentError(prev => ({
        ...prev,
        [documentType]: 'File size must be less than 10MB'
      }));
      return null;
    }

    setDocumentError(prev => ({ ...prev, [documentType]: '' }));
    setUploadingDocument(prev => ({ ...prev, [documentType]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Try these common preset name variations:
      const presetNames = [
        'erp_unsigned_upload',
        'erp_unsigned_upload_0',
        'erp_unsigned_upload0',
        'unsigned_upload',
        'ml_default'
      ];

      let response;
      let lastError;

      // Try each preset name until one works
      for (const presetName of presetNames) {
        try {
          const testFormData = new FormData();
          testFormData.append('file', file);
          testFormData.append('upload_preset', presetName);

          console.log(`Trying preset: ${presetName}`);

          response = await fetch('https://api.cloudinary.com/v1_1/dn8zkmwt1/upload', {
            method: 'POST',
            body: testFormData,
          });

          if (response.ok) break;

          const errorData = await response.json();
          lastError = errorData;
          console.log(`Preset ${presetName} failed:`, errorData);

        } catch (error) {
          lastError = error;
          console.log(`Preset ${presetName} error:`, error);
        }
      }

      if (!response || !response.ok) {
        throw new Error(`All presets failed. Last error: ${JSON.stringify(lastError)}`);
      }

      const data = await response.json();

      if (data.secure_url) {
        console.log(`${documentType} uploaded successfully:`, data);
        return data.secure_url; // Return the full URL instead of just public_id
      } else {
        throw new Error('Upload failed: No secure_url returned');
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      setDocumentError(prev => ({
        ...prev,
        [documentType]: `Upload failed: ${error.message}`
      }));
      toast.error(`Failed to upload ${documentType}`);
      return null;
    } finally {
      setUploadingDocument(prev => ({ ...prev, [documentType]: false }));
    }
  };

  // Use this updated function with a properly named upload preset
  // const handleImageUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   // Check if it's an image
  //   if (!file.type.match('image.*')) {
  //     setImageError('Only image files are allowed');
  //     return;
  //   }

  //   // Check file size (max 5MB)
  //   if (file.size > 5 * 1024 * 1024) {
  //     setImageError('Image size must be less than 5MB');
  //     return;
  //   }

  //   setImageError('');
  //   setUploadingImage(true);

  //   try {
  //     const imageUrl = await uploadDocumentToCloudinary(file, 'profile');
  //     if (imageUrl) {
  //       setCloudinaryImageId(imageUrl);
  //       setProfileImage(URL.createObjectURL(file));
  //       toast.success('Profile image uploaded successfully!');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //     setImageError(`Upload failed: ${error.message}`);
  //     toast.error('Failed to upload image');
  //   } finally {
  //     setUploadingImage(false);
  //   }
  // };
  // Use this updated function with a properly named upload preset
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.match('image.*')) {
      setImageError('Only image files are allowed');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setImageError('');
    setUploadingImage(true);

    // Create a temporary URL for preview
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    try {
      const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'profile');
      if (cloudinaryUrl) {
        // Store the Cloudinary URL in state
        setCloudinaryImage(cloudinaryUrl);
        toast.success('Profile image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageError(`Upload failed: ${error.message}`);
      toast.error('Failed to upload image');
      // Remove the preview if upload fails
      setProfileImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handler for Aadhaar card upload
  const handleAadhaarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'aadhaar');
    if (cloudinaryUrl) {
      setAadhaarCloudinaryUrl(cloudinaryUrl);
      setAadhaarCardProof(URL.createObjectURL(file));
      setAadhaarFileName(file.name);
      toast.success('Aadhaar card uploaded successfully!');
    }
  };

  // Handler for PAN card upload
  const handlePanCardUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'pan');
    if (cloudinaryUrl) {
      setPanCardCloudinaryUrl(cloudinaryUrl);
      setUploadedPanCard(URL.createObjectURL(file));
      setPanCardFileName(file.name);
      toast.success('PAN card uploaded successfully!');
    }
  };

  // Handler for Passport upload
  const handlePassportUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'passport');
    if (cloudinaryUrl) {
      setPassportCloudinaryUrl(cloudinaryUrl);
      setUploadedPassPort(URL.createObjectURL(file));
      setPassportFileName(file.name);
      toast.success('Passport uploaded successfully!');
    }
  };

  const handleRemoveImage = () => {
    setCloudinaryImage(null);
    setProfileImage(null);
  };

  const handleRemoveDocument = (type) => {
    switch (type) {
      case 'aadhaar':
        setAadhaarCloudinaryUrl(null);
        setAadhaarCardProof(null);
        break;
      case 'pan':
        setPanCardCloudinaryUrl(null);
        setUploadedPanCard(null);
        break;
      case 'passport':
        setPassportCloudinaryUrl(null);
        setUploadedPassPort(null);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!profileData.hrCode || !profileData.name || !profileData.email || !profileData.password) {
        throw new Error('Please fill all required fields');
      }

      // Validate numeric fields
      if (profileData.daysForIdentity && isNaN(profileData.daysForIdentity)) {
        throw new Error('Days for Identity must be a number');
      }

      if (!profileData.workMode) {
        throw new Error('Please select a work mode');
      }

      // Format data according to API requirements
      const formattedData = {
        hrCode: profileData.hrCode.toUpperCase(),
        name: profileData.name.toUpperCase(),
        email: profileData.email,
        password: profileData.password,
        gender: profileData.Gender,
        birthday: profileData.birthday,
        birthplace: profileData.birthplace,
        homeTown: profileData.homeTown,
        maritalStatus: profileData.maritalStatus,
        nation: profileData.nation,
        joinDate: profileData.joinDate,
        identification: profileData.identification,
        daysForIdentity: profileData.daysForIdentity ? parseInt(profileData.daysForIdentity) : null,
        placeOfIssue: profileData.placeOfIssue,
        resident: profileData.resident,
        currentAddress: profileData.currentAddress,
        literacy: profileData.literacy,
        status: profileData.status,
        jobPosition: profileData.jobPosition,
        workplace: profileData.workplace,
        role: {
          id: profileData.Role.roleId || null,
        },
        phone: profileData.phone,
        workMode: profileData.workMode,
        department: {
          id: departments.find(d => d.name === profileData.department)?.id || null,
          name: profileData.department
        },
        pancard: profileData.pancard.toUpperCase(),
        profileImage: cloudinaryImage, // This is now the full URL
        // Add the document URLs to the submission
        aadhaarCardProof: aadhaarCloudinaryUrl,
        uploadedPanCard: panCardCloudinaryUrl,
        uploadedPassPort: passportCloudinaryUrl
      };

      console.log('Submitting data:', formattedData);

      const response = await axios.post('/staff', formattedData);

      toast.success('Staff created successfully!');

      onAddStaff?.(response.data);
      setActiveTab(0);
    } catch (err) {
      console.error('Submission error:', err);

      let errorMessage = 'Failed to save staff';
      if (err.response) {
        const details = err.response.data?.details;

        errorMessage = Array.isArray(details)
          ? details.join(', ')
          : details || err.response.data?.message || err.response.data?.error ||
          `Server error: ${err.response.status}`;

        console.error('Server error details:', err.response.data);
      }
      else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProfileData((prevData) => {
      let newValue = type === 'checkbox' ? checked : value;

      // Reset OTP-related state when email changes
      if (name === 'email') {
        setOtpSent(false);
        setOtpVerified(false);
        setOtpError('');
        setEmailError('');
      }

      // Handle numeric fields
      if ((name === 'daysForIdentity') && value !== '') {
        if (isNaN(value)) return prevData;
      }

      // Handle Role selection (trigger async fetch separately)
      if (name === 'Role') {
        fetchAndSetRoleDetails(value);
        return prevData;
      }

      // Handle jobPosition as a special case
      if (name === 'jobPosition') {
        return {
          ...prevData,
          jobPosition: newValue,
        };
      }

      return {
        ...prevData,
        [name]: newValue,
      };
    });
  };

  const fetchAndSetRoleDetails = async (roleName) => {
    try {
      const { data } = await axios.get(`/roles/${roleName}`);
      const selectedRole = data.role;

      setProfileData((prevData) => ({
        ...prevData,
        Role: {
          roleId: selectedRole.roleId,
          name: selectedRole.name,
          featurePermissions: selectedRole.featurePermissions || [],
        }
      }));
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  const handleOpenRoleModal = (e) => {
    e.stopPropagation();
    setOpenRoleModal(true);
  };

  const handleCancel = () => {
    setActiveTab(0);
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      await axios.post('/staff/verifyMail', { email: profileData.email });
      setOtpSent(true);
      toast.success("OTP send successfully in your Gmail");
      setSendingOtp(false);
    } catch (err) {
      setEmailError(err?.response?.data?.details || err?.response?.data?.message || 'Failed to Fetch Email');
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setSendingOtp(true);
      const response = await axios.post('/staff/verifyOtp', {
        email: profileData.email,
        otp,
      });

      if (response.status === 200) {
        setOtpVerified(true);
        toast.success("email verified successfully");
        setOtpError('');
      } else {
        setOtpVerified(false);
        setOtpError(response.data.details || response.data.message);
        toast.warning("OTP already verified.");
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Component for document upload
  const DocumentUploadField = ({
    title,
    description,
    fileType,
    onUpload,
    onRemove,
    fileUrl,
    cloudinaryUrl,
    uploading,
    fileName,
    error,
    inputId
  }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {description}
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          {fileUrl ? (
            <Description sx={{ fontSize: 40, color: 'primary.main' }} />
          ) : (
            <Description sx={{ fontSize: 40, color: 'grey.400' }} />
          )}

          <Box flex={1}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                component="label"
                htmlFor={inputId}
                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                size="small"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  id={inputId}
                  type="file"
                  onChange={onUpload}
                  disabled={uploading}
                />
              </Button>

              {fileUrl && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.open(cloudinaryUrl || fileUrl, '_blank')}
                    startIcon={<Visibility />}
                    size="small"
                    disabled={uploading}
                  >
                    View
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={onRemove}
                    startIcon={<Delete />}
                    size="small"
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </>
              )}
            </Box>
            {/* ✅ Display uploaded file name and type */}
            {fileName && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                Uploaded File: <strong>{fileName}</strong>
                {/* <strong>.{fileName.split('.').pop()}</strong>) */}
              </Typography>
            )}

            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}
            {cloudinaryUrl && (
              <Typography variant="body2" color="success.main" mt={1}>
                ✓ Document successfully uploaded
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ padding: '16px', fontFamily: theme.typography.fontFamily }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Profile Picture Upload */}
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                gap={3}
                mb={2}
                sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}
              >

                {/* Edit overlay */}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <label htmlFor="profile-picture-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        backgroundColor: theme.palette.grey[300]
                      }
                    }}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <CircularProgress size={24} /> : <Edit />}
                  </IconButton>
                </label>
                {/* </Box> */}
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 120, sm: 150 },
                    height: { xs: 120, sm: 150 },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${theme.palette.primary.main}`,
                    backgroundColor: theme.palette.grey[200]
                  }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <AccountCircle sx={{ fontSize: 80, color: theme.palette.grey[500] }} />
                    </Box>
                  )}

                  {/* Edit overlay */}
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <label htmlFor="profile-picture-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                          backgroundColor: theme.palette.grey[300]
                        }
                      }}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? <CircularProgress size={24} /> : <Edit />}
                    </IconButton>
                  </label>
                </Box>

                <Box flex={1} width="100%">
                  <Typography variant="h6" gutterBottom>
                    PROFILE PICTURE
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Upload a clear photo of yourself (max 5MB)
                  </Typography>
                  <Box display="flex" gap={1} mt={3} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      component="label"
                      htmlFor="profile-picture-upload"
                      startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUpload />}
                      size="small"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input
                        accept="image/*"
                        hidden
                        id="profile-picture-upload"
                        type="file"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </Button>

                    {(profileImage || cloudinaryImage) && (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            window.open(cloudinaryImage, '_blank');
                          }}
                          startIcon={<Visibility />}
                          size="small"
                          disabled={uploadingImage}
                        >
                          View
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleRemoveImage}
                          startIcon={<Delete />}
                          size="small"
                          disabled={uploadingImage}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </Box>

                  {imageError && (
                    <Typography color="error" variant="body2" mt={1}>
                      {imageError}
                    </Typography>
                  )}
                  {cloudinaryImage && (
                    <Typography variant="body2" color="success.main" mt={1}>
                      ✓ Image successfully uploaded 
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>PERSONAL INFORMATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profileData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only letters (uppercase, lowercase) and spaces, up to 40 characters
                  if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 40) {
                    handleChange(e);
                  }
                }}
                required
                placeholder="Enter full name (e.g. John)"
                error={profileData.name.length > 0 && profileData.name.length < 3}
                helperText={
                  profileData.name.length > 0 && profileData.name.length < 3
                    ? 'Name must be at least 3 characters'
                    : ''
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="HR Code"
                name="hrCode"
                value={profileData.hrCode}
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();

                  // Allow typing only alphanumeric and up to 7 characters
                  if (input.length <= 7 && /^[A-Z0-9]*$/.test(input)) {
                    handleChange({ target: { name: 'hrCode', value: input } });
                  }
                }}
                required
                placeholder="Enter HR Code (e.g. HR12345)"
                error={
                  profileData.hrCode.length === 7 &&
                  !/^[A-Z]{2}[0-9]{5}$/.test(profileData.hrCode)
                }
                helperText={
                  profileData.hrCode.length === 7 &&
                    !/^[A-Z]{2}[0-9]{5}$/.test(profileData.hrCode)
                    ? 'HR Code must be 2 letters followed by 5 digits (e.g. HR12345)'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                type="email"
                required
                placeholder="Enter email (e.g. Example@gmail.com)"
                error={!!emailError}
                helperText={emailError}
              />
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={!!emailError || !profileData.email || otpSent || sendingOtp}
                sx={{ mt: 1, minWidth: 120 }}
              >
                {sendingOtp ? (
                  <CircularProgress size={20} color="inherit" />
                ) : otpSent ? (
                  'OTP Sent'
                ) : (
                  'Send OTP'
                )}
              </Button>
            </Grid>
            {otpSent && (
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  error={!!otpError}
                  helperText={otpError}
                />
                <Button
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={!otp || sendingOtp || otpVerified}
                  sx={{ mt: 1, minWidth: 120 }}
                >
                  {sendingOtp ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
                {otpVerified && (
                  <Typography sx={{ mt: 1 }} color="success.main">
                    ✅ Email Verified Successfully!
                  </Typography>
                )}
              </Grid>
            )}


            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                value={profileData.password}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow passwords between 0 and 15 characters
                  if (value.length <= 15) {
                    handleChange(e);
                  }
                }}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                error={profileData.password.length > 0 && profileData.password.length < 5}
                helperText={
                  profileData.password.length > 0 && profileData.password.length < 5
                    ? 'Password must be at least 5 characters'
                    : ''
                }
                inputProps={{ maxLength: 15 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Gender "
                name="Gender"
                value={profileData.Gender}
                onChange={handleChange}
                required
                variant="outlined"
              >
                {['Male', 'Female', 'Other'].map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {['birthday', 'birthplace', 'homeTown', 'nation'].map((field) => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field.split(/(?=[A-Z])/).join(' ').replace(/^./, (c) => c.toUpperCase())}
                  name={field}
                  type={field.toLowerCase() === 'birthday' ? 'date' : 'text'}
                  InputLabelProps={field.toLowerCase() === 'birthday' ? { shrink: true } : {}}
                  value={profileData[field]}
                  onChange={(e) => {
                    const { value } = e.target;
                    if (field === 'birthday') {
                      handleChange(e);
                    } else {
                      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                      handleChange({ target: { name: field, value: lettersOnly } });
                    }
                  }}
                  placeholder={
                    field === 'birthplace'
                      ? 'Enter place of birth (e.g. Chennai)'
                      : field === 'homeTown'
                        ? 'Enter hometown (e.g. Coimbatore)'
                        : field === 'nation'
                          ? 'Enter nationality (e.g. Indian)'
                          : ''
                  }
                  inputProps={{
                    maxLength: 50,
                  }}
                  sx={{
                    '& input::placeholder': {
                      fontSize: '0.9rem',
                      color: '#000',
                    },
                  }}
                />
              </Grid>
            ))}

            {/* Marital Status as Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  name="maritalStatus"
                  value={profileData.maritalStatus || ''}
                  onChange={handleChange}
                  label="Marital Status"
                >
                  <MenuItem value="Single">{"Single".toUpperCase()}</MenuItem>
                  <MenuItem value="Married">{"Married".toUpperCase()}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Join Date"
                name="joinDate"
                type="date"
                value={profileData.joinDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {/* Identification */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>IDENTIFICATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Identification"
                name="identification"
                value={profileData.identification}
                onChange={handleChange}
                placeholder="Enter ID number (e.g. Aadhar, PAN)"
                inputProps={{
                  maxLength: 50, // optional character limit
                  placeholder: 'Enter ID Number (e.g. Aadhar, PAN)',
                }}
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid>

            {['resident', 'currentAddress'].map((field) => (
              <Grid item xs={field === 'currentAddress' ? 12 : 6} key={field}>
                <TextField
                  fullWidth
                  label={field.split(/(?=[A-Z])/).join(' ').replace(/^./, (c) => c.toUpperCase())}
                  name={field}
                  value={profileData[field]}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (field === 'resident') {
                      // Allow only letters and spaces, and max 50 characters
                      value = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                    }

                    handleChange({ target: { name: field, value } });
                  }}
                  multiline={field === 'currentAddress'}
                  rows={field === 'currentAddress' ? 3 : 1}
                  placeholder={
                    field === 'resident'
                      ? 'Enter Resident Status (e.e.g. Indian, NRI)'
                      : 'Enter Current Address'
                  }
                  inputProps={{
                    maxLength: field === 'currentAddress' ? 300 : 50,
                  }}
                  sx={{
                    '& input::placeholder, & textarea::placeholder': {
                      fontSize: '0.9rem',
                      color: '#000',
                    },
                  }}
                />
              </Grid>
            ))}


            {/* Job Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>JOB INFORMATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Literacy"
                name="literacy"
                placeholder="Enter Literacy (e.g. Graduate, Diploma)"
                value={profileData.literacy}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  if (onlyLetters.length <= 50) {
                    handleChange({ target: { name: 'literacy', value: onlyLetters } });
                  }
                }}
                inputProps={{
                  maxLength: 50,
                }}
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="status">Status</InputLabel>
                <Select
                  labelId="status"
                  name="status"
                  value={profileData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {['Active', 'Inactive'].map(status => (
                    <MenuItem key={status} value={status}> {status.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Department *</InputLabel>
                <Select
                  name="department"
                  value={profileData.department}
                  onChange={handleChange}
                  label="Department"
                  disabled={loading.departments}
                  required
                >
                  {loading.departments ? (
                    <MenuItem value="">Loading departments...</MenuItem>
                  ) : (
                    departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>{dept.name.toUpperCase()}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            {/* Job Position Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Job Position *</InputLabel>
                <Select
                  name="jobPosition"
                  value={profileData.jobPosition || ''}
                  onChange={handleChange}
                  label="Job Position"
                  disabled={loading.jobPositions}
                  required
                >
                  {loading.jobPositions ? (
                    <MenuItem value="">Loading job positions...</MenuItem>
                  ) : (
                    jobPositions.map((position) => (
                      <MenuItem key={position.id} value={position.name}>{position.name}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* WorkMode Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Work Mode *</InputLabel>
                <Select
                  name="workMode"
                  value={profileData.workMode}
                  onChange={handleChange}
                  label="Work Mode"
                  required
                >
                  {['REMOTE', 'ONSITE'].map(mode => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>


            {/* Workplace Dropdown */}
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Workplace *</InputLabel>
                <Select
                  name="workplace"
                  value={profileData.workplace}
                  onChange={handleChange}
                  label="Workplace"
                  disabled={loading.workplaces}
                  required
                >
                  {loading.workplaces ? (
                    <MenuItem value="">Loading workplaces...</MenuItem>
                  ) : (
                    workplaces.map((place) => (
                      <MenuItem key={place.id} value={place.name}>{place.name}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={10}>
                  <FormControl fullWidth>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      name="Role"
                      value={profileData.Role?.roleId || ''}
                      onChange={handleChange}
                      label="Role"
                      disabled={loading.roles}
                      required
                    >
                      {loading.roles ? (
                        <MenuItem value="">Loading roles...</MenuItem>
                      ) : (
                        roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <Button variant="outlined" onClick={handleOpenRoleModal} style={{ height: '56px' }}>
                    Show Permissions
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>CONTACT INFORMATION</Typography>
            </Grid>

            <Grid item xs={6}>
              <PhoneInput
                country={'in'}
                value={profileData.phone}
                onChange={(value) => {
                  const nationalNumber = value.replace(/^\+?\d{1,4}/, '');
                  if (/^\d{0,10}$/.test(nationalNumber)) {
                    handleChange({
                      target: {
                        name: 'phone',
                        value: value,
                      }
                    });
                  }
                }}
                inputProps={{
                  name: 'phone',
                  required: true
                }}
                specialLabel="Phone *"
                isValid={(value, country) => {
                  const number = value.replace(country.dialCode, '');
                  return number.length === 10;
                }}
                inputStyle={{
                  width: '100%',
                  fontFamily: 'Marquis',
                  border: '1px solid #ccc',
                }}
              />
            </Grid>

            {/* Member Departments */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>PANCARD</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pancard *"
                name="pancard"
                value={profileData.pancard}
                onChange={(e) => {
                  const input = e.target.value.toUpperCase();
                  // Progressive validation pattern
                  const regexStep = /^[A-Z]{0,5}$|^[A-Z]{5}\d{0,4}$|^[A-Z]{5}\d{4}[A-Z]{0,1}$/;

                  if (regexStep.test(input)) {
                    handleChange({
                      target: { name: 'pancard', value: input }
                    });
                  }
                }}
                inputProps={{
                  maxLength: 10,
                }}
                placeholder="PanCard (e.g. ABCDE1234F)"
                error={
                  profileData.pancard.length === 10 &&
                  !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.pancard)
                }
                helperText={
                  profileData.pancard.length === 10 &&
                    !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.pancard)
                    ? 'Invalid PAN format. Use AAAAA9999A'
                    : ''
                }
              />
            </Grid>

            {/* Document Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis", marginBottom: '16px' }}>
                DOCUMENT UPLOADS
              </Typography>

              <DocumentUploadField
                title="AADHAAR CARD PROOF"
                description="Upload Aadhaar card document (PDF, JPG, PNG - max 10MB)"
                fileType="aadhaar"
                onUpload={handleAadhaarUpload}
                onRemove={() => handleRemoveDocument('aadhaar')}
                fileUrl={aadhaarCardProof}
                cloudinaryUrl={aadhaarCloudinaryUrl}
                uploading={uploadingDocument.aadhaar}
                error={documentError.aadhaar}
                fileName={aadhaarFileName}
                inputId="aadhaar-upload"
              />

              <DocumentUploadField
                title="PAN CARD"
                description="Upload PAN card document (PDF, JPG, PNG - max 10MB)"
                fileType="pan"
                onUpload={handlePanCardUpload}
                onRemove={() => handleRemoveDocument('pan')}
                fileUrl={uploadedPanCard}
                cloudinaryUrl={panCardCloudinaryUrl}
                uploading={uploadingDocument.pan}
                error={documentError.pan}
                inputId="pan-card-upload"
              />

              <DocumentUploadField
                title="PASSPORT"
                description="Upload Passport document (PDF, JPG, PNG - max 10MB)"
                fileType="passport"
                onUpload={handlePassportUpload}
                onRemove={() => handleRemoveDocument('passport')}
                fileUrl={uploadedPassPort}
                cloudinaryUrl={passportCloudinaryUrl}
                uploading={uploadingDocument.passport}
                error={documentError.passport}
                inputId="passport-upload"
              />
            </Grid>


            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  style={{ marginRight: '8px' }}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
                  disabled={
                    isSubmitting ||
                    loading.departments ||
                    loading.roles ||
                    loading.jobPositions ||
                    loading.workplaces
                  }
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </Button>

              </Box>
            </Grid>
          </Grid>
        </form>

        <Dialog open={openRoleModal} onClose={() => setOpenRoleModal(false)} maxWidth="md" fullWidth scroll="paper">
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Role Permissions</Typography>
              <IconButton onClick={() => setOpenRoleModal(false)}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <RolePermission
              onCancel={() => setOpenRoleModal(false)}
              onRoleCreated={(role) => {
                // Update the profileData with the new role
                setProfileData(prev => ({
                  ...prev,
                  Role: {
                    roleId: role.roleId,
                    name: role.roleName,
                    featurePermissions: role.featurePermissions || [],
                  }
                }));
                setOpenRoleModal(false);
              }}
              initialRole={profileData.Role} // Pass the role data to RolePermission component
            />

          </DialogContent>
        </Dialog>
      </Paper>
    </ThemeProvider>

  );
};

export default Newstaff;