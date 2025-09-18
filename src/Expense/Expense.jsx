import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {
    Paper, Table, TableBody, Grid, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Typography, Box, Button, TextField, InputAdornment,
    useMediaQuery, useTheme, Tab, Tabs, Dialog, DialogTitle, DialogContent,
    DialogActions, DialogContentText, AppBar, Toolbar
} from '@mui/material';
import {
    Search,
    Close,
    PictureAsPdf,
    Image,
    Description,
    Download,
    ZoomIn,
    ZoomOut
} from '@mui/icons-material';
import Nodatapage from '../Nodatapage';
import RequestExpensive from './RequestExpense';
import { useUser } from '../Contexts/Usercontext.jsx';
import AllExpenseRequest from '../Expense/AllExpenseRequest.jsx';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";

const ExpenseReportTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expenses, setExpenses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const { role, featurePermissions, userId } = useUser();
    const [approvers, setApprovers] = useState([]);
    const isAdmin = role === 'ADMIN';
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
    
    // Document viewing state
    const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [pdfLoading, setPdfLoading] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);

    const handleChange = (_, newValue) => setValue(newValue);

    // Set initial tab based on user role
    useEffect(() => {
        setValue(0);
    }, []);

    // Get staff ID from authentication context or local storage
    const getStaffId = () => {
        const staffId =
            localStorage.getItem('staffId') ||
            localStorage.getItem('userId') ||
            sessionStorage.getItem('staffId') ||
            sessionStorage.getItem('userId') ||
            userId;

        if (!staffId || staffId === 'null' || staffId === 'undefined') {
            console.error('Staff ID not found in storage or invalid');
            setError('Staff authentication required. Please log in again.');
            return null;
        }

        const numericStaffId = parseInt(staffId, 10);
        if (isNaN(numericStaffId)) {
            console.error('Staff ID is not a valid number:', staffId);
            setError('Invalid staff ID format. Please log in again.');
            return null;
        }

        return numericStaffId;
    };

    // // Fetch approvers for admin users
    // useEffect(() => {
    //     const fetchApprovers = async () => {
    //         if (!isAdmin) return;
            
    //         try {
    //             const response = await axios.get('');
    //             setApprovers(response.data);
    //         } catch (error) {
    //             console.error('Error fetching approvers:', error);
    //         }
    //     };
        
    //     fetchApprovers();
    // }, [isAdmin]);

    // Fetch expenses from API (only for admin users)
    useEffect(() => {
        const fetchExpenses = async () => {
            if (!isAdmin) {
                setLoading(false);
                return;
            }

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
    }, [isAdmin]);

    // Function to handle document view
    const handleViewDocument = (documentUrl) => {
        if (!documentUrl) {
            alert('No document available');
            return;
        }
        
        setCurrentDocument(documentUrl);
        setPdfLoading(true);
        
        // Determine document type
        if (documentUrl.toLowerCase().endsWith('.pdf') || documentUrl.includes('pdf')) {
            setDocumentType('pdf');
        } else if (documentUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/)) {
            setDocumentType('image');
        } else {
            setDocumentType('other');
        }
        
        setViewDocumentOpen(true);
    };

    // Close document view dialog
    const handleCloseDocumentView = () => {
        setViewDocumentOpen(false);
        setCurrentDocument(null);
        setDocumentType('');
        setZoomLevel(1);
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

    // Handle PDF load event
    const handlePdfLoad = () => {
        setPdfLoading(false);
    };

    // Handle PDF error
    const handlePdfError = () => {
        setPdfLoading(false);
        alert('Failed to load PDF document');
    };

    // Zoom in/out functions
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    // Get document icon based on file type
    const getDocumentIcon = (documentUrl) => {
        if (!documentUrl) return <Description />;
        
        if (documentUrl.toLowerCase().endsWith('.pdf') || documentUrl.includes('pdf')) {
            return <PictureAsPdf />;
        } else if (documentUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/)) {
            return <Image />;
        } else {
            return <Description />;
        }
    };

    // Get short document name for display
    const getShortDocumentName = (documentUrl) => {
        if (!documentUrl) return 'No document';
        
        const urlParts = documentUrl.split('/');
        const fullName = urlParts[urlParts.length - 1];
        
        // Extract name without query parameters
        const cleanName = fullName.split('?')[0];
        
        // Shorten if too long
        if (cleanName.length > 15) {
            return cleanName.substring(0, 12) + '...';
        }
        
        return cleanName;
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
    
    // const getApproverName = (approver) => {
    //     if (!approver) return 'Unknown';

    //     // Handle both object and ID formats
    //     if (typeof approver === 'object') {
    //         return approver.name || 'Unknown';
    //     } else {
    //         const approverObj = approvers.find(a => a.id === approver);
    //         return approverObj ? approverObj.name : 'Unknown';
    //     }
    // };
    
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
                {isAdmin && <Tab label="EXPENSIVE" />}
                {isAdmin && <Tab label="ALL EXPENSE REQUEST" />}
                {!isAdmin && <Tab label="REQUEST EXPENSIVE" />}
            </Tabs>
            <Box sx={{ width: '100%' }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                    {error && (
                        <Typography color="error" sx={{ mb: 2, p: 1, backgroundColor: '#ffebee', borderRadius: 1 }}>
                            {error}
                        </Typography>
                    )}

                    {isAdmin && (
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
                                            width: { xs: '100%', sm: '200px' }
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
                                                    <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                                        {expense.staffName || expense.name || 'N/A'}
                                                    </TableCell>

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
                                                                disabled={!expense.document}
                                                            >
                                                                {getDocumentIcon(expense.document)}
                                                            </IconButton>
                                                            <Typography variant="body2" noWrap sx={{ 
                                                                maxWidth: { xs: 100, sm: 150 }, 
                                                                textTransform: 'uppercase',
                                                                color: expense.document ? 'inherit' : 'text.disabled'
                                                            }}>
                                                                {getShortDocumentName(expense.document)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {expense.status?.toLowerCase() === 'pending' ? (
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
                                                        ) : (
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
                    )}

                    {!isAdmin && (
                        <TabPanel value={value} index={0}>
                            <RequestExpensive />
                        </TabPanel>
                    )}
                    { isAdmin && (
                        <TabPanel value={value} index={1}>
                            <AllExpenseRequest />
                        </TabPanel>
                    )}
                </Paper>
            </Box>

            {/* Document View Dialog */}
            <Dialog 
                open={viewDocumentOpen} 
                onClose={handleCloseDocumentView} 
                maxWidth="lg" 
                fullWidth
                fullScreen={isMobile}
                sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
            >
                <DialogTitle sx={{ p: 0 }}>
                    <AppBar position="static" sx={{ backgroundColor: '#0a2342' }}>
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textTransform: 'uppercase' }}>
                                View Document
                            </Typography>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 0.5}
                            >
                                <ZoomOut />
                            </IconButton>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 3}
                            >
                                <ZoomIn />
                            </IconButton>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => window.open(currentDocument, '_blank')}
                            >
                                <Download />
                            </IconButton>
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={handleCloseDocumentView}
                            >
                                <Close />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                    {pdfLoading && documentType === 'pdf' && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography variant="body1">
                                Loading PDF...
                            </Typography>
                        </Box>
                    )}
                    
                    {documentType === 'pdf' ? (
                        <Box sx={{ width: '100%', height: '100%', overflow: 'auto', p: 2 }}>
                            <iframe 
                                src={currentDocument} 
                                width="100%" 
                                height="100%" 
                                title="Expense Document"
                                style={{ 
                                    border: 'none',
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: '0 0',
                                    width: `${100 / zoomLevel}%`,
                                    height: `${100 / zoomLevel}%`
                                }}
                                onLoad={handlePdfLoad}
                                onError={handlePdfError}
                            />
                        </Box>
                    ) : documentType === 'image' ? (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <img 
                                src={currentDocument} 
                                alt="Expense Document" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%', 
                                    objectFit: 'contain',
                                    transform: `scale(${zoomLevel})`
                                }} 
                            />
                        </Box>
                    ) : documentType === 'other' ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Document Preview Not Available
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This document type cannot be previewed directly in the browser.
                            </Typography>
                            <Button 
                                variant="contained" 
                                sx={{ mt: 2 }}
                                onClick={() => window.open(currentDocument, '_blank')}
                                startIcon={<Download />}
                            >
                                Download Document
                            </Button>
                        </Box>
                    ) : null}
                </DialogContent>
            </Dialog>

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

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default ExpenseReportTable;