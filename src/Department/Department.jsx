import React, { useState, useEffect } from 'react';
import {
  Paper, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell, Button,
  Box, TextField, Grid, InputAdornment, IconButton, Tooltip, useMediaQuery,
  useTheme, TableContainer, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Typography
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import Newdepartment from './Newdepartment.jsx';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import Nodatapage from '../Nodatapage.jsx';

const Department = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState(0);
  const [departmentData, setDepartmentData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [departmentIdToDelete, setDepartmentIdToDelete] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState({ id: '', name: '', email: '' });
  const [editErrors, setEditErrors] = useState({ name: '', email: '' });
  const [lastFetchedIds, setLastFetchedIds] = useState(new Set());

  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchDepartments = async (reset = false) => {
    if (reset) {
      setInitialLoading(true);
      setCursor(null);
      setLastFetchedIds(new Set()); // ✅ Clear previously fetched IDs
    } else {
      if (loadingMore || !hasMore) return;
      setLoadingMore(true);
    }

    try {
      const params = {
        size: 10,
        ...(cursor && !reset && { cursor }),
        ...(filterText && { search: filterText }),
      };

      const response = await axios.get('/departments/all-departments', { params });
      const newData = response.data;

      // ✅ Filter duplicates if not resetting
      const filteredData = reset
        ? newData
        : newData.filter((item) => !lastFetchedIds.has(item.id));

      setDepartmentData(prev => reset ? filteredData : [...prev, ...filteredData]);

      setLastFetchedIds(prev => {
        const newSet = reset ? new Set() : new Set(prev);
        filteredData.forEach((item) => newSet.add(item.id));
        return newSet;
      });

      setHasMore(filteredData.length >= 10);
      if (filteredData.length > 0) {
        setCursor(filteredData[filteredData.length - 1].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
      toast.error('Failed to load departments');
    } finally {
      reset ? setInitialLoading(false) : setLoadingMore(false);
    }
  };



  useEffect(() => {
    if (activeTab === 0) {
      if (filterText) {
        const filtered = departmentData.filter(dept =>
          dept.name.toLowerCase().includes(filterText.toLowerCase())
        );
        setDepartmentData(filtered);
      } else {
        fetchDepartments(true);
      }
    }
  }, [activeTab, filterText]);

  const handleAddSuccess = () => {
    fetchDepartments(true);
    setActiveTab(0);
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleEdit = (id) => {
    const department = departmentData.find((dept) => dept.id === id);
    if (department) {
      setSelectedDepartment(department);
      setEditModalOpen(true);
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    const name = selectedDepartment.name.trim();
    if (!name) newErrors.name = 'Department name is required';
    else if (name.length < 3) newErrors.name = 'Must be at least 3 characters';
    else if (name.length > 50) newErrors.name = 'Must be less than 50 characters';

    const email = selectedDepartment.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditErrors({});
    try {
      await axios.put(`/departments/${selectedDepartment.id}`, {
        name: selectedDepartment.name,
        email: selectedDepartment.email
      });
      toast.success('Department updated successfully!');
      fetchDepartments(true);
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.details || err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteDepartment = (id) => {
    setDepartmentIdToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    deleteEntity({
      endpoint: '/departments',
      entityId: departmentIdToDelete,
      fetchDataCallback: () => fetchDepartments(true),
      onFinally: () => {
        setConfirmDialogOpen(false);
        setDepartmentIdToDelete(null);
      },
      onErrorMessage: 'Failed to delete department. Please try again.'
    });
  };

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
          marginBottom: '5px',
          bgcolor: '#F0F4F8',
          padding: '8px 12px',
          // borderRadius: '12px',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#142a4f',
            // borderRadius: '8px',
            padding: '6px 18px',
            // margin: '0 8px',
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
        <Tab label="DEPARTMENT LIST" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
        <Tab label="ADD DEPARTMENT" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
      </Tabs>
      <Box sx={{ p: isMobile ? 2 : 3, minHeight: '100vh' }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
          {activeTab === 0 ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={12} sm="auto" justifyContent="flex-start">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setActiveTab(1)}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': { backgroundColor: theme.palette.primary.dark },
                      whiteSpace: 'nowrap',
                      width: '100%', // Ensures it takes full width on mobile
                      maxWidth: isMobile ? 'none' : '200px', // Controls max width for larger screens
                    }}
                  >
                    Add Department
                  </Button>
                </Grid>

                <Grid item xs={12} sm="auto">
                  <TextField
                    variant="outlined"
                    placeholder="Search By Name..."
                    size={isMobile ? "small" : "medium"}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1,
                        height: { xs: 36, sm: 40 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                    sx={{
                      minWidth: '100%', // Makes it full width on mobile
                      maxWidth: isMobile ? 'none' : '300px', // Controls max width on larger screens
                    }}
                  />
                </Grid>
              </Grid>

              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 2, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                {initialLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) :
                  <InfiniteScroll
                    dataLength={departmentData.length}
                    next={fetchDepartments}
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
                        <Typography variant="h6" color="textSecondary">
                          {departmentData.length > 0 ? 'No more departments to load' : ''}
                        </Typography>
                      </Box>
                    }
                    style={{ overflow: 'visible' }}
                  >
                    <Table sx={{ minWidth: 650, borderCollapse: 'separate', borderSpacing: 0 }} size={isMobile ? "small" : "medium"} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          {['ID', 'Name', 'Email', 'Actions'].map((heading, index) => (
                            <TableCell align="center"
                              key={heading}
                              sx={{
                                fontWeight: 'bold',
                                position: 'sticky',
                                top: 0,
                                backgroundColor: '#f5f5f5',
                                zIndex: 1,
                                borderRight: index < 3 ? '1px solid #e0e0e0' : 'none' // Apply border to all except last column
                              }}
                            >
                              {heading}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {departmentData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}


                            >
                              <Nodatapage />
                            </TableCell>
                          </TableRow>
                        ) : (
                          departmentData.map((row, index) => (
                            <TableRow
                              key={row.id}
                              sx={{
                                '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                '&:hover': { backgroundColor: '#f0f0f0' }
                              }}
                            >
                              <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0' }}>
                                {index + 1}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  textTransform: 'uppercase',
                                  fontFamily: 'Marquis',
                                  borderRight: '1px solid #e0e0e0'
                                }}
                              >
                                {row.name}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  maxWidth: isMobile ? '120px' : 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  borderRight: '1px solid #e0e0e0'
                                }}
                              >
                                {row.email.toUpperCase()}
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      onClick={() => handleEdit(row.id)}
                                      size={isMobile ? "small" : "medium"}
                                      sx={{
                                        color: theme.palette.primary.main,
                                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                                      }}
                                    >
                                      <Edit fontSize={isMobile ? "small" : "medium"} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      onClick={() => handleDeleteDepartment(row.id)}
                                      size={isMobile ? "small" : "medium"}
                                      sx={{
                                        color: theme.palette.error.main,
                                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' }
                                      }}
                                    >
                                      <Delete fontSize={isMobile ? "small" : "medium"} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </InfiniteScroll>
                }
              </TableContainer>
            </>
          ) : (
            <Newdepartment onAddSuccess={handleAddSuccess} onClose={() => setActiveTab(0)} />
          )}

          <ConfirmDialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
            onConfirm={confirmDelete}
            title="Confirm Deletion"
            message="Are you sure you want to delete this Department?"
            confirmText="Delete"
          />
          <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, p: 2 } }}>
            <DialogTitle sx={{ fontFamily: "Marquis", fontSize: "24px" }}>EDIT DEPARTMENT</DialogTitle>
            <DialogContent>
              <TextField
                label="Department Name"
                fullWidth
                margin="normal"
                variant="outlined"
                value={selectedDepartment.name}
                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, name: e.target.value })}
                error={!!editErrors.name}
                helperText={editErrors.name}
                inputProps={{ minLength: 2, maxLength: 50 }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={selectedDepartment.email}
                onChange={(e) => setSelectedDepartment({ ...selectedDepartment, email: e.target.value })}
                error={!!editErrors.email}
                helperText={editErrors.email}
              />
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setEditModalOpen(false)} variant="outlined" sx={{ mr: 2, color: theme.palette.text.secondary, borderColor: theme.palette.divider }}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}>Save Changes</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </>
  );
};

export default Department;


