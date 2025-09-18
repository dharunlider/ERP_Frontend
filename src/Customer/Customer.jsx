import React, { useState, useEffect } from 'react';
import {
    Box, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent,
    DialogTitle, Grid, Paper, Tab, Table, TableBody, TableCell, TableContainer, InputAdornment,
    TableHead, TableRow, Tabs, TextField, useMediaQuery, useTheme, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import Nodatapage from "../Nodatapage";
import SearchBar from '../Constants/SearchBar';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";

const EntityTable = () => {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEntityId, setCurrentEntityId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [newEntity, setNewEntity] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        companyName: '',
        customerCode: '',
        contactPerson: '',
        contactPersonNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTogglePassword = () => setShowPassword((prev) => !prev);

    const tableHeadings = [
        'S.NO', 'Name', 'Email', 'Phone', 'Customer Code',
        'City', 'Company Name', 'Actions'
    ];

    const headCellStyle = {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        position: 'sticky',
        top: 0,
        backgroundColor: '#f5f5f5',
        zIndex: 1,
    };

    // Fetch all customers using axios
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/customers/getallcustomers');
            setEntities(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to fetch customers', 'error');
            setEntities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleOpenModal = () => {
        setOpenModal(true);
        setIsEditing(false);
        setCurrentEntityId(null);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setIsEditing(false);
        setCurrentEntityId(null);
        // Reset form
        setNewEntity({
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            city: '',
            companyName: '',
            customerCode: '',
            contactPerson: '',
            contactPersonNumber: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEntity(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddEntity = async () => {
        try {
            let response;
            if (isEditing && currentEntityId) {
                response = await axios.put(`/customers/${currentEntityId}`, newEntity);
                toast.success('Customer updated successfully');
            } else {
                response = await axios.post('/customers/create', newEntity);
                toast.success('Customer added successfully');
            }
            handleCloseModal();
            fetchCustomers();
        } catch (error) {
            console.error('Error saving customer:', error);
            const backendMessage =
                error.response?.data?.message || error.response?.data || error.message || 'Failed to save customer';
            toast.error(`Error: ${backendMessage}`);
        }
    };

    const handleEdit = (entity) => {
        setNewEntity({
            name: entity.name,
            email: entity.email,
            password: '********',
            phone: entity.phone,
            address: entity.address,
            city: entity.city,
            companyName: entity.companyName,
            customerCode: entity.customerCode,
            contactPerson: entity.contactPerson,
            contactPersonNumber: entity.contactPersonNumber
        });
        setCurrentEntityId(entity.id);
        setIsEditing(true);
        setOpenModal(true);
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setDeleteDialogOpen(true);
    };

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const confirmDelete = async () => {
        try {
            await axios.delete(`/customers/${deleteTargetId}`);
            setEntities(prev => prev.filter(e => e.id !== deleteTargetId));
            toast.success('Customer deleted successfully');
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Failed to delete customer');
        } finally {
            setDeleteDialogOpen(false);
            setDeleteTargetId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    // Filter entities based on search term
    const filteredEntities = entities.filter(entity =>
        entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.phone?.includes(searchTerm) ||
        entity.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <Tab label="CUSTOMER LIST" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
            </Tabs>
            <Container maxWidth="fullwidth">
                <Box sx={{ my: 4 }}>
                    <Paper elevation={3} sx={{ p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                        {/* Add button above the table */}
                        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'stretch' : 'center'} flexWrap="wrap" gap={2} marginBottom={2}>
                            <Button variant="contained" color="primary" onClick={handleOpenModal} fullWidth={isMobile} sx={{ height: '40px' }}>
                                ADD CUSTOMER
                            </Button>

                            <SearchBar
                                variant="outlined"
                                value={searchTerm}
                                placeholder="Search Customer"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Box>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 2, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>

                                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                        <InfiniteScrollWrapper
                                            dataLength={filteredEntities.length}
                                            next={() => fetchCustomers()}
                                            hasMore={hasMore}
                                            loading={loadingMore}
                                        >
                                            <Table sx={{ minWidth: 700, borderCollapse: 'separate', borderSpacing: 2 }} size={isMobile ? "small" : "medium"} stickyHeader>
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                        {tableHeadings.map((heading, index) => (
                                                            <TableCell
                                                                key={heading}
                                                                align="center"
                                                                sx={{
                                                                    ...headCellStyle,
                                                                    borderRight: index < tableHeadings.length - 1 ? '1px solid #e0e0e0' : 'none',
                                                                }}
                                                            >
                                                                {heading}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {filteredEntities.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={8} align="center">
                                                                <Nodatapage />
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredEntities.map((entity, index) => (
                                                            <TableRow
                                                                key={entity.id}
                                                                sx={{
                                                                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                                                    '&:hover': { backgroundColor: '#f0f0f0' }
                                                                }}
                                                            >
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {index + 1}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {entity.name.toUpperCase()}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {entity.email.toUpperCase()}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {entity.phone}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {entity.customerCode.toUpperCase()}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {entity.city.toUpperCase()}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                                    {entity.companyName.toUpperCase()}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <IconButton color="primary" onClick={() => handleEdit(entity)}>
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                    <IconButton color="error" onClick={() => handleDelete(entity.id)}>
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>

                                            </Table>
                                        </InfiniteScrollWrapper>
                                    </Box>
                                </TableContainer>
                            </>
                        )}
                    </Paper>
                </Box>

                {/* Add/Edit Entity Modal */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle
                        sx={{
                            textAlign: 'center',
                            backgroundColor: '#0a2342',
                            color: 'white',
                            fontWeight: 'bold',
                        }}
                    >
                        {isEditing ? 'EDIT CUSTOMER' : 'ADD NEW CUSTOMER'}
                    </DialogTitle>

                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        name="name"
                                        value={newEntity.name}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // Allow only letters and spaces, and limit to 30 characters
                                            if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 30) {
                                                handleInputChange(e);
                                            }
                                        }}
                                        required
                                        margin="normal"
                                        error={newEntity.name.length > 0 && !/^[a-zA-Z\s]+$/.test(newEntity.name)}
                                        helperText={
                                            newEntity.name.length > 30
                                                ? 'Maximum 30 characters allowed'
                                                : newEntity.name.length > 0 && !/^[a-zA-Z\s]+$/.test(newEntity.name)
                                                    ? 'Name should contain letters only'
                                                    : ''
                                        }
                                        inputProps={{ maxLength: 30 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={newEntity.email}
                                        onChange={handleInputChange}
                                        required
                                        margin="normal"
                                        error={newEntity.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEntity.email)}
                                        helperText={
                                            newEntity.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEntity.email)
                                                ? 'Enter a valid email address'
                                                : ''
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box mt={2}>
                                        <TextField
                                            fullWidth
                                            label="Password"
                                            name="password"
                                            value={newEntity.password}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Only allow passwords between 0 and 15 characters
                                                if (value.length <= 15) {
                                                    handleInputChange(e);

                                                }
                                            }}
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Enter password"
                                            error={newEntity.password.length > 0 && newEntity.password.length < 5}
                                            helperText={
                                                newEntity.password.length > 0 && newEntity.password.length < 5
                                                    ? 'Password must be at least 5 characters'
                                                    : ''
                                            }
                                            inputProps={{ maxLength: 15 }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleTogglePassword} edge="end">
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box mt={2}>
                                        <PhoneInput
                                            country={'in'}
                                            value={newEntity.phone}
                                            onChange={(value) => {
                                                const nationalNumber = value.replace(/^\+?\d{1,4}/, '');
                                                if (/^\d{0,10}$/.test(nationalNumber)) {
                                                    handleInputChange({
                                                        target: {
                                                            name: 'phone',
                                                            value: value,
                                                        }
                                                    });
                                                }
                                            }}
                                            inputProps={{
                                                name: 'phone',
                                                required: true
                                            }}
                                            specialLabel="Personal Number *"
                                            isValid={(value, country) => {
                                                const number = value.replace(country.dialCode, '');
                                                return number.length === 10;
                                            }}
                                            inputStyle={{
                                                width: '100%',
                                                fontFamily: 'Marquis',
                                                border: '1px solid #ccc',
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        value={newEntity.address}
                                        onChange={handleInputChange}
                                        margin="normal"
                                        InputProps={{
                                            sx: { height: 100 }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} >
                                    <TextField
                                        fullWidth
                                        label="Company Name"
                                        name="companyName"
                                        value={newEntity.companyName}
                                        onChange={handleInputChange}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        name="city"
                                        value={newEntity.city}
                                        onChange={handleInputChange}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Customer Code"
                                        name="customerCode"
                                        value={newEntity.customerCode}
                                        onChange={handleInputChange}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Contact Person "
                                        name="contactPerson"
                                        value={newEntity.contactPerson}
                                        onChange={handleInputChange}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box mt={2}>
                                        <PhoneInput
                                            country={'in'}
                                            value={newEntity.contactPersonNumber}
                                            onChange={(value) => {
                                                const nationalNumber = value.replace(/^\+?\d{1,4}/, '');
                                                if (/^\d{0,10}$/.test(nationalNumber)) {
                                                    handleInputChange({
                                                        target: {
                                                            name: 'contactPersonNumber',
                                                            value: value,
                                                        }
                                                    });
                                                }
                                            }}
                                            inputProps={{
                                                name: 'contactPersonNumber',
                                                required: true
                                            }}
                                            placeholder="Contact Person Number"
                                            specialLabel="Contact Person Number *"
                                            isValid={(value, country) => {
                                                const number = value.replace(country.dialCode, '');
                                                return number.length === 10;
                                            }}
                                            inputStyle={{
                                                width: '100%',
                                                fontFamily: 'Marquis',
                                                border: '1px solid #ccc',
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={handleCloseModal} color="secondary" >Cancel</Button>
                        <Button
                            onClick={handleAddEntity}
                            variant="contained"
                            disabled={!newEntity.name || !newEntity.email || !newEntity.password || !newEntity.phone}
                        >
                            {isEditing ? 'Update' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={deleteDialogOpen}
                    onClose={cancelDelete}
                >
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this customer?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelDelete} variant='outlined' color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default EntityTable;