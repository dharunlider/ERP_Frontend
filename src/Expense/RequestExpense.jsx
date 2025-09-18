import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {Paper,Table,TableBody,Grid,TableCell,TableContainer,TableHead,TableRow,Chip,IconButton,Typography,
    Box,Button,TextField,Dialog,DialogTitle,DialogContent,DialogActions,InputAdornment,useMediaQuery,useTheme,MenuItem,CircularProgress,AppBar,Toolbar
} from '@mui/material';
import {
    Visibility,Edit,Delete,Add,Search,Close,PictureAsPdf,Description,Image,Download,ZoomIn,
    ZoomOut
} from '@mui/icons-material';
import Nodatapage from '../Nodatapage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmDialog from '../Constants/ConfirmDialog';
import DocumentUploadField from '../Constants/DocumentUploadField';
import { uploadFileToCloudinary } from '../Constants/Documentuploadfunction';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";

const ExpenseReportTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expenses, setExpenses] = useState([]);
    const [approvers, setApprovers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [RequestExpenseToDelete, setRequestExpenseToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [pdfLoading, setPdfLoading] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);

    const [documentCloudinaryUrl, setdocumentCloudinaryUrl] = useState(null);
    const [document, setdocument] = useState(null);
    const [fileName, setFileName] = useState('');
    const [uploadingDocument, setUploadingDocument] = useState(false);

    // Handler for file upload
    const handledocument = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit');
            return;
        }

        // Check file type
        const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validFileTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PDF, JPG, or PNG files only');
            return;
        }

        setUploadingDocument(true);
        try {
            const cloudinaryUrl = await uploadFileToCloudinary(file, 'expense_documents');
            if (cloudinaryUrl) {
                setdocumentCloudinaryUrl(cloudinaryUrl);
                setdocument(URL.createObjectURL(file));
                setFileName(file.name);
                toast.success('Document uploaded successfully!');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error('Failed to upload document. Please try again.');
        } finally {
            setUploadingDocument(false);
        }
    };

    const handleRemoveDocument = () => {
        setdocumentCloudinaryUrl(null);
        setdocument(null);
        setFileName('');
    };

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
            toast.error('Staff authentication required. Please log in again.');
            return null;
        }

        return parseInt(staffId);
    };

    const handleDeleteClick = (id) => {
        setRequestExpenseToDelete(id);
        setConfirmDialogOpen(true);
    };
    
    const confirmDelete = async () => {
        try {
            await handleDelete(RequestExpenseToDelete);
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
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
                toast.error('Failed to load expenses. Please try again later.');
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
                toast.error('Failed to load approvers. Please try again later.');
            }
        };

        fetchApprovers();
    }, []);

    // Function to handle document view
    const handleViewDocument = (documentUrl) => {
        if (!documentUrl) {
            toast.error('No document available');
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
        const statusString = status?.toString()?.toLowerCase() || 'default';

        switch (statusString) {
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
            approverId: expense.approverId?.id || expense.approverId || '',
            staffId: expense.staffId?.id || expense.staffId || ''
        });
        
        // Pre-fill document if editing existing expense
        if (expense.document) {
            setdocumentCloudinaryUrl(expense.document);
            setFileName(expense.document.split('/').pop() || 'document');
        }
        
        setOpenDialog(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingExpense(null);
        setdocumentCloudinaryUrl(null);
        setdocument(null);
        setFileName('');
    };

    // Save edited expense
    const handleSave = async () => {
        if (editingExpense) {
            const staffId = getStaffId();
            if (!staffId) return;

            try {
                // Prepare the data in the format backend expects
                const expenseData = {
                    ...editingExpense,
                    staffId: { id: staffId },
                    approverId: { id: editingExpense.approverId },
                    document: documentCloudinaryUrl // Send as string, not object
                };

                // Remove any undefined or null values
                Object.keys(expenseData).forEach(key => {
                    if (expenseData[key] === undefined || expenseData[key] === null) {
                        delete expenseData[key];
                    }
                });

                if (editingExpense.id) {
                    // Update existing expense
                    await axios.put(`/Expense/${editingExpense.id}`, expenseData);

                    // Update state correctly
                    setExpenses(prevExpenses =>
                        prevExpenses.map(exp =>
                            exp.id === editingExpense.id
                                ? {
                                    ...exp,
                                    description: editingExpense.description,
                                    amount: editingExpense.amount,
                                    date: editingExpense.date,
                                    document: documentCloudinaryUrl,
                                    approverId: { id: editingExpense.approverId }
                                }
                                : exp
                        )
                    );
                    toast.success('Expense updated successfully');
                } else {
                    // Add new expense
                    const response = await axios.post('/Expense', expenseData);
                    setExpenses(prevExpenses => [...prevExpenses, response.data]);
                    toast.success('Expense added successfully');
                }
            } catch (error) {
                console.error('Error saving expense:', error);
                const errorMsg = error.response?.data?.details || 'Failed to save expense. Please try again.';
                setError(errorMsg);
                toast.error(errorMsg);
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
        try {
            await axios.delete(`/Expense/${id}`);
            setExpenses(expenses.filter(exp => exp.id !== id));
            toast.success('Expense deleted successfully');
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Failed to delete expense');
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
            approverId: '',
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
        });
        
        // Reset document state for new expense
        setdocumentCloudinaryUrl(null);
        setdocument(null);
        setFileName('');
        
        setOpenDialog(true);
    };

    const getApproverName = (approver) => {
        if (!approver) return 'Unknown';

        // Handle both object and ID formats
        if (typeof approver === 'object') {
            return approver.name || 'Unknown';
        } else {
            const approverObj = approvers.find(a => a.id === approver);
            return approverObj ? approverObj.name : 'Unknown';
        }
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

    // Handle PDF load event
    const handlePdfLoad = () => {
        setPdfLoading(false);
    };

    // Handle PDF error
    const handlePdfError = () => {
        setPdfLoading(false);
        toast.error('Failed to load PDF document');
    };

    // Zoom in/out functions
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
    };

    return (
        <Box sx={{ p: isMobile ? 2 : 3, minHeight: '100vh' }}>
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'white' }}>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
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
                                            {expense.staffName || 'N/A'}
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
                                                label={expense.status || 'Pending'}
                                                color={getStatusColor(expense.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'center', textTransform: 'uppercase' }}>
                                            {getApproverName(expense.approverId)}
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid ' + (expense.document ? '#e0e0e0' : 'transparent'), textAlign: 'center' }}>
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
                                                <Typography
                                                    variant="body2"
                                                    noWrap
                                                    sx={{
                                                        maxWidth: { xs: 100, sm: 150 },
                                                        textTransform: 'uppercase',
                                                        color: expense.document ? 'inherit' : 'text.disabled'
                                                    }}
                                                >
                                                    {getShortDocumentName(expense.document)}
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
                                                onClick={() => handleDeleteClick(expense.id)}
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
                            <CircularProgress />
                            <Typography variant="body1" sx={{ ml: 2 }}>
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
                                    value={editingExpense?.approverId || ''}
                                    onChange={(e) => handleInputChange('approverId', e.target.value)}
                                    fullWidth
                                    required
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
                                    value={editingExpense?.amount || ''}
                                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                                    fullWidth
                                    required
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Date"
                                    type="date"
                                    value={editingExpense?.date || ''}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Description"
                                    value={editingExpense?.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" style={{ fontFamily: "Marquis", marginBottom: '16px' }}>
                                    DOCUMENT UPLOADS
                                </Typography>

                                <DocumentUploadField
                                    title="Document"
                                    description="Upload document (PDF, JPG, PNG - max 10MB)"
                                    fileType="document"
                                    onUpload={handledocument}
                                    onRemove={handleRemoveDocument}
                                    fileUrl={document}
                                    cloudinaryUrl={documentCloudinaryUrl}
                                    uploading={uploadingDocument}
                                    fileName={fileName}
                                    inputId="document-upload"
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
            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this Expense?"
                confirmText="Delete"
            />
        </Box>
    );
};
export default ExpenseReportTable;