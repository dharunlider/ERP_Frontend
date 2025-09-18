import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Grid, MenuItem, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
  Tabs, Tab, AppBar
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import axios from '../Axiosinstance';
import ApprovalProcess from '../LeaveSettings/ApprovalProcess';
import Holiday from '../LeaveSettings/Holiday';
import LeavePolicy from '../LeaveSettings/LeavePolicy';
import Nodatapage from "../Nodatapage";

const AnnualLeave = () => {
  const [allStaff, setAllStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  // const [tab, setTab] = useState(0);

  useEffect(() => {
    axios.get('/staff/allstaffs').then(res => {
      const staffData = res.data || [];
      setAllStaff(staffData);
      setStaffList(staffData);
    });

    axios.get('/departments/all-departments').then(res => setDepartments(res.data || []));
    axios.get('/roles/all').then(res => setRoles(res.data || []));
  }, []);

  useEffect(() => {
    let filtered = [...allStaff];
    if (selectedStaff) filtered = filtered.filter(s => s.id === selectedStaff);
    if (selectedDept) {
      const deptObj = departments.find(d => d.id === selectedDept);
      if (deptObj) {
        filtered = filtered.filter(s =>
          s.departmentName?.trim().toLowerCase() === deptObj.name.trim().toLowerCase()
        );
      }
    }
    if (selectedRole) {
      const roleObj = roles.find(r => r.roleId === selectedRole);
      if (roleObj) {
        filtered = filtered.filter(s =>
          s.roleName?.trim().toLowerCase() === roleObj.roleName.trim().toLowerCase()
        );
      }
    }
    setFilteredData(filtered);
  }, [selectedStaff, selectedDept, selectedRole, allStaff, departments, roles]);

  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
        style={{ backgroundColor: 'white', padding: 24 }}
      >
        {value === index && children}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">

      <AppBar position="static" color="default" elevation={0} sx={{ mb: 3 }}>
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
          {/* <Tab label="ANNUAL LEAVE" {...a11yProps(0)} /> */}
          <Tab label="HOLIDAY" {...a11yProps(0)} />
          <Tab label="LEAVE MANAGEMENT" {...a11yProps(1)} />
          <Tab label="LEAVE POLICY" {...a11yProps(2)} />
        </Tabs>
      </AppBar>

      {/* Holiday Tab */}
      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
       <Holiday />
      </Box>

      {/* Approval Process Tab */}
      <TabPanel value={activeTab} index={1}>
          <ApprovalProcess />
      </TabPanel>
      {/* Leave Policy Tab */}
      <TabPanel value={activeTab} index={2}>
        <LeavePolicy />
      </TabPanel>
    </Container>
  );
};

export default AnnualLeave;