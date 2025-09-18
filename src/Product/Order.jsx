import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Divider,
  Alert,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Avatar,
  CardHeader,
  InputAdornment,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Add, 
  Remove, 
  Delete, 
  Refresh, 
  ShoppingCart, 
  Person, 
  Inventory, 
  AttachMoney,
  LocalMall,
  CheckCircle,
  AccountCircle
} from '@mui/icons-material';
import axios from '../Axiosinstance';

const OrderPlacement = () => {
  const theme = useTheme();
  const userId = sessionStorage.getItem("userId");
  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  // Fetch customer details based on userId
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!userId) return;
      
      try {
        setCustomersLoading(true);
        const response = await axios.get(`/customers/${userId}`);
        setCustomerDetails(response.data);
        setCustomerId(response.data.id);
        setSelectedCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer details:', error);
        setMessage({ type: 'error', text: 'Failed to load customer information.' });
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [userId]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await axios.get('/products/get-all');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setMessage({ type: 'error', text: 'Failed to load products. Please try again.' });
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveProduct = (index) => {
    if (orderItems.length > 1) {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleQuantityChange = (index, value) => {
    const quantity = parseInt(value) || 1;
    if (quantity > 0) {
      const newItems = [...orderItems];
      newItems[index].quantity = quantity;
      setOrderItems(newItems);
    }
  };

  const incrementQuantity = (index) => {
    const newItems = [...orderItems];
    newItems[index].quantity += 1;
    setOrderItems(newItems);
  };

  const decrementQuantity = (index) => {
    const newItems = [...orderItems];
    if (newItems[index].quantity > 1) {
      newItems[index].quantity -= 1;
      setOrderItems(newItems);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.productName : 'Unknown Product';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.price : 0;
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      if (item.productId) {
        return total + (getProductPrice(item.productId) * item.quantity);
      }
      return total;
    }, 0);
  };

  const calculateItemsCount = () => {
    return orderItems.filter(item => item.productId).reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!customerId) {
      setMessage({ type: 'error', text: 'Customer information is missing' });
      setLoading(false);
      return;
    }

    for (let i = 0; i < orderItems.length; i++) {
      if (!orderItems[i].productId) {
        setMessage({ type: 'error', text: 'Please select a product for all items' });
        setLoading(false);
        return;
      }
    }

    try {
      const orderData = {
        customerId: parseInt(customerId),
        orderItems: orderItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: item.quantity
        }))
      };

      const response = await axios.post('/orders/place', orderData);
      setMessage({ type: 'success', text: 'Order placed successfully!' });
      
      // Reset form
      setOrderItems([{ productId: '', quantity: 1 }]);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setMessage({ type: 'error', text: 'Failed to place order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await axios.get('/products/get-all');
      setProducts(response.data);
      setMessage({ type: 'success', text: 'Products refreshed successfully!' });
    } catch (error) {
      console.error('Error refreshing products:', error);
      setMessage({ type: 'error', text: 'Failed to refresh products. Please try again.' });
    } finally {
      setProductsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#fff', backgroundColor: 'rgb(15,58,87)', p: 2, borderRadius: 2}}>
        <LocalMall sx={{ fontSize: 32, mr: 2, color: 'white' }} />
        <Typography variant="h4" fontWeight={700} color="white">
          ORDER PLACEMENT
        </Typography>
        <Chip 
          label={`${calculateItemsCount()} items`} 
          color="white" 
          variant="outlined" 
          sx={{ ml: 2, fontWeight: 600 ,  color: '#fff' }}
        />
      </Box>
      
      {message.text && (
        <Zoom in={true}>
          <Alert 
            severity={message.type} 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={message.type === 'success' ? <CheckCircle /> : null}
          >
            {message.text}
          </Alert>
        </Zoom>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Customer Information
              </Typography>
            </Box>
            
            {customersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : customerDetails ? (
              <Fade in={true}>
                <Card variant="outlined" sx={{ mb: 3, borderColor: 'primary.light', bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
                      Customer Details
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {customerDetails.name ? customerDetails.name.charAt(0) : 'C'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{customerDetails.name || 'Customer Name'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customerDetails.email || 'customer@example.com'}
                        </Typography>
                        {customerDetails.phone && (
                          <Typography variant="body2" color="text.secondary">
                            Phone: {customerDetails.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            ) : (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                Unable to load customer information. Please try refreshing the page.
              </Alert>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Order Items
                </Typography>
              </Box>
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<Refresh />} 
                  onClick={refreshProducts}
                  disabled={productsLoading}
                  sx={{ mr: 1, borderRadius: 2 }}
                  size="small"
                >
                  Refresh
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={handleAddProduct}
                  disabled={productsLoading}
                  sx={{ borderRadius: 2 }}
                  size="small"
                >
                  Add Item
                </Button>
              </Box>
            </Box>
            
            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                No products available. Please try refreshing.
              </Alert>
            ) : (
              orderItems.map((item, index) => (
                <Fade in={true} key={index}>
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 2,
                    bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 1,
                      borderColor: 'primary.light'
                    }
                  }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          select
                          fullWidth
                          label="Select Product"
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                          required
                          disabled={productsLoading}
                          size="small"
                        >
                          <MenuItem value="">Select a product</MenuItem>
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.productName} - ${product.price ? product.price.toFixed(2) : '0.00'}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => decrementQuantity(index)}
                            disabled={item.quantity <= 1}
                            color="primary"
                          >
                            <Remove />
                          </IconButton>
                          
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            inputProps={{ min: 1 }}
                            sx={{ width: 80, mx: 1 }}
                            size="small"
                          />
                          
                          <IconButton 
                            size="small" 
                            onClick={() => incrementQuantity(index)}
                            color="primary"
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={2}>
                        {item.productId && (
                          <Typography fontWeight={600} color="primary">
                            ${(getProductPrice(item.productId) * item.quantity).toFixed(2)}
                          </Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sm={1}>
                        {orderItems.length > 1 && (
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveProduct(index)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              ))
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Order Summary
              </Typography>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.filter(item => item.productId).map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                          {getProductName(item.productId)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${(getProductPrice(item.productId) * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <Typography variant="body1" fontWeight={600}>
                        Grand Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        ${calculateTotal().toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || productsLoading || !customerId || orderItems.some(item => !item.productId)}
              sx={{ 
                mt: 3, 
                py: 1.5, 
                borderRadius: 2,
                fontWeight: 600
              }}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
            >
              {loading ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
            </Button>
            
            {(!customerId || orderItems.some(item => !item.productId)) && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                Please select all products to place order
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderPlacement;