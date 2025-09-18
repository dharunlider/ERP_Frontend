import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem, useTheme, useMediaQuery, Grid, Chip, CircularProgress, Typography, InputAdornment, Tabs, Tab
} from '@mui/material';
import { Add, Search, Edit, Delete, Close } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmDialog from '../Constants/ConfirmDialog';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import Nodatapage from '../Nodatapage';
import axios from "../Axiosinstance";

const ItemManagementSystem = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [procurementIdToDelete, setProcurementIdToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [formData, setFormData] = useState({
        itemName: '',
        vendorName: '',
        amount: '',
        purchaseDate: '',
        itemType: '',
        category: '',
        location: '',
        invoiceNumber: '',
        quantity: ''
    });

    const fetchItems = async (reset = false) => {
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
                ...(searchTerm && { search: searchTerm }),
            };

            const response = await axios.get('/procurements', { params });
            const newData = response.data || [];

            if (reset) {
                setItems(newData);
            } else {
                setItems(prevItems => {
                    const existingIds = new Set(prevItems.map(item => item.id));
                    const uniqueNewItems = newData.filter(item => !existingIds.has(item.id));
                    return [...prevItems, ...uniqueNewItems];
                });
            }

            setHasMore(newData.length >= 10);
            if (newData.length > 0) {
                setCursor(newData[newData.length - 1].id);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to load items. Please try again later.');
            toast.error('Failed to fetch items');
            setHasMore(false);
        } finally {
            if (reset) {
                setInitialLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };
    useEffect(() => {
        fetchItems(true);
    }, [searchTerm]);

    // Filter items based on search term
  const filteredItems = items.filter(item => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
        (item.itemName && item.itemName.toLowerCase().includes(lowerSearch)) ||
        (item.itemType && item.itemType.toLowerCase().includes(lowerSearch)) ||
        (item.purchaseDate && item.purchaseDate.toLowerCase().includes(lowerSearch))
    );
});

    const handleTabChange = (e, val) => setActiveTab(val);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Letter-only fields (max 50)
        const letterOnlyFields = ['itemName', 'vendorName', 'category'];

        // Number-only fields (e.g., invoiceNumber: max 20 digits)
        const numberOnlyFields = ['invoiceNumber'];

        if (letterOnlyFields.includes(name)) {
            const lettersOnly = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
            setFormData(prev => ({
                ...prev,
                [name]: lettersOnly
            }));
        } else if (numberOnlyFields.includes(name)) {
            const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 20);
            setFormData(prev => ({
                ...prev,
                [name]: numbersOnly
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDeleteClick = (id) => {
        setProcurementIdToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await handleDelete(procurementIdToDelete);
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const requestData = {
                itemName: formData.itemName,
                vendorName: formData.vendorName,
                amount: parseFloat(formData.amount),
                purchaseDate: formData.purchaseDate,
                itemType: formData.itemType,
                category: formData.category,
                location: formData.location,
                invoiceNumber: formData.invoiceNumber,
                quantity: parseInt(formData.quantity)
            };

            if (editingItem) {
                await axios.put(`/procurements/${editingItem.id}`, requestData);
                setItems(prevItems =>
                    prevItems.map(item =>
                        item.id === editingItem.id ? { ...requestData, id: editingItem.id } : item
                    )
                );
                toast.success("Item updated successfully!");
            } else {
                const response = await axios.post('/procurements', requestData);
                const newItem = { ...requestData, id: response.data.id };
                setItems(prevItems => [newItem, ...prevItems]);
                toast.success("Item Created successfully");
            }
            handleCloseDialog();
        } catch (error) {
            const backendMessage = error.response?.data?.details || error.details || 'An unexpected error occurred';
            toast.error(backendMessage);
        }
    };

    // Open dialog for editing
    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName || '',
            vendorName: item.vendorName || '',
            amount: item.amount || '',
            purchaseDate: item.purchaseDate || '',
            itemType: item.itemType || '',
            category: item.category || '',
            location: item.location || '',
            invoiceNumber: item.invoiceNumber || '',
            quantity: item.quantity || ''
        });
        setOpenDialog(true);
    };

    // Delete an item
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/procurements/${id}`);
            setItems(prev => prev.filter(item => item.id !== id));
            toast.success("Item deleted successfully");
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to delete item.";
            toast.error(errorMsg);
            throw error;
        }
    };

    // Open dialog for adding new item
    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            itemName: '',
            vendorName: '',
            amount: '',
            purchaseDate: '',
            itemType: '',
            category: '',
            location: '',
            invoiceNumber: '',
            quantity: ''
        });
        setOpenDialog(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingItem(null);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
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
                <Tab label="PROCUREMENTS" />
            </Tabs>
            <Box sx={{ p: isMobile ? 2 : 3, minHeight: '100vh' }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                    <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                        <Grid item xs={12} sm={6} md="auto">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Add />}
                                onClick={handleAddNew}
                                fullWidth
                                sx={{
                                    whiteSpace: 'nowrap',
                                    fontWeight: 'bold',
                                    boxShadow: 2,
                                }}
                            >
                                Add Item
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={6} md="auto">
                            <TextField
                                placeholder="ItemName,Type,Date"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-root': {
                                        paddingRight: 0,
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={clearSearch}>
                                                <Close />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>

                    <TableContainer>
                        {initialLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                              <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                            <InfiniteScrollWrapper
                                dataLength={filteredItems.length}
                                next={() => fetchItems()}
                                hasMore={hasMore}
                                loading={loadingMore}
                                loader={
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                }
                            >
                                <Table
                                    sx={{
                                        minWidth: 650,
                                        border: '1px solid #ccc',
                                        borderCollapse: 'collapse',
                                        '& .MuiTableCell-root': {
                                            border: '1px solid #ddd',
                                            textAlign: 'center',
                                            textTransform: 'uppercase',
                                            fontSize: '0.875rem',
                                        },
                                        '& .MuiTableHead-root': {
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 2,
                                            backgroundColor: '#f5f5f5'
                                        },
                                        '& .MuiTableCell-head': {
                                            backgroundColor: '#c2c2c5ff',
                                            color: 'black',
                                            fontWeight: 'bold',
                                        },
                                    }}
                                    aria-label="product table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>S.NO</TableCell>
                                            <TableCell>Item Name</TableCell>
                                            <TableCell>Vendor</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Purchase Date</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Invoice</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading && items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} align="center">
                                                    <Nodatapage />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredItems && filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell sx={{ fontWeight: '500' }}>{item.itemName}</TableCell>
                                                    <TableCell>{item.vendorName}</TableCell>
                                                    <TableCell>${item.amount ? item.amount.toFixed(2) : '0.00'}</TableCell>
                                                    <TableCell>{item.purchaseDate}</TableCell>
                                                    <TableCell>
                                                        <Chip label={item.itemType} size="small" color="primary" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell>{item.location}</TableCell>
                                                    <TableCell>{item.invoiceNumber}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>
                                                        <IconButton color="primary" onClick={() => handleEdit(item)}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton color="error" onClick={() => handleDeleteClick(item.id)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={11} align="center">
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
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle
                        sx={{
                            backgroundColor: '#142a4f',
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        {editingItem ? 'Edit Item' : 'Add New Item'}
                    </DialogTitle>

                    <DialogContent>
                        <Box sx={{ mt: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={12}>
                                    <TextField
                                        label="Item Name"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Vendor Name"
                                        name="vendorName"
                                        value={formData.vendorName}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        size="medium"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Amount"
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                        required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Purchase Date"
                                        name="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Item Type"
                                        name="itemType"
                                        value={formData.itemType}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                        required
                                        select
                                    >
                                        <MenuItem value="ASSET">ASSET</MenuItem>
                                        <MenuItem value="CONSUMABLE">CONSUMABLE</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Invoice Number"
                                        name="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        size="medium"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Quantity"
                                        name="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="medium"
                                        required
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} variant="outlined" color="secondary">Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">
                            {editingItem ? 'Update' : 'save'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <ConfirmDialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this item?"
                    confirmText="Delete"
                />
            </Box>
        </>
    );
};

export default ItemManagementSystem;