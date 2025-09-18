import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Button, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Menu, MenuItem, InputAdornment, Tooltip, IconButton,
  useMediaQuery, useTheme, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Search, FileDownload as ExportIcon } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from '../Axiosinstance';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import SearchBar from '../Constants/SearchBar'

const AllowanceManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [allowanceData, setAllowanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAllowanceModal, setOpenAllowanceModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAllowanceId, setCurrentAllowanceId] = useState(null);
  const [newAllowance, setNewAllowance] = useState({
    allowanceTypeName: '',
    amount: '',
    taxable: 'No',
  });
  const [filterText, setFilterText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [allowancetypeIdToDelete, setAllowancetypeIdToDelete] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { role, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canEditSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'EDIT');
  const canDeleteSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'DELETE');
  const canManageSettings = canEditSettings || canDeleteSettings;
  const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');

  // Fetch all allowances from API
  const fetchAllowances = async (reset = false) => {
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

      const response = await axios.get('/hrm-allowancetype', { params });
      const newData = response.data.map(item => ({
        id: item.id || item._id,
        allowanceTypeName: item.allowanceTypeName || item.name || item.allowance_name || 'N/A',
        amount: item.amount || item.value || 0,
        taxable: item.taxable ? 'Yes' : 'No'
      }));

      setAllowanceData(prev => reset ? newData : [...prev, ...newData]);
      setHasMore(newData.length >= 10);
      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (error) {
      console.error('Error fetching allowances:', error);
      toast.error('Failed to fetch allowances. Please try again.');
      setAllowanceData([]);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchAllowances(true);
  }, []);

  // Reset and fetch data when filter changes
  useEffect(() => {
    fetchAllowances(true);
  }, [filterText]);

  const handleOpenAllowanceModal = () => {
    setOpenAllowanceModal(true);
    setIsEditing(false);
    setNewAllowance({
      allowanceTypeName: '',
      amount: '',
      taxable: 'No',
    });
  };

  const handleCloseAllowanceModal = () => {
    setOpenAllowanceModal(false);
    setNewAllowance({
      allowanceTypeName: '',
      amount: '',
      taxable: 'No',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAllowance(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToPDF = () => {
    if (allowanceData.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'Allowance Name', 'Amount', 'Taxable']],
      body: allowanceData.map((row) => [row.id, row.allowanceTypeName, row.amount, row.taxable]),
    });
    doc.save('Allowances.pdf');
    toast.success('Exported to PDF successfully');
    handleExportClose();
  };

  const exportToExcel = () => {
    if (allowanceData.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(allowanceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Allowances');
    XLSX.writeFile(workbook, 'Allowances.xlsx');
    toast.success('Exported to Excel successfully');
    handleExportClose();
  };

  const exportToCSV = () => {
    if (allowanceData.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = ['ID', 'Allowance Name', 'Amount', 'Taxable'];
    const csvData = [
      headers.join(','),
      ...allowanceData.map(row => [row.id, `"${row.allowanceTypeName}"`, row.amount, row.taxable].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'Allowances.csv');
    toast.success('Exported to CSV successfully');
    handleExportClose();
  };

  const handlePrint = () => {
    if (allowanceData.length === 0) {
      toast.warning('No data to print');
      return;
    }
    window.print();
    toast.success('Print initiated successfully');
    handleExportClose();
  };

  const handleAddAllowance = async () => {
    if (!newAllowance.allowanceTypeName.trim() || !newAllowance.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        allowanceTypeName: newAllowance.allowanceTypeName,
        amount: parseFloat(newAllowance.amount),
        taxable: newAllowance.taxable === 'Yes'
      };

      if (isEditing) {
        await axios.put(`/hrm-allowancetype/${currentAllowanceId}`, payload);
        toast.success('Allowance updated successfully');
      } else {
        await axios.post('/hrm-allowancetype', payload);
        toast.success('Allowance Created successfully');
      }
      await fetchAllowances(true);
      handleCloseAllowanceModal();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} allowance:`, error);
      toast.error(error.response?.data?.details || error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} allowance`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAllowance = (id) => {
    const allowanceToEdit = allowanceData.find(allowance => allowance.id === id);
    if (allowanceToEdit) {
      setNewAllowance({
        allowanceTypeName: allowanceToEdit.allowanceTypeName,
        amount: allowanceToEdit.amount,
        taxable: allowanceToEdit.taxable
      });
      setCurrentAllowanceId(id);
      setIsEditing(true);
      setOpenAllowanceModal(true);
    }
  };

  const handleDeleteAllowancetype = (id) => {
    setAllowancetypeIdToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    deleteEntity({
      endpoint: '/hrm-allowancetype',
      entityId: allowancetypeIdToDelete,
      fetchDataCallback: () => fetchAllowances(true),
      onFinally: () => {
        setConfirmDialogOpen(false);
        setAllowancetypeIdToDelete(null);
      },
      onSuccessMessage: 'Allowance deleted successfully!',
      onErrorMessage: 'Failed to delete Allowance. Please try again.'
    });
  };

  const filteredAllowanceData = allowanceData.filter(row => {
    const searchText = filterText.toLowerCase();
    return (
      // String(row.id).toLowerCase().includes(searchText) ||
      row.allowanceTypeName.toLowerCase().includes(searchText) ||
      String(row.amount).toLowerCase().includes(searchText)
      // row.taxable.toLowerCase().includes(searchText)
    );
  });

  return (
    <>
      <Paper sx={{ p: 3, overflow: 'hidden' }}>
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'stretch' : 'center'}
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >
          {canCreateSettings && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAllowanceModal}
              sx={{ height: 40, minWidth: 200 }}
              startIcon={<Add />}
            >
              Add New Allowance
            </Button>
          )}
          <SearchBar
            variant="outlined"
            placeholder="SEARCH BY NAME"
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
            onClick={handleExportClick}
            startIcon={<ExportIcon />}
            style={{
              height: '40px',
              marginLeft: isMobile ? '0' : 'auto'
            }}
            fullWidth={isMobile}
          >
            {isMobile ? 'Export' : 'Export'}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleExportClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={exportToPDF} disabled={filteredAllowanceData.length === 0}>
              Export to PDF
            </MenuItem>
            <MenuItem onClick={exportToExcel} disabled={filteredAllowanceData.length === 0}>
              Export to Excel
            </MenuItem>
            <MenuItem onClick={exportToCSV} disabled={filteredAllowanceData.length === 0}>
              Export to CSV
            </MenuItem>
            <MenuItem onClick={handlePrint} disabled={filteredAllowanceData.length === 0}>
              Print
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ position: 'relative', minHeight: 200 }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
              <InfiniteScrollWrapper
                dataLength={filteredAllowanceData.length}
                next={() => fetchAllowances()}
                hasMore={hasMore}
                loading={loadingMore}
              >
                <TableContainer component={Paper}>
                  <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{
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
                    }
                  }}>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ minWidth: isMobile ? '50px' : '80px' }}>S.NO</TableCell>
                        <TableCell align="center" sx={{ minWidth: isMobile ? '120px' : '200px' }}>ALLOWANCE NAME</TableCell>
                        <TableCell align="center" sx={{ minWidth: isMobile ? '80px' : '120px' }}>AMOUNT</TableCell>
                        <TableCell align="center" sx={{ minWidth: isMobile ? '80px' : '120px' }}>TAXABLE</TableCell>
                        {canManageSettings && <TableCell align="center" sx={{ minWidth: isMobile ? '100px' : '150px' }}>ACTIONS</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAllowanceData.length > 0 ? (
                        filteredAllowanceData.map((row, index) => (
                          <TableRow key={row.id} hover>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center" sx={{ textTransform: 'uppercase', fontFamily: 'Marquis' }}>
                              {row.allowanceTypeName}
                            </TableCell>
                            <TableCell align="center">{row.amount}</TableCell>
                            <TableCell align="center" sx={{ textTransform: 'uppercase', fontFamily: 'Marquis' }}>
                              {row.taxable}
                            </TableCell>
                            {canManageSettings && (
                              <TableCell align="center">
                                {canEditSettings && (
                                  <Tooltip title="Edit">
                                    <IconButton
                                      onClick={() => handleEditAllowance(row.id)}
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
                                      onClick={() => handleDeleteAllowancetype(row.id)}
                                      color="error"
                                      size={isMobile ? "small" : "medium"}
                                      sx={{ ml: 1 }}
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
                          <TableCell colSpan={5} align="center">
                            <Nodatapage />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </InfiniteScrollWrapper>
            </Box>
          )}
        </Box>
        <ConfirmDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message="Are you sure you want to delete this Allowancetype?"
          confirmText="Delete"
        />
        <Dialog open={openAllowanceModal} onClose={handleCloseAllowanceModal} maxWidth="sm" fullWidth>

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
                {isEditing ? 'EDIT ALLOWANCE' : 'NEW ALLOWANCE'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allowance Name"
                  name="allowanceTypeName"
                  value={newAllowance.allowanceTypeName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value) && value.length <= 50) {
                      handleInputChange(e);
                    }
                  }}
                  margin="normal"
                  required
                  disabled={loading}
                  inputProps={{
                    placeholder: "Enter Allowance Name (e.g. Transport, Housing)",
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={newAllowance.amount}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  disabled={loading}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Taxable"
                  name="taxable"
                  value={newAllowance.taxable}
                  onChange={handleInputChange}
                  margin="normal"
                  disabled={loading}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseAllowanceModal}
              color="primary"
              variant="outlined"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAllowance}
              color="primary"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <Edit /> : <Add />)}
            >
              {isEditing ? 'Update' : 'ADD'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </>
  );
};

export default AllowanceManagement;