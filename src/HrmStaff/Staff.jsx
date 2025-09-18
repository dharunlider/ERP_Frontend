import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography, Box, TextField,
  InputAdornment, Tabs, Tab, IconButton, Tooltip, useMediaQuery, useTheme, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import { Search, Edit, Delete, Add } from '@mui/icons-material';
import Newstaff from './Newstaff';
import EditStaff from './EditStaff';
import axios from '../Axiosinstance';
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import { downloadFile } from "../Constants/Constants";
import SearchBar from '../Constants/SearchBar'

const Staff = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { role, featurePermissions } = useUser();

  // Memoize permission checks
  const isAdmin = role === 'ADMIN';
  const canEditStaff = useMemo(() => isAdmin || hasPermission(featurePermissions, 'Staff', 'EDIT'), [isAdmin, featurePermissions]);
  const canDeleteStaff = useMemo(() => isAdmin || hasPermission(featurePermissions, 'Staff', 'DELETE'), [isAdmin, featurePermissions]);
  const canManageStaff = useMemo(() => canEditStaff || canDeleteStaff, [canEditStaff, canDeleteStaff]);
  const canCreateStaff = useMemo(() => isAdmin || hasPermission(featurePermissions, 'Staff', 'CREATE'), [isAdmin, featurePermissions]);
  const tabHeaders = useMemo(() => ['STAFF LIST', ...(canCreateStaff ? ['ADD NEW STAFF MEMBER'] : [])], [canCreateStaff]);

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
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Debounce search term with cleanup
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Stable fetch function with dependency optimization
  const fetchStaffData = useCallback(async (reset = false) => {
    if (!reset && loadingMore) return;

    reset ? setInitialLoading(true) : setLoadingMore(true);

    try {
      const params = {
        size: 10,
        ...(!reset && cursor && { cursor }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const response = await axios.get('/staff/allstaffs', { params });
      const newData = response.data.content || response.data;

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
      reset ? setInitialLoading(false) : setLoadingMore(false);
    }
  }, [cursor, debouncedSearchTerm, loadingMore]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchStaffData(true);
  }, [refreshKey, debouncedSearchTerm]);

  const handleUpdate = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleExportClick = useCallback(() => {
    downloadFile({
      url: "/staff/export",
      filename: "staff.xlsx",
      onStart: () => setDownloading(true),
      onComplete: () => setDownloading(false),
      onError: (err) => {
        setDownloading(false);
        toast.error("Failed to export: " + err.message);
      },
    });
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleAddStaff = useCallback((newStaff) => {
    const normalizedStaff = {
      ...newStaff,
      roleName: newStaff.role?.name || newStaff.roleName || newStaff.role || '-',
      departmentName: newStaff.department?.name || newStaff.departmentName || newStaff.department || '-'
    };
    setStaffData(prev => [normalizedStaff, ...prev]);
    setActiveTab(0);
  }, []);

  const handleEditEmployee = useCallback((id) => {
    const employee = staffData.find(emp => emp.id === id);
    setCurrentId(id);
    setCurrentEmployee(employee);
    setIsEditingView(true);
  }, [staffData]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingView(false);
  }, []);

  const handleSaveEmployee = useCallback((updatedEmployee) => {
    const normalizedEmployee = {
      ...updatedEmployee,
      roleName: updatedEmployee.role?.name || updatedEmployee.roleName || updatedEmployee.role || '-',
      departmentName: updatedEmployee.department?.name || updatedEmployee.departmentName || updatedEmployee.department || '-'
    };

    setStaffData(prev => prev.map(emp =>
      emp.id === currentId ? normalizedEmployee : emp
    ));
    setIsEditingView(false);
  }, [currentId]);

  const handleDeleteClick = useCallback((id) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
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
  }, [employeeToDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  // Memoize filtered staff to prevent unnecessary recalculations
  const filteredStaff = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return staffData.filter(employee => (
      (employee.name || employee.fullName || '').toLowerCase().includes(searchLower) ||
      (employee.email || '').toLowerCase().includes(searchLower) ||
      (employee.hrCode || '').toLowerCase().includes(searchLower) ||
      (employee.roleName.toLowerCase().includes(searchLower))
    ));
  }, [staffData, searchTerm]);

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
            gap={2}
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
                Add Staff
              </Button>
            )}
             <SearchBar
             placeholder="SEARCH BY NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                             style={{
                                maxWidth: isMobile ? '100%' : '300px',
                                marginRight: isMobile ? '0' : '16px'
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
              disabled={downloading}
              fullWidth={isMobile}
            >
              {downloading ? <CircularProgress size={24} /> : 'Export'}
            </Button>
          </Box>

              <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <InfiniteScrollWrapper
              dataLength={filteredStaff.length}
              next={() => fetchStaffData()}
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
                    <TableCell align="center">HR CODE</TableCell>
                    <TableCell align="center">FULL NAME</TableCell>
                    <TableCell align="center" > Email </TableCell>
                    <TableCell align="center">BIRTHDAY</TableCell>
                    <TableCell align="center" >GENDER</TableCell>
                    <TableCell align="center">ROLE</TableCell>
                    <TableCell align="center">STATUS</TableCell>
                    <TableCell align="center">DEPARTMENT</TableCell>
                    {canManageStaff && <TableCell align="center">ACTIONS</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.length === 0 && !initialLoading ? (
                    <TableRow>
                      <TableCell colSpan={canManageStaff ? 10 : 9} align="center">
                        <Nodatapage />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((row, index) => (
                      <TableRow key={`${row.id}-${index}`} hover>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{row.hrCode || '-'}</TableCell>
                        <TableCell align="center">{row.name || row.fullName || '-'}</TableCell>
                        <TableCell align="center">{row.email ? row.email.toUpperCase() : '-'}</TableCell>
                        <TableCell align="center">{row.birthday || '-'}</TableCell>
                        <TableCell align="center">{row.gender ? row.gender.toUpperCase() : '-'}</TableCell>
                        <TableCell align="center">{row.roleName}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.status || '-'}
                            size="small"
                            color={row.status === 'Active' ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">{row.departmentName}</TableCell>
                        {canManageStaff && (
                          <TableCell align="center">
                            {canEditStaff && (
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEditEmployee(row.id)}
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDeleteStaff && (
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => handleDeleteClick(row.id)}
                                  color="error"
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
            </InfiniteScrollWrapper>
          </Box>
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
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this staff member?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
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