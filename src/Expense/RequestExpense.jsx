import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {
    Paper,
    Table,
    TableBody,
    Grid,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Typography,
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    useMediaQuery,
    useTheme,
    MenuItem
} from '@mui/material';
import {
    Visibility,
    Edit,
    Delete,
    Add,
    Search,
    Close
} from '@mui/icons-material';
import Nodatapage from '../Nodatapage';

const ExpenseReportTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expenses, setExpenses] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get staff ID from authentication context or local storage
    const getStaffId = () => {
        const staffId = 
            localStorage.getItem('staffId') || 
            localStorage.getItem('userId') || 
            sessionStorage.getItem('staffId') ||
            sessionStorage.getItem('userId');
        
        if (!staffId) {
            console.error('Staff ID not found in storage');
            setError('Staff authentication required. Please log in again.');
            return null;
        }
        
        return staffId;
    };

    // Fetch expenses from API
    useEffect(() => {
        const fetchExpenses = async () => {
            const staffId = getStaffId();
            if (!staffId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`/Expense/staff/${staffId}`);
                setExpenses(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching expenses:', error);
                setError('Failed to load expenses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    // Fetch approvers from API
    useEffect(() => {
        const fetchApprovers = async () => {
            try {
                const response = await axios.get('/staff/admin-roles');
                setApprovers(response.data);
            } catch (error) {
                console.error('Error fetching approvers:', error);
                setError('Failed to load approvers. Please try again later.');
            }
        };

        fetchApprovers();
    }, []);

    // Function to handle document view
    const handleViewDocument = (documentName) => {
        alert(`Viewing document: ${documentName}`);
    };

    // Function to get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    // Open edit dialog
    const handleEdit = (expense) => {
        setEditingExpense({
            ...expense,
            approverId: expense.approverId || ''
        });
        setOpenDialog(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingExpense(null);
    };

    // Save edited expense
    const handleSave = async () => {
        if (editingExpense) {
            const staffId = getStaffId();
            if (!staffId) return;

            try {
                // Prepare the data with approverId instead of approverName
                const expenseData = {
                    ...editingExpense,
                    staffId: parseInt(staffId),
                    approverId: parseInt(editingExpense.approverId),
                    // Remove approverName as it's not needed for the API
                    approverName: undefined
                };

                if (editingExpense.id) {
                    // Update existing expense
                    await axios.put(`/Expense/${editingExpense.id}`, expenseData);
                    // Update local state with the response data
                    const response = await axios.get(`/Expense/staff/${staffId}`);
                    setExpenses(response.data);
                } else {
                    // Add new expense
                    const response = await axios.post('/Expense', expenseData);
                    setExpenses([...expenses, response.data]);
                }
                setError(null);
            } catch (error) {
                console.error('Error saving expense:', error);
                if (error.response?.data?.details) {
                    setError(`Validation error: ${error.response.data.details.join(', ')}`);
                } else {
                    setError('Failed to save expense. Please try again.');
                }
            }
        }
        handleCloseDialog();
    };

    // Handle input changes in dialog
    const handleInputChange = (field, value) => {
        setEditingExpense({
            ...editingExpense,
            [field]: value
        });
    };

    // Handle delete expense
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await axios.delete(`/Expense/${id}`);
                setExpenses(expenses.filter(exp => exp.id !== id));
                setError(null);
            } catch (error) {
                console.error('Error deleting expense:', error);
                setError('Failed to delete expense. Please try again.');
            }
        }
    };

    // Filter expenses based on search term
    const filteredExpenses = expenses.filter(expense =>
        expense && Object.values(expense).some(value =>
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Initialize new expense object when opening dialog for adding
    const handleOpenDialog = () => {
        setEditingExpense({
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            approverId: '',
            document: ''
        });
        setOpenDialog(true);
    };

    // Get approver name by ID for display
    const getApproverName = (approverId) => {
        const approver = approvers.find(a => a.id === approverId);
        return approver ? approver.name : 'Unknown';
    };

    return (
        <Box sx={{ p: isMobile ? 2 : 3, minHeight: '100vh' }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                {error && (
                    <Typography color="error" sx={{ mb: 2, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
                        {error}
                    </Typography>
                )}

                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    <Grid item xs={12} sm="auto" justifyContent="flex-start">
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenDialog}
                        >
                            {isMobile ? 'Add' : 'New Expense'}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm="auto">
                        <TextField
                            size="small"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: 1,
                                mr: 2,
                                width: { xs: '40%', sm: '200px' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                                            <Close />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>
                
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #ccc8c8ff', borderRadius: 2, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                    <Table sx={{ minWidth: 650, borderCollapse: 'separate', borderSpacing: 0 }} size={isMobile ? "small" : "medium"} stickyHeader>
                        <TableHead>
                            <TableRow>
                                {[
                                    'S.NO',
                                    'Staff Name',
                                    'Description',
                                    'Amount ($)',
                                    'Date',
                                    'Status',
                                    'Approver Name',
                                    'Document',
                                    'Actions'
                                ].map((header, index) => (
                                    <TableCell
                                        key={index}
                                        sx={{
                                            fontWeight: 'bold',
                                            borderRight: '1px solid #e0e0e0',
                                            backgroundColor: '#bdbabaff',
                                            position: 'sticky',
                                            top: 0,
                                            textTransform: 'uppercase',
                                            zIndex: 1,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography>Loading expenses...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense, index) => (
                                    <TableRow
                                        key={expense.id || index}
                                        sx={{
                                            '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                            '&:hover': { backgroundColor: '#f0f0f0' }
                                        }}
                                    >
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            {expense.staffName}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            {expense.description}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            ${expense.amount?.toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            {expense.date ? new Date(expense.date).toLocaleDateString() : ''}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            <Chip
                                                label={expense.status}
                                                color={getStatusColor(expense.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            {getApproverName(expense.approverId)}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleViewDocument(expense.document)}
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                                <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                        maxWidth: { xs: 100, sm: 150 },
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {expense.document}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleEdit(expense)}
                                                sx={{ mr: 1 }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                size="small"
                                                onClick={() => handleDelete(expense.id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Nodatapage />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{
                        textAlign: 'center',
                        backgroundColor: '#0a2342',
                        textTransform: 'uppercase',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    {editingExpense?.id ? 'Edit Expense' : 'Add New Expense'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Approver"
                                    select
                                    required
                                    value={editingExpense?.approverId || ''}
                                    onChange={(e) => handleInputChange('approverId', e.target.value)}
                                    fullWidth
                                >
                                    {approvers.map((approver) => (
                                        <MenuItem key={approver.id} value={approver.id}>
                                            {approver.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Amount"
                                    type="number"
                                    required
                                    value={editingExpense?.amount || ''}
                                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Date"
                                    type="date"
                                    required
                                    value={editingExpense?.date || ''}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Description"
                                    required
                                    value={editingExpense?.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Document"
                                    value={editingExpense?.document || ''}
                                    onChange={(e) => handleInputChange('document', e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpenseReportTable;