import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Save, Cancel, Info, AttachMoney, VerifiedUser } from '@mui/icons-material';
import { toast } from 'react-toastify';

const EditContract = ({ currentContract, onCancelEdit, onSaveContract }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [contract, setContract] = useState(currentContract);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContract(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSaveContract(contract);
    toast.success('Contract updated successfully!');
  };

  const handleNext = () => {
    if (activeTab < 2) {
      setActiveTab(activeTab + 1);
      toast.info(`Moved to ${activeTab === 0 ? 'Wages & Allowance' : 'Signed Information'} section`);
    }
  };

  const handleCancel = () => {
    onCancelEdit();
    toast.warning('Editing cancelled');
  };

  return (
    <>
      
      <Paper style={{ padding: '24px' }}>
        <Typography variant="h4" gutterBottom style={{ fontFamily: "Marquis", fontSize: "30px" }}>
          Edit Contract
        </Typography>

        {/* Tabs Section */}
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="tabs">
          <Tab icon={<Info />} iconPosition="start" label="Public Information" />
          <Tab icon={<AttachMoney />} iconPosition="start" label="Wages Allowance" />
          <Tab icon={<VerifiedUser />} iconPosition="start" label="Signed Information" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box mt={2}>
            {/* Public Information Inputs */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contract Code"
                    name="contractCode"
                    value={contract.contractCode}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    required
                    onBlur={() => {
                      if (!contract.contractCode) {
                        toast.error('Contract Code is required');
                      }
                    }}
                  />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contract ID"
                  name="contractId"
                  value={contract.contractId}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                  onBlur={() => {
                    if (!contract.contractId) {
                      toast.error('Contract ID is required');
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Contract Status</InputLabel>
                  <Select
                    name="contractStatus"
                    value={contract.contractStatus}
                    onChange={handleInputChange}
                    label="Contract Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Staff Name"
                  name="staff"
                  value={contract.staff}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                  onBlur={() => {
                    if (!contract.staff) {
                      toast.error('Staff Name is required');
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="start"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={contract.start}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                  onBlur={() => {
                    if (!contract.start) {
                      toast.error('Start Date is required');
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="end"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={contract.end}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                  required
                  onBlur={() => {
                    if (!contract.end) {
                      toast.error('End Date is required');
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box mt={2}>
            {/* Wages Allowance Inputs */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Since Date"
                  name="sinceDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={contract.sinceDate || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Note"
                  name="note"
                  value={contract.note || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              {/* Salary Input */}
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Salary Form"
                  name="salaryForm"
                  value={contract.salaryForm || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="salaryAmount"
                  type="number"
                  value={contract.salaryAmount || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>

              {/* Allowance Input */}
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Allowance Type"
                  name="allowanceType"
                  value={contract.allowanceType || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="allowanceAmount"
                  type="number"
                  value={contract.allowanceAmount || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box mt={2}>
            {/* Signed Information Inputs */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sign Day"
                  name="signDay"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={contract.signDay || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Staff Delegate"
                  name="staffDelegate"
                  value={contract.staffDelegate || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default EditContract;