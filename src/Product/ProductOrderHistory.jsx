import React, { useEffect, useState } from "react";
import {
    Box, Button, Select, MenuItem, InputLabel, FormControl, Tabs, Tab,
    TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import axios from "../Axiosinstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme, useMediaQuery } from '@mui/material';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [dateRange, setDateRange] = useState({
        from: '',
        to: ''
    });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   
    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await axios.get("/products/get-all");
            setProducts(res.data);
        } catch (error) {
            toast.error("Error fetching products");
        }
    };

    // Fetch orders based on selected product and date range
    const fetchOrders = async () => {
        if (!selectedProduct) {
            toast.error("Please select a product first");
            return;
        }

        try {
            // Find the selected product to get its ID
            const product = products.find(p => 
                (p.name || p.productName) === selectedProduct
            );
            
            if (!product) {
                toast.error("Selected product not found");
                return;
            }

            const productId = product.id;
            let url = `/orders/product/${productId}/customers`;
            
            // Add date parameters if provided
            const params = new URLSearchParams();
            if (dateRange.from) params.append('fromDate', dateRange.from);
            if (dateRange.to) params.append('toDate', dateRange.to);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const res = await axios.get(url);
            setOrders(res.data);
        } catch (error) {
            toast.error("Error fetching orders");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    // Reset all filters
    const resetFilters = () => {
        setSelectedProduct('');
        setDateRange({ from: '', to: '' });
        setFilterText('');
        setOrders([]);
    };

    return (
        <>
        
            <Paper sx={{ p: 2 }}>
                <Box>
                    <ToastContainer position="bottom-right" autoClose={2000} />

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                            flexWrap: 'wrap'
                        }}
                    >
                        {/* Product Name Dropdown */}
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Product Name</InputLabel>
                            <Select
                                value={selectedProduct}
                                label="Product Name"
                                onChange={(e) => setSelectedProduct(e.target.value)}
                            >
                                <MenuItem value="">Select Product</MenuItem>
                                {[...new Set(products.map(p => p.name || p.productName))].map(name => (
                                    <MenuItem key={name} value={name}>{name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Date Range Pickers */}
                        <TextField
                            label="From Date"
                            type="date"
                            size="small"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 150 }}
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            size="small"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 150 }}
                        />

                        {/* Fetch Orders Button */}
                        <Button
                            variant="contained"
                            onClick={fetchOrders}
                            disabled={!selectedProduct}
                        >
                            Get Orders
                        </Button>

                        {/* Reset Filters Button */}
                        <Button
                            variant="outlined"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </Button>
                    </Box>

                    {/* Orders Table */}
                    {orders.length > 0 && (
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
                                        <TableCell>Customer ID</TableCell>
                                        <TableCell>Customer Name</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Unit Price</TableCell>
                                        <TableCell>Item Total</TableCell>
                                        <TableCell>Order Date</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{order.customerId}</TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>{order.quantity}</TableCell>
                                            <TableCell>${order.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell>${order.itemTotal.toFixed(2)}</TableCell>
                                            <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{order.orderStatus}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* No orders message */}
                    {selectedProduct && orders.length === 0 && (
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            No orders found for the selected criteria
                        </Box>
                    )}
                </Box>
            </Paper>
        </>
    );
};

export default ProductList;
