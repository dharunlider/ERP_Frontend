import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  IconButton,
  CssBaseline,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import EditRole from "./RoleEdit";
import axios from "./Axiosinstance";
import { toast } from 'react-toastify';
import { useTheme, useMediaQuery } from '@mui/material';
import CreateRole from "./CreateRole";
import Nodatapage from './Nodatapage.jsx';


const Roles = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [rolePermissionData, setRolePermissionData] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

  const tabHeaders = ["ROLES", "ROLE PERMISSION"];

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/roles/all');
      const data = response.data.content || response.data;
      setRolePermissionData(data);
    } catch (err) {
      // toast.error('FAILED TO FETCH ROLES');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const refreshData = () => {
    fetchRoles();
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredData = rolePermissionData.filter((row) => {
    const matchesId = row.roleId?.toString().toLowerCase().includes(filterText.toLowerCase());
    const matchesName = row.roleName?.toLowerCase().includes(filterText.toLowerCase());
    return matchesId || matchesName;
  });
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const handleRolePermission = (newRole) => {
    const roleWithUpperCase = {
      ...newRole,
      roleName: newRole.roleName.toUpperCase()
    };
    setRolePermissionData(prev => [roleWithUpperCase, ...prev]);
    setActiveTab(0);
    toast.success('Role Created Successfully');
    refreshData();
  };

  const handleEdit = (row) => {
    setCurrentRole(row);
    setIsEditingRole(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/roles/${roleToDelete.roleId}`);
      toast.success('Role Deleted Successfully');
      refreshData();
    } catch (err) {
     const errorMessage =
      err.response?.data?.details ||
      err.response?.data?.message ||
      'Failed to delete role. Please try again.';
    toast.error(errorMessage);
    }
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const handleSaveRole = (updatedRole) => {
    const roleWithUpperCase = {
      ...updatedRole,
      roleName: updatedRole.roleName.toUpperCase()
    };
    setRolePermissionData(prev =>
      prev.map(role =>
        role.roleId === updatedRole.roleId ? roleWithUpperCase : role
      )
    );
    setIsEditingRole(false);
    refreshData();
  };

  const handleCancelEdit = () => {
    setIsEditingRole(false);
  };

  if (isEditingRole) {
    return (
      <EditRole
        currentRole={currentRole}
        onSave={handleSaveRole}
        onCancel={handleCancelEdit}
        onTabChange={setActiveTab}
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
        {tabHeaders.map((header, index) => (
          <Tab key={index} label={header} style={{ textTransform: 'uppercase', fontFamily: "Marquis" }} />
        ))}
      </Tabs>
      <Box sx={{ backgroundColor: 'rgb(233, 248, 240)', minHeight: '100vh' }}>
        <CssBaseline />


        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete the Role "{roleToDelete?.roleName.toUpperCase()}"?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>CANCEL</Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{
                backgroundColor: '#D32F2F',
                '&:hover': {
                  backgroundColor: '#b71c1c'
                },
                color: '#fff'
              }}
            >
              DELETE
            </Button>


          </DialogActions>
        </Dialog>

        <Paper style={{ padding: '24px', margin: '24px' }}>


          {activeTab === 0 && (
            <>
              <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                alignItems={isMobile ? 'stretch' : 'center'}
                gap={2}
                mb={2}
              >
                <Button
                  fullWidth={isMobile}
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(1)}
                  startIcon={<Add />}
                  sx={{
                    height: '40px',
                    textTransform: 'uppercase',
                    fontFamily: 'Marquis',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  }}
                >
                  NEW ROLE
                </Button>

                <TextField
                  fullWidth={isMobile}
                  variant="outlined"
                  placeholder="SEARCH ROLE"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    sx: {
                      height: '40px',
                      textTransform: 'uppercase',
                      fontFamily: 'Marquis',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                    },
                  }}
                  sx={{
                    maxWidth: isMobile ? '100%' : '300px',
                  }}
                />

                <Box flexGrow={1} />
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                  <CircularProgress />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '70vh',
                    overflow: 'auto',
                    position: 'relative'
                  }}
                >
                  <Table
                    sx={{
                      '& .MuiTableCell-root': {
                        border: '1px solid rgba(224, 224, 224, 1)',
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        fontFamily: "Marquis"
                      },
                      '& .MuiTableCell-head': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }
                    }}
                    size="small"
                    stickyHeader
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: '50px' }}>S.NO</TableCell>
                        <TableCell align="center" style={{ minWidth: '310px' }}>ROLE</TableCell>
                        <TableCell align="center" style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((row, index) => (
                          <TableRow key={`${row.roleId}-${index}`} hover>
                            <TableCell align="center" style={{
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              textTransform: "uppercase"
                            }}>
                              {index + 1}
                            </TableCell>
                            <TableCell align="center" style={{
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                              textTransform: "uppercase"
                            }}>
                              {row.roleName ? row.roleName.toUpperCase() : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="EDIT" arrow>
                                <IconButton
                                  onClick={() => handleEdit(row)}
                                  color="primary"
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                    }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="DELETE" arrow>
                                <IconButton
                                  onClick={() => handleDeleteClick(row)}
                                  color="error"
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: 'rgba(211, 47, 47, 0.08)'
                                    }
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            <Nodatapage />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </>
          )}

          {activeTab === 1 && (
            <Box marginTop="16px">
              <CreateRole
                onRoleCreated={handleRolePermission}
                onCancel={() => setActiveTab(0)}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default Roles;