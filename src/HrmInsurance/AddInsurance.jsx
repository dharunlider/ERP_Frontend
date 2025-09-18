import React, { useState, useEffect } from 'react';
import {
  Paper, Button, Box, TextField, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify'; // ✅ Correctly import toast
import 'react-toastify/dist/ReactToastify.css';
import axios from '../Axiosinstance';
import { useNavigate } from 'react-router-dom';

const AddInsurance = ({ onAddInsurance, onCancel }) => {
  const navigate = useNavigate();
  const [insurance, setInsurance] = useState({
    staffId: '',
    bookNumber: '',
    insuranceNumber: '',
    provincialCode: '',
    medicalCareRegistration: '',
    startDate: '',
    endDate: '',
  });
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Function moved outside useEffect to be reusable
  const fetchStaffList = async () => {
    try {
      setStaffLoading(true);
      const response = await axios.get('/staff/allstaffs?size=100');
      let staffData = response.data;
      const formattedStaff = (staffData || []).map((staff) => ({
        id: String(staff.id || staff.staffId || staff._id),
        name: String(staff.name || staff.staffName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim()),
      }));

      setStaffList(formattedStaff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      toast.error('Failed to load staff list');
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleDropdownOpen = () => {
    setDropdownOpen(true);
    if (staffList.length === 0) {
      fetchStaffList();
    }
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInsurance((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!insurance.staffId || !insurance.bookNumber || !insurance.insuranceNumber) {
      // setError('Please fill all required fields');
      toast.error('Please fill all required fields');
      return;
    }

    const selectedStaff = staffList.find((staff) => staff.id === insurance.staffId);
    const payload = {
      staffId: insurance.staffId,
      staffName: selectedStaff?.name || '',
      bookNumber: insurance.bookNumber,
      healthInsuranceNumber: insurance.insuranceNumber,
      cityCode: insurance.provincialCode,
      registrationOfMedicalCare: insurance.medicalCareRegistration,
      startDate: insurance.startDate,
      endDate: insurance.endDate,
    };
    try {
      setSubmitting(true);
      await axios.post(`/insurance/staff/${insurance.staffId}`, payload);
      toast.success('Insurance added successfully!');
      if (typeof onCancel === 'function') {
        onCancel();
      }
    } catch (error) {
      console.error('Error adding insurance:', error);
      toast.error(`Failed to add insurance: ${error.response?.data?.details || error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper style={{ padding: '24px' }}>
      {error && (
        <Box mb={2} color="error.main">
          {error}
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="staff-select-label">Staff Name</InputLabel>
            <Select
              labelId="staff-select-label"
              name="staffId"
              value={insurance.staffId}
              onChange={handleInputChange}
              label="Staff Name *"
              onOpen={handleDropdownOpen}
              onClose={handleDropdownClose}
              MenuProps={{
                PaperProps: { style: { maxHeight: 300 } },
              }}
            >
              {staffLoading ? (
                <MenuItem disabled>
                  <Box display="flex" alignItems="center">
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    Loading staff...
                  </Box>
                </MenuItem>
              ) : staffList.length > 0 ? (
                staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff members found</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Insurance Book Number"
            name="bookNumber"
            value={insurance.bookNumber}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only digits and max 20 characters
              if (/^\d{0,20}$/.test(value)) {
                setInsurance((prev) => ({ ...prev, bookNumber: value }));
              }
            }}
            inputProps={{
              minLength: 10,
              maxLength: 20,
              inputMode: 'numeric', // for mobile numeric keyboard
              pattern: '[0-9]*',
              placeholder: 'Enter Insurance Book Number (e.g. 1234567890)',
            }}
            required
            margin="normal"
            sx={{
              '& input::placeholder': {
                fontSize: '0.9rem',
                color: '#000',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Health Insurance Number"
            name="insuranceNumber"
            value={insurance.insuranceNumber}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only digits and max 20 characters
              if (/^\d{0,20}$/.test(value)) {
                setInsurance((prev) => ({ ...prev, insuranceNumber: value }));
              }
            }}
            inputProps={{
              minLength: 10,
              maxLength: 20,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              placeholder: 'Enter Health Insurance Number (e.g. HINS123456)',
            }}
            required
            margin="normal"
            sx={{
              '& input::placeholder': {
                fontSize: '0.9rem',
                color: '#000',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Provincial Code"
            name="provincialCode"
            value={insurance.provincialCode}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only digits and limit to 6 characters
              if (/^\d{0,6}$/.test(value)) {
                setInsurance((prev) => ({ ...prev, provincialCode: value }));
              }
            }}
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              placeholder: 'Enter Provincial Code (e.g. 0123456789)',
            }}
            margin="normal"
            required
            sx={{
              '& input::placeholder': {
                fontSize: '0.9rem',
                color: '#000',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="date"
            value={insurance.startDate}
            onChange={(e) => {
              const value = e.target.value;
              setInsurance((prev) => ({ ...prev, startDate: value }));
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              placeholder: 'Select start date',
            }}
            margin="normal"
            required
            sx={{
              '& input': {
                fontSize: '0.9rem',
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Registration of Medical Care</InputLabel>
            <Select
              name="medicalCareRegistration"
              value={insurance.medicalCareRegistration}
              onChange={handleInputChange}
              label="Registration of Medical Care"
            >
              <MenuItem value="Registered" sx={{ textTransform: 'uppercase' }}>Registered</MenuItem>
              <MenuItem value="Pending" sx={{ textTransform: 'uppercase' }}>Pending</MenuItem>
              <MenuItem value="Not Registered" sx={{ textTransform: 'uppercase' }}>Not Registered</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="End Date"
            name="endDate"
            type="date"
            value={insurance.endDate}
            onChange={(e) => {
              const value = e.target.value;
              setInsurance((prev) => ({ ...prev, endDate: value }));
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              placeholder: 'Select end date',
            }}
            margin="normal"
            required
            sx={{
              '& input': {
                fontSize: '0.9rem',
              },
            }}
          />

        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<Cancel />}
          sx={{ mr: 1 }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Adding...' : 'Add Insurance'}
        </Button>
      </Box>
    </Paper>
  );
};
export default AddInsurance;
