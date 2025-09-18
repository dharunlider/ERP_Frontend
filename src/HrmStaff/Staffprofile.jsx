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
  Tooltip
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import axios from '../Axiosinstance';
import RolePermission from '../RolePermission';
import { toast } from 'react-toastify';

const theme = createTheme({
  typography: {
    fontFamily: '"Marquis"',
  },
});

const requiredFields = ['hrCode', 'name', 'email', 'password', 'Role', 'bankAccount', 'phone', 'department'];

const Editstaff = ({ currentEmployee, onCancelEdit, onSaveEmployee, setActiveTab }) => {
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
    bankAccount: '',
    accountName: '',
    bankOfIssue: '',
    personalTaxCode: '',
    hourlyRate: '',
    phone: '',
    department: '',
    pancard: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState({
    departments: true,
    roles: true,
    jobPositions: true,
    workplaces: true
  });

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
          identification: staffData.identification || '',
          daysForIdentity: staffData.daysForIdentity || '',
          placeOfIssue: staffData.placeOfIssue || '',
          resident: staffData.resident || '',
          currentAddress: staffData.currentAddress || '',
          literacy: staffData.literacy || '',
          status: staffData.status ?
            staffData.status.charAt(0).toUpperCase() + staffData.status.slice(1).toLowerCase() : 'Active',
          jobPosition: staffData.jobPosition || '',
          workplace: staffData.workplace || '',
          // Role: staffData.role?.name || staffData.user?.role || '',

          Role: staffData.role || '',


          bankAccount: staffData.bankAccount || '',
          accountName: staffData.nameOfAccount || '',
          bankOfIssue: staffData.bankOfIssue || '',
          personalTaxCode: staffData.personalTaxCode || '',
          hourlyRate: staffData.hourlyRate || '',
          phone: staffData.phone || '',
          department: staffData.department?.name || '',
          pancard: staffData.pancard || ''
        });

        // Fetch additional data (departments, roles, etc.)
        const [deptResponse, rolesResponse, jobPositionsResponse, workplacesResponse] = await Promise.all([
          axios.get('/departments/all-departments'),
          axios.get('/roles/get-all-role-names'),
          axios.get('/job-positions'),
          axios.get('/work-places')
        ]);
        console.log(deptResponse.data, "department");
        console.log(workplacesResponse.data, "workplaces");
        setDepartments(deptResponse.data);
        setRoles(rolesResponse.data);
        setJobPositions(jobPositionsResponse.data);
        setWorkplaces(workplacesResponse.data);
        console.log()
        setLoading({
          departments: false,
          roles: false,
          jobPositions: false,
          workplaces: false
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading({ departments: false, roles: false, jobPositions: false, workplaces: false });
      }
    };

    if (currentEmployee && currentEmployee.id) {
      fetchStaffData();
    }
  }, [currentEmployee]);

  console.log('Role data:', profileData.Role);
  useEffect(() => {
    if (profileData) {
      console.log('Updated profileData:', profileData);
    }
  }, [profileData]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // requiredFields.forEach(field => {
    //   if (!profileData[field] || profileData[field].trim() === '') {
    //     errors[field] = 'This field is required';
    //     isValid = false;
    //   }
    // });
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

    // Validate bank account (only numbers)
    if (profileData.bankAccount && !/^\d+$/.test(profileData.bankAccount)) {
      errors.bankAccount = 'Bank account should contain only numbers';
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
          // name: toUpper(profileData.Role)
        };
      }
      if (profileData.bankAccount) formattedData.bankAccount = profileData.bankAccount;
      if (profileData.accountName) formattedData.nameOfAccount = toUpper(profileData.accountName);
      if (profileData.bankOfIssue) formattedData.bankOfIssue = toUpper(profileData.bankOfIssue);
      if (profileData.personalTaxCode) formattedData.personalTaxCode = toUpper(profileData.personalTaxCode);
      if (profileData.hourlyRate) formattedData.hourlyRate = parseFloat(profileData.hourlyRate);
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

      const response = await axios.put(`/staff/${currentEmployee.id}`, formattedData);

      toast.success('Staff updated successfully!');

      onSaveEmployee?.(response.data);
      if (typeof setActiveTab === 'function') {
        setActiveTab(0);
      }
    } 
    catch (err) {
      console.error('Submission error:', err);
    
      // Default error message
      let errorMessage = 'Failed to update staff';
      if (err.response) {
        // Get the message from the server (if available)
        errorMessage = err.response.data?.message || err.response.data?.error || `Error: ${err.response.status}`;
      } else if (err.request) {
        // Handle no response from server
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Default fallback for any other error
        errorMessage = err.message || errorMessage;
      }
    
      // Show error toast with server message or fallback
      toast.error(errorMessage);
    }
    finally {
      setIsSubmitting(false);
    }
  };


  // const handleChange = async (e) => {
  //   const { name, value, type, checked } = e.target;

  //   // Handle Role selection
  //   if (name === 'Role') {
  //     try {
  //       const { data } = await axios.get(`/roles/${value}`);
  //       const selectedRole = data.role;

  //       setProfileData({
  //         ...profileData,
  //         Role: {
  //           roleId: selectedRole.roleId,
  //           name: selectedRole.name,
  //           featurePermissions: selectedRole.featurePermissions || []
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error fetching role details:', error);
  //     }

  //     return;
  //   }

  //   // Handle numeric fields
  //   if ((name === 'daysForIdentity' || name === 'hourlyRate') && value !== '') {
  //     if (isNaN(value)) return;
  //   }

  //   // Handle all other fields
  //   setProfileData({
  //     ...profileData,
  //     [name]: type === 'checkbox' ? checked : value,
  //   });

  //   if (fieldErrors[name]) {
  //     setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  //   }
  // };
  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    setProfileData((prevData) => {
      let newValue = type === 'checkbox' ? checked : value;

      // Handle numeric fields
      if ((name === 'daysForIdentity' || name === 'hourlyRate') && value !== '') {
        if (isNaN(value)) return prevData; // Ignore invalid input
      }

      // Handle jobPosition specifically (store ID)
      if (name === 'jobPosition') {
        return {
          ...prevData,
          jobPosition: newValue, // This is the selected position ID
        };
      }

      // Handle role (fetch role details and set via API)
      if (name === 'Role') {
        // async logic needs to be handled separately — see note below
        fetchAndSetRoleDetails(newValue);
        return prevData; // Don't update here, update happens in async
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

  return (
    <ThemeProvider theme={theme}>
      <Paper style={{ padding: '16px', fontFamily: theme.typography.fontFamily }}>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>PERSONAL INFORMATION</Typography>
            </Grid>

            {/* Map other fields (excluding name) */}
            {['hrCode', 'email'].map((field) => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={profileData[field]}
                  onChange={handleChange}
                  type={field === 'email' ? 'email' : 'text'}
                  error={!!fieldErrors[field]}
                  helperText={fieldErrors[field]}
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
                  // Allow only letters and spaces
                  if (/^[a-zA-Z\s]*$/.test(value)) {
                    handleChange(e);
                  }
                }}
                inputProps={{ maxLength: 500 }}
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
                required
              />
            </Grid>

            {/* Separate Password Field with Toggle Icon */}
            {/* <Grid item xs={6}>
              <TextField
                fullWidth
                label="New Password (leave blank to keep current)"
                name="password"
                value={profileData.password}
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Only enter to change password"
              />
            </Grid> */}
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

            {['birthday', 'birthplace', 'homeTown', 'maritalStatus', 'nation'].map(field => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                    .trim()}
                  name={field}
                  type={field === 'birthday' ? 'date' : 'text'}
                  InputLabelProps={field === 'birthday' ? { shrink: true } : {}}
                  value={profileData[field]}
                  onChange={handleChange}
                />
              </Grid>
            ))}

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
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Days For Identity"
                name="daysForIdentity"
                value={profileData.daysForIdentity}
                onChange={handleChange}
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {['placeOfIssue', 'resident', 'currentAddress'].map(field => (
              <Grid item xs={field === 'currentAddress' ? 12 : 6} key={field}>
                <TextField
                  fullWidth
                  label={field
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                    .trim()}
                  name={field}
                  value={profileData[field]}
                  onChange={handleChange}
                  multiline={field === 'currentAddress'}
                  rows={field === 'currentAddress' ? 3 : 1}
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
                value={profileData.literacy}
                onChange={handleChange}
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
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
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
                  disabled={loading.jobPositions}
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


            {/* Bank Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>BANK INFORMATION</Typography>
            </Grid>

            {/* Separate Bank Account Field */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bank Account"
                name="bankAccount"
                value={profileData.bankAccount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and up to 15 digits
                  if (/^\d{0,15}$/.test(value)) {
                    handleChange(e);
                  }
                }}
                inputProps={{ maxLength: 15 }}
                error={!!fieldErrors.bankAccount}
                helperText={fieldErrors.bankAccount}
                required
              />
            </Grid>

            {/* Map the rest of the fields (excluding bankAccount) */}
            {['accountName', 'bankOfIssue', 'personalTaxCode'].map(field => (
              <Grid item xs={6} key={field}>
                <TextField
                  fullWidth
                  label={field
                    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                    .trim()}
                  name={field}
                  value={profileData[field]}
                  onChange={handleChange}
                />
              </Grid>
            ))}

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hourly Rate"
                name="hourlyRate"
                value={profileData.hourlyRate}
                onChange={handleChange}
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>CONTACT INFORMATION</Typography>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <PhoneInput
                  country={'in'}
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
                  inputStyle={{ width: '100%', height: '56px' }} // Match Material-UI input height
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
              <Typography variant="h6" style={{ fontFamily: "Marquis" }}>MEMBER DEPARTMENTS</Typography>
            </Grid>

            <Grid item xs={12}>
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
                      <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
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
    </ThemeProvider>
  );
};

export default Editstaff;