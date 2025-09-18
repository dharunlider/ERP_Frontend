import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Box, Grid, FormControl,
  InputLabel, Select, MenuItem, Divider, Tabs, Tab, IconButton
} from '@mui/material';
import { Save, Cancel, Info, AttachMoney, VerifiedUser, Add, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from '../Axiosinstance';

const ContractModal = ({ open, onClose, currentId, onUpdateContract }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contractOptions, setContractOptions] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [salaryFormOptions, setSalaryFormOptions] = useState([]);
  const [contract, setContract] = useState({
    id: '',
    contractCode: '', 
    contractId: '', 
    contractStatus: 'ACTIVE',
    staff: '', 
    startDate: '', 
    endDate: '', 
    sinceDate: '',
    note: '', 
    signDay: '', 
    staffDelegate: '', 
    salaryForm: '', 
    amount: '',
    allowanceTypes: []
  });
  const [dynamicAllowances, setDynamicAllowances] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const [contractsRes, staffRes, allowancesRes, salaryRes] = await Promise.all([
          axios.get('/contract'),
          axios.get('/staff/allstaffs?size=100'),
          axios.get('/hrm-allowancetype'),
          axios.get('/hrm-salary')
        ]);

        setContractOptions(contractsRes.data);
        setStaffOptions(staffRes.data);
        setAllowanceTypes(allowancesRes.data);
        setSalaryFormOptions(salaryRes.data);

        if (currentId) {
          const { data: contractData } = await axios.get(`/staff-contracts/${currentId}`);
          setContract({
            id: contractData.id,
            contractCode: contractData.contractCode || '',
            contractId: contractData.contractId?.id || '',
            contractStatus: contractData.contractStatus || 'ACTIVE',
            staff: contractData.staff?.id || '',
            startDate: formatDate(contractData.startDate),
            endDate: formatDate(contractData.endDate),
            sinceDate: formatDate(contractData.sinceDate),
            note: contractData.note || '',
            signDay: formatDate(contractData.signDay),
            staffDelegate: contractData.staffDelegate?.id || '',
            salaryForm: contractData.salaryForm?.id || '',
            amount: contractData.salaryForm?.amount || '',
            allowanceTypes: contractData.allowanceTypes || []
          });

          setDynamicAllowances((contractData.allowanceTypes || []).map(a => ({
            type: a.id, 
            amount: a.amount || ''
          })));
        } else {
          // Reset form for new contract
          setContract({
            id: '',
            contractCode: '', 
            contractId: '', 
            contractStatus: 'ACTIVE',
            staff: '', 
            startDate: '', 
            endDate: '', 
            sinceDate: '',
            note: '', 
            signDay: '', 
            staffDelegate: '', 
            salaryForm: '', 
            amount: '',
            allowanceTypes: []
          });
          setDynamicAllowances([]);
        }
      } catch (err) {
        toast.error('Failed to load contract data');
        console.error('Error loading contract data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, currentId]);

  const handleInputChange = (e) => {
    setContract(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!contract.contractCode || !contract.contractId || !contract.staff || !contract.startDate || !contract.endDate) {
      return toast.error('Please complete all required fields before saving');
    }

    setLoading(true);
    try {
      const contractData = {
        ...contract,
        startDate: contract.startDate,
        endDate: contract.endDate,
        allowanceTypes: dynamicAllowances.map(a => ({
          id: a.type,
          amount: parseFloat(a.amount || 0)
        })),
        salaryForm: contract.salaryForm ? { 
          id: contract.salaryForm, 
          amount: parseFloat(contract.amount || 0) 
        } : null,
        staff: { id: contract.staff },
        staffDelegate: contract.staffDelegate ? { id: contract.staffDelegate } : null,
        contractId: { id: contract.contractId }
      };

      let response;
      if (currentId) {
        response = await axios.put(`/staff-contracts/${currentId}`, contractData);
        toast.success('Contract updated successfully');
      } else {
        response = await axios.post('/staff-contracts', contractData);
        toast.success('Contract created successfully');
      }

      onUpdateContract(response.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.details || err.response?.data?.message || 'Error saving contract');
      console.error('Error saving contract:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newVal) => setActiveTab(newVal);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
         <Box sx={{ 
                bgcolor: '#142a4f', 
                color: 'white',
                px: 2, 
                py: 1, 
                borderRadius: 1,
                  textAlign: 'center' 
              }}>

      <DialogTitle>{currentId ? 'EDIT CONTRACT ' : 'CREATE CONTRACT'}</DialogTitle>
      </Box>
      <DialogContent dividers>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Public Info" icon={<Info />} />
          <Tab label="Wages" icon={<AttachMoney />} />
          <Tab label="Signature" icon={<VerifiedUser />} />
        </Tabs>

        {activeTab === 0 && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth 
                  label="Contract Code" 
                  name="contractCode"
                  value={contract.contractCode} 
                  onChange={handleInputChange} 
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Contract ID</InputLabel>
                  <Select 
                    name="contractId" 
                    value={contract.contractId} 
                    onChange={handleInputChange} 
                    label="Contract ID"
                  >
                    {contractOptions.map(opt => (
                      <MenuItem key={opt.id} value={opt.id}>{opt.contractId}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Contract Status</InputLabel>
                  <Select 
                    name="contractStatus" 
                    value={contract.contractStatus} 
                    onChange={handleInputChange}
                     label="Contract Status"
                  >
                    {['ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED'].map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Staff </InputLabel>
                  <Select 
                    label="Staff" 
                    name="staff" 
                    value={contract.staff} 
                    onChange={handleInputChange}
                  >
                    {staffOptions.map(opt => (
                      <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  type="date" 
                  label="Start Date" 
                  name="startDate" 
                  InputLabelProps={{ shrink: true }} 
                  value={contract.startDate} 
                  onChange={handleInputChange} 
                  required 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  type="date" 
                  label="End Date" 
                  name="endDate" 
                  InputLabelProps={{ shrink: true }} 
                  value={contract.endDate} 
                  onChange={handleInputChange} 
                  required 
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  type="date" 
                  label="Since Date" 
                  name="sinceDate" 
                  InputLabelProps={{ shrink: true }} 
                  fullWidth 
                  value={contract.sinceDate} 
                  onChange={handleInputChange} 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Note" 
                  name="note" 
                  fullWidth 
                  value={contract.note} 
                  onChange={handleInputChange} 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Salary Form</InputLabel>
                  <Select
                   label="Salary Form" 
                    name="salaryForm"
                    value={contract.salaryForm}
                    onChange={(e) => {
                      const form = salaryFormOptions.find(s => s.id === e.target.value);
                      setContract(prev => ({ 
                        ...prev, 
                        salaryForm: form.id, 
                        amount: form.amount || '' 
                      }));
                    }}
                  >
                    {salaryFormOptions.map(f => (
                      <MenuItem key={f.id} value={f.id}>{f.salaryName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
<Grid item xs={12} md={6}>
  <TextField 
    type="number" 
    label="Amount" 
    name="amount" 
    fullWidth 
    value={contract.amount} 
    InputProps={{
      readOnly: true,
    }}
    disabled
  />
</Grid>


              <Grid item xs={12}>
                {dynamicAllowances.map((a, idx) => (
                  <Grid container spacing={1} key={idx} alignItems="center">
                    <Grid item xs={5} mb={2}>
                      <FormControl fullWidth>
                        <InputLabel>Allowance Type</InputLabel>
                        <Select
                         label="Allowance Type" 
                          value={a.type}
                          onChange={e => {
                            const newAllowances = [...dynamicAllowances];
                            newAllowances[idx].type = e.target.value;
                            const selected = allowanceTypes.find(at => at.id === e.target.value);
                            if (selected?.amount) newAllowances[idx].amount = selected.amount;
                            setDynamicAllowances(newAllowances);
                          }}
                        >
                          {allowanceTypes.map(at => (
                            <MenuItem key={at.id} value={at.id}>{at.allowanceTypeName}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={5} mb={2}>
                      <TextField 
                        type="number" 
                        fullWidth 
                        label="Amount" 
                        value={a.amount} 
                         InputProps={{
      readOnly: true,
    }}
    disabled
                        onChange={(e) => {
                          const updated = [...dynamicAllowances];
                          updated[idx].amount = e.target.value;
                          setDynamicAllowances(updated);
                        }} 
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton 
                        color="error" 
                        onClick={() => {
                          const updated = [...dynamicAllowances];
                          updated.splice(idx, 1);
                          setDynamicAllowances(updated);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button 
                variant='contained'
                color='primary'
                  startIcon={<Add />} 
                  onClick={() => setDynamicAllowances([...dynamicAllowances, { type: '', amount: '' }])}
                >
                  Add Allowance
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth 
                  type="date" 
                  label="Sign Day"
                  name="signDay" 
                  InputLabelProps={{ shrink: true }}
                  value={contract.signDay} 
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Delegate</InputLabel>
                  <Select
                   label="Delegate" 
                    name="staffDelegate"
                    value={contract.staffDelegate}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">None</MenuItem>
                    {staffOptions.map(opt => (
                      <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button    variant='outlined'
                color='primary' onClick={onClose} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          startIcon={<Save />} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractModal;