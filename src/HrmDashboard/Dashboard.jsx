// HrDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Grid, Card, CardContent, ThemeProvider, createTheme, useMediaQuery, CircularProgress, IconButton, Button
} from '@mui/material';
import { Person, Group, Work, Warning, Event } from '@mui/icons-material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from '../Axiosinstance';
import ExpiredContracts from "./ExpiredContracts";
import NearlyExpiredContracts from "./NearlyExpiredContracts";
import BirthdaysInMonth from "./BirthdaysInMonth";
import { generateColors } from "../Constants/UtilFunctions";
import { useNavigate } from 'react-router-dom';
import Staff from '../HrmStaff/Staff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Contract from '../Contract/Contract';
import Activestaff from './Activestaff'
import Inactivestaff from './Inactivestaff'
import Newstaffcount from './Newstaffcount'

ChartJS.register(ArcElement, Tooltip, Legend);

const theme = createTheme({
  palette: {
    primary: { main: '#3f51b5', light: '#757de8', dark: '#002984' },
    secondary: { main: '#f50057' },
    background: { default: '#f8f9fa', paper: '#ffffff' },
    text: { primary: '#2d3748', secondary: '#718096' },
  },
  typography: {
    fontFamily: 'Marquis',
    h3: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    body1: { fontSize: '0.875rem' },
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

const StatCard = ({ icon, title, count, maxValue, color, onClick }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (

    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `4px solid ${color}`, cursor: 'pointer' }} onClick={onClick}>

      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" mb={1.5}>
          <Box sx={{ p: 1.5, mr: 2, bgcolor: `${color}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(icon, { sx: { color, fontSize: isSmallScreen ? '1.25rem' : '1.5rem' } })}
          </Box>
          <Typography variant="subtitle2" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem', fontWeight: "bold", fontFamily: "Marquis", textTransform: "uppercase" }}>
            {title}
          </Typography>
        </Box>
        <Box display="flex" alignItems="flex-end" mb={1}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mr: 1, fontSize: isSmallScreen ? '1.5rem' : '2rem' }}>
            {count}
          </Typography>
          {maxValue && <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>{`/ ${maxValue}`}</Typography>}
        </Box>
        {maxValue && (
          <Box sx={{ height: 8, bgcolor: '#edf2f7', borderRadius: 4, overflow: 'hidden', width: '100%' }}>
            <Box sx={{ width: `${(count / maxValue) * 100}%`, height: '100%', bgcolor: color, borderRadius: 4 }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ title, data, colors }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = {
    labels: data.labels,
    datasets: [{ data: data.values, backgroundColor: colors, borderWidth: 0 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: isSmallScreen ? 10 : 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            const value = data.values[index];
            const total = data.values.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${data.labels[index]}: ${value} (${percent}%)`;
          },
        },
      },
    },
    cutout: isSmallScreen ? '60%' : '70%',
  };

  return (

    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: isSmallScreen ? '320px' : '370px' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center', fontFamily: 'Marquis', textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1, position: 'relative', minHeight: '250px' }}>
          <Pie data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

function HrDashboard() {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardData, setDashboardData] = useState(null);
  const [contractCounts, setContractCounts] = useState({ overdue: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('/staff/dashboard-statistics');
        const contractRes = await axios.get('/staff-contracts/contract-counts');
        setDashboardData(statsRes.data);
        setContractCounts(contractRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </ThemeProvider>
    );
  }

const staffStats = [
  { title: 'TOTAL STAFF', count: dashboardData.overallStats.total, icon: <Group />, color: theme.palette.primary.main, view: 'staff' },
  { title: 'NEW STAFF (THIS MONTH)', count: dashboardData.overallStats.thisMonth, icon: <Person />, color: '#4caf50', view: 'Newstaffcount' },
  { title: 'ACTIVE STAFF', count: dashboardData.overallStats.active, icon: <Work />, color: '#2196f3', view: 'Activestaff' },
  { title: 'INACTIVE STAFF', count: dashboardData.overallStats.inactive, icon: <Person />, color: '#ef5350', view: 'Inactivestaff' },
  { title: 'OVERDUE CONTRACTS', count: contractCounts.overdue, icon: <Warning />, color: '#f44336', view: 'contracts' },
  { title: 'CONTRACTS TO EXPIRE', count: contractCounts.expiringSoon, icon: <Event />, color: '#ff9800', view: 'contracts' },
];


  const chartData = {
      department: {
        labels: dashboardData.departmentStats.map(d => d.departmentName),
        values: dashboardData.departmentStats.map(d => d.staffCount),
        colors: generateColors(dashboardData.departmentStats.length),
      },
    gender: {
      labels: dashboardData.genderStats.map(g => g.gender),
      values: dashboardData.genderStats.map(g => g.count),
      colors: ['#2196f3', '#e91e63', '#9c27b0'],
    },
    staffType: {
      labels: dashboardData.statusStats.map(s => s.status),
      values: dashboardData.statusStats.map(s => s.count),
      colors: ['#2e7d32', '#a5d6a7', '#ff9800'],
    },
    contractType: {
      labels: ['Fixed-price', 'Cost-plus', 'Conditional'],
    values: dashboardData.statusStats.map(s => s.count),
      colors: ['#3f51b5', '#ff9800', '#f44336'],
    },
  };

  return (
    <ThemeProvider theme={theme}>
      {activeView === 'dashboard' && (
        <Box sx={{ p: isSmallScreen ? 2 : 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ color: '#fff', backgroundColor: 'rgb(15,58,87)', p: 2, borderRadius: 2 }}>
              HR DASHBOARD
            </Typography>
          </Box>


          <Grid container spacing={3} sx={{ mb: 4 }}>
            {staffStats.map((stat, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <StatCard
                  {...stat}
                  onClick={() => setActiveView(stat.view)}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}><ChartCard title="Staff by Department" data={chartData.department} colors={chartData.department.colors} /></Grid>
            <Grid item xs={12} sm={6}><ChartCard title="Staff by Gender" data={chartData.gender} colors={chartData.gender.colors} /></Grid>
            <Grid item xs={12} sm={6}><ChartCard title="Staff Status" data={chartData.staffType} colors={chartData.staffType.colors} /></Grid>
            <Grid item xs={12} sm={6}><ChartCard title="Contract Types" data={chartData.contractType} colors={chartData.contractType.colors} /></Grid>
          </Grid>

          <Box sx={{ mb: 4 }}><ExpiredContracts /></Box>
          <Box sx={{ mb: 4 }}><NearlyExpiredContracts /></Box>
          <Box sx={{ mb: 4 }}><BirthdaysInMonth /></Box>
        </Box>
      )}

      {activeView === 'staff' && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography variant="h5">Staff</Typography> */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveView('dashboard')}
              sx={{
                mb: 2,
                backgroundColor: '#1976d2', // MUI blue
                color: '#fff',
                textTransform: 'none', // keep text normal case
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: 4,
                },
              }}
            >
              Back to Dashboard
            </Button>

          </Box>
          <Staff />
        </Box>
      )}

         {activeView === 'Newstaffcount' && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography variant="h5">Staff</Typography> */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveView('dashboard')}
              sx={{
                mb: 2,
                backgroundColor: '#1976d2', // MUI blue
                color: '#fff',
                textTransform: 'none', // keep text normal case
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: 4,
                },
              }}
            >
              Back to Dashboard
            </Button>

          </Box>
          <Newstaffcount />
        </Box>
      )}

         {activeView === 'Activestaff' && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography variant="h5">Staff</Typography> */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveView('dashboard')}
              sx={{
                mb: 2,
                backgroundColor: '#1976d2', // MUI blue
                color: '#fff',
                textTransform: 'none', // keep text normal case
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: 4,
                },
              }}
            >
              Back to Dashboard
            </Button>

          </Box>
          <Activestaff />
        </Box>
      )}

        {activeView === 'Inactivestaff' && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography variant="h5">Staff</Typography> */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveView('dashboard')}
              sx={{
                mb: 2,
                backgroundColor: '#1976d2', // MUI blue
                color: '#fff',
                textTransform: 'none', // keep text normal case
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: 4,
                },
              }}
            >
              Back to Dashboard
            </Button>

          </Box>
          <Inactivestaff />
        </Box>
      )}



      {activeView === 'contracts' && (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography variant="h5">Contracts Management</Typography> */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveView('dashboard')}
              sx={{
                mb: 2,
                backgroundColor: '#1976d2', // MUI blue
                color: '#fff',
                textTransform: 'none', // keep text normal case
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: 4,
                },
              }}
            >
              Back to Dashboard
            </Button>

          </Box>
          <Contract />
        </Box>
      )}
    </ThemeProvider>
  );
}
export default HrDashboard;
