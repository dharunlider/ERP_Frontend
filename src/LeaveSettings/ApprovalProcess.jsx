import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, TextField, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Chip, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from '../Axiosinstance';
import Nodatapage from "../Nodatapage";
import { toast, ToastContainer } from 'react-toastify';
import Myrequests from './LeaveRequests';
import Approverequest from './UnapproveRequests';
import EmergencyLeave from './EmergencyLeave';

const ApprovalProcessTabs = () => {
  const [value, setValue] = useState(0);
  const [isStaff, setIsStaff] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState({ myRequests: false, approveRequests: false });
  const [myRequestsData, setMyRequestsData] = useState([]);
  const [approveRequestsData, setApproveRequestsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const role = JSON.parse(sessionStorage.getItem("role"));

  useEffect(() => {
    const authoritiesFromSession = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    setIsStaff(authoritiesFromSession.includes('TYPE_STAFF'));
    setIsAdmin(authoritiesFromSession.includes('ROLE_ADMIN'));
  }, []);

  const handleChange = (_, newValue) => setValue(newValue);

  useEffect(() => {
    if (isAdmin) setValue(0);
    else if (isStaff) setValue(1);
  }, [isAdmin, isStaff]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/approval-process');
      setData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch approval processes:', error);
      toast.error("Failed to fetch data");
    }
  };

  const fetchMyRequests = async () => {
    setLoading(prev => ({ ...prev, myRequests: true }));
    try {
      const currentUserId = JSON.parse(sessionStorage.getItem('userId'));
      const response = await axios.get(`/approval-process/by-staff/${currentUserId}`);
      setMyRequestsData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch my requests:', error);
      toast.error("Failed to fetch my requests");
    } finally {
      setLoading(prev => ({ ...prev, myRequests: false }));
    }
  };

  const fetchunApprove = async () => {
    setLoading(prev => ({ ...prev, approveRequests: true }));
    try {
      const currentUserId = JSON.parse(sessionStorage.getItem('userId'));
      const response = await axios.get(`/approval-process/by-notification-receiver/${currentUserId}`);
      setApproveRequestsData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch approve requests:', error);
      toast.error("Failed to fetch requests to approve");
    } finally {
      setLoading(prev => ({ ...prev, approveRequests: false }));
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchMyRequests();
      fetchunApprove();
    } else if (isAdmin) {
      fetchData();
    }
  }, [isStaff, isAdmin]);

  const filtereData = data.filter(row =>
    (row.leaveAppliedStaffName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  };

  const tableCellStyles = {
    border: '1px solid rgba(224, 224, 224, 1)',
    padding: '8px 12px',
    fontSize: '0.875rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontFamily: 'Marquis',
    textTransform: 'uppercase',
    wordBreak: 'break-word',
    '&.MuiTableCell-head': {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
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
        <Tab label="All Requests" sx={{ display: isAdmin ? 'flex' : 'none' }} />
        <Tab label="My Requests" sx={{ display: isStaff ? 'flex' : 'none' }} />
        <Tab label="Approve Requests" sx={{ display: isStaff ? 'flex' : 'none' }} />
        {role === "TEAMLEAD" && (<Tab label="Emergency Leave " sx={{ display: isStaff ? 'flex' : 'none' }} />)}

      </Tabs>

      {isAdmin && (
        <TabPanel value={value} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: '250px', md: '300px', lg: '250px' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            />
          </Box>

          <TableContainer sx={{ maxHeight: 500, overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 650, '& .MuiTableCell-root': tableCellStyles }}>
              <TableHead>
                <TableRow>
                  {['S.NO', 'NAME', 'APPLIED DATE', 'RELATED', 'SUBJECT', 'ASSIGN NAME', 'STATUS', 'LEAVE COUNTS'].map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtereData.length > 0 ? filtereData.map((row, index) => (
                  <TableRow hover key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.leaveAppliedStaffName}</TableCell>
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {row.daySelection?.map((item, i) => (
                          <Chip key={i} label={item.date} variant="outlined" size="small" sx={{ fontSize: '0.8rem' }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{row.relatedReason}</TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{row.notificationReceivedToName}</TableCell>
                    <TableCell>
                      <Chip
                        label={(row.status || 'PENDING').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor:
                            (row.status || 'PENDING').toUpperCase() === 'APPROVED' ? '#4caf50' :
                              (row.status || 'PENDING').toUpperCase() === 'REJECTED' ? '#f44336' : '#9e9e9e',
                          color: '#fff',
                          textTransform: 'uppercase',
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.maximumNumberToAssign}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={8} align="center"><Nodatapage /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <ToastContainer position="bottom-right" autoClose={1000} />
          </TableContainer>
        </TabPanel>
      )}

      {isStaff && (
        <>
          <TabPanel value={value} index={1}>
            <Myrequests data={myRequestsData} loading={loading.myRequests} refreshData={fetchMyRequests} />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Approverequest data={approveRequestsData} loading={loading.approveRequests} refreshData={fetchunApprove} />
          </TabPanel>
          <TabPanel value={value} index={3}>
            {/* <Approverequest data={EmergencyRequestData} loading={loading.approveRequests} refreshData={fetchunApprove} /> */}
            <EmergencyLeave />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default ApprovalProcessTabs;