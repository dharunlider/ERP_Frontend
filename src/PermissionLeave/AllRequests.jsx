import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {
    Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, InputAdornment, Tabs, Tab, Typography, Chip, Paper
} from '@mui/material';
import Nodatapage from "../Nodatapage";
import { Search } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import ApplyPermission from './ApplyPermission';
import Processedrequest from './ProcessedRequests';
import {formatMinutesToHours}  from '../Constants/UtilFunctions'


function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box p={2}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export default function Compount() {
    const [isStaff, setIsStaff] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const currentUserId = sessionStorage.getItem('userId');

    useEffect(() => {
        const authorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
        setIsStaff(authorities.includes('TYPE_STAFF'));
        setIsAdmin(authorities.includes('ROLE_ADMIN'));
    }, []);
    useEffect(() => {
        if (isAdmin) {
            setTabIndex(0);
        } else if (isStaff) {
            setTabIndex(1);
        }
    }, [isAdmin, isStaff]);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/PermissionLeaveApply');
            console.log("API response:", response.data);
            setData(response.data || []);
        } catch (error) {
            console.error('Failed to fetch approval processes:', error);
            toast.error("Failed to fetch data");
        }
    };


    const [requestsData, setRequestsData] = useState([]);
    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/PermissionLeaveApply/by-staff/${currentUserId}`);
            setRequestsData(response.data || []);
        } catch (error) {
            console.error('Failed to fetch my requests:', error);
           
        } finally {
            setLoading(false);
        }
    };

    const [processdata, setprocessData] = useState([]);
    const fetchProcessData = async () => {
        try {
            const currentUserId = sessionStorage.getItem('userId');
            const response = await axios.get(`/PermissionLeaveApply/by-notification-receiver/${currentUserId}`);
            setprocessData(response.data || []);
        } catch (error) {
            console.error('Failed to fetch approval processes:', error);
          
        }
    };



    useEffect(() => {
        fetchData();
        fetchMyRequests();
        fetchProcessData();
    }, []);

    const filteredData = data.filter(row =>
        (row.leaveAppliedStaffName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ width: '100%' }}>
                <Tabs value={tabIndex} onChange={handleChange}
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
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#142a4f',
                            borderRadius: '8px',
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
                    }}>
                    <Tab label="ALL Requests" sx={{ display: isAdmin ? 'flex' : 'none' }} />
                    <Tab label="Apply Permission" sx={{ display: isStaff ? 'flex' : 'none' }} />
                    <Tab label="Process Requests" sx={{ display: isStaff ? 'flex' : 'none' }} />
                </Tabs>

                {/* Tab 0: Staff */}
                {isAdmin && (
                    <TabPanel value={tabIndex} index={0}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    width: {
                                        xs: '100%',
                                        sm: '250px',
                                        md: '300px',
                                        lg: '250px',
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <TableContainer
                            sx={{
                                maxHeight: 500,
                                overflowX: 'auto',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                            }}
                        >
                            <Table stickyHeader size="small"
                                sx={{
                                    minWidth: 650,
                                    '& .MuiTableCell-root': {
                                        border: '1px solid rgba(224, 224, 224, 1)',
                                        padding: '8px 12px',
                                        fontSize: '0.875rem',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        fontFamily: 'Marquis',
                                        textTransform: 'uppercase',
                                        wordBreak: 'break-word',
                                    },
                                    '& .MuiTableCell-head': {
                                        backgroundColor: '#f5f5f5',
                                        fontWeight: 'bold',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>S.NO</TableCell>
                                        <TableCell>NAME</TableCell>
                                        <TableCell>APPLIED DATE</TableCell>
                                        <TableCell>REASON</TableCell>
                                        <TableCell>APPROVER NAME</TableCell>
                                        <TableCell>STATUS</TableCell>
                                        <TableCell>PERMISSION DURATION</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((row, index) => (
                                            <TableRow hover key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{row.leaveAppliedStaffName}</TableCell>
                                                <TableCell align='center'>
                                                  {row.permissionAppliedDate}
                                                </TableCell>
                                                <TableCell>{row.relatedReason}</TableCell>
                                                <TableCell>{row.notificationReceivedToName}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={(row.status || 'PENDING').toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor:
                                                                (row.status || 'PENDING').toUpperCase() === 'APPROVED'
                                                                    ? '#4caf50'
                                                                    : (row.status || 'PENDING').toUpperCase() === 'REJECTED'
                                                                        ? '#f44336'
                                                                        : '#9e9e9e',
                                                            color: '#fff',
                                                            textTransform: 'uppercase',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{formatMinutesToHours(row.duration)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Nodatapage />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <ToastContainer position="bottom-right" autoClose={1000} />
                        </TableContainer>
                    </TabPanel>
                )}

                {isStaff && (
                    <TabPanel value={tabIndex} index={1}>
                        <ApplyPermission data={requestsData}
                            refreshData={fetchMyRequests} />
                    </TabPanel>
                )}

                {/* Tab 2: General */}
                {isStaff && (
                    <TabPanel value={tabIndex} index={2}>
                        <Processedrequest data={processdata}
                            refreshData={fetchProcessData} />
                    </TabPanel>
                )}
            </Box>
        </Paper>
    );
}
