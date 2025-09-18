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
  useMediaQuery, DialogTitle,
  DialogContent,
  IconButton,
  Box, Tabs, Tab,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  AccountCircle,
  Edit,
  Delete,
  CloudUpload,
  Description,
} from "@mui/icons-material";
import { Save, Cancel } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import axios from '../Axiosinstance';
import RolePermission from '../RolePermission';
import { toast } from 'react-toastify';
import Staffprofile from './Staffprofile';
import Staffinsurance from './Staffinsurance';
import Staffcontact from './Staffcontact';
import Staffattachments from './Staffattachments';

const theme = createTheme({
  typography: {
    fontFamily: '"Marquis"',
  },
});

const requiredFields = ['hrCode', 'name', 'email', 'password', 'Role', 'phone', 'department', 'workMode'];

const Editstaff = ({ currentEmployee, onCancelEdit, onSaveEmployee, onUpdate }) => {
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

  // New state variables for document uploads
  const [aadhaarCardProof, setAadhaarCardProof] = useState(null);
  const [uploadedPanCard, setUploadedPanCard] = useState(null);
  const [uploadedPassPort, setUploadedPassPort] = useState(null);
  const [aadhaarCloudinaryUrl, setAadhaarCloudinaryUrl] = useState(null);
  const [panCardCloudinaryUrl, setPanCardCloudinaryUrl] = useState(null);
  const [passportCloudinaryUrl, setPassportCloudinaryUrl] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState({
    profile: false,
    aadhaar: false,
    pan: false,
    passport: false
  });
  const [documentError, setDocumentError] = useState({
    profile: '',
    aadhaar: '',
    pan: '',
    passport: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [panCardFileName, setPanCardFileName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [jobPosition, setJobPosition] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passportFileName, setPassportFileName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState({
    departments: true,
    roles: true,
    jobPosition: true,
    workplaces: true
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Fetch staff details
        const staffResponse = await axios.get(`/staff/${currentEmployee.id}`);
        const staffData = staffResponse.data;
        console.log(staffResponse.data, "staffResponse.data");

        // Set profile data from the API response
        setProfileData({
          hrCode: staffData.hrCode || '',
          name: staffData.name || staffData.user?.name || '',
          email: staffData.email || staffData.user?.email || '',
          password: staffData.user.password || '', // Don't pre-fill password
          Gender: staffData.gender ? staffData.gender.charAt(0).toUpperCase() + staffData.gender.slice(1).toLowerCase() : 'Male',
          birthday: staffData.birthday || '',
          birthplace: staffData.birthplace || '',
          homeTown: staffData.homeTown || '',
          maritalStatus: staffData.maritalStatus || '',
          nation: staffData.nation || '',
          joinDate: staffData.joinDate || '',
          identification: staffData.identification || '',
          daysForIdentity: staffData.daysForIdentity || '',
          placeOfIssue: staffData.placeOfIssue || '',
          resident: staffData.resident || '',
          currentAddress: staffData.currentAddress || '',
          literacy: staffData.literacy || '',
          status: staffData.status ?
            staffData.status.charAt(0).toUpperCase() + staffData.status.slice(1).toLowerCase() : '',
          jobPosition: staffData.jobPosition || '',
          workplace: staffData.workplace || '',
          Role: staffData.role || '',
          phone: staffData.phone || '',
          department: staffData.department?.name || '',
          pancard: staffData.pancard || '',
          workMode: staffData.workMode || '',
        });

        // Set profile image from API if it exists
        if (staffData.profileImage) {
          setProfileImage(staffData.profileImage);
        }

        // Set document URLs if they exist
        if (staffData.aadhaarCardProof) setAadhaarCloudinaryUrl(staffData.aadhaarCardProof);
        if (staffData.uploadedPanCard) setPanCardCloudinaryUrl(staffData.uploadedPanCard);
        if (staffData.uploadedPassPort) setPassportCloudinaryUrl(staffData.uploadedPassPort);

        // Fetch additional data (departments, roles, etc.)
        const [deptResponse, rolesResponse, jobPositionResponse, workplacesResponse] = await Promise.all([
          axios.get('/departments/all-departments'),
          axios.get('/roles/get-all-role-names'),
          axios.get('/job-positions'),
          axios.get('/work-places')
        ]);

        setDepartments(deptResponse.data);
        setRoles(rolesResponse.data);
        setJobPosition(jobPositionResponse.data);
        setWorkplaces(workplacesResponse.data);

        setLoading({
          departments: false,
          roles: false,
          jobPosition: false,
          workplaces: false
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading({ departments: false, roles: false, jobPosition: false, workplaces: false });
      }
    };

    if (currentEmployee && currentEmployee.id) {
      fetchStaffData();
    }
  }, [currentEmployee]);

  const uploadDocumentToCloudinary = async (file, documentType) => {
    if (!file) return null;

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
      formData.append('upload_preset', 'erp_unsigned_upload'); // Use your preset here

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
        console.log(`${documentType} uploaded successfully:`, data);
        return data.secure_url;
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
  // Add this function to check file type
  const getFileType = (url) => {
    if (!url) return '';
    const extension = url.split('.').pop().split(/\#|\?/)[0];
    return extension.toLowerCase();
  };

  // Handler for Aadhaar card upload
  const handleAadhaarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'aadhaar');
    if (cloudinaryUrl) {
      setAadhaarCloudinaryUrl(cloudinaryUrl);
      setAadhaarCardProof(URL.createObjectURL(file));
      setAadhaarFileName(file.name); // ✅ store file name with extension
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

  // Component for document upload
  const DocumentUploadField = ({
    title,
    description,
    fileType,
    onUpload,
    onRemove,
    fileUrl,
    fileName,
    cloudinaryUrl,
    uploading,
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
                {uploading ? 'Updating...' : 'Update'}
                <input
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  id={inputId}
                  type="file"
                  onChange={onUpload}
                  disabled={uploading}
                />
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  const url = cloudinaryUrl || fileUrl;
                  const fileType = getFileType(url);

                  if (fileType === 'pdf') {
                    // Open PDF via Google Docs Viewer
                    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`, '_blank');
                  } else {
                    // Open other file types directly
                    window.open(url, '_blank');
                  }
                }}
                startIcon={<Visibility />}
                size="small"
                disabled={uploading || !(cloudinaryUrl || fileUrl)}
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
                ✓  successfully uploaded
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const value = profileData[field];
      const isEmpty = typeof value === 'string' ? value.trim() === '' : !value;
      if (isEmpty) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Validate email format
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate phone number
    if (profileData.phone && !/^\+?\d{10,15}$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill all required fields correctly')
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a base object with only the fields that have values
      const formattedData = {};
      const toUpper = (value) => {
        if (typeof value === 'string') {
          return value.toUpperCase();
        }
        return value;
      };

      // Only include fields that have values and convert to uppercase
      if (profileData.hrCode) formattedData.hrCode = toUpper(profileData.hrCode);
      if (profileData.name) formattedData.name = toUpper(profileData.name);
      if (profileData.email) formattedData.email = toUpper(profileData.email);
      if (profileData.status) formattedData.status = profileData.status;

      // Conditionally add other fields only if they have values
      if (profileData.Gender) formattedData.gender = profileData.Gender;
      if (profileData.birthday) formattedData.birthday = profileData.birthday;
      if (profileData.birthplace) formattedData.birthplace = toUpper(profileData.birthplace);
      if (profileData.homeTown) formattedData.homeTown = toUpper(profileData.homeTown);
      if (profileData.maritalStatus) formattedData.maritalStatus = toUpper(profileData.maritalStatus);
      if (profileData.nation) formattedData.nation = toUpper(profileData.nation);
      if (profileData.joinDate) formattedData.joinDate = profileData.joinDate;
      if (profileData.identification) formattedData.identification = toUpper(profileData.identification);
      if (profileData.daysForIdentity) formattedData.daysForIdentity = parseInt(profileData.daysForIdentity);
      if (profileData.placeOfIssue) formattedData.placeOfIssue = toUpper(profileData.placeOfIssue);
      if (profileData.resident) formattedData.resident = toUpper(profileData.resident);
      if (profileData.currentAddress) formattedData.currentAddress = toUpper(profileData.currentAddress);
      if (profileData.literacy) formattedData.literacy = toUpper(profileData.literacy);
      if (profileData.jobPosition) formattedData.jobPosition = toUpper(profileData.jobPosition);
      if (profileData.workplace) formattedData.workplace = toUpper(profileData.workplace);
      if (profileData.Role) {
        formattedData.role = {
          id: profileData.Role.roleId || null,
        };
      }
      if (profileData.phone) formattedData.phone = profileData.phone;
      if (profileData.department) {
        formattedData.department = {
          id: departments.find(d => d.name === profileData.department)?.id || null,
          name: toUpper(profileData.department)
        };
      }
      if (profileData.pancard) formattedData.pancard = toUpper(profileData.pancard);

      if (profileData.password && profileData.password.trim() !== '') {
        formattedData.password = profileData.password;
      }

      if (profileData.workMode) formattedData.workMode = profileData.workMode || '';

      // Add document URLs if they exist
      if (aadhaarCloudinaryUrl) formattedData.aadhaarCardProof = aadhaarCloudinaryUrl;
      if (panCardCloudinaryUrl) formattedData.uploadedPanCard = panCardCloudinaryUrl;
      if (passportCloudinaryUrl) formattedData.uploadedPassPort = passportCloudinaryUrl;

      // Add profile image if it exists
      if (profileImage) formattedData.profileImage = profileImage;

      const response = await axios.put(`/staff/${currentEmployee.id}`, formattedData);
      onUpdate();
      toast.success('Staff updated successfully!');

      onSaveEmployee?.(response.data);
      if (typeof setActiveTab === 'function') {
        setActiveTab(0);
      }
    }
    catch (err) {
      console.error('Submission error:', err);

      let errorMessage = 'Failed to update staff';
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

      toast.error(errorMessage);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    setProfileData((prevData) => {
      let newValue = type === 'checkbox' ? checked : value;

      // Handle numeric fields
      if ((name === 'daysForIdentity' || name === 'hourlyRate') && value !== '') {
        if (isNaN(value)) return prevData;
      }

      // Handle jobPosition specifically (store ID)
      if (name === 'jobPosition') {
        return {
          ...prevData,
          jobPosition: newValue,
        };
      }

      // Handle role (fetch role details and set via API)
      if (name === 'Role') {
        fetchAndSetRoleDetails(newValue);
        return prevData;
      }

      // Default: update other fields
      return {
        ...prevData,
        [name]: newValue,
      };
    });

    // Clear field errors if any
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const fetchAndSetRoleDetails = async (roleName) => {
    try {
      const { data } = await axios.get(`/roles/${roleName}`);
      const selectedRole = data.role;

      setProfileData((prev) => ({
        ...prev,
        Role: {
          roleId: selectedRole.roleId,
          name: selectedRole.name,
          featurePermissions: selectedRole.featurePermissions || [],
        },
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
    toast.info('Editing cancelled. No changes were saved.');
    onCancelEdit?.();
    if (typeof setActiveTab === 'function') {
      setActiveTab(0);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const tabHeaders = ['PROFILE', 'CONTRACT', 'INSURANCE', 'ATTACHMENTS'];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadDocumentToCloudinary(file, 'profile');
    if (cloudinaryUrl) {
      setProfileImage(cloudinaryUrl); // Cloudinary hosted image
      setProfilePreview(URL.createObjectURL(file)); // Optional preview
      toast.success('Profile picture uploaded successfully!');
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfilePreview(null);
    toast.info('Profile picture removed.');
  };


  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ padding: '16px', fontFamily: theme.typography.fontFamily }}>
        <Grid item xs={12}>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            gap={3}
            mb={2}
          >
            {/* Profile image display */}
            <Box
              sx={{
                position: 'relative',
                width: { xs: 120, sm: 150 },
                height: { xs: 120, sm: 150 },
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.grey[200],
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
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

              {/* File input and edit icon */}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleImageUpload}
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
                      backgroundColor: theme.palette.grey[300],
                    },
                  }}
                >
                  <Edit />
                </IconButton>
              </label>
            </Box>

            {/* Upload & remove buttons */}
            <Box flex={1} width="100%">
              <Typography variant="h6" gutterBottom>
                PROFILE PICTURE
              </Typography>
              <Box display="flex" gap={1} mt={3} flexWrap="wrap">
                <label htmlFor="profile-picture-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    size="small"
                  >
                    Upload
                  </Button>
                </label>

                {profileImage && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveImage}
                    startIcon={<Delete />}
                    size="small"
                  >
                    Remove
                  </Button>
                )}
              </Box>

              {imageError && (
                <Typography color="error" variant="body2" mt={1}>
                  {imageError}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        <Box mb={3}>
          <Typography variant="h4" gutterBottom style={{ fontFamily: 'Marquis', fontSize: '30px' }}>
            STAFF DETAILS
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#F0F4F8',
            padding: '8px 12px',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#142a4f',
              padding: '6px 18px',
              backgroundColor: '#ffffff',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#e6ecf3',
              },
              '&.Mui-selected': {
                backgroundColor: '#142a4f',
                color: '#ffffff',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
              },
            },
          }}
        >
          {tabHeaders.map((header, index) => (
            <Tab key={index} label={header} />
          ))}
        </Tabs>

        <br />
        {activeTab === 0 && (
          <Paper style={{ padding: isMobile ? '10px' : '20px', marginBottom: '20px' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" style={{ fontFamily: "Marquis" }}>PERSONAL  INFORMATION</Typography>
                </Grid>

                {['hrCode', 'email'].map((field) => (
                  <Grid item xs={6} key={field}>
                    <TextField
                      fullWidth
                      label={field === 'hrCode' ? 'HR Code' : 'Email'}
                      name={field}
                      value={profileData[field]}
                      onChange={(e) => {
                        let value = e.target.value;

                        if (field === 'hrCode') {
                          value = value.toUpperCase();
                          if (/^[A-Z0-9]{0,7}$/.test(value)) {
                            handleChange({ target: { name: field, value } });
                          }
                        } else {
                          handleChange(e); // For email
                        }
                      }}
                      type={field === 'email' ? 'email' : 'text'}
                      placeholder={
                        field === 'hrCode'
                          ? 'Enter HR Code (e.g. HR12345)'
                          : 'Enter email (e.g. john@example.com)'
                      }
                      error={
                        !!fieldErrors[field] ||
                        (field === 'hrCode' &&
                          profileData.hrCode.length === 7 &&
                          !/^[A-Z]{2}[0-9]{5}$/.test(profileData.hrCode)) ||
                        (field === 'email' &&
                          profileData.email.length > 0 &&
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email))
                      }
                      helperText={
                        fieldErrors[field]
                          ? fieldErrors[field]
                          : field === 'hrCode' &&
                            profileData.hrCode.length === 7 &&
                            !/^[A-Z]{2}[0-9]{5}$/.test(profileData.hrCode)
                            ? 'HR Code must be 2 letters followed by 5 digits (e.g. HR12345)'
                            : field === 'email' &&
                              profileData.email.length > 0 &&
                              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)
                              ? 'Invalid email format'
                              : field === 'hrCode'
                                ? ''
                                : ''
                      }
                      required={requiredFields.includes(field)}
                    />
                  </Grid>
                ))}

                {/* Separate Name Field - Only Allow Letters */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={profileData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only letters (no spaces)
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    inputProps={{ maxLength: 40 }}
                    placeholder="Enter full name (e.g. John)"
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    value={profileData.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
                    required
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
                  <FormControl fullWidth>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      name="Gender"
                      value={profileData.Gender}
                      onChange={handleChange}
                      label="Gender"
                    >
                      {['Male', 'Female', 'Other'].map(gender => (
                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {['birthday', 'birthplace', 'homeTown', 'maritalStatus', 'nation'].map((field) => (
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
                          // Allow only letters and spaces, and max 50 chars
                          const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                          handleChange({ target: { name: field, value: lettersOnly } });
                        }
                      }}
                      placeholder={
                        field === 'birthplace' ? 'Enter place of birth (e.g. Chennai)' :
                          field === 'homeTown' ? 'Enter hometown (e.g. Coimbatore)' :
                            field === 'maritalStatus' ? 'Enter marital status (e.g. Single, Married)' :
                              field === 'nation' ? 'Enter nationality (e.g. Indian)' :
                                ''
                      }
                      inputProps={{
                        maxLength: 50,
                        placeholder:
                          field === 'birthplace' ? 'Enter Place Of Birth (e.g. Chennai)' :
                            field === 'homeTown' ? 'Enter Hometown (e.g. Coimbatore)' :
                              field === 'maritalStatus' ? 'Enter Marital Status (e.g. Single, Married)' :
                                field === 'nation' ? 'Enter Nationality (e.g. Indian)' :
                                  '',
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
                  // inputProps={{
                  //   min: new Date().toISOString().split("T")[0], // Disable past dates
                  // }}
                  />
                </Grid>

                {/* Identification */}
                <Grid item xs={12}>
                  <Typography variant="h6" style={{ fontFamily: "Marquis" }}>IDENTIFICATION</Typography>
                </Grid>
                {['resident', 'currentAddress'].map((field) => (
                  <Grid item xs={field === 'currentAddress' ? 12 : 6} key={field}>
                    <TextField
                      fullWidth
                      label={field
                        .split(/(?=[A-Z])/)
                        .join(' ')
                        .replace(/^./, (c) => c.toUpperCase())}
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
                          ? 'Enter Resident Status (e.g. Indian, NRI)'
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
                        color: '#000',
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
                  <FormControl fullWidth error={!!fieldErrors.department}>
                    <InputLabel>Department</InputLabel>
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
                    {fieldErrors.department && (
                      <Typography variant="caption" color="error">
                        {fieldErrors.department}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Job Position Dropdown */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Job Position</InputLabel>
                    <Select
                      name="jobPosition"
                      value={profileData.jobPosition || ''}
                      onChange={handleChange}
                      label="Job Position"
                      disabled={loading.jobPosition}
                    >
                      {loading.jobPosition ? (
                        <MenuItem value="">Loading job positions...</MenuItem>
                      ) : (
                        jobPosition.map((position) => (
                          <MenuItem key={position.id} value={position.name}>{position.name}</MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

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
                    <InputLabel>Workplace</InputLabel>
                    <Select
                      name="workplace"
                      value={profileData.workplace || ''}
                      onChange={handleChange}
                      label="Workplace"
                      disabled={loading.workplaces}
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
                      <FormControl fullWidth error={!!fieldErrors.Role}>
                        <InputLabel>Role</InputLabel>
                        <Select
                          name="Role"
                          value={profileData.Role?.roleId || ''} // Ensure the roleId is correctly set
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
                        {fieldErrors.Role && (
                          <Typography variant="caption" color="error">
                            {fieldErrors.Role}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <Tooltip title="Edit role permissions">
                        <Button
                          variant="outlined"
                          onClick={handleOpenRoleModal}
                          style={{ height: '56px' }}
                          disabled={!profileData.Role}
                        >
                          Show Permissions
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" style={{ fontFamily: "Marquis" }}>CONTACT INFORMATION</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <PhoneInput
                      country={'in'}
                      fontFamily="Marquis"
                      value={profileData.phone}
                      onChange={(value) => {
                        const nationalNumber = value.replace(/^\+?\d{1,4}/, '');
                        if (/^\d{0,10}$/.test(nationalNumber)) {
                          handleChange({
                            target: {
                              name: 'phone',
                              value: value
                            }
                          });
                        }
                      }}
                      inputProps={{
                        name: 'phone',
                        required: true
                      }}
                      containerStyle={{ marginTop: '16px' }} // Add margin to align with other fields
                      inputStyle={{ width: '100%', height: '56px', fontFamily: 'Marquis' }}// Match Material-UI input height
                      isValid={(value, country) => {
                        const number = value.replace(country.dialCode, '');
                        return number.length === 10;
                      }}
                    />
                    {fieldErrors.phone && (
                      <Typography variant="caption" color="error" style={{ display: 'block', marginTop: '8px' }}>
                        {fieldErrors.phone}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Member Departments */}
                <Grid item xs={12}>
                  <Typography variant="h6" style={{ fontFamily: "Marquis" }}>PANCARD</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pancard"
                    name="pancard"
                    value={profileData.pancard}
                    onChange={(e) => {
                      const input = e.target.value.toUpperCase();
                      // Allow only A-Z and 0-9, and enforce the PAN format: 5 letters, 4 digits, 1 letter
                      const regex = /^[A-Z]{0,5}$|^[A-Z]{5}\d{0,4}$|^[A-Z]{5}\d{4}[A-Z]{0,1}$/;

                      if (regex.test(input)) {
                        handleChange({
                          target: { name: 'pancard', value: input }
                        });
                      }
                    }}
                    inputProps={{
                      maxLength: 10, // Correct max length for PAN
                    }}
                    placeholder="AAAAA9999A"
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
                    fileName={panCardFileName}
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
                    fileName={passportFileName}
                    inputId="passport-upload"
                  />
                </Grid>

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
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                      disabled={isSubmitting || loading.departments || loading.roles}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>

            {/* Role Permissions Dialog */}
            <Dialog
              open={openRoleModal}
              onClose={() => setOpenRoleModal(false)}
              maxWidth="md"
              fullWidth
              scroll="paper"
            >
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
                    setProfileData(prev => ({
                      ...prev,
                      Role: {
                        roleId: role.roleId,
                        name: role.roleName,
                        featurePermissions: role.featurePermissions || []
                      }
                    }));
                    setOpenRoleModal(false);
                    toast.success('Role permissions updated successfully!');
                  }}
                  initialRole={profileData.Role}
                />

              </DialogContent>
            </Dialog>
          </Paper>

        )}
        {activeTab === 1 && <Staffcontact isMobile={isMobile} staffid={currentEmployee.id} />}
        {activeTab === 2 && <Staffinsurance isMobile={isMobile} staffid={currentEmployee.id} />}
        {activeTab === 3 && <Staffattachments isMobile={isMobile} />}
      </Paper>
    </ThemeProvider>
  );
};

export default Editstaff;