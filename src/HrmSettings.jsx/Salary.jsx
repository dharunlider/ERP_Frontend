import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableHead, Typography, TableBody, TableRow, TableCell, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, MenuItem, InputAdornment, Tooltip, IconButton, useMediaQuery, useTheme, CircularProgress, Tabs, Tab
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import axios from '../Axiosinstance';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import StaffSalary from "../HrmSettings.jsx/StaffSalary";
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import SearchBar from '../Constants/SearchBar'

const SalaryManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State variables
  const [salaryData, setSalaryData] = useState([]);
  const [openSalaryModal, setOpenSalaryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSalaryId, setCurrentSalaryId] = useState(null);
  const [newSalary, setNewSalary] = useState({
    salaryName: '',
    amount: '',
    paymentMode: 'MONTHLY',
    taxable: 'No',
  });
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [salaryIdToDelete, setSalaryIdToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { role, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canEditSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'EDIT');
  const canDeleteSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'DELETE');
  const canManageSettings = canEditSettings || canDeleteSettings;
  const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');

  const paymentModes = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'];
  const tabs = [
    { label: 'ADD SALARY', component: 'salary' },
    { label: 'ALL STAFF SALARY DETAILS', component: 'StaffSalary' },
  ];

  // Fetch salaries with pagination
  const fetchSalaries = async (reset = false) => {
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

      const response = await axios.get('/hrm-salary', { params });
      const newData = response.data;

      setSalaryData(prev => reset ? newData : [...prev, ...newData]);
      setHasMore(newData.length >= 10);
      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
      toast.error('Failed to fetch salaries. Please try again.');
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchSalaries(true);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 0) {
      fetchSalaries(true);
    }
  }, [filterText]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredSalaryData = salaryData.filter((row) =>
    // String(row.id).includes(filterText) ||
    (row.salaryName?.toLowerCase().includes(filterText.toLowerCase())) ||
    String(row.amount).includes(filterText) ||
    (row.paymentMode?.toLowerCase().includes(filterText.toLowerCase()))
    // (row.taxable?.toString().toLowerCase().includes(filterText.toLowerCase()))
  );

  const handleOpenSalaryModal = () => {
    setOpenSalaryModal(true);
    setIsEditing(false);
    setNewSalary({
      salaryName: '',
      amount: '',
      paymentMode: 'MONTHLY',
      taxable: 'No',
    });
  };

  const handleCloseSalaryModal = () => {
    setOpenSalaryModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSalary({
      ...newSalary,
      [name]: value,
    });
  };

  const handleAddSalary = async () => {
    if (!newSalary.salaryName || !newSalary.amount || !newSalary.paymentMode) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        salaryName: newSalary.salaryName,
        amount: parseFloat(newSalary.amount),
        paymentMode: newSalary.paymentMode,
        taxable: newSalary.taxable === 'Yes'
      };

      if (isEditing) {
        await axios.put(`/hrm-salary/${currentSalaryId}`, payload);
        toast.success('Salary updated successfully');
      } else {
        await axios.post('/hrm-salary', payload);
        toast.success('Salary created successfully');
      }

      await fetchSalaries(true);
      handleCloseSalaryModal();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} salary:`, error);
      toast.error(
        error.response?.data?.details || error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} salary`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSalary = (id) => {
    const salaryToEdit = salaryData.find((salary) => salary.id === id);
    if (salaryToEdit) {
      setNewSalary({
        salaryName: salaryToEdit.salaryName,
        amount: salaryToEdit.amount,
        paymentMode: salaryToEdit.paymentMode || 'MONTHLY',
        taxable: salaryToEdit.taxable ? 'Yes' : 'No'
      });
      setCurrentSalaryId(id);
      setIsEditing(true);
      setOpenSalaryModal(true);
    }
  };

  const handleDeleteSalary = (id) => {
    setSalaryIdToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    deleteEntity({
      endpoint: '/hrm-salary',
      entityId: salaryIdToDelete,
      fetchDataCallback: () => fetchSalaries(true),
      onFinally: () => {
        setConfirmDialogOpen(false);
        setSalaryIdToDelete(null);
      },
      onSuccessMessage: 'Salary deleted successfully!',
      onErrorMessage: 'Failed to delete Salary. Please try again.'
    });
  };

  return (
    <Box sx={{ backgroundColor: '#ffff', p: isMobile ? 1 : 3, borderRadius: 2 }}>
      <Paper style={{ padding: isMobile ? '10px' : '20px', marginBottom: '20px' }}>
        <Box marginBottom="16px">
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
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
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  sx={{
                    minWidth: isMobile ? 'unset' : 'unset',
                    fontSize: isMobile ? '0.7rem' : '0.875rem',
                    px: isMobile ? 1 : 2,
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <>
              <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems={isMobile ? 'stretch' : 'center'}
                gap="10px"
                marginBottom={2}
              >
                {canCreateSettings && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenSalaryModal}
                    style={{ height: '40px' }}
                    startIcon={<Add />}
                    disabled={loading}
                    fullWidth={isMobile}
                  >
                    {isMobile ? 'Add' : 'Add New Salary'}
                  </Button>
                )}
                <SearchBar
                  variant="outlined"
                  placeholder="SEARCH BY NAME"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  disabled={loading}
                  style={{
                    maxWidth: isMobile ? '100%' : '300px',
                    marginRight: isMobile ? '0' : '16px'
                  }}
                  fullWidth={isMobile}
                />

                {!isMobile && <Box flexGrow={1} />}
              </Box>

              <Box sx={{
                position: 'relative',
                minHeight: 200,
              }}>
                {initialLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                    <InfiniteScrollWrapper
                      dataLength={filteredSalaryData.length}
                      next={() => fetchSalaries()}
                      hasMore={hasMore}
                      loading={loadingMore}
                    >
                      <Table
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          '& .MuiTableCell-root': {
                            border: '1px solid rgba(224, 224, 224, 1)',
                            padding: isMobile ? '6px 8px' : '8px 12px',
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                          },
                          '& .MuiTableHead-root': {
                            position: 'sticky',
                            top: 0,
                            zIndex: 2, // Higher than the body cells
                            backgroundColor: '#f5f5f5'
                          },
                          '& .MuiTableCell-head': {
                            fontWeight: 'bold',
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '50px' : '100px' }}>S.NO</TableCell>
                            <TableCell align="center" style={{ minWidth: isMobile ? '120px' : '150px' }}>SALARY NAME</TableCell>
                            <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '80px' : '100px' }}>AMOUNT</TableCell>
                            <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '100px' : '120px' }}>PAYMENT MODE</TableCell>
                            <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '80px' : '100px' }}>TAXABLE</TableCell>
                            {canManageSettings && <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: isMobile ? '90px' : '150px' }}>ACTIONS</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredSalaryData.length > 0 ? (
                            filteredSalaryData.map((row, index) => (
                              <TableRow key={row.id} hover>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell align="center">{row.salaryName?.toUpperCase()}</TableCell>
                                <TableCell align="center">{row.amount}</TableCell>
                                <TableCell align="center">{(row.paymentMode || 'MONTHLY')?.toUpperCase()}</TableCell>
                                <TableCell align="center">{(row.taxable ? 'Yes' : 'No')?.toUpperCase()}</TableCell>
                                {canManageSettings && (
                                  <TableCell align="center">
                                    {canEditSettings && (
                                      <Tooltip title="Edit">
                                        <IconButton
                                          onClick={() => handleEditSalary(row.id)}
                                          color="primary"
                                          size={isMobile ? "small" : "medium"}
                                        >
                                          <Edit fontSize={isMobile ? "small" : "medium"} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {canDeleteSettings && (
                                      <Tooltip title="Delete">
                                        <IconButton
                                          onClick={() => handleDeleteSalary(row.id)}
                                          color="error"
                                          size={isMobile ? "small" : "medium"}
                                        >
                                          <Delete fontSize={isMobile ? "small" : "medium"} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Nodatapage />
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </InfiniteScrollWrapper>
                  </Box>
                )}
              </Box>
              <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this Salary?"
                confirmText="Delete"
              />
              <Dialog
                open={openSalaryModal}
                onClose={handleCloseSalaryModal}
                maxWidth="sm"
                fullWidth
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
                    <Typography variant="h6" sx={{ fontFamily: 'Marquis', fontWeight: 'bold' }}>
                      {isEditing ? 'EDIT SALARY' : 'NEW SALARY'}
                    </Typography>
                  </Box>
                </DialogTitle>

                <DialogContent>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Salary Name"
                        name="salaryName"
                        value={newSalary.salaryName}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        required
                        inputProps={{
                          maxLength: 50,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={newSalary.amount}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        required
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Payment Mode"
                        name="paymentMode"
                        value={newSalary.paymentMode}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                        required
                      >
                        {paymentModes.map(mode => (
                          <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Taxable"
                        name="taxable"
                        value={newSalary.taxable}
                        onChange={handleInputChange}
                        variant="outlined"
                        margin="normal"
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleCloseSalaryModal}
                    color="primary"
                    variant="outlined"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSalary}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <Edit /> : <Add />)}
                  >
                    {isEditing ? 'Update' : 'ADD'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <StaffSalary />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SalaryManagement;