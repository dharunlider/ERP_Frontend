import React, { useState, useEffect } from 'react';
import {
  Paper, Tabs, Tab, Snackbar, Alert, useMediaQuery, useTheme,
} from '@mui/material';
import AttendanceTab from './AttendanceTab';

import axios from '../Axiosinstance';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Timesheet = () => {


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [employeeData, setEmployeeData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const staffId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchEmployeeData();
  }, [staffId]);

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(`staff/${staffId}`);
      console.log(response.data, "staffstaff");
      setEmployeeData(response.data);
    } catch (err) {
      console.error('Failed to fetch employee data:', err);
      setError('Failed to load employee info');
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') return;
    setAlert({ ...alert, open: false });
  };

  return (
    <Paper style={{ padding: '16px', overflowX: 'hidden' }}>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      {isMobile ? (
    
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#F0F4F8',
            padding: '8px 12px',
            // borderRadius: '12px',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#142a4f',
              // borderRadius: '8px',
              padding: '6px 18px',
              // margin: '0 8px',
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
          <Tab label="TIMESHEET" />
        </Tabs>
      ) : (
        <Tabs indicatorColor="primary" textColor="black">
          <Tab
            label="TIMESHEET"
            icon={<AccessTimeIcon />}
            iconPosition="start"
            sx={{
              fontSize: '24px',
              fontWeight: 600,
              textTransform: 'none',
              // padding: '12px 24px',
            }}
          />
        </Tabs>
      )}
      {activeTab === 0 && (
        <AttendanceTab
         isMobile={isMobile}
          employeeData={employeeData}
          month={month}
          year={year}
        />
      )}

    </Paper>
  );
};

export default Timesheet;
