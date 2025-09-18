import React, { useState, useEffect } from 'react';
import {
  Paper, TextField, Button, Typography, Box, Grid, FormControl,
  InputLabel, Select, MenuItem, Divider, Tabs, Tab, IconButton, CircularProgress, InputAdornment,
  useMediaQuery, useTheme
} from '@mui/material';
import { Save, Cancel, Info, AttachMoney, VerifiedUser, Add, Delete, } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../Axiosinstance';

const ContractPage = ({ onAddContract, onCancel }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contractOptions, setContractOptions] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [salaryFormOptions, setSalaryFormOptions] = useState([]);
  const [contract, setContract] = useState({
    contractCode: '',
    contractId: '',
    contractStatus: 'Active',
    staff: '',
    start: '',
    end: '',
    sinceDate: '',
    note: '',
    signDay: '',
    staffDelegate: '',
    salaryForm: '',
    salaryAmount: ''
  });
  const [dynamicAllowances, setDynamicAllowances] = useState([]);

  useEffect(() => {
    const fetchContractOptions = async () => {
      try {
        const response = await axios.get('/contract');
        setContractOptions(response.data);
      } catch (error) {
        console.error('Error fetching contract options:', error);
        toast.error('Failed to load contract options');
      }
    };

    fetchContractOptions();
  }, []);

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const response = await axios.get('/staff/allstaffs?size=100');
        setStaffOptions(response.data);
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff list');
      }
    };

    fetchStaffList();
  }, []);

  useEffect(() => {
    const fetchAllowanceTypes = async () => {
      try {
        const response = await axios.get('/hrm-allowancetype');
        setAllowanceTypes(response.data);
      } catch (error) {
        console.error('Error fetching allowance types:', error);
        toast.error('Failed to load allowance types');
      }
    };

    fetchAllowanceTypes();
  }, []);

  useEffect(() => {
    const fetchSalaryOptions = async () => {
      try {
        const response = await axios.get('/hrm-salary');
        setSalaryFormOptions(response.data);
      } catch (error) {
        console.error('Error fetching salary options:', error);
        toast.error('Failed to load salary options');
      }
    };

    fetchSalaryOptions();
  }, []);

  const handleTabChange = (e, newValue) => {
    if (newValue > activeTab) {
      if (activeTab === 0 && (!contract.contractCode || !contract.contractId || !contract.staff || !contract.start || !contract.end)) {
        toast.error('Please fill all required fields before proceeding');
        return;
      }
      if (activeTab === 1 && !contract.salaryForm) {
        toast.error('Please select a salary form before proceeding');
        return;
      }
    }
    setActiveTab(newValue);
  };

  const handleInputChange = e => {
    setContract(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = () => {
    if (activeTab === 0 && (!contract.contractCode || !contract.contractId || !contract.staff || !contract.start || !contract.end)) {
      return toast.error('Please fill all required fields before proceeding');
    }
    if (activeTab === 1 && !contract.salaryForm) {
      return toast.error('Please select a salary form before proceeding');
    }
    if (activeTab < 2) {
      setActiveTab(activeTab + 1);
    }
  };

  const handleCancel = () => {
    setContract({
      contractCode: '',
      contractId: '',
      contractStatus: '',
      staff: '',
      start: '',
      end: '',
      sinceDate: '',
      note: '',
      signDay: '',
      staffDelegate: '',
      salaryForm: '',
      salaryAmount: ''
    });
    setDynamicAllowances([]);
    onCancel();
  };

  const handleAddAllowanceField = () => {
    setDynamicAllowances([...dynamicAllowances, { type: '', amount: '' }]);
  };

  const handleRemoveAllowanceField = (index) => {
    const updated = [...dynamicAllowances];
    updated.splice(index, 1);
    setDynamicAllowances(updated);
  };

  const handleSave = async () => {
    if (!contract.contractCode || !contract.contractId || !contract.staff || !contract.start || !contract.end || !contract.staffDelegate) {
      return toast.error('Please complete all required fields before saving');
    }

    setLoading(true);

    try {
      const contractData = {
        contractCode: contract.contractCode.toUpperCase(),
        contractStatus: contract.contractStatus.toUpperCase(),
        startDate: contract.start,
        endDate: contract.end,
        signDay: contract.signDay,
        note: contract.note.toUpperCase(),
        sinceDate: contract.sinceDate,
        staff: {
          id: contract.staff
        },
        staffDelegate: {
          id: contract.staffDelegate
        },
        salaryForm: {
          id: contract.salaryForm,
          amount: parseFloat(contract.salaryAmount) || 0
        },
        allowanceTypes: dynamicAllowances
          .filter(a => a.type && a.amount)
          .map(a => ({
            id: a.type,
            amount: parseFloat(a.amount) || 0
          })),
        contractId: {
          id: contract.contractId
        }
      };

      const response = await axios.post('/staff-contracts', contractData);
      console.log('Contract saved successfully:', response.data);
      toast.success('Contract saved successfully!');
      onAddContract(); // Refresh contract list
      onCancel();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error(error.response?.data?.details || error.response?.data?.message || 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{
      p: isMobile ? 1 : 3,
      borderRadius: 2,
      boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          '& .MuiTabs-flexContainer': {
            justifyContent: 'space-between'
          },
          '& .MuiTab-root': {
            minWidth: 'unset',
            padding: isMobile ? '6px 4px' : '6px 12px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: isMobile ? '0.7rem' : '0.875rem'
          }
        }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab
          icon={isMobile ? <Info fontSize="small" /> : <Info />}
          iconPosition="start"
          label={
            <span style={{ fontSize: isMobile ? 14 : 16 }}>
              {isMobile ? 'Info' : 'Public Information'}
            </span>
          }
        />

        <Tab
          icon={isMobile ? <AttachMoney fontSize="small" /> : <AttachMoney />}
          iconPosition="start"
          label={
            <span style={{ fontSize: isMobile ? 14 : 16 }}>
              {isMobile ? 'Wages' : 'Wages Allowance'}
            </span>
          }
        />

        <Tab
          icon={isMobile ? <VerifiedUser fontSize="small" /> : <VerifiedUser />}
          iconPosition="start"
          label={
            <span style={{ fontSize: isMobile ? 14 : 16 }}>
              {isMobile ? 'Sign Info' : 'Signed Information'}
            </span>
          }
        />

      </Tabs>

      {activeTab === 0 && (
        <Box mt={2}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract Code"
                name="contractCode"
                placeholder="Enter Contract Code (e.g. CNTR2025)"
                value={contract.contractCode}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
                required
                inputProps={{ minLength: 3, maxLength: 30 }}
                error={contract.contractCode.length > 0 && (contract.contractCode.length < 3 || contract.contractCode.length > 30)}
                helperText={
                  contract.contractCode.length > 0 && (contract.contractCode.length < 3 || contract.contractCode.length > 30)
                    ? "Contract code must be between 3 and 30 characters."
                    : ""
                }
                sx={{
                  '& input::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Contract ID</InputLabel>
                <Select
                  name="contractId"
                  value={contract.contractId}
                  onChange={handleInputChange}
                  label="Contract ID *"
                >
                  {contractOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.contractId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Contract Status</InputLabel>
                <Select
                  name="contractStatus"
                  value={contract.contractStatus}
                  onChange={handleInputChange}
                  label="Contract Status"
                >
                  {['Active', 'Inactive', 'Pending', 'Expired'].map(status => (
                    <MenuItem key={status} value={status}>{status.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Staff Name</InputLabel>
                <Select
                  name="staff"
                  value={contract.staff}
                  onChange={handleInputChange}
                  label="Staff Name *"
                >
                  {staffOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                size={isMobile ? 'small' : 'medium'}
                required
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
                size={isMobile ? 'small' : 'medium'}
                required
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              sx={{ px: 4, py: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              Next
            </Button>
          </Box> 
        </Box>
      )}

      {activeTab === 1 && (
        <Box mt={2}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Since Date"
                name="sinceDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={contract.sinceDate}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Note"
                name="note"
                placeholder="Enter Any Remarks Or Additional Information"
                value={contract.note}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
                inputProps={{ maxLength: 300 }}
                helperText={`${contract.note.length}/300`}
                sx={{
                  '& textarea::placeholder': {
                    fontSize: '0.9rem',
                    color: '#000',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth margin="normal" required size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Salary Form</InputLabel>
                <Select
                  name="salaryForm"
                  value={contract.salaryForm}
                  onChange={(e) => {
                    const selectedSalaryForm = salaryFormOptions.find(option => option.id === e.target.value);
                    setContract(prev => ({
                      ...prev,
                      salaryForm: e.target.value,
                      salaryAmount: selectedSalaryForm?.amount || ''
                    }));
                  }}
                  label="Salary Form *"
                >
                  {salaryFormOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.salaryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Salary Amount"
                name="salaryAmount"
                type="number"
                value={contract.salaryAmount}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                InputLabelProps={{
                  shrink: !!contract.salaryAmount,
                }}
              />
            </Grid>
          </Grid>

          {/* Dynamic Allowances Section */}
          {dynamicAllowances.map((item, index) => (
            <Grid container spacing={isMobile ? 1 : 2} key={index} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={isMobile ? 5 : 5} sm={4} md={3}>
                <FormControl fullWidth margin="normal" size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Allowance Type</InputLabel>
                  <Select
                    value={item.type}
                    onChange={(e) => {
                      const selectedTypeId = e.target.value;
                      const selectedAllowance = allowanceTypes.find(opt => opt.id === selectedTypeId);

                      const updated = [...dynamicAllowances];
                      updated[index] = {
                        type: selectedTypeId,
                        amount: selectedAllowance?.amount || ''
                      };
                      setDynamicAllowances(updated);
                    }}
                    label="Allowance Type"
                  >
                    {allowanceTypes.map((option) => {
                      const isSelected = dynamicAllowances.some(
                        (a, i) => a.type === option.id && i !== index
                      );
                      return (
                        <MenuItem key={option.id} value={option.id} disabled={isSelected}>
                          {option.allowanceTypeName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={isMobile ? 5 : 5} sm={4} md={3}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={item.amount}
                  onChange={(e) => {
                    const updated = [...dynamicAllowances];
                    updated[index].amount = e.target.value;
                    setDynamicAllowances(updated);
                  }}
                  variant="outlined"
                  margin="normal"
                  size={isMobile ? 'small' : 'medium'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={isMobile ? 2 : 2} sm={4} md={1}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveAllowanceField(index)}
                  aria-label="remove"
                  sx={{ mt: 1 }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <Delete fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Box display="flex" justifyContent="flex-start" mt={2}>
            <Button
              variant="outlined"
              onClick={handleAddAllowanceField}
              startIcon={<Add fontSize={isMobile ? 'small' : 'medium'} />}
              sx={{ mb: 2 }}
              size={isMobile ? 'small' : 'medium'}
            >
              Add Allowance
            </Button>
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
            <Button
              variant="outlined"
              onClick={() => setActiveTab(0)}
              sx={{ px: 4, py: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              sx={{ px: 4, py: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Box mt={2}>
          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sign Day"
                name="signDay"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={contract.signDay}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Staff Delegate</InputLabel>
                <Select
                  name="staffDelegate"
                  value={contract.staffDelegate}
                  onChange={handleInputChange}
                  label="Staff Delegate"
                >
                  {staffOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={() => setActiveTab(1)}
              sx={{ px: 4, py: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Cancel fontSize={isMobile ? 'small' : 'medium'} />}
              onClick={handleCancel}
              sx={{ px: 4, py: 1 }}
              size={isMobile ? 'small' : 'medium'}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save fontSize={isMobile ? 'small' : 'medium'} />}
              onClick={handleSave}
              sx={{ px: 4, py: 1 }}
              disabled={loading}
              size={isMobile ? 'small' : 'medium'}
            >
              {loading ? 'Saving...' : 'Save Contract'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ContractPage;