import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography,
  Box, TextField, Menu, MenuItem, InputAdornment, Tabs, Tab, Avatar, IconButton,
  Tooltip, useMediaQuery, useTheme, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TableContainer
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import CreateContract from './CreateContract';
import ContractModal from './ContractModal';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import SearchBar from '../Constants/SearchBar'

const Contract = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [contractData, setContractData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openContractModal, setOpenContractModal] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, role, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canEditContracts = isAdmin || hasPermission(featurePermissions, 'Contracts', 'EDIT');
  const canDeleteContracts = isAdmin || hasPermission(featurePermissions, 'Contracts', 'DELETE');
  const canManageContracts = canEditContracts || canDeleteContracts;
  const canCreateContracts = isAdmin || hasPermission(featurePermissions, 'Contracts', 'CREATE');
  const [cursor, setCursor] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tabHeaders = ['CONTRACT LIST', ...(canCreateContracts ? ['CREATE NEW CONTRACT'] : [])];

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
        ...(searchTerm && { search: searchTerm })
      };

      const response = await axios.get('/staff-contracts', { params });
      const newData = response.data;

      setContractData(prev => reset ? newData : [...prev, ...newData]);
      setHasMore(newData.length >= 10);
      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts. Please try again later.');
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchContracts(true);
  }, []);

  // Reset and fetch data when search term changes
  useEffect(() => {
    fetchContracts(true);
  }, [searchTerm]);

  const filteredData = contractData.filter(contract => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toUpperCase();
    const idString = contract.id.toString();
    return (
      // idString === searchTerm ||
      idString.includes(searchTerm) ||
      contract.contractCode.toUpperCase().includes(searchTermLower) ||
      (contract.contractId?.contractId?.toUpperCase().includes(searchTermLower)) ||
      contract.staff.name.toUpperCase().includes(searchTermLower)
      // contract.startDate.toUpperCase().includes(searchTermLower) ||
      // contract.endDate.toUpperCase().includes(searchTermLower) ||
      // contract.contractStatus.toUpperCase().includes(searchTermLower)
    );
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddContract = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab(0);
    fetchContracts(true); // Refresh data
  };

  const handleEditContract = (contractId) => {
    setSelectedContractId(contractId);
    setOpenContractModal(true);
  };

  const handleCloseModal = () => {
    setOpenContractModal(false);
    setSelectedContractId(null);
  };

  const handleUpdateContract = () => {
    setRefreshKey(prev => prev + 1);
    fetchContracts(true); // Refresh data
    handleCloseModal();
  };

  const handleDeleteClick = (id) => {
    setContractToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/staff-contracts/${contractToDelete}`);
      setRefreshKey(prev => prev + 1);
      fetchContracts(true); // Refresh data
      toast.success('Contract deleted successfully!');
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setContractToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setContractToDelete(null);
  };

    const handleExport = async () => {
    try {
      const response = await axios.get("/staff-contracts/excel/export", {
        responseType: "blob", // important for binary data
      });
      // Create file URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Staff_contract.xlsx"); // file name
      document.body.appendChild(link);
      link.click();
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting file:", error);
    }
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
          <Tab key={index} label={header} />
        ))}
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            alignItems={isMobile ? 'stretch' : 'center'}
            justifyContent="space-between"
            flexWrap="wrap"
            gap={isMobile ? 2 : 2}
            mb={2}
          >
            {canCreateContracts && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveTab(1)}
                startIcon={<Add />}
                sx={{ height: '40px', flexShrink: 0 }}
                fullWidth={isMobile}
              >
                Add Contract
              </Button>
            )}
            <SearchBar

              placeholder="SEARCH BY CODE & ID"
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
              onClick={handleExport}
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

          <TableContainer sx={{ maxHeight: 400, overflowX: 'auto' }}>
            {initialLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                <InfiniteScrollWrapper
                  dataLength={filteredData.length}
                  next={() => fetchContracts()}
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
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>S.NO</TableCell>
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Contract Code</TableCell>
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Contract ID</TableCell>
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Staff</TableCell>
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Start Date</TableCell>
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>End Date</TableCell>
                        <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Status</TableCell>
                        {canManageContracts && <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                          >
                            <Nodatapage />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((row, index) => (
                          <TableRow key={row.id || index} hover>
                            <TableCell align="center">{index + 1}</TableCell>
                            <TableCell align="center" sx={{ textTransform: 'uppercase' }}>{row.contractCode}</TableCell>
                            <TableCell align="center" sx={{ textTransform: 'uppercase' }}>{row.contractId?.contractId || 'N/A'}</TableCell>
                            <TableCell align="center" sx={{ textTransform: 'uppercase' }}>{row.staff?.name || 'N/A'}</TableCell>
                            <TableCell align="center">{row.startDate}</TableCell>
                            <TableCell align="center">{row.endDate}</TableCell>
                            <TableCell align="center" sx={{ textTransform: 'uppercase' }}>
                              <Box display="flex" alignItems="center">
                                {row.contractStatus}
                              </Box>
                            </TableCell>
                            {canManageContracts && (
                              <TableCell align="center">
                                {canEditContracts && (
                                  <Tooltip title="Edit">
                                    <IconButton onClick={() => handleEditContract(row.id)} color="primary">
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {canDeleteContracts && (
                                  <Tooltip title="Delete">
                                    <IconButton onClick={() => handleDeleteClick(row.id)} color="error">
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
            )}
          </TableContainer>
        </Paper>
      )}
      {activeTab === 1 && (
        <Box mt={2}>
          <CreateContract
            onAddContract={handleAddContract}
            onCancel={() => setActiveTab(0)}
          />
        </Box>
      )}

      <ContractModal
        open={openContractModal}
        onClose={handleCloseModal}
        currentId={selectedContractId}
        onUpdateContract={handleUpdateContract}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this contract?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
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
              },
              color: 'white',
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

export default Contract;