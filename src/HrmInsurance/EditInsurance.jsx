import React, { useState, useEffect } from 'react';
import {
  Paper, Button, Box, TextField, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography
} from '@mui/material';
import { Save, Cancel, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../Axiosinstance';

const EditInsurance = ({ currentInsurance, onCancelEdit, onSaveInsurance, onDeleteInsurance }) => {
  const [insurance, setInsurance] = useState({
    staffId: '',
    staffName: '',
    bookNumber: '',
    insuranceNumber: '',
    provincialCode: '',
    medicalCareRegistration: '',
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (currentInsurance) {
      setInsurance({
        staffId: currentInsurance.staffId || currentInsurance.id || '',
        staffName: currentInsurance.staffName || '',
        bookNumber: currentInsurance.bookNumber || '',
        insuranceNumber: currentInsurance.healthInsuranceNumber || '',
        provincialCode: currentInsurance.cityCode || '',
        medicalCareRegistration: currentInsurance.registrationOfMedicalCare || '',
        startDate: currentInsurance.startDate || '',
        endDate: currentInsurance.endDate || '',
      });
    }
  }, [currentInsurance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInsurance((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!insurance.bookNumber || !insurance.insuranceNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      staffId: insurance.staffId,
      staffName: insurance.staffName,
      bookNumber: insurance.bookNumber,
      healthInsuranceNumber: insurance.insuranceNumber,
      cityCode: insurance.provincialCode,
      registrationOfMedicalCare: insurance.medicalCareRegistration,
      startDate: insurance.startDate,
      endDate: insurance.endDate
    };

    try {
      setSubmitting(true);
      await axios.put(`/insurance/${currentInsurance.id}`, payload);
      toast.success('Insurance updated successfully!');
      onSaveInsurance({ ...payload, id: currentInsurance.id });
    } catch (error) {
      console.error('Error updating insurance:', error);
      toast.error(`Failed to update insurance: ${error.response?.data?.details || error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this insurance record?')) {
      try {
        setDeleting(true);
        await onDeleteInsurance(currentInsurance.id);
        toast.success('Insurance deleted successfully!');
      } catch (error) {
        console.error('Error deleting insurance:', error);
        toast.error(`Failed to delete insurance: ${error.response?.data?.message || error.message}`);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Paper style={{ padding: '24px' }}>
      <Typography variant="h6" gutterBottom>
        Edit Insurance
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Staff Name"
            value={insurance.staffName}
            margin="normal"
            disabled
          />
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
              <MenuItem value="Registered">Registered</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Not Registered">Not Registered</MenuItem>
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

      <Box display="flex" justifyContent="space-between" mt={3}>
        {/* <Button
          variant="contained"
          color="error"
          startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
          onClick={handleDelete}
          disabled={deleting || submitting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button> */}

        <Box>
          <Button
            variant="outlined"
            onClick={onCancelEdit}
            startIcon={<Cancel />}
            sx={{ mr: 1 }}
            disabled={submitting || deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSubmit}
            disabled={submitting || deleting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditInsurance;