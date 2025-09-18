import React, { useState, useEffect } from 'react';
import {
  Paper, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell, Button,
  Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Menu, MenuItem, IconButton, Tooltip, InputAdornment,
  useMediaQuery, useTheme
} from '@mui/material';
import { Add, Edit, Delete, Search, Cancel } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Allowancetype from "./Allowancetype";
import Salary from "./Salary";
import Jobposition from "./Jobposition";
import Workplace from "./Workplace";
import { FileDownload as ExportIcon } from '@mui/icons-material';
import axios from '../Axiosinstance';
import ConfirmDialog from '../Constants/ConfirmDialog';
import CircularProgress from '@mui/material/CircularProgress';
import { deleteEntity } from '../Constants/DeleteEntity';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import SearchBar from '../Constants/SearchBar'

const ContractManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [contractData, setContractData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newContract, setNewContract] = useState({
    contractId: '',
    contractType: '',
    paymentMode: '',
    duration: '',
    unit: '',
    insurance: false,
  });
  const [errors, setErrors] = useState({
    contractId: '',
    contractType: '',
    paymentMode: '',
    duration: '',
    unit: '',
    insurance: ''
  });
  const [filterText, setFilterText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [contractIdToDelete, setContractIdToDelete] = useState(null);
  const {role, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canEditSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'EDIT');
  const canDeleteSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'DELETE');
  const canManageSettings = canEditSettings || canDeleteSettings;
  const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');
  const tabHeaders = [
    "CONTRACT TYPE",
    "ALLOWANCE TYPE",
    "SALARY",
    "JOB POSITION",
    "WORKPLACE"
  ];

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'contractId':
        if (!value.trim()) return 'Contract ID is required';
          if (value.trim().length < 3) return 'Minimum 3 characters required';
        if (!/^[A-Za-z0-9-]+$/.test(value)) return 'Only alphanumeric characters and hyphens allowed';
        if (value.length > 20) return 'Maximum 20 characters allowed';
        
        return '';
      case 'contractType':
        if (!value.trim()) return 'Contract type is required';
        return '';
      case 'paymentMode':
        if (!value.trim()) return 'Payment mode is required';
        return '';
      case 'duration':
        if (newContract.contractType === 'TEMPORARY' && !value) return 'Duration is required';
        if (value && isNaN(value)) return 'Must be a number';
        if (value && value <= 0) return 'Must be greater than 0';
        if (value && value > 100) return 'Must be less than 100';
        return '';
      case 'unit':
        if (newContract.contractType === 'TEMPORARY' && !value) return 'Unit is required';
        return '';
      case 'insurance':
        if (typeof value !== 'boolean') return 'Invalid selection';
        return '';
      default:
        return '';
    }
  };

  // Fetch contracts from API with pagination
  const fetchContracts = async (reset = false) => {
    if (reset) {
      setInitialLoading(true);
    } else {
      if (loadingMore) return;
      setLoadingMore(true);
    }

    try {
      const params = {
        size: 10,
        ...(!reset && cursor && { cursor }),
        ...(filterText && { search: filterText })
      };

      const response = await axios.get('/contract', { params });
      const newData = response.data;

      setContractData(prev =>
        reset ? newData : [...prev, ...newData]
      );
      setHasMore(newData.length >= 10);
      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Initial load and reset when filter changes
  useEffect(() => {
    if (activeTab === 0) {
      fetchContracts(true);
    }
  }, [activeTab, filterText]);

  // Validate entire form
  const validateForm = () => {
    const newErrors = {
      contractId: validateField('contractId', newContract.contractId),
      contractType: validateField('contractType', newContract.contractType),
      paymentMode: validateField('paymentMode', newContract.paymentMode),
      duration: validateField('duration', newContract.duration),
      unit: validateField('unit', newContract.unit),
      insurance: validateField('insurance', newContract.insurance)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If contract type is changing, handle special cases
    if (name === 'contractType') {
      setNewContract(prev => ({
        ...prev,
        [name]: value,
        // Clear duration and unit if changing to PERMANENT
        ...(value === 'PERMANENT' && { duration: null, unit: null })
      }));
    } else {
      setNewContract(prev => ({ ...prev, [name]: value }));
    }

    // Validate field on change
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // Prepare contract data for API submission
  const prepareContractData = () => {
    const data = {
      contractId: newContract.contractId,
      contractType: newContract.contractType,
      paymentMode: newContract.paymentMode,
      insurance: newContract.insurance
    };

    // Only include duration and unit for TEMPORARY contracts
    if (newContract.contractType === 'TEMPORARY') {
      data.duration = newContract.duration;
      data.unit = newContract.unit;
    }

    return data;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle opening modal
  const handleOpenModal = () => {
    setIsEditing(false);
    setNewContract({
      contractId: '',
      contractType: '',
      paymentMode: '',
      duration: '',
      unit: '',
      insurance: false,
    });
    setErrors({
      contractId: '',
      contractType: '',
      paymentMode: '',
      duration: '',
      unit: '',
      insurance: ''
    });
    setOpenModal(true);
  };

  // Handle add/update contract
  const handleSaveContract = async () => {
    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }
    try {
      setApiLoading(true);
      const contractData = prepareContractData();

      if (isEditing) {
        await axios.put(`/contract/${currentId}`, contractData);
        toast.success('Contract updated successfully');
      } else {
        await axios.post('/contract', contractData);
        toast.success('Contract created successfully');
      }
      fetchContracts(true);
      setOpenModal(false);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error(error.response?.data?.details || error.response?.data?.message || 'Failed to save contract');
    } finally {
      setApiLoading(false);
    }
  };

  // Handle edit contract
  const handleEditContract = (id) => {
    const contractToEdit = contractData.find(item => item.id === id);
    if (contractToEdit) {
      setNewContract({
        ...contractToEdit,
        duration: contractToEdit.duration || '',
        unit: contractToEdit.unit || ''
      });
      setIsEditing(true);
      setCurrentId(id);
      setErrors({
        contractId: '',
        contractType: '',
        paymentMode: '',
        duration: '',
        unit: '',
        insurance: ''
      });
      setOpenModal(true);
    }
  };

  // Handle delete contract
  const handleDeleteContract = (id) => {
    setContractIdToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    deleteEntity({
      endpoint: '/contract',
      entityId: contractIdToDelete,
      fetchDataCallback: () => fetchContracts(true),
      onFinally: () => {
        setConfirmDialogOpen(false);
        setContractIdToDelete(null);
      },
      onSuccessMessage: 'Contract deleted successfully!',
      onErrorMessage: 'Failed to delete Contract. Please try again.'
    });
  };

  // Export functions
  const exportData = (type) => {
    if (contractData.length === 0) return toast.warning('No data to export');
    const data = contractData.map(item => ({
      ...item,
      insurance: item.insurance ? 'Yes' : 'No',
      duration: item.duration || 'NA',
      unit: item.unit || 'NA'
    }));

    if (type === 'pdf') {
      const doc = new jsPDF();
      doc.text('Contract Management', 14, 16);
      autoTable(doc, {
        head: [['ID', 'Contract ID', 'Contract Type', 'Payment Mode', 'Duration', 'Unit', 'Insurance']],
        body: data.map(item => [
          item.id,
          item.contractId,
          item.contractType,
          item.paymentMode,
          item.duration,
          item.unit,
          item.insurance
        ]),
      });
      doc.save('contracts.pdf');
    }
    else if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");
      XLSX.writeFile(workbook, "contracts.xlsx");
    }
    else if (type === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
      saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'contracts.csv');
    }
    else if (type === 'print') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>Contract Management</title>
        <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}</style>
        </head><body><h1>Contract Management</h1><table>
        <thead><tr><th>ID</th><th>Contract ID</th><th>Contract Type</th><th>Payment Mode</th><th>Duration</th><th>Unit</th><th>Insurance</th></tr></thead>
        <tbody>${data.map(item => `
          <tr><td>${item.id}</td><td>${item.contractId}</td><td>${item.contractType}</td>
          <td>${item.paymentMode}</td><td>${item.duration}</td><td>${item.unit}</td><td>${item.insurance}</td></tr>
        `).join('')}</tbody></table></body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setAnchorEl(null);
    toast.success(`${type === 'print' ? 'Print initiated' : `${type.toUpperCase()} exported successfully`}`);
  };

  // Filter data based on search text
  const filteredData = contractData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons={isMobile ? 'auto' : false}
        allowScrollButtonsMobile
        TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
        sx={{
          bgcolor: '#F0F4F8',
          marginBottom: '20px',
          padding: isMobile ? '4px 8px' : '8px 12px',
          overflowX: isMobile ? 'auto' : 'unset',
          '& .MuiTabs-flexContainer': {
            flexWrap: isMobile ? 'nowrap' : 'wrap',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '16px',
            color: '#142a4f',
            padding: isMobile ? '6px 12px' : '6px 18px',
            whiteSpace: 'nowrap',
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
          <Tab
            key={index}
            label={isMobile ? header.split(' ')[0] : header}
            sx={{ fontSize: isMobile ? '0.875rem' : '0.875rem' }}
          />
        ))}
      </Tabs>

      {activeTab === 0 && (
        <Paper style={{ padding: isMobile ? '10px' : '20px', marginBottom: '20px' }}>
          <Box marginBottom="16px">
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={isMobile ? 'stretch' : 'center'}
              gap="8px"
            >
              {canCreateSettings && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenModal}
                  style={{ height: '40px' }}
                  startIcon={<Add />}
                  disabled={loading}
                  fullWidth={isMobile}
                >
                  {isMobile ? 'Add New' : 'Add New Contract'}
                </Button>
              )}
            <SearchBar
              
                placeholder="SEARCH BY TYPE"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                 style={{
                                maxWidth: isMobile ? '100%' : '300px',
                                marginRight: isMobile ? '0' : '16px'
                            }}
                            fullWidth={isMobile}
                        />

              {!isMobile && <Box flexGrow={1} />}

              <Button
                variant="contained"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={loading || contractData.length === 0}
                startIcon={<ExportIcon />}
                style={{
                  height: '40px',
                  marginLeft: isMobile ? '0' : 'auto',
                }}
                fullWidth={isMobile}
              >
                {isMobile ? 'Export' : 'Export'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => exportData('pdf')} disabled={contractData.length === 0}>PDF</MenuItem>
                <MenuItem onClick={() => exportData('excel')} disabled={contractData.length === 0}>Excel</MenuItem>
                <MenuItem onClick={() => exportData('csv')} disabled={contractData.length === 0}>CSV</MenuItem>
                <MenuItem onClick={() => exportData('print')} disabled={contractData.length === 0}>Print</MenuItem>
              </Menu>
            </Box>
          </Box>

          <Box sx={{
            width: '100%',
            overflowX: 'auto',
            maxHeight: isMobile ? 'calc(100vh - 300px)' : '70vh'
          }}>
            {initialLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
              </Box>
            ) : filteredData.length === 0 ? (
              <Nodatapage />
            ) : (
               <InfiniteScrollWrapper
              dataLength={filteredData.length}
              next={() => fetchContracts()}
              hasMore={hasMore}
              loading={loadingMore}
            >
                <Table sx={{
                  '& .MuiTableCell-root': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    padding: isMobile ? '6px 8px' : '8px 12px',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  },
                  '& .MuiTableCell-head': {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  },
                  '& .MuiTable-root': {
                    position: 'relative' // Add this line
                  }
                }}
                  size={isMobile ? "small" : "medium"}
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" style={{ minWidth: isMobile ? '50px' : '100px' }}>S.NO</TableCell>
                      <TableCell align="center" style={{ minWidth: isMobile ? '100px' : '150px' }}>CONTRACT ID</TableCell>
                      <TableCell align="center" style={{ minWidth: isMobile ? '100px' : '150px' }}>CONTRACT TYPE</TableCell>
                      <TableCell align="center" style={{ minWidth: isMobile ? '100px' : '150px' }}>PAYMENT MODE</TableCell>
                      <TableCell align="center" style={{ minWidth: isMobile ? '70px' : '100px' }}>DURATION</TableCell>
                      <TableCell align="center" style={{ minWidth: isMobile ? '70px' : '100px' }}>UNIT</TableCell>
                      <TableCell align="center" style={{ minWidth: isMobile ? '70px' : '100px' }}>INSURANCE</TableCell>
                      {canManageSettings && <TableCell align="center" style={{ minWidth: isMobile ? '90px' : '120px' }}>ACTIONS</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell align="center">{index + 1 || '-'}</TableCell>
                        <TableCell align="center">{row.contractId || '-'}</TableCell>
                        <TableCell align="center">{row.contractType || '-'}</TableCell>
                        <TableCell align="center">{row.paymentMode || '-'}</TableCell>
                        <TableCell align="center">{row.duration || 'NA'}</TableCell>
                        <TableCell align="center">{row.unit || 'NA'}</TableCell>
                        <TableCell align="center">{row.insurance ? 'Yes' : 'No'}</TableCell>
                        {canManageSettings && (
                          <TableCell  align="center">
                            {canEditSettings && (
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEditContract(row.id)}
                                  color="primary"
                                  size={isMobile ? "small" : "medium"}
                                  disabled={apiLoading}
                                >
                                  <Edit fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDeleteSettings && (
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => handleDeleteContract(row.id)}
                                  color="error"
                                  size={isMobile ? "small" : "medium"}
                                  disabled={apiLoading}
                                >
                                  <Delete fontSize={isMobile ? "small" : "medium"} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </InfiniteScrollWrapper>
            )}
          </Box>

          <ConfirmDialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message="Are you sure you want to delete this Contract?"
            confirmText="Delete"
          />

          <Dialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            maxWidth="sm"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                margin: isMobile ? '16px' : '24px',
                width: '100%'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{
                bgcolor: '#142a4f',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="h7" fontWeight="bold">
                  {isEditing ? 'EDIT CONTRACT' : 'NEW CONTRACT'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contract ID"
                    name="contractId"
                    value={newContract.contractId}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    required
                    disabled={apiLoading}
                    error={!!errors.contractId}
                    helperText={errors.contractId}
                    inputProps={{
                      placeholder: 'Enter Contract ID (e.g. CNT2025-001)',
                      maxLength: 20,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Contract Type"
                    name="contractType"
                    value={newContract.contractType}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    required
                    disabled={apiLoading}
                    error={!!errors.contractType}
                    helperText={errors.contractType}
                  >
                    <MenuItem value="PERMANENT">Permanent</MenuItem>
                    <MenuItem value="TEMPORARY">Temporary</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Mode"
                    name="paymentMode"
                    value={newContract.paymentMode}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    required
                    disabled={apiLoading}
                    error={!!errors.paymentMode}
                    helperText={errors.paymentMode}
                  >
                    <MenuItem value="HOURLY">Hourly</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={isMobile ? 12 : 6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    name="duration"
                    type="number"
                    value={newContract.duration || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    required={newContract.contractType === 'TEMPORARY'}
                    disabled={apiLoading || newContract.contractType !== 'TEMPORARY'}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>

                <Grid item xs={isMobile ? 12 : 6}>
                  <TextField
                    fullWidth
                    select
                    label="Unit"
                    name="unit"
                    value={newContract.unit || ''}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    required={newContract.contractType === 'TEMPORARY'}
                    disabled={apiLoading || newContract.contractType !== 'TEMPORARY'}
                    error={!!errors.unit}
                    helperText={errors.unit}
                  >
                    <MenuItem value="Days">Days</MenuItem>
                    <MenuItem value="Months">Months</MenuItem>
                    <MenuItem value="Years">Years</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Insurance"
                    name="insurance"
                    value={String(newContract.insurance)}
                    onChange={(e) => {
                      const value = e.target.value === 'true';
                      setNewContract(prev => ({ ...prev, insurance: value }));
                      setErrors(prev => ({ ...prev, insurance: validateField('insurance', value) }));
                    }}
                    variant="outlined"
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                    required
                    disabled={apiLoading}
                    error={!!errors.insurance}
                    helperText={errors.insurance}
                  >
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setOpenModal(false)}
                color="primary"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                startIcon={<Cancel />}
                disabled={apiLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveContract}
                color="primary"
                variant="contained"
                size={isMobile ? "small" : "medium"}
                startIcon={<Add />}
                disabled={apiLoading || Object.values(errors).some(error => error)}
              >
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}

      {activeTab === 1 && <Allowancetype isMobile={isMobile} />}
      {activeTab === 2 && <Salary isMobile={isMobile} />}
      {activeTab === 3 && <Jobposition isMobile={isMobile} />}
      {activeTab === 4 && <Workplace isMobile={isMobile} />}
    </>
  );
};

export default ContractManagement;