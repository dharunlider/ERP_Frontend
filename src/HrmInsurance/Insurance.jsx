import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Typography, Box, TextField, Menu, MenuItem,
  InputAdornment, Tabs, Tab, Tooltip, IconButton,
  TableContainer, useMediaQuery, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Search, PictureAsPdf, GridOn, Print } from '@mui/icons-material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AddInsurance from './AddInsurance';
import EditInsurance from './EditInsurance';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import { format, parseISO } from 'date-fns';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import SearchBar from '../Constants/SearchBar'

const Insurance = () => {
  const [insuranceData, setInsuranceData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditingView, setIsEditingView] = useState(false);
  const [currentInsurance, setCurrentInsurance] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [insuranceToDelete, setInsuranceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const { user, role, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canEditHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'EDIT');
  const canDeleteHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'DELETE');
  const canManageHRM = canEditHRM || canDeleteHRM;
  const canCreateHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'CREATE');
  const [refreshKey, setRefreshKey] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Fetch insurance data with infinite scroll
  const fetchInsuranceData = async (reset = false) => {
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

      const response = await axios.get('/insurance/staff-insurance', { params });
      const newData = response.data;

      setInsuranceData(prev => reset ? newData : [...prev, ...newData]);
      setHasMore(newData.length >= 10);
      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (error) {
      console.error('Error fetching insurance data:', error);
      toast.error('Failed to load insurance data');
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchInsuranceData(true);
  }, []);

  // Reset and fetch data when filter changes
  useEffect(() => {
    fetchInsuranceData(true);
  }, [filterText]);

  const handleExportClick = (event) => setAnchorEl(event.currentTarget);
  const handleExportClose = () => setAnchorEl(null);

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['S.NO', 'Staff Name', 'Job Position', 'Insurance Book', 'Health Insurance', 'City Code', 'Medical Care', 'Start Date', 'End Date']],
      body: filteredData.map((row, index) => [
        index + 1,
        row.staffName,
        row.jobPosition,
        row.bookNumber,
        row.healthInsuranceNumber,
        row.cityCode,
        row.registrationOfMedicalCare,
        formatDate(row.startDate),
        formatDate(row.endDate)
      ])
    });
    doc.save('insurance_data.pdf');
    handleExportClose();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row, index) => ({
        'S.NO': index + 1,
        'Staff Name': row.staffName,
        'Job Position': row.jobPosition,
        'Insurance Book': row.bookNumber,
        'Health Insurance': row.healthInsuranceNumber,
        'City Code': row.cityCode,
        'Medical Care': row.registrationOfMedicalCare,
        'Start Date': formatDate(row.startDate),
        'End Date': formatDate(row.endDate)
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurance');
    XLSX.writeFile(workbook, 'insurance_data.xlsx');
    handleExportClose();
  };

  const exportToCSV = () => {
    const headers = ['S.NO', 'Staff Name', 'Job Position', 'Insurance Book', 'Health Insurance', 'City Code', 'Medical Care', 'Start Date', 'End Date'];
    const csvData = [
      headers.join(','),
      ...filteredData.map((row, index) => [
        index + 1,
        row.staffName,
        row.jobPosition,
        row.bookNumber,
        row.healthInsuranceNumber,
        row.cityCode,
        row.registrationOfMedicalCare,
        formatDate(row.startDate),
        formatDate(row.endDate)
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'insurance_data.csv');
    handleExportClose();
  };

  const handlePrint = () => {
    window.print();
    handleExportClose();
  };

  const handleTabChange = (e, val) => setActiveTab(val);

  const handleAddInsurance = (newInsurance) => {
    setInsuranceData(prev => [newInsurance, ...prev]);
    setActiveTab(0);
    fetchInsuranceData(true); // Refresh data
  };

  const handleEditInsurance = (id) => {
    const record = insuranceData.find(item => item.id === id);
    setCurrentInsurance(record);
    setIsEditingView(true);
  };

  const handleCancelEdit = () => setIsEditingView(false);

  const handleSaveInsurance = (updated) => {
    setInsuranceData(prev => prev.map(item => item.id === updated.id ? updated : item));
    setIsEditingView(false);
    fetchInsuranceData(true); // Refresh data
  };

  const handleDeleteClick = (id) => {
    setInsuranceToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!insuranceToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/insurance/delete/${insuranceToDelete}`);
      setInsuranceData(prev => prev.filter(item => item.id !== insuranceToDelete));
      toast.success('Insurance deleted successfully');
    } catch (error) {
      console.error('Error deleting insurance:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.details ||
        'Failed to delete insurance record';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setInsuranceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setInsuranceToDelete(null);
  };

  const filteredData = insuranceData.filter(row =>
    Object.values(row).some(value =>
      value && value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  if (isEditingView) {
    return (
      <EditInsurance
        currentInsurance={currentInsurance}
        onCancelEdit={handleCancelEdit}
        onSaveInsurance={handleSaveInsurance}
        onDeleteInsurance={handleDeleteClick}
      />
    );
  }

  return (
    <>
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
        <Tab label="INSURANCE LIST" />
        {canCreateHRM && <Tab label="ADD INSURANCE" />}
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            alignItems={isMobile ? 'stretch' : 'center'}
            flexWrap="wrap"
            gap={isMobile ? 2 : 2}
            mb={2}
          >
            {canCreateHRM && (
              <Box sx={{ flex: isMobile ? '1 1 auto' : 'none', minWidth: isMobile ? '100%' : '150px' }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab(1)}
                  startIcon={<Add />}
                  sx={{ height: 40 }}
                  fullWidth={isMobile}
                >
                  Add Insurance
                </Button>
              </Box>
            )}
            <Box sx={{ flex: isMobile ? '1 1 auto' : 'none', minWidth: isMobile ? '100%' : '300px' }}>
               <SearchBar
             
                placeholder="STAFF NAME & JOB POSITION "
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                               style={{
                                maxWidth: isMobile ? '100%' : '300px',
                                marginRight: isMobile ? '0' : '16px'
                            }}
                            fullWidth={isMobile}
                        />
            </Box>

            <Box sx={{ flexGrow: 1, display: isMobile ? 'none' : 'block' }} />

            <Box sx={{ flex: isMobile ? '1 1 auto' : 'none', minWidth: isMobile ? '100%' : '120px' }}>
              <Button
                variant="contained"
                onClick={handleExportClick}
                startIcon={<ExportIcon />}
                sx={{ height: 40, width: '100%' }}
              >
                Export
              </Button>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleExportClose}>
              <MenuItem onClick={exportToPDF}><PictureAsPdf fontSize="small" sx={{ mr: 1 }} />Export to PDF</MenuItem>
              <MenuItem onClick={exportToExcel}><GridOn fontSize="small" sx={{ mr: 1 }} />Export to Excel</MenuItem>
              <MenuItem onClick={exportToCSV}><GridOn fontSize="small" sx={{ mr: 1 }} />Export to CSV</MenuItem>
              <MenuItem onClick={handlePrint}><Print fontSize="small" sx={{ mr: 1 }} />Print</MenuItem>
            </Menu>
          </Box>

          <TableContainer sx={{ maxHeight: 400, overflowX: 'auto' }}>
            {initialLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                <InfiniteScrollWrapper
                  dataLength={filteredData.length}
                  next={() => fetchInsuranceData()}
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
                        zIndex: 2,
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
                        <TableCell align="center">S.NO</TableCell>
                        <TableCell align="center">STAFF NAME</TableCell>
                        <TableCell align="center">JOB POSITION</TableCell>
                        <TableCell align="center">INSURANCE BOOK</TableCell>
                        <TableCell align="center">HEALTH INSURANCE</TableCell>
                        <TableCell align="center">CITY CODE</TableCell>
                        <TableCell align="center">MEDICAL CARE</TableCell>
                        <TableCell align="center">START DATE</TableCell>
                        <TableCell align="center">END DATE</TableCell>
                        {canManageHRM && <TableCell align="center">ACTIONS</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((row, index) => (
                          <TableRow key={row.id} hover>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center">{row.staffName}</TableCell>
                            <TableCell align="center">{row.jobPosition}</TableCell>
                            <TableCell align="center">{row.bookNumber}</TableCell>
                            <TableCell align="center">{row.healthInsuranceNumber}</TableCell>
                            <TableCell align="center">{row.cityCode}</TableCell>
                            <TableCell align="center">{row.registrationOfMedicalCare}</TableCell>
                            <TableCell align="center">{formatDate(row.startDate)}</TableCell>
                            <TableCell align="center">{formatDate(row.endDate)}</TableCell>
                            {canManageHRM && (
                              <TableCell align="center">
                                {canEditHRM && (
                                  <Tooltip title="Edit">
                                    <IconButton
                                      onClick={() => handleEditInsurance(row.id)}
                                      color="primary"
                                      size={isMobile ? "small" : "medium"}
                                    >
                                      <Edit fontSize={isMobile ? "small" : "medium"} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {canDeleteHRM && (
                                  <Tooltip title="Delete">
                                    <IconButton
                                      onClick={() => handleDeleteClick(row.id)}
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
                          <TableCell colSpan={10} align="center">
                            <Nodatapage />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </InfiniteScrollWrapper>
              </Box>
            )}
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Box mt={2}>
          <AddInsurance
            onAddInsurance={handleAddInsurance}
            onCancel={() => setActiveTab(0)}
          />
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this insurance record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            autoFocus
            disabled={isDeleting}
            variant="contained"
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              }
            }}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Insurance; 