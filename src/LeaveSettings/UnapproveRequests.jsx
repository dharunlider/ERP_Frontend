import React, { useState, useEffect } from 'react';
import axios from "../Axiosinstance";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    Box, Button, TextField, TableContainer, Table, TableHead, TableRow, TableCell,
    TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Select, MenuItem, Chip, InputAdornment, Alert, Snackbar, Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import {
    Search, EventNote as EventNoteIcon,
    CalendarToday as CalendarTodayIcon, AccountBalance as AccountBalanceIcon,
    MedicalInformation,
    CardTravel,
    PregnantWoman,
    FamilyRestroom,
    MoneyOff,
    Visibility
} from '@mui/icons-material';
import { CheckCircle, Cancel, HourglassEmpty, Delete as DeleteIcon, Event as EventIcon, Close as CloseIcon } from '@mui/icons-material';
import Nodatapage from "../Nodatapage";

const statusStyles = {
    APPROVED: { label: 'Approved', icon: <CheckCircle fontSize="small" />, chipColor: 'success' },
    REJECTED: { label: 'Rejected', icon: <Cancel fontSize="small" />, chipColor: 'error' },
    PENDING: { label: 'Pending', icon: <HourglassEmpty fontSize="small" />, chipColor: 'warning' },
};

const leaveTypes = [
    { value: "annualLeave", label: "Annual Leave" },
    { value: "sickLeave", label: "Sick Leave" },
    { value: "maternityLeave", label: "Maternity Leave" },
    { value: "paternityLeave", label: "Paternity Leave" },
    { value: "CompOff", label: "Compoff Leave" },
];

const StatusDropdown = ({ status = 'PENDING', onChange, row }) => {
    const selectedStyle = statusStyles[status] || statusStyles.PENDING;
    return (
        <Box>
            <Select
                value={status}
                onChange={(e) => onChange(e.target.value, row)}
                size="small"
                displayEmpty
                renderValue={() => (
                    <Chip
                        icon={selectedStyle.icon}
                        label={selectedStyle.label}
                        color={selectedStyle.chipColor}
                        size="small"
                        sx={{ borderRadius: '8px', fontWeight: 500 }}
                    />
                )}
                sx={{
                    minWidth: 150,
                    height: 36,
                    backgroundColor: '#f9f9f9',
                    borderRadius: '10px',
                    px: 1,
                    '& .MuiSelect-icon': { color: '#555' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
                MenuProps={{ PaperProps: { sx: { borderRadius: 1 } } }}
            >
                {['APPROVED', 'REJECTED'].map((val) => (
                    <MenuItem key={val} value={val}>
                        <Chip
                            icon={statusStyles[val].icon}
                            label={statusStyles[val].label}
                            color={statusStyles[val].chipColor}
                            size="small"
                            sx={{ borderRadius: '8px', fontWeight: 500 }}
                        />
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};

const ApprovalProcessTab = ({ value, isStaff, data = [], loading = false, refreshData = () => { } }) => {


    const [searchTerm, setSearchTerm] = useState('');
    const [allStaff, setAllStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [openToast, setOpenToast] = useState(false);
    const [filteredData, setFilteredData] = useState(data);

    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const [leaveBalanceData, setLeaveBalanceData] = useState([]);
    const [leaveBalanceLoading, setLeaveBalanceLoading] = useState(false);
    const [leaveBalanceError, setLeaveBalanceError] = useState(false);


    const fetchLeaveBalance = async (staffId, year) => {
        setLeaveBalanceLoading(true);
        try {
            const response = await axios.get(`/leave-balance/staff/${staffId}/year/${year}`);
            setLeaveBalanceData(response.data);
        } catch (error) {
            setLeaveBalanceError(true);
        } finally {
            setLeaveBalanceLoading(false);
        }
    };

    const formatLeaveType = (type) => {
        const types = {
            'SICK_LEAVE': 'Sick Leave',
            'ANNUAL_LEAVE': 'Annual Leave',
            'MATERNITY_LEAVE': 'Maternity Leave',
            'PATERNITY_LEAVE': 'Paternity Leave',

            'UNPAID_LEAVE': 'Unpaid Leave'
        };
        return types[type] || type;
    };

    const getLeaveIcon = (type) => {
        const icons = {
            'SICK_LEAVE': <MedicalInformation fontSize="small" color="primary" />,
            'ANNUAL_LEAVE': <CardTravel fontSize="small" color="primary" />,
            'MATERNITY_LEAVE': <PregnantWoman fontSize="small" color="primary" />,
            'PATERNITY_LEAVE': <FamilyRestroom fontSize="small" color="primary" />,
            'UNPAID_LEAVE': <MoneyOff fontSize="small" color="primary" />
        };
        return icons[type] || <EventNoteIcon fontSize="small" color="primary" />;
    };

    // Add this useEffect to load data when dialog opens
    useEffect(() => {
        if (detailsDialogOpen && selectedLeave) {
            fetchLeaveBalance(selectedLeave.leaveAppliedStaffId, new Date().getFullYear());
        }
    }, [detailsDialogOpen, selectedLeave]);


    const handleViewDetails = (leave) => {
        console.log("SSDFDF:", leave)
        setSelectedLeave(leave);
        setDetailsDialogOpen(true);
    };

    const fetchDropdownOptions = async () => {
        try {
            const [staffRes, deptRes, rolesRes] = await Promise.all([
                axios.get('/staff/allstaffs'),
                axios.get('/departments/all-departments'),
                axios.get('/roles/all')
            ]);
            setAllStaff(staffRes.data || []);
            setDepartments(deptRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch dropdown options:', error);
            toast.error('Failed to fetch dropdown options');
        }
    };

    useEffect(() => { fetchDropdownOptions(); }, []);
    useEffect(() => { setFilteredData(data); }, [data]);
    useEffect(() => {
        setFilteredData(searchTerm.trim() === '' ? data :
            data.filter(item => item.leaveAppliedStaffName?.toLowerCase().includes(searchTerm.toLowerCase())))
    }, [searchTerm, data]);

    const staffId = sessionStorage.getItem("userId");
    const handleStatusChange = async (newStatus, row) => {
        try {
            await axios.post(`/approval-process/${row.id}/approve`,
                { status: newStatus },
                { params: { approverId: staffId } }
            );
            refreshData();
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };


    const currentUserId = Number(JSON.parse(sessionStorage.getItem('userId')));

    return (
        <>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ height: '40px', width: { xs: '100%', sm: '250px', md: '300px', lg: '250px' } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
            </Box>

            <TableContainer sx={{ maxHeight: 500, overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 650, '& .MuiTableCell-root': tableCellStyle }}>
                    <TableHead>
                        <TableRow>
                            {['S.NO', 'NAME', 'APPLIED DATE', 'RELATED', 'LEAVE COUNTS', 'STATUS', 'DETAILS'].map((header) => (
                                <TableCell key={header}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length > 0 ? filteredData.map((row, index) => (
                            <TableRow hover key={row.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.leaveAppliedStaffName}</TableCell>
                                <TableCell align="center">
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.4,
                                            alignItems: 'center',
                                            minWidth: '200px',
                                        }}
                                    >
                                        {/* Case 1: Annual/Sick/Paternity Leave → Show daySelection */}
                                        {['annualLeave', 'sickLeave', 'paternityLeave', 'EmergencyLeave'].includes(row.relatedReason) && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                    {leaveTypes.find((lt) => lt.value === row.relatedReason)?.label || row.relatedReason}
                                                </Typography>

                                                {row.daySelection && row.daySelection.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, justifyContent: 'center' }}>
                                                        {row.daySelection.map((item, i) => (
                                                            <Chip
                                                                key={i}
                                                                label={
                                                                    item.date
                                                                        ? `${dayjs(item.date).format('DD MMM')}${item.type === 'HALF' ? ' (Half)' : ''
                                                                        }`
                                                                        : 'No date'
                                                                }
                                                                color="primary"
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.6rem' }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        No date
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Case 2: Comp Off */}
                                        {row.relatedReason === 'CompOff' && (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                    {row.compOffLeaveType || 'Comp Off'}
                                                </Typography>
                                                {row.compensatoryWork ? (
                                                    <Chip
                                                        label={dayjs(row.compensatoryWork).format('DD MMM YYYY')}
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.6rem', mt: 0.4 }}
                                                    />
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        No date
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Case 3: Maternity Leave */}
                                        {row.relatedReason === 'maternityLeave' && (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                                    {leaveTypes.find((lt) => lt.value === row.relatedReason)?.label || row.relatedReason}
                                                </Typography>
                                                {row.fromDate && row.toDate ? (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip
                                                            label={
                                                                dayjs(row.fromDate).isSame(dayjs(row.toDate), 'day')
                                                                    ? dayjs(row.fromDate).format('DD MMM')
                                                                    : `${dayjs(row.fromDate).format('DD MMM')} - ${dayjs(row.toDate).format('DD MMM')}`
                                                            }
                                                            color="primary"
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.6rem' }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        No date
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </TableCell>

                                <TableCell>{row.relatedReason}</TableCell>
                                <TableCell>{row.maximumNumberToAssign}</TableCell>
                                <TableCell>
                                    <StatusDropdown status={row.status} onChange={handleStatusChange} row={row} />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewDetails(row)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={7} align="center"><Nodatapage /></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Leave Details Dialog */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        background: 'linear-gradient(to bottom right, #f9f9f9, #ffffff)'
                    }
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 3,
                    borderBottom: '1px solid #e0e0e0',
                    background: 'linear-gradient(to right, #1a2b48, #2c3e50)',
                    color: 'white'
                }}>
                    <DialogTitle sx={{
                        p: 0,
                        fontSize: '1.4rem',
                        fontWeight: 600,
                        color: 'inherit'
                    }}>
                        Leave Request Details
                    </DialogTitle>
                    <IconButton
                        onClick={() => setDetailsDialogOpen(false)}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <DialogContent dividers sx={{ p: 3 }}>
                    {selectedLeave && (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'max-content 1fr',
                            gap: 2,
                            alignItems: 'center'
                        }}>
                            <DetailItem label="Staff Name" value={selectedLeave.leaveAppliedStaffName} />
                            <DetailItem label="Leave Type" value={selectedLeave.relatedReason} />
                            <DetailItem label="Document">
                                {selectedLeave.document && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => window.open(selectedLeave.document, '_blank')}
                                        startIcon={<Visibility />}
                                        size="small"
                                    >
                                        View
                                    </Button>
                                )}
                            </DetailItem>


                            <DetailItem label="Status">
                                <Chip
                                    label={selectedLeave.status}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: statusStyles[selectedLeave.status]?.chipColor || 'default',
                                        color: 'black',
                                        textTransform: 'capitalize'
                                    }}
                                />
                            </DetailItem>
                            <DetailItem label="Leave Count" value={selectedLeave.maximumNumberToAssign} />

                            <>

                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="subtitle1" sx={{
                                        mb: 1.5,
                                        fontWeight: 600,
                                        color: '#1a2b48',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <EventNoteIcon fontSize="small" />
                                        Leave Dates
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            p: 1.5,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        {/* Case 1: Day selection dates */}
                                        {selectedLeave.daySelection?.length > 0 ? (
                                            selectedLeave.daySelection.map((day, index) => (
                                                <Chip
                                                    key={index}
                                                    label={`${dayjs(day.date).format('DD MMM YYYY')} (${day.type})`}
                                                    variant="outlined"
                                                    size="small"
                                                    icon={<CalendarTodayIcon fontSize="small" />}
                                                    sx={{
                                                        backgroundColor: '#ffffff',
                                                        borderColor: '#e0e0e0',
                                                        '& .MuiChip-label': {
                                                            fontSize: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        },
                                                    }}
                                                />
                                            ))
                                        ) : selectedLeave.relatedReason === 'CompOff' && selectedLeave.compensatoryWork ? (
                                            // Case 2: CompOff
                                            <Chip
                                                label={`${selectedLeave.compOffLeaveType || 'Comp Off'} - ${dayjs(selectedLeave.compensatoryWork).format('DD MMM YYYY')}`}
                                                variant="outlined"
                                                size="small"
                                                icon={<CalendarTodayIcon fontSize="small" />}
                                                sx={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e0e0e0',
                                                    '& .MuiChip-label': {
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    },
                                                }}
                                            />
                                        ) : selectedLeave.fromDate && selectedLeave.toDate ? (
                                            // Case 3: fromDate - toDate (like Maternity Leave)
                                            <Chip
                                                label={
                                                    dayjs(selectedLeave.fromDate).isSame(dayjs(selectedLeave.toDate), 'day')
                                                        ? `${dayjs(selectedLeave.fromDate).format('DD MMM YYYY')}`
                                                        : `${dayjs(selectedLeave.fromDate).format('DD MMM YYYY')} - ${dayjs(selectedLeave.toDate).format('DD MMM YYYY')}`
                                                }
                                                variant="outlined"
                                                size="small"
                                                icon={<CalendarTodayIcon fontSize="small" />}
                                                sx={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e0e0e0',
                                                    '& .MuiChip-label': {
                                                        fontSize: '0.75rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    },
                                                }}
                                            />
                                        ) : null}
                                    </Box>




                                </Box>

                            </>

                            <Box sx={{ gridColumn: '1 / -1', mt: 3 }}>
                                <Typography variant="subtitle1" sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: '#1a2b48',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <AccountBalanceIcon fontSize="small" />
                                    Leave Balance Summary
                                </Typography>

                                {leaveBalanceLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                        <Typography>Loading leave balance...</Typography>
                                    </Box>
                                ) : leaveBalanceError ? (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        Failed to load leave balance data
                                    </Alert>
                                ) : (
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: 2,
                                        mt: 1
                                    }}>
                                        {leaveBalanceData.map((balance) => (
                                            <Box key={balance.leaveType} sx={{
                                                p: 2,
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '8px',
                                                backgroundColor: '#f8fafc'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    {getLeaveIcon(balance.leaveType)}
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {formatLeaveType(balance.leaveType)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                    <Typography variant="body2">Used:</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {balance.used}/{balance.maxAllowed}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2">Remaining:</Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontWeight: 600,
                                                        color: balance.remaining > 0 ? 'success.main' : 'error.main'
                                                    }}>
                                                        {balance.remaining}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ mt: 1 }}>
                                                    <Box sx={{
                                                        height: 8,
                                                        backgroundColor: '#e0e0e0',
                                                        borderRadius: 4,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <Box sx={{
                                                            width: `${balance.usedPercentage}%`,
                                                            height: '100%',
                                                            backgroundColor: balance.usedPercentage >= 100 ? 'error.main' :
                                                                balance.usedPercentage >= 80 ? 'warning.main' : 'primary.main'
                                                        }} />
                                                    </Box>
                                                    <Typography variant="caption" sx={{ textAlign: 'right', display: 'block', mt: 0.5 }}>
                                                        {balance.usedPercentage.toFixed(1)}% used
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {selectedLeave.notificationReceivedToName && (
                                <DetailItem
                                    label="Approver"
                                    value={selectedLeave.notificationReceivedToName}
                                />
                            )}
                        </Box>

                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                    background: '#f9f9f9'
                }}>
                    <Button
                        onClick={() => setDetailsDialogOpen(false)}
                        variant="contained"
                        sx={{
                            backgroundColor: '#1a2b48',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#0f1a2e'
                            },
                            px: 3,
                            py: 1,
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer position="bottom-right" autoClose={3000} />
            <Snackbar open={openToast} autoHideDuration={3000} onClose={() => setOpenToast(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity="error" onClose={() => setOpenToast(false)}>You cannot assign notification to yourself</Alert>
            </Snackbar>
        </>
    );
};

const DetailItem = ({ label, value, children }) => (
    <>
        <Typography variant="subtitle1" sx={{
            fontWeight: 600,
            color: '#555',
            whiteSpace: 'nowrap'
        }}>
            {label}:
        </Typography>
        {children || (
            <Typography variant="body1" sx={{
                color: '#333',
                wordBreak: 'break-word'
            }}>
                {value}
            </Typography>
        )}
    </>
);


const tableCellStyle = {
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
    }
};

export default ApprovalProcessTab;