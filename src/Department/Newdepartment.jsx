import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';

const NewDepartment = ({ onAddSuccess, onClose }) => {
  const [department, setDepartment] = useState({
    name: '',
    departmentEmail: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    departmentEmail: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!department.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (department.name.trim().length < 3) {
      newErrors.name = 'Department name must be at least 3 characters';
    } else if (department.name.trim().length > 50) {
      newErrors.name = 'Department name must be less than 50 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!department.departmentEmail.trim()) {
      newErrors.departmentEmail = 'Email is required';
    } else if (!emailRegex.test(department.departmentEmail)) {
      newErrors.departmentEmail = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/departments', {
        name: department.name.toUpperCase(),
        email: department.departmentEmail
      });
      toast.success("department created successfully")
      setSuccess(true);

      setDepartment({ name: '', departmentEmail: '' });
      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || 'Failed to save department');
      toast.error("Invalid Email Please Enter The Correct Email")
    } finally {

      setLoading(false);
    }
  };


  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, textTransform: 'uppercase', fontFamily: 'Marquis' }}>
        New Department
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Department Name"
            placeholder="A-Z"
            name="name"
            value={department.name}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 50) {
                handleChange(e);
              }
            }}
            required
            error={!!errors.name}
            helperText={errors.name}
            inputProps={{ maxLength: 50, placeholder: "Enter Department Name (e.g. Marketing)" }}
            sx={{
              mb: { xs: 2, md: 0 },
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
            label="Department Email"
            name="departmentEmail"
            value={department.departmentEmail}
            onChange={(e) => {
              const value = e.target.value;
              const emailPattern = /^[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*\.?[a-zA-Z]{0,}$/;
              if (emailPattern.test(value)) {
                handleChange(e);
              }
            }}
            required
            type="email"
            error={!!errors.departmentEmail}
            helperText={errors.departmentEmail}
            inputProps={{
              placeholder: "Enter email address (e.g. dept@example.com)",
            }}
            sx={{
              '& input::placeholder': {
                fontSize: '0.9rem',
                color: '#000',
              },
            }}
          />

        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ mr: 2 }}
          startIcon={<Close />}
          disabled={loading}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Box>

    </Paper>
  );
};

export default NewDepartment;