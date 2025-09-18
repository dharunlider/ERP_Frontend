// Shiftcategories.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, TextField, InputAdornment, Menu, MenuItem,
    Table, TableBody, TableCell, TableHead, TableRow,
    Paper, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Tooltip, IconButton, Tabs, Tab,
    useMediaQuery
} from '@mui/material';
import { Add, Search, Edit, Delete, Cancel } from '@mui/icons-material';
import ExportIcon from '@mui/icons-material/FileDownload';
import axios from '../Axiosinstance';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/material/CircularProgress';
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";


const Shiftcategories = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [shiftData, setShiftData] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [shiftIdToDelete, setShiftIdToDelete] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { role, featurePermissions } = useUser();
    const isAdmin = role === 'ADMIN';
    const canEditTimesheetAttendance = isAdmin || hasPermission(featurePermissions, 'TimesheetAttendance', 'EDIT');
    const canDeleteTimesheetAttendance = isAdmin || hasPermission(featurePermissions, 'TimesheetAttendance', 'DELETE');
    const canManageTimesheetAttendance = canEditTimesheetAttendance || canDeleteTimesheetAttendance;
    const canCreateTimesheetAttendance = isAdmin || hasPermission(featurePermissions, 'TimesheetAttendance', 'CREATE');
    const [formData, setFormData] = useState({
        name: '',
        color: '',
        workStartTime: '',
        workEndTime: '',
        description: ''
    });
    const [editId, setEditId] = useState(null);

    const isMobile = useMediaQuery('(max-width:600px)');

    const fetchData = async () => {
        try {
            const response = await axios.get('/shift-category/get-all-workshifts');
            setShiftData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load shift data');
        }
    };
    const handleTabChange = (e, val) => setActiveTab(val);

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setOpenModal(true);
        setIsEditing(false);
        setFormData({
            name: '', color: '', workStartTime: '', workEndTime: '',
            description: ''
        });
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditId(item.id);
        setIsEditing(true);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({});
        setEditId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (!formData.workStartTime) {
            newErrors.workStartTime = 'Start time is required';
        }

        if (!formData.workEndTime) {
            newErrors.workEndTime = 'End time is required';
        }

        if (formData.description && formData.description.length > 300) {
            newErrors.description = 'Description must be 300 characters or less';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please correct the highlighted fields');
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            if (isEditing) {
                await axios.put(`/shift-category/${editId}`, formData);
                toast.success('Shift updated successfully');
            } else {
                await axios.post('/shift-category', formData);
                toast.success('Shift created successfully');
            }

            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error('Failed to save shift');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/shift-category/${id}`);
            toast.success('Shift deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Delete:', error);
            toast.error('Failed to delete shift');
        }
    };

    const handleDeleteClick = (id) => {
        setShiftIdToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = () => {
        handleDelete(shiftIdToDelete);
        setConfirmDialogOpen(false);
    };

    const handleExportCSV = () => {
        const csvHeader = ['ID', 'Name', 'Description'];
        const csvRows = shiftData.map(row =>
            [row.id, row.name || '', row.description || '']
        );

        const csvContent = [
            csvHeader.join(','), // header row
            ...csvRows.map(row => row.join(',')) // data rows
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'shift-categories.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setAnchorEl(null); // close the menu
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
                <Tab label="SHIFT" />
            </Tabs>
            <Paper style={{ padding: '20px' }}>
                <Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={2}
                        sx={{
                            background: 'linear-gradient(90deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)',
                        }}
                    >
                        {/* <AccessTimeIcon sx={{ color: 'black' }} /> */}
                        {/* <Typography
                        fontSize={24}
                        fontWeight={600}
                        fontFamily="Marquis"
                        color="black"
                    >
                        SHIFT
                    </Typography> */}
                    </Box>
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'stretch' : 'center'} flexWrap="wrap" gap={2} marginBottom={2}>
                        {canCreateTimesheetAttendance && (
                            <Button variant="contained" color="primary" onClick={handleOpenModal} startIcon={<Add />} fullWidth={isMobile} sx={{ height: '40px' }}>
                                Add New Shift
                            </Button>
                        )}
                        <TextField
                            variant="outlined"
                            placeholder="Search Name..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                style: { height: 40 }
                            }}
                        />

                        <Button
                            variant="contained"
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            startIcon={<ExportIcon />}
                            fullWidth={isMobile}
                            sx={{ height: '40px', marginLeft: isMobile ? 0 : 'auto' }}
                        >
                            Export
                        </Button>

                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            <MenuItem onClick={handleExportCSV}>Export to CSV</MenuItem>
                            <MenuItem onClick={() => window.print()}>Print</MenuItem>
                            {/* PDF and Excel exports can be added similarly using libraries like jsPDF or xlsx */}
                        </Menu>
                    </Box>

                    <Box sx={{ width: '100%', height: '70vh', overflow: 'auto', position: 'relative' }}>
                        <Table stickyHeader size="small" sx={{
                            '& .MuiTableCell-root': { border: '1px solid rgba(224, 224, 224, 1)', padding: '8px 12px', fontSize: '0.875rem' },
                            '& .MuiTableCell-head': { backgroundColor: '#f5f5f5', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }
                        }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center" style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }} >S.NO</TableCell>
                                    <TableCell align="center" style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }} >Name</TableCell>
                                    <TableCell align="center" style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }} >Description</TableCell>
                                    {canManageTimesheetAttendance && <TableCell align="center" style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }} >Options</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {shiftData.filter((row) =>
                                    row.name?.toLowerCase().includes(filterText.toLowerCase())
                                ).length > 0 ? (
                                    shiftData
                                        .filter((row) =>
                                            row.name?.toLowerCase().includes(filterText.toLowerCase())
                                        )
                                        .map((row, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell align="center">{index + 1}</TableCell>
                                                <TableCell align="center">{row.name ? row.name.toUpperCase() : '--'}</TableCell>

                                                <TableCell align="center">{row.description ? row.description.toUpperCase() : '--'}</TableCell>
                                                {canManageTimesheetAttendance && (
                                                    <TableCell align="center">
                                                        {canEditTimesheetAttendance && (
                                                            <Tooltip title="Edit" arrow>
                                                                <IconButton color="primary" onClick={() => handleEdit(row)}>
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {canDeleteTimesheetAttendance && (
                                                            <Tooltip title="Delete" arrow>
                                                                <IconButton color="error" onClick={() => handleDeleteClick(row.id)}>
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" >
                                            <Nodatapage />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>

                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Typography variant="h6" fontWeight="bold">
                            {isEditing ? 'Edit Shift' : 'New Shift'}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} >
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if ((/^[A-Za-z\s]*$/.test(value) || value === '') && value.length <= 30) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    inputProps={{
                                        maxLength: 30,
                                        placeholder: "Enter Shift Name (e.g. Morning, Evening)",
                                    }}
                                    sx={{
                                        '& input::placeholder': {
                                            fontSize: '0.9rem',
                                            color: '#000',
                                        },
                                    }}
                                />

                            </Grid>
                            {/* <Grid item xs={6}>
                            <TextField fullWidth label="Color" name="color" value={formData.color} onChange={handleInputChange} variant="outlined" margin="normal" required />
                        </Grid> */}
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Time to Start Working"
                                    name="workStartTime"
                                    type="time"
                                    value={formData.workStartTime}
                                    onChange={handleInputChange}
                                    error={!!errors.workStartTime}
                                    helperText={errors.workStartTime}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="End Working Time"
                                    name="workEndTime"
                                    type="time"
                                    value={formData.workEndTime}
                                    onChange={handleInputChange}
                                    error={!!errors.workEndTime}
                                    helperText={errors.workEndTime}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if ((/^[A-Za-z\s]*$/.test(value) || value === '') && value.length <= 300) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    error={!!errors.description}
                                    helperText={errors.description}
                                    variant="outlined"
                                    margin="normal"
                                    placeholder="Enter description (e.g. Short summary or details)"
                                    InputProps={{
                                        style: { fontSize: '0.95rem' },
                                    }}
                                    sx={{
                                        '& textarea::placeholder': {
                                            fontSize: '0.9rem',
                                            color: '#000',
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleCloseModal} color="primary" variant="outlined" startIcon={<Cancel />}>
                            Close
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={handleSave}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                <ConfirmDialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this shift?"
                    confirmText="Delete"
                />
            </Paper>
        </>
    );
};
export default Shiftcategories;