import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    InputAdornment,
    Grid,
    MenuItem,
    Chip,
    Tabs,
    Tab,
    Button,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Search, DateRange } from '@mui/icons-material';
import ProductOrderHistory from '../Product/ProductOrderHistory';
import Nodatapage from '../Nodatapage';
import { useParams } from 'react-router-dom';
import { Clear as ClearIcon } from '@mui/icons-material';

const Customerorderlist = () => {
    const [data, setData] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { customerId } = useParams();

    // Get current date in YYYY-MM-DD format
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Set current date as default for toDate
    useEffect(() => {
        setToDate(getCurrentDate());
    }, []);

    // Fetch customers data from API
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setCustomerLoading(true);
                const response = await axios.get('/customers');
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
                setCustomers([]);
            } finally {
                setCustomerLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Fetch data from API based on selected customer and date filters
    const fetchData = async () => {
        try {
            setLoading(true);
            const idToFetch = selectedCustomer || customerId;

            if (!idToFetch) {
                setData([]);
                return;
            }

            // Build query parameters
            const params = {};
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const response = await axios.get(`/orders/customer/${idToFetch}/products`, { params });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data when component mounts or customerId changes
    useEffect(() => {
        if (customerId) {
            setSelectedCustomer(customerId);
            fetchData();
        }
    }, [customerId]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle customer change
    const handleCustomerChange = (event) => {
        setSelectedCustomer(event.target.value);
        setSearchTerm('');
        fetchData();
    };

    // Handle filter button click
    const handleFilterClick = () => {
        fetchData();
    };

    // Filter data based on search term
    const filteredData = data.filter(item => {
        return item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.orderStatus.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    // Clear date filters
    const clearDateFilters = () => {
        setFromDate('');
        setToDate(getCurrentDate());
        fetchData();
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
                <Tab label="CUSTOMER ORDER HISTORY" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
                <Tab label="PRODUCT ORDER HISTORY" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
            </Tabs>

            {activeTab === 0 ? (
                <Box sx={{ p: isMobile ? 1 : 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
                    {/* Search and Filter Section */}
                    <Paper elevation={2} sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Filter by Customer"
                                    value={selectedCustomer}
                                    onChange={handleCustomerChange}
                                    variant="outlined"
                                    size={isMobile ? "small" : "medium"}
                                    InputProps={{
                                        sx: { borderRadius: 2 },
                                    }}
                                    disabled={customerLoading}
                                >
                                    {customers.map((customer) => (
                                        <MenuItem key={customer.id} value={customer.id}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    whiteSpace: 'normal',
                                                    fontSize: isMobile ? '0.85rem' : '1rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {`${customer.name.toUpperCase()} - ${customer.customerCode}`}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    label="From Date"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size={isMobile ? "small" : "medium"}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <DateRange fontSize={isMobile ? "small" : "medium"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TextField
                                        fullWidth
                                        label="To Date"
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size={isMobile ? "small" : "medium"}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <DateRange fontSize={isMobile ? "small" : "medium"} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Grid>
                            {/* <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    variant="outlined"
                                    size={isMobile ? "small" : "medium"}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 },
                                    }}
                                />
                            </Grid> */}
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: 1,
                                    alignItems: isMobile ? 'stretch' : 'center'
                                }}>
                                    {(fromDate || toDate !== getCurrentDate()) && (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={!isMobile && <ClearIcon />}
                                            size={isMobile ? "small" : "medium"}
                                            sx={{
                                                height: isMobile ? 36 : 40,
                                                minWidth: isMobile ? '100%' : 120,
                                                fontSize: isMobile ? '0.75rem' : '0.875rem'
                                            }}
                                            onClick={clearDateFilters}
                                        >
                                            {isMobile ? 'Clear' : 'Clear Filter'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={!isMobile && <Search />}
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            height: isMobile ? 36 : 40,
                                            minWidth: isMobile ? '100%' : 120,
                                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                                        }}
                                        onClick={handleFilterClick}
                                    >
                                        {isMobile ? 'Apply' : 'Apply Filter'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Table Section */}
                    {!loading && !customerLoading ? (
                        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
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
                                    '& .MuiTableCell-head': {
                                        backgroundColor: '#c7c8cfff',
                                        color: 'black',
                                        fontWeight: 'bold',
                                    },
                                }}
                                aria-label="product table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.NO</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Price (₹)</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Item Total (₹)</TableCell>
                                        <TableCell>Order Date</TableCell>
                                        <TableCell>Order Status</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Nodatapage />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{
                                                    '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' },
                                                    '&:hover': {
                                                        backgroundColor: '#eceef0ff',
                                                        cursor: 'pointer',
                                                    },
                                                }}
                                            >
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell sx={{ fontWeight: 'medium' }}>{row.productName}</TableCell>
                                                <TableCell>₹{row.price.toFixed(2)}</TableCell>
                                                <TableCell>{row.quantity}</TableCell>
                                                <TableCell>₹{row.itemTotal.toFixed(2)}</TableCell>
                                                <TableCell>{formatDate(row.orderDate)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={row.orderStatus}
                                                        color={getStatusColor(row.orderStatus)}
                                                        size="small"
                                                        sx={{ fontWeight: 'bold', minWidth: 100 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            {/* <Typography>Loading...</Typography> */}
                        </Box>
                    )}
                </Box>
            ) : (
                <ProductOrderHistory />
            )}
        </>
    );
};

export default Customerorderlist;