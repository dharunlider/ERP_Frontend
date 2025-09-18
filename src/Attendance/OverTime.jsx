import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Tooltip, IconButton, useMediaQuery, Tabs, Tab, FormHelperText,
    FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress
} from '@mui/material';
import { Add, Search, Edit, Delete, Cancel } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import PropTypes from 'prop-types';

const initialFormData = {
    otDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    staff: '',
    department: '',
    notificationReceivedTO: null,
    role: ''
};

const OverTime = () => {
    const [state, setState] = useState({
        openModal: false,
        isEditing: false,
        roles: [],
        pendingShifts: [],
        processedShifts: [],
        allShifts: [],
        allStaff: [],
        departments: [],
        searchTerm: '',
        tableData: [],
        formData: initialFormData,
        activeTab: 0
    });
    const [isStaff, setIsStaff] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        otDate: '',
        startTime: '',
        endTime: '',
        reason: '',
        notificationReceivedTO: ''
    });

    const validateForm = () => {
        const newErrors = {
            otDate: '',
            startTime: '',
            endTime: '',
            reason: '',
            notificationReceivedTO: ''
        };
        let isValid = true;

        if (!state.formData.otDate) {
            newErrors.otDate = 'Date is required';
            isValid = false;
        }

        if (!state.formData.startTime) {
            newErrors.startTime = 'Start time is required';
            isValid = false;
        }

        if (!state.formData.endTime) {
            newErrors.endTime = 'End time is required';
            isValid = false;
        } else if (state.formData.startTime && state.formData.endTime) {
            const start = new Date(`1970-01-01T${state.formData.startTime}`);
            const end = new Date(`1970-01-01T${state.formData.endTime}`);
            if (end <= start) {
                newErrors.endTime = 'End time must be after start time';
                isValid = false;
            }
        }

        if (!state.formData.reason) {
            newErrors.reason = 'Reason is required';
            isValid = false;
        } else if (state.formData.reason.length < 5 || state.formData.reason.length > 50) {
            newErrors.reason = 'Reason must be between 5-50 characters';
            isValid = false;
        }

        if (!state.formData.notificationReceivedTO?.id) {
            newErrors.notificationReceivedTO = 'Notification receiver is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleTabChange = (event, newValue) => {
        setState(prev => ({ ...prev, activeTab: newValue }));
    };

    const isMobile = useMediaQuery('(max-width:600px)');
    const currentUserId = sessionStorage.getItem('userId');

    const fetchData = async () => {
        try {
            const [staffRes, deptRes, rolesRes] = await Promise.all([
                axios.get('/staff/allstaffs'),
                axios.get('/departments/all-departments'),
                axios.get('/roles/all')
            ]);

            let pendingShifts = [];
            let processedShifts = [];
            let allShifts = [];

            if (isAdmin) {
                const allOtRes = await axios.get('/overtime/all');
                allShifts = allOtRes.data || [];
            } else if (isStaff) {
                [pendingShifts, processedShifts] = await Promise.all([
                    axios.get(`/overtime/staff/${currentUserId}`).then(res => res.data || []),
                    axios.get(`/overtime/by-notification-receiver/${currentUserId}`).then(res => res.data || [])
                ]);
            }

            setState(prev => ({
                ...prev,
                allStaff: staffRes.data || [],
                departments: deptRes.data || [],
                roles: rolesRes.data || [],
                pendingShifts,
                processedShifts,
                allShifts
            }));
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(error.response?.data?.message || 'Failed to load data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUserId, isAdmin, isStaff]);

    useEffect(() => {
        const authoritiesFromSession = JSON.parse(sessionStorage.getItem('authorities') || '[]');
        setIsStaff(authoritiesFromSession.includes('TYPE_STAFF'));
        setIsAdmin(authoritiesFromSession.includes('ROLE_ADMIN'));
    }, []);

    const handleModal = (isOpen, isEdit = false, item = null) => {
        setState(prev => ({
            ...prev,
            openModal: isOpen,
            isEditing: isEdit,
            formData: item ? {
                id: item.id,
                otDate: item.otDate,
                startTime: item.startTime,
                endTime: item.endTime,
                reason: item.reason,
                staff: item.staffId,
                 department: item.departmentId  || '',
                notificationReceivedTO: { id: item.notificationReceivedToId },
                role: item.roleId || ''
            } : initialFormData
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, formData: { ...prev.formData, [name]: value } }));
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const { isEditing, formData } = state;
            const url = isEditing ? `/overtime/update/${formData.id}` : '/overtime/create';
            const method = isEditing ? 'put' : 'post';

            const requestData = {
                ...formData,
                otDate: formData.otDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                reason: formData.reason,
                staffId: formData.staff,
                notificationReceivedToId: formData.notificationReceivedTO?.id
            };

            const response = await axios[method](url, requestData);
            toast.success(`OT ${isEditing ? 'updated' : 'created'} successfully`);
            handleModal(false);
            fetchData();
        } catch (err) {
            if (err.response?.status === 400) {
                const backendErrors = {};
                const errorDetails = err.response?.data?.errors || err.response?.data;
                Object.keys(errorDetails).forEach(field => {
                    const frontendField = field === 'otAppliedStaff' ? 'staff' :
                        field === 'notificationReceivedTO' ? 'notificationReceivedTO' : field;
                    backendErrors[frontendField] = Array.isArray(errorDetails[field])
                        ? errorDetails[field].join(', ')
                        : errorDetails[field];
                });
                setErrors(backendErrors);
            } else {
                toast.error(err.response?.data?.message || 'Failed to save OT');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/overtime/delete/${id}`);
            toast.success('Shift deleted successfully');
            fetchData();
        } catch (err) {
            toast.error('Error deleting shift');
        }
    };

    const handleStatusChange = async (row, newStatus) => {
        try {
            await axios.post(
                `/overtime/${row.id}/approve?approverId=${currentUserId}`,
                { status: newStatus }
            );
            fetchData();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const filteredPending = state.pendingShifts.filter(row =>
        (row.staffName || '').toLowerCase().includes(state.searchTerm.toLowerCase())
    );

    const filteredProcessed = state.processedShifts.filter(row =>
        (row.staffName || '').toLowerCase().includes(state.searchTerm.toLowerCase())
    );

    const filteredAll = state.allShifts.filter(row =>
        (row.staffName || '').toLowerCase().includes(state.searchTerm.toLowerCase())
    );

    // Updated table styles with centered content
    const centeredTableStyles = {
        '& .MuiTableCell-root': {
            border: '1px solid #e0e0e0',
            padding: '8px 12px',
            fontSize: '0.875rem',
            textAlign: 'center' // Center all table cell content
        },
        '& .MuiTableCell-head': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            textAlign: 'center' // Center header content
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={state.activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            aria-label="request tabs"
                            TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: '20px',
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
                            {isStaff && <Tab label="Pending Requests" {...a11yProps(0)} />}
                            {isStaff && <Tab label="Processed Requests" {...a11yProps(1)} />}
                            {isAdmin && <Tab label="All Requests" {...a11yProps(isStaff ? 2 : 0)} />}
                        </Tabs>
                    </Box>

                    {/* 
                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'}
                        alignItems={isMobile ? 'stretch' : 'center'} gap={2} mb={1}>
                        {isStaff && (
                            <Button variant="contained" color="primary" onClick={() => handleModal(true)}
                                startIcon={<Add />} fullWidth={isMobile} sx={{ height: 40 }}>
                                STAFF OT
                            </Button>
                        )}
                        <TextField
                            variant="outlined" placeholder="Search Name..." value={state.searchTerm}
                            onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                style: { height: 40 }
                            }}
                            fullWidth={isMobile}
                        />
                    </Box> */}

                    {/* Pending Requests Tab */}


                    {isStaff && (

                        <TabPanel value={state.activeTab} index={0}>
                            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'}
                                alignItems={isMobile ? 'stretch' : 'center'} gap={2} mb={2}>

                                <Button variant="contained" color="primary" onClick={() => handleModal(true)}
                                    startIcon={<Add />} fullWidth={isMobile} sx={{ height: 40 }}>
                                    STAFF OT
                                </Button>

                                <TextField
                                    variant="outlined" placeholder="Search Name..." value={state.searchTerm}
                                    onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                        style: { height: 40 }
                                    }}
                                    fullWidth={isMobile}
                                />
                            </Box>

                            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                                <Table stickyHeader size="small" sx={{ mb: 4, ...centeredTableStyles }}>
                                    <TableHead>
                                        <TableRow>
                                            {['S.NO', 'NAME', 'OT DATE', 'TOTAL HOURS', 'STATUS', 'ASSIGN NAME', 'REASON', 'OPTIONS'].map((header) => (
                                                <TableCell key={header}>{header}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredPending.length > 0 ? (
                                            filteredPending.map((row, index) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{row.staffName.toUpperCase()}</TableCell>
                                                    <TableCell>{row.otDate}</TableCell>
                                                    <TableCell>{row.duration}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor:
                                                                    row.status === 'Approved'
                                                                        ? 'rgba(0, 102, 0, 0.6)'
                                                                        : row.status === 'Rejected'
                                                                            ? 'rgba(211, 47, 47, 0.1)'
                                                                            : 'rgba(25, 118, 210, 0.1)', // default (e.g., Pending)

                                                                color:
                                                                    row.status === 'Approved'
                                                                        ? '#fff'
                                                                        : row.status === 'Rejected'
                                                                            ? '#d32f2f'
                                                                            : '#1976d2', // default (e.g., Pending)

                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.notificationReceivedToName.toUpperCase()}</TableCell>
                                                    <TableCell>{row.reason.toUpperCase()}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" justifyContent="center">
                                                            <Tooltip title="Edit">
                                                                <span>
                                                                    <IconButton
                                                                        onClick={() => handleModal(true, true, row)}
                                                                        color="primary"
                                                                        disabled={row.status === 'Approved' || row.status === 'Rejected'}
                                                                        sx={{
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(25, 118, 210, 0.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Edit />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>

                                                            <Tooltip title="Delete">
                                                                <span>
                                                                    <IconButton
                                                                        onClick={() => handleDelete(row.id)}
                                                                        color="error"
                                                                        disabled={row.status === 'Approved' || row.status === 'Rejected'}
                                                                        sx={{
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(25, 118, 210, 0.1)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Delete />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>

                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ height: 100, verticalAlign: 'middle' }}>
                                                    <Nodatapage />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </TabPanel>
                    )}

                    {/* Processed Requests Tab */}

                    {isStaff && (
                        <TabPanel value={state.activeTab} index={1}>
                            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                                <Table stickyHeader size="small" sx={centeredTableStyles}>
                                    <TableHead>
                                        <TableRow>
                                            {['S.NO', 'NAME', 'OT DATE', 'TOTAL HOURS', 'ASSIGN NAME', 'REASON', 'STATUS'].map((header) => (
                                                <TableCell key={header}>{header}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredProcessed.length > 0 ? (
                                            filteredProcessed.map((row, index) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{row.staffName.toUpperCase()}</TableCell>
                                                    <TableCell>{row.otDate}</TableCell>
                                                    <TableCell>{row.duration}</TableCell>
                                                    <TableCell>{row.notificationReceivedToName.toUpperCase()}</TableCell>
                                                    <TableCell>{row.reason.toUpperCase()}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" justifyContent="center">
                                                            <FormControl size="small" fullWidth>
                                                                <Select
                                                                    value={row.status || ""}
                                                                    onChange={(e) => handleStatusChange(row, e.target.value)}
                                                                    disabled={row.status === "Approved" || row.status === "Rejected"} // Disable after selection
                                                                    sx={{
                                                                        minWidth: 70,
                                                                        backgroundColor:
                                                                            row.status === "Approved"
                                                                                ? "rgba(56, 142, 60, 0.1)"
                                                                                : row.status === "Rejected"
                                                                                    ? "rgba(211, 47, 47, 0.1)"
                                                                                    : "rgba(2, 136, 209, 0.1)",
                                                                        "& .MuiSelect-select": {
                                                                            color:
                                                                                row.status === "Approved"
                                                                                    ? "#388e3c"
                                                                                    : row.status === "Rejected"
                                                                                        ? "#d32f2f"
                                                                                        : "#0288d1",
                                                                            fontWeight: "600"
                                                                        }
                                                                    }}
                                                                >
                                                                    {["Approved", "Rejected"].map((status) => (
                                                                        <MenuItem key={status} value={status}>
                                                                            {status}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Box>
                                                    </TableCell>

                                                    {/* <TableCell>
                                                        <Box display="flex" justifyContent="center">
                                                            <Tooltip title="Edit">
                                                                <IconButton onClick={() => handleModal(true, true, row)}
                                                                    color="primary" // Blue color for Edit
                                                                    sx={{
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(25, 118, 210, 0.1)'
                                                                        }
                                                                    }}>
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell> */}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center" sx={{ height: 100, verticalAlign: 'middle' }}>
                                                    <Nodatapage />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </TabPanel>
                    )}

                    {/* Admin Requests Tab */}

                    {isAdmin && (
                        <TabPanel value={state.activeTab} index={isStaff ? 2 : 0}>
                            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                                <Table stickyHeader size="small" sx={{ mb: 4, ...centeredTableStyles }}>
                                    <TableHead>
                                        <TableRow>
                                            {['S.NO', 'NAME', 'OT DATE', 'TOTAL HOURS', 'ASSIGN NAME', 'REASON', 'STATUS'].map((header) => (
                                                <TableCell key={header}>{header}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredAll.length > 0 ? (
                                            filteredAll.map((row, index) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{row.staffName.toUpperCase()}</TableCell>
                                                    <TableCell>{row.otDate}</TableCell>
                                                    <TableCell>{row.duration }</TableCell>
                                                    <TableCell>{row.notificationReceivedToName.toUpperCase()}</TableCell>
                                                    <TableCell>{row.reason.toUpperCase()}</TableCell>
                                                    <TableCell>
                                                        <Box display="flex" justifyContent="center">
                                                            <Chip
                                                                label={row.status}
                                                                color={
                                                                    row.status === 'Approved' ? 'success' :
                                                                        row.status === 'Rejected' ? 'error' : 'default'
                                                                }
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    {/* <TableCell>{row.approverName ? row.approverName : '-'}</TableCell> */}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ height: 100, verticalAlign: 'middle' }}>
                                                    <Nodatapage />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </TabPanel>
                    )}
                </Box>
            </Box>

            <Dialog open={state.openModal} onClose={() => handleModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold" component="div">
                        {state.isEditing ? 'Edit Staff OT' : 'Staff OT'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="otDate"
                                label="DATE"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={state.formData.otDate}
                                onChange={handleInputChange}
                                error={!!errors.otDate}
                                helperText={errors.otDate}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                name="startTime"
                                label="START TIME"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                value={state.formData.startTime}
                                onChange={handleInputChange}
                                error={!!errors.startTime}
                                helperText={errors.startTime}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                name="endTime"
                                label="END TIME"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                value={state.formData.endTime}
                                onChange={handleInputChange}
                                error={!!errors.endTime}
                                helperText={errors.endTime}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="reason"
                                label="REASON"
                                multiline
                                rows={2}
                                value={state.formData.reason}
                                onChange={handleInputChange}
                                error={!!errors.reason}
                                helperText={errors.reason}
                                inputProps={{
                                    maxLength: 50
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>DEPARTMENT</InputLabel>
                                <Select
                                    name="department"
                                    value={state.formData.department}
                                    onChange={handleInputChange}
                                    label="DEPARTMENT"
                                >
                                    {state.departments.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>ROLE</InputLabel>
                                <Select
                                    name="role"
                                    value={state.formData.role}
                                    onChange={handleInputChange}
                                    label="ROLE"
                                >
                                    {state.roles.map((role) => (
                                        <MenuItem key={role.roleId} value={role.roleId}>
                                            {role.roleName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.notificationReceivedTO}>
                                <InputLabel>NOTIFICATION RECEIVER</InputLabel>
                                <Select
                                    name="notificationReceivedTO"

                                    value={state.formData.notificationReceivedTO?.id || ''}
                                    onChange={(e) => setState(prev => ({
                                        ...prev,
                                        formData: {
                                            ...prev.formData,
                                            notificationReceivedTO: { id: e.target.value }
                                        }
                                    }))}
                                    label="NOTIFICATION RECEIVER"
                                    // displayEmpty
                                >
                                    {state.isEditing && state.formData.notificationReceivedTO?.id && (
                                        <MenuItem
                                            value={state.formData.notificationReceivedTO.id}
                                            style={{ display: 'none' }}
                                        >
                                            {state.allStaff.find(s => s.id === state.formData.notificationReceivedTO?.id)?.name ||
                                                'Current Receiver'}
                                        </MenuItem>
                                    )}

                                    <MenuItem disabled value="">
                                        {state.allStaff.filter(staff => {
                                            const selectedDept = state.departments.find(dept => dept.id === state.formData.department);
                                            const selectedRole = state.roles.find(role => role.roleId === state.formData.role);
                                            return (
                                                String(staff.id) !== String(currentUserId) &&
                                                staff.departmentName === (selectedDept?.name || '') &&
                                                staff.roleName === (selectedRole?.roleName || '')
                                            );
                                        }).length === 0 ? (
                                            state.isEditing && state.formData.notificationReceivedTO?.id ?
                                                "Current receiver doesn't match filters" :
                                                "No available staff matching department and role"
                                        ) : (
                                            "Select a notification receiver"
                                        )}
                                    </MenuItem>

                                    {state.allStaff
                                        .filter(staff => {
                                            const selectedDept = state.departments.find(dept => dept.id === state.formData.department);
                                            const selectedRole = state.roles.find(role => role.roleId === state.formData.role);
                                            return (
                                                String(staff.id) !== String(currentUserId) &&
                                                staff.departmentName === (selectedDept?.name || '') &&
                                                staff.roleName === (selectedRole?.roleName || '')
                                            );
                                        })
                                        .map((staff) => (
                                            <MenuItem key={staff.id} value={staff.id}>
                                                {staff.name} ({staff.departmentName} - {staff.roleName})
                                            </MenuItem>
                                        ))}
                                </Select>
                                {errors.notificationReceivedTO && (
                                    <FormHelperText>{errors.notificationReceivedTO}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => handleModal(false)} color="primary"
                        variant="outlined" startIcon={<Cancel />}>
                        Close
                    </Button>
                    <Button color="primary" variant="contained" onClick={handleSave} disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
                        {state.isEditing ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default OverTime;