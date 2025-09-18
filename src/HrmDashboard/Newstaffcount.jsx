import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography, Box, TextField,
  InputAdornment, Tabs, Tab, IconButton, Tooltip, useMediaQuery, useTheme, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, CircularProgress, TableContainer
} from '@mui/material';
import { Search, Edit, Delete, Add } from '@mui/icons-material';
import Newstaff from '../HrmStaff/EditStaff';
import EditStaff from '../HrmStaff/Newstaff';
import axios from '../Axiosinstance';
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import {
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import InfiniteScroll from 'react-infinite-scroll-component';
import { downloadFile } from "../Constants/Constants";

const Staff = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [staffData, setStaffData] = useState([]);
  const [isEditingView, setIsEditingView] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [error, setError] = useState(null);
  const { role, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canEditStaff = isAdmin || hasPermission(featurePermissions, 'Staff', 'EDIT');
  const canDeleteStaff = isAdmin || hasPermission(featurePermissions, 'Staff', 'DELETE');
  const canManageStaff = canEditStaff || canDeleteStaff;
  const canCreateStaff = isAdmin || hasPermission(featurePermissions, 'Staff', 'CREATE');
  const tabHeaders = ['STAFF LIST', ...(canCreateStaff ? ['ADD NEW STAFF MEMBER'] : [])];
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100000); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchStaffData = useCallback(async (reset = false) => {
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
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const response = await axios.get('/staff/new-staffs-this-month', { params });
      const newData = response.data.content || response.data;

      // Normalize the data structure
      const normalizedData = newData.map(staff => ({
        ...staff,
        roleName: staff.role?.name || staff.roleName || staff.role || '-',
        departmentName: staff.department?.name || staff.departmentName || staff.department || '-',
      }));

      setStaffData(prev => reset ? normalizedData : [...prev, ...normalizedData]);
      setHasMore(newData.length >= 10);
      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || err.message || 'Failed to fetch staff data');
      console.error('Error fetching staff data:', err);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [cursor, debouncedSearchTerm, loadingMore]);

  useEffect(() => {
    fetchStaffData(true);
  }, [refreshKey, debouncedSearchTerm]);

  const handleUpdate = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleExportClick = () => {
    downloadFile({
      url: "/staff/export",
      filename: "staff.xlsx",
      onStart: () => setDownloading(true),
      onComplete: () => setDownloading(false),
      onError: (err) => {
        setDownloading(false);
        alert("Failed to export: " + err.message);
      },
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddStaff = (newStaff) => {
    const normalizedStaff = {
      ...newStaff,
      roleName: newStaff.role?.name || newStaff.roleName || newStaff.role || '-',
      departmentName: newStaff.department?.name || newStaff.departmentName || newStaff.department || '-'
    };
    setStaffData(prev => [normalizedStaff, ...prev]);
    setActiveTab(0);
    fetchStaffData(true);
  };

  const handleEditEmployee = (id) => {
    const employee = staffData.find(emp => emp.id === id);
    setCurrentId(id);
    setCurrentEmployee(employee);
    setIsEditingView(true);
  };

  const handleCancelEdit = () => {
    setIsEditingView(false);
  };

  const handleSaveEmployee = (updatedEmployee) => {
    const normalizedEmployee = {
      ...updatedEmployee,
      roleName: updatedEmployee.role?.name || updatedEmployee.roleName || updatedEmployee.role || '-',
      departmentName: updatedEmployee.department?.name || updatedEmployee.departmentName || updatedEmployee.department || '-'
    };

    setStaffData(prev => prev.map(emp =>
      emp.id === currentId ? normalizedEmployee : emp
    ));
    setIsEditingView(false);
    fetchStaffData(true);
  };

  const handleDeleteClick = (id) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/staff/${employeeToDelete}`);
      setStaffData(prev => prev.filter(emp => emp.id !== employeeToDelete));
      setDeleteDialogOpen(false);
      toast.success('Staff member deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || err.message || 'Failed to delete staff');
      console.error('Error deleting staff:', err);
      toast.error('Failed to delete staff member');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const filteredStaff = staffData.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (employee.name || employee.fullName || '').toLowerCase().includes(searchLower) ||
      (employee.email || '').toLowerCase().includes(searchLower) ||
      (employee.hrCode || '').toLowerCase().includes(searchLower) ||
      (employee.roleName.toLowerCase().includes(searchLower))
    );
  });

  if (isEditingView) {
    return (
      <EditStaff
        currentEmployee={currentEmployee}
        onCancelEdit={handleCancelEdit}
        onSaveEmployee={handleSaveEmployee}
        setCurrentEmployee={setCurrentEmployee}
        onUpdate={handleUpdate}
      />
    );
  }

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
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
        {tabHeaders.map((header, index) => (
          <Tab key={index} label={header} />
        ))}
      </Tabs>
      <br />

      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            alignItems={isMobile ? 'stretch' : 'center'}
            justifyContent="space-between"
            flexWrap="wrap"
            gap={isMobile ? 2 : 2}
            mb={2}
          >
            {canCreateStaff && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(1)}
                startIcon={<Add />}
                sx={{ height: '40px', flexShrink: 0 }}
                fullWidth={isMobile}
              >
              ADD STAFF
              </Button>
            )}
            <TextField
              variant="outlined"
              placeholder="Search Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                style: { height: '40px' }
              }}
              sx={{
                minWidth: isMobile ? '100%' : 250,
                maxWidth: 300,
                flexShrink: 0,
              }}
              fullWidth={isMobile}
            />

            <Box flexGrow={1} display={isMobile ? 'none' : 'block'} />

            <Button
              variant="contained"
              onClick={handleExportClick}
              startIcon={<ExportIcon />}
              sx={{
                height: '40px',
                width: isMobile ? '100%' : 'auto',
                flexShrink: 0,
              }}
              fullWidth={isMobile}
            >
              Export
            </Button>
          </Box>

          <TableContainer sx={{ maxHeight: 400 }}>
            {initialLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ maxHeight: '70vh', position: 'relative' }}>
                <InfiniteScroll
                  dataLength={filteredStaff.length}
                  next={fetchStaffData}
                  hasMore={hasMore}
                  loader={
                    loadingMore && (
                      <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress />
                      </Box>
                    )
                  }
                  endMessage={
                    <Box textAlign="center" p={2}>
                      <Typography variant="body2" color="textSecondary">
                        {filteredStaff.length > 0 ? 'No more staff members to load' : ''}
                      </Typography>
                    </Box>
                  }
                  style={{ overflow: 'visible' }}
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
                        <TableCell align="center" style={{ minWidth: '50px' }}>S.NO</TableCell>
                        <TableCell align="center" style={{ minWidth: '80px' }}>HR CODE</TableCell>
                        <TableCell align="center" style={{ minWidth: '150px' }}>FULL NAME</TableCell>
                        <TableCell align="center" style={{ minWidth: '150px' }}>EMAIL</TableCell>
                        <TableCell align="center" style={{ minWidth: '100px' }}>BIRTHDAY</TableCell>
                        <TableCell align="center" style={{ minWidth: '80px' }}>GENDER</TableCell>
                        <TableCell align="center" style={{ minWidth: '100px' }}>ROLE</TableCell>
                        <TableCell align="center" style={{ minWidth: '100px' }}>STATUS</TableCell>
                        <TableCell align="center" style={{ minWidth: '100px' }}>DEPARTMENT</TableCell>
                        {canManageStaff && <TableCell align="center">ACTIONS</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStaff.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            <Nodatapage />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStaff.map((row, index) => (
                          <TableRow key={index + 1} hover>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{index + 1 || '-'}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.hrCode || '-'}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.name || row.fullName || '-'}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.email || '-'}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.birthday || '-'}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.gender || '-'}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.roleName}</TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                              <Chip
                                label={row.status || '-'}
                                size="small"
                                color={row.status === 'Active' ? "success" : "default"}
                              />
                            </TableCell>
                            <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{row.departmentName}</TableCell>
                            {canManageStaff && (
                              <TableCell align="center">
                                {canEditStaff && (
                                  <Tooltip title="Edit" arrow>
                                    <IconButton
                                      onClick={() => handleEditEmployee(row.id)}
                                      color="primary"
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                        },
                                      }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {canDeleteStaff && (
                                  <Tooltip title="Delete" arrow>
                                    <IconButton
                                      onClick={() => handleDeleteClick(row.id)}
                                      color="error"
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                        },
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </InfiniteScroll>
              </Box>
            )}
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Box mt={2}>
          <Newstaff onAddStaff={handleAddStaff} setActiveTab={setActiveTab} />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this staff member?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;