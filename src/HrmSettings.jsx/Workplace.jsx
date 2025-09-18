import React, { useState, useEffect } from 'react';
import {
    Paper, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography,
    Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
    InputAdornment, CircularProgress, Tooltip, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import { Add, Edit, Delete, Search,Cancel } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import Nodatapage from "../Nodatapage";
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper"
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import SearchBar from '../Constants/SearchBar'


const WorkplaceManagement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [workplaceData, setWorkplaceData] = useState([]);
    const [openWorkplaceModal, setOpenWorkplaceModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentWorkplaceId, setCurrentWorkplaceId] = useState(null);
    const [newWorkplace, setNewWorkplace] = useState({ name: '' });
    const [filterText, setFilterText] = useState('');
    const [loading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [workplaceIdToDelete, setWorkplaceIdToDelete] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const {role, featurePermissions } = useUser();
    const isAdmin = role === 'ADMIN';
    const canEditSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'EDIT');
    const canDeleteSettings= isAdmin || hasPermission(featurePermissions, 'Settings', 'DELETE');
    const canManageSettings= canEditSettings || canDeleteSettings;
    const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');


    // Fetch initial workplace data
    useEffect(() => {
        fetchWorkplaceData(true);
    }, []);

    // Reset and fetch data when filter changes
    useEffect(() => {
        fetchWorkplaceData(true);
    }, [filterText]);

    const fetchWorkplaceData = async (reset = false) => {
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

            const response = await axios.get('/work-places', { params });
            const newData = response.data;

            setWorkplaceData(prev => reset ? newData : [...prev, ...newData]);
            setHasMore(newData.length >= 10);
            if (newData.length > 0) {
                setCursor(newData[newData.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching workplace data:', error);
            toast.error('Failed to fetch workplace data');
        } finally {
            if (reset) {
                setInitialLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    const filteredWorkplaceData = workplaceData.filter((row) => {
        if (!row) return false;
        // const idMatch = row.id?.toString().toLowerCase().includes(filterText.toLowerCase());
        const nameMatch = row.name?.toLowerCase().includes(filterText.toLowerCase());
        return  nameMatch;
    });

    const handleOpenWorkplaceModal = () => {
        setOpenWorkplaceModal(true);
        setIsEditing(false);
        setNewWorkplace({ name: '' });
    };

    const handleCloseWorkplaceModal = () => {
        setOpenWorkplaceModal(false);
        setIsEditing(false);
        setNewWorkplace({ name: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewWorkplace({
            ...newWorkplace,
            [name]: value.toUpperCase(), // Convert to uppercase as user types
        });
    };

    const handleAddWorkplace = async () => {
        if (!newWorkplace.name?.trim()) {
            toast.warning('Please fill in the workplace field', 'error');
            return;
        }

        try {
            const payload = {
                name: newWorkplace.name.toUpperCase(), // Ensure data is sent in uppercase
            };

            if (isEditing) {
                await axios.put(`/work-places/${currentWorkplaceId}`, payload);
                toast.success('Workplace updated successfully!');
            } else {
                await axios.post('/work-places', payload);
                toast.success('Workplace Created successfully!');
            }
            // Reset and reload data
            fetchWorkplaceData(true);
            handleCloseWorkplaceModal();
        } catch (error) {
            console.error('Error saving workplace:', error);
            toast.error('Failed to save workplace. Please try again.', 'error');
        }
    };

    const handleEditWorkplace = (id) => {
        const workplaceToEdit = workplaceData.find((workplace) => workplace.id === id);
        if (workplaceToEdit) {
            setNewWorkplace({ name: workplaceToEdit.name.toUpperCase() });
            setCurrentWorkplaceId(id);
            setIsEditing(true);
            setOpenWorkplaceModal(true);
        }
    };

    const handleDeleteWorkplace = (id) => {
        setWorkplaceIdToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        deleteEntity({
            endpoint: '/work-places',
            entityId: workplaceIdToDelete,
            fetchDataCallback: () => fetchWorkplaceData(true),
            onFinally: () => {
                setConfirmDialogOpen(false);
                setWorkplaceIdToDelete(null);
            },
            onSuccessMessage: 'Workplace deleted successfully!',
            onErrorMessage: 'Failed to delete workplace. Please try again.'
        });
    };

    return (
        <Paper style={{ padding: isMobile ? '12px' : '24px' }}>
            <Box>
                <Box
                    display="flex"
                    flexDirection={isMobile ? 'column' : 'row'}
                    alignItems={isMobile ? 'stretch' : 'center'}
                    marginBottom="16px"
                    gap="8px"
                >
                    {canCreateSettings && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenWorkplaceModal}
                            style={{
                                height: '40px',
                                textTransform: 'uppercase',
                                marginBottom: isMobile ? '8px' : 0
                            }}
                            startIcon={<Add />}
                            fullWidth={isMobile}
                        >
                            {isMobile ? 'New' : 'New Workplace'}
                        </Button>
                    )}
                    <SearchBar
                      
                        placeholder={isMobile ? "SEARCH..." : "SEARCH BY WORKPLACE"}
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                                        style={{
                                maxWidth: isMobile ? '100%' : '300px',
                                marginRight: isMobile ? '0' : '16px'
                            }}
                            fullWidth={isMobile}
                        />

                    {!isMobile && <Box flexGrow={1} />}
                </Box>

               
                    {initialLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                             <InfiniteScrollWrapper
                                dataLength={filteredWorkplaceData.length}
                                next={() => fetchWorkplaceData()}
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
                                            <TableCell align="center" style={{ whiteSpace: 'nowrap', width: isMobile ? '60px' : '100px' }}>S.NO</TableCell>
                                            <TableCell align="center">WORKPLACE</TableCell>
                                            {canManageSettings &&<TableCell align="center" style={{ whiteSpace: 'nowrap', width: isMobile ? '100px' : '150px' }}>OPTIONS</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredWorkplaceData.length > 0 ? (
                                            filteredWorkplaceData.map((row, index) => (
                                                <TableRow key={row.id} hover>
                                                    <TableCell align="center" style={{
                                                        whiteSpace: 'normal',
                                                        wordWrap: 'break-word',
                                                        textTransform: "uppercase",
                                                        fontFamily: "Marquis"
                                                    }}>
                                                        {index + 1 || '-'}
                                                    </TableCell>
                                                    <TableCell align="center" style={{
                                                        whiteSpace: 'normal',
                                                        wordWrap: 'break-word',
                                                        textTransform: "uppercase",
                                                        fontFamily: "Marquis"
                                                    }}>
                                                        {row.name.toUpperCase() || '-'}
                                                    </TableCell>
                                                      {canManageSettings && (
                                                    <TableCell align="center" style={{ fontFamily: "Marquis" }}>
                                                         {canEditSettings&& (
                                                        <Tooltip title="EDIT" arrow>
                                                            <IconButton
                                                                onClick={() => handleEditWorkplace(row.id)}
                                                                color="primary"
                                                                size={isMobile ? 'small' : 'medium'}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                                                    }
                                                                }}
                                                            >
                                                                <Edit fontSize={isMobile ? 'small' : 'medium'} />
                                                            </IconButton>
                                                        </Tooltip>
                                                         )}
                                                          {canDeleteSettings && (
                                                        <Tooltip title="DELETE" arrow>
                                                            <IconButton
                                                                onClick={() => handleDeleteWorkplace(row.id)}
                                                                color="error"
                                                                size={isMobile ? 'small' : 'medium'}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.08)'
                                                                    }
                                                                }}
                                                            >
                                                                <Delete fontSize={isMobile ? 'small' : 'medium'} />
                                                            </IconButton>
                                                        </Tooltip>
                                                          )}
                                                    </TableCell>
                                                      )}
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
                            </InfiniteScrollWrapper>
                        </Box>
                    )}
                </Box>
            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this workplace?"
                confirmText="Delete"
            />

            <Dialog
                open={openWorkplaceModal}
                onClose={handleCloseWorkplaceModal}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
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
                        <Typography variant="h6" fontWeight="bold" style={{ textTransform: 'uppercase' }}>
                            {isEditing ? 'EDIT WORKPLACE' : 'NEW WORKPLACE'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: isMobile ? 0 : 2 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Workplace"
                                name="name"
                                value={newWorkplace.name}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^[A-Za-z\s]*$/.test(value) && value.length <= 50) {
                                        handleInputChange(e);
                                    }
                                }}
                                variant="outlined"
                                margin="normal"
                                required
                                autoFocus
                                inputProps={{
                                    maxLength: 50,
                                    placeholder: "Enter Workplace Name (e.g. CHENNAI,TRICHY)",
                                }}
                                sx={{
                                    '& input::placeholder': {
                                        fontSize: '0.9rem',
                                        color: '#000',
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
                    <Button
                        onClick={handleCloseWorkplaceModal}
                        color="primary"
                        variant="outlined"
                        style={{ textTransform: 'uppercase' }}
                        startIcon={<Cancel />}
                        fullWidth={isMobile}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddWorkplace}
                        color="primary"
                        variant="contained"
                        style={{ textTransform: 'uppercase' }}
                        startIcon={!loading && <Add />}
                        disabled={loading}
                        fullWidth={isMobile}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            isEditing ? 'Update' : 'Add'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default WorkplaceManagement;