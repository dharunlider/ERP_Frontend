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
    InputAdornment,
    useMediaQuery,
    useTheme,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
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
import RequestExpensive from './RequestExpense';

const ExpenseReportTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expenses, setExpenses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [value, setValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionDialog, setActionDialog] = useState({
        open: false,
        expenseId: null,
        action: '',
        expenseName: ''
    });

    const handleChange = (_, newValue) => setValue(newValue);

    // Get staff ID from authentication context or local storage
    const getStaffId = () => {
        // Try to get staff ID from various storage locations
        const staffId = 
            localStorage.getItem('staffId') || 
            localStorage.getItem('userId') || 
            sessionStorage.getItem('staffId') ||
            sessionStorage.getItem('userId');
        
        // Check if staffId exists and is a valid number
        if (!staffId || staffId === 'null' || staffId === 'undefined') {
            console.error('Staff ID not found in storage or invalid');
            setError('Staff authentication required. Please log in again.');
            return null;
        }
        
        // Convert to number to ensure it's a valid Long value
        const numericStaffId = parseInt(staffId, 10);
        if (isNaN(numericStaffId)) {
            console.error('Staff ID is not a valid number:', staffId);
            setError('Invalid staff ID format. Please log in again.');
            return null;
        }
        
        return numericStaffId;
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
                const response = await axios.get(`/Expense/approver/${staffId}`);
                setExpenses(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching expenses:', error);
                if (error.response?.status === 500 && error.response?.data?.message?.includes('Failed to convert value')) {
                    setError('Authentication error. Please log out and log in again.');
                } else {
                    setError('Failed to load expenses. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
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

    // Function to handle approve/reject action
    const handleActionClick = (expenseId, action, staffName) => {
        setActionDialog({
            open: true,
            expenseId,
            action,
            expenseName: `${staffName}'s expense`
        });
    };

    // Function to confirm action
    const confirmAction = async () => {
        const { expenseId, action } = actionDialog;
        try {
            const endpoint = `/Expense/${expenseId}/${action}`;
            await axios.patch(endpoint);
            
            // Update the local state to reflect the change
            setExpenses(prevExpenses => 
                prevExpenses.map(expense => 
                    expense.id === expenseId 
                        ? { ...expense, status: action === 'approve' ? 'Approved' : 'Rejected' } 
                        : expense
                )
            );
            
            setActionDialog({ open: false, expenseId: null, action: '', expenseName: '' });
        } catch (error) {
            console.error(`Error ${action}ing expense:`, error);
            setError(`Failed to ${action} expense. Please try again.`);
        }
    };

    // Function to cancel action
    const cancelAction = () => {
        setActionDialog({ open: false, expenseId: null, action: '', expenseName: '' });
    };

    const tabStyles = {
        textTransform: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        color: '#142a4f',
        borderRadius: '8px',
        padding: '6px 18px',
        backgroundColor: '#ffffff',
        transition: 'all 0.3s ease-in-out',
        '&:hover': { backgroundColor: '#e6ecf3' },
        '&.Mui-selected': {
            backgroundColor: '#142a4f',
            color: '#ffffff',
            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)'
        },
    }

    // Filter expenses based on search term
    const filteredExpenses = expenses.filter(expense =>
        expense && Object.values(expense).some(value =>
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                centered
                aria-label="request tabs"
                TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    bgcolor: '#F0F4F8',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    '& .MuiTab-root': tabStyles
                }}
            >
                <Tab label="EXPENSIVE" />
                <Tab label="REQUEST EXPENSIVE" />
            </Tabs>
            <Box sx={{ width: '100%' }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                    {error && (
                        <Typography color="error" sx={{ mb: 2, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
                            {error}
                        </Typography>
                    )}
                    
                    <TabPanel value={value} index={0}>
                        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
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
                                                <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center' }}>{index + 1}</TableCell>
                                                <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>{expense.staffName}</TableCell>
                                                <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>{expense.description}</TableCell>
                                                <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>${expense.amount?.toFixed(2)}</TableCell>
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
                                                <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>{expense.approverName}</TableCell>
                                                <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleViewDocument(expense.document)}
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                        <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 100, sm: 150 }, textTransform: 'uppercase' }}>
                                                            {expense.document}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {expense.status?.toLowerCase() === 'pending' && (
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                            <Chip
                                                                label="Approve"
                                                                color="success"
                                                                size="small"
                                                                onClick={() => handleActionClick(expense.id, 'approve', expense.staffName)}
                                                                clickable
                                                            />
                                                            <Chip
                                                                label="Reject"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleActionClick(expense.id, 'reject', expense.staffName)}
                                                                clickable
                                                            />
                                                        </Box>
                                                    )}
                                                    {expense.status?.toLowerCase() !== 'pending' && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Processed
                                                        </Typography>
                                                    )}
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
                    </TabPanel>
                    <>
                        <TabPanel value={value} index={1}>
                            <RequestExpensive />
                        </TabPanel>
                    </>
                </Paper>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={actionDialog.open}
                onClose={cancelAction}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {`Confirm ${actionDialog.action === 'approve' ? 'Approval' : 'Rejection'}`}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to {actionDialog.action} {actionDialog.expenseName}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelAction}>Cancel</Button>
                    <Button 
                        onClick={confirmAction} 
                        autoFocus
                        color={actionDialog.action === 'approve' ? 'success' : 'error'}
                        variant="contained"
                    >
                        Confirm {actionDialog.action === 'approve' ? 'Approval' : 'Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

function TabPanel({ children, value, index, ...other }) {
    return (
        <div hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default ExpenseReportTable;