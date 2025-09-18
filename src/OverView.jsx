import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, Paper, Avatar,
  useTheme, styled, alpha,TextField, IconButton
} from '@mui/material';
import {
  Inventory, Construction, Business, Group
} from '@mui/icons-material';
import axios from './Axiosinstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import Customer from './Customer/Customer';
import Product from './Product/Product';
import { Refresh } from "@mui/icons-material";

const DashboardCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(
    theme.palette.primary.dark,
    0.9
  )} 100%)`,
  color: theme.palette.common.white,
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const dashboardCards = [
  { title: 'Product', count: 189, icon: <Inventory />, tagline: 'Available items' },
  { title: 'Material', count: 324, icon: <Construction />, tagline: 'Raw materials' },
  { title: 'Departments', count: 12, icon: <Business />, tagline: 'Active departments' },
  { title: 'Customers', count: 245, icon: <Group />, tagline: 'Registered clients' },
];

export default function Dashboard() {
  const theme = useTheme();
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);

   const [productMonthYear, setProductMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customerMonthYear, setCustomerMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // fetch product orders
  const fetchProductData = async () => {
    try {
      const response = await axios.get('/orders/monthly-product-counts', {
        params: { monthYear: productMonthYear },
      });

      const productMap = new Map();
      response.data.forEach((item) => {
        if (item.totalCount > 0) {
          productMap.set(
            item.productName,
            (productMap.get(item.productName) || 0) + item.totalCount
          );
        }
      });
      setProductData(Array.from(productMap, ([name, count]) => ({ name, count })));
    } catch (err) {
      console.error('Error fetching product data:', err);
      setProductData([]);
    }
  };

  // fetch customer growth
  const fetchCustomerData = async () => {
    try {
      const [year, month] = customerMonthYear.split('-');
      const response = await axios.get('/customers/monthly-count', {
        params: { month, year },
      });

      let apiData = response.data;
      if (Array.isArray(apiData)) {
        setCustomerData(apiData.map((item) => ({ month: item.month, count: item.count })));
      } else if (typeof apiData === 'object') {
        setCustomerData([{ month: apiData.month || customerMonthYear, count: apiData.count }]);
      } else if (typeof apiData === 'number') {
        setCustomerData([{ month: customerMonthYear, count: apiData }]);
      } else {
        setCustomerData([]);
      }
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setCustomerData([]);
    }
  };

  // run fetches
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProductData(), fetchCustomerData()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProductData();
  }, [productMonthYear]);

  useEffect(() => {
    fetchCustomerData();
  }, [customerMonthYear]);

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1600, margin: '0 auto' }}>
      {/* Dashboard Heading */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{
          color: theme.palette.primary.main,
          mb: 4,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '60px',
            height: '4px',
            backgroundColor: theme.palette.secondary.main,
            position: 'absolute',
            bottom: '-8px',
            left: 0
          }
        }}
      >
        DASHBOARD
      </Typography>

      {/* Cards Section */}
      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DashboardCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2) }}>
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {card.count}
                  </Typography>
                  <Typography variant="subtitle1">{card.title}</Typography>
                  <Typography variant="caption">{card.tagline}</Typography>
                </Box>
              </CardContent>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{ mt: 6, color: theme.palette.primary.main, mb: 4, position: 'relative',
          '&:after': { content: '""', display: 'block', width: '60px', height: '4px',
            backgroundColor: theme.palette.secondary.main, position: 'absolute',
            bottom: '-8px', left: 0 } }}
      >
        Statistics
      </Typography>

       <Grid container spacing={3}>
        {/* Product Orders Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 350 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Monthly Product Orders
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="month"
                  size="small"
                  value={productMonthYear}
                  onChange={(e) => setProductMonthYear(e.target.value)}
                />
                <IconButton onClick={fetchProductData} color="primary">
                  <Refresh />
                </IconButton>
              </Box>
            </Box>

            {productData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1">No product orders data available for this period</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Customer Growth Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 350 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Customer Growth
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="month"
                  size="small"
                  value={customerMonthYear}
                  onChange={(e) => setCustomerMonthYear(e.target.value)}
                />
                <IconButton onClick={fetchCustomerData} color="primary">
                  <Refresh />
                </IconButton>
              </Box>
            </Box>

            {customerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1">No customer growth data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      
      {/* Customer Management Section */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{ mt: 6, color: theme.palette.primary.main, mb: 4, position: 'relative',
          '&:after': { content: '""', display: 'block', width: '60px', height: '4px',
            backgroundColor: theme.palette.secondary.main, position: 'absolute',
            bottom: '-8px', left: 0 } }}
      >
        Customer Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Customer />
          </Paper>
        </Grid>
      </Grid>

      {/* Product Management Section */}
      <Typography
        variant="h5"
        fontWeight={600}
        sx={{ mt: 6, color: theme.palette.primary.main, mb: 4, position: 'relative',
          '&:after': { content: '""', display: 'block', width: '60px', height: '4px',
            backgroundColor: theme.palette.secondary.main, position: 'absolute',
            bottom: '-8px', left: 0 } }}
      >
        Product Management
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Product />
      </Paper>
    </Box>
  );
}