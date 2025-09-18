import React, { useState, useEffect } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, Grid, TextField,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, IconButton, InputAdornment, Autocomplete, CircularProgress, Chip,
    DialogActions, DialogContentText
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Nodatapage from "../Nodatapage";
import dayjs from 'dayjs';
import axios from '../Axiosinstance';
import { formatMinutesToHours } from '../Constants/UtilFunctions'
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';

const ShortLeaveManager = ({ data = [], refreshData = () => { } }) => {
    const currentUserId = Number(sessionStorage.getItem('userId'));

    const today = dayjs().format('YYYY-MM-DD');

    const [departments, setDepartments] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [filteredApprovers, setFilteredApprovers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);


    const defaultForm = {
        subject: '',
        department: '',
        date: '',
        fromTime: '',
        toTime: '',
        approverId: null,
        approverName: '',
        duration: '',
    };

    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        (async () => {
            try {
                const staffRes = await axios.get('/staff/allstaffs');
                const deptRes = await axios.get('/departments/all-departments');
                setAllStaff(staffRes.data || []);
                setDepartments(deptRes.data || []);
            } catch (e) {
                console.error(e);
                toast.error('Failed to fetch departments or staff.');
            }
        })();
    }, []);

    useEffect(() => {
        if (formData.department) {
            setFilteredApprovers(
                allStaff
                    .filter(s => s.departmentName === formData.department && s.id !== currentUserId)
                    .map(s => ({ label: s.name, id: s.id }))
            );
        } else setFilteredApprovers([]);
    }, [formData.department, allStaff]);

    const filteredRows = data.filter(r => {
        const name = r.name || '';

        const search = searchText.toLowerCase();

        return (
            name.toLowerCase().includes(search)
        );
    });

    const openForm = (idx, id) => {
        if (id === undefined || id === null) {
            // NEW FORM - reset everything
            setEditIndex(null);
            setEditId(null);
            setFormData({
                ...defaultForm,
                date: ''
            });
        } else {

            setEditIndex(idx);
            setEditId(id);
            const requestToEdit = data.find(r => r.id === id);

            if (requestToEdit) {

                const departmentObj = departments.find(d => d.id === requestToEdit.departmentId);
                const approverObj = allStaff.find(s => s.id === requestToEdit.notoficationReceiverId);

                setFormData({
                    department: departmentObj?.name || '',
                    subject: requestToEdit.subject || '',
                    date: requestToEdit.permissionAppliedDate || '',
                    fromTime: requestToEdit.startTime || '',
                    toTime: requestToEdit.endTime || '',
                    duration: requestToEdit.duration,
                    approverId: approverObj?.id || null,
                    approverName: approverObj?.name || '',
                });
            }
        }
        setDialogOpen(true);
    };

    const closeForm = () => setDialogOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {

            const approver = filteredApprovers.find(a => a.id === formData.approverId);



            // Basic required field validation
            const missingFields = [];

            if (!formData.date) missingFields.push('Date');
            if (!formData.fromTime) missingFields.push('From Time');
            if (!formData.toTime) missingFields.push('To Time');
            if (!formData.subject) missingFields.push('Subject');

            // Display missing fields
            if (missingFields.length > 0) {
                toast.error(`Please fill in the following fields: ${missingFields.join(', ')}`);
                setLoading(false);
                return;
            }

            // Subject min-length validation
            if (formData.subject.trim().length < 5) {
                toast.error('Subject must be at least 5 characters.');
                setLoading(false);
                return;
            }

            // Validate time range
            const from = dayjs(`2023-01-01T${formData.fromTime}`);
            const to = dayjs(`2023-01-01T${formData.toTime}`);
            if (to.isSame(from) || to.isBefore(from)) {
                toast.error('End time must be after start time.');
                setLoading(false);
                return;
            }
            if (!approver) {
                toast.error('Please select an approver.');
                setLoading(false);
                return;
            }

            // Payload to send
            const payload = {
                subject: formData.subject,
                permissionAppliedDate: formData.date,
                startTime: formData.fromTime,
                endTime: formData.toTime,
                relatedReason: "Permission",
                notificationReceivedTO: { id: approver.id },
                leaveAppliedStaff: { id: currentUserId }
            };

            // Send to API
            if (editId) {
                await axios.put(`/PermissionLeaveApply/${editId}`, payload);
                toast.success('Leave request updated successfully.');
            } else {
                await axios.post('/PermissionLeaveApply', payload);
                toast.success('Leave submitted successfully.');
            }

            refreshData();
            setDialogOpen(false);

        } catch (err) {
            console.error(err);
            const errorMsg = err?.response?.data?.details || 'Failed to submit leave.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };


    const openDeleteDialog = (id) => {
        setDeleteId(id);
        setConfirmDialogOpen(true);
    };

    // const handleDelete = async () => {
    //     setLoading(true);
    //     try {
    //         await axios.delete();
    //         toast.success('Leave request deleted successfully.');
    //         refreshData();
    //     } catch (error) {
    //         console.error('Failed to delete leave request:', error);
    //         toast.error('Failed to delete leave request');
    //     } finally {
    //         setLoading(false);
    //         setConfirmDialogOpen(false);
    //     }
    // };

    const confirmDelete = async () => {
        deleteEntity({
            endpoint: `/PermissionLeaveApply`,
            entityId: deleteId,
            fetchDataCallback: refreshData,
            onFinally: () => {
                setConfirmDialogOpen(false);
                setDeleteId(null);
            },
            onErrorMessage: 'Failed to delete leave request. Please try again.'
        });
    };


    return (
        <Box p={3} mx="auto">
            <ToastContainer position="bottom-right" autoClose={1000} />

            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                gap={2}
                mb={2}
            >
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => openForm()}
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                >
                    New
                </Button>

                <TextField
                    size="small"
                    placeholder="Search by name..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />
            </Box>



            <TableContainer sx={{
                maxHeight: 500,
                overflowX: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
            }}>
                <Table stickyHeader size="small" sx={{
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
                }}>
                    <TableHead>
                        <TableRow>
                            {['S.NO', 'NAME', 'APPLIED DATE', 'REASON', 'APPROVER NAME', 'PERMISSION DURATION', 'STATUS', 'ACTIONS'].map(h => (
                                <TableCell key={h}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.length > 0 ? filteredRows.map((row, index) => (
                            <TableRow hover key={row.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.leaveAppliedStaffName}</TableCell>
                                <TableCell>{row.permissionAppliedDate}</TableCell>
                                <TableCell>Permission</TableCell>
                                <TableCell>{row.notificationReceivedToName || '-'}</TableCell>
                                <TableCell>{formatMinutesToHours(row.duration)}</TableCell>
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

                                <TableCell align="center">
                                    <IconButton
                                        onClick={() => openForm(null, row.id)}
                                        disabled={["APPROVED", "REJECTED"].includes(row.status)}
                                    >
                                        <Edit
                                            color="primary"
                                            style={{
                                                opacity: ["APPROVED", "REJECTED"].includes(row.status) ? 0.5 : 1
                                            }}
                                        />
                                    </IconButton>

                                    <IconButton
                                        onClick={() => openDeleteDialog(row.id)}
                                        disabled={["APPROVED", "REJECTED"].includes(row.status)}
                                    >
                                        <Delete
                                            color="error"
                                            style={{
                                                opacity: ["APPROVED", "REJECTED"].includes(row.status) ? 0.5 : 1
                                            }}
                                        />
                                    </IconButton>
                                </TableCell>


                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center"><Nodatapage /></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>


            {/* Rest of the component remains the same */}

            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this leave request?"
            />

            <Dialog open={dialogOpen} onClose={closeForm} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editIndex === null ? 'New Permission' : 'Edit Permission'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={departments}
                                    getOptionLabel={o => o.name}
                                    value={departments.find(d => d.name === formData.department) || null}
                                    onChange={(_, v) =>
                                        setFormData(f => ({
                                            ...f,
                                            department: v?.name || '',
                                            approverName: '',
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Department" required fullWidth />
                                    )}
                                    disableClearable
                                />

                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Leave Date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: today }}
                                    required
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData(f => ({ ...f, subject: e.target.value }))}
                                    required
                                    fullWidth
                                />
                            </Grid>

                       
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="From Time"
                                        type="time"
                                        value={formData.fromTime}
                                        onChange={(e) => setFormData(f => ({ ...f, fromTime: e.target.value }))}
                                        required
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>


                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="To Time"
                                        type="time"
                                        value={formData.toTime}
                                        onChange={(e) => setFormData(f => ({ ...f, toTime: e.target.value }))}
                                        required
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                {/* <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="PERMISSION DURATION"
                                        value={formData.duration}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                    />
                                </Grid> */}
                       
                            {/* <Grid item xs={12}>
                                <TextField
                                    label="Reason"
                                    multiline
                                    rows={3}
                                    value={formData.reason}
                                    onChange={(e) => setFormData(f => ({ ...f, reason: e.target.value }))}
                                    required
                                    fullWidth
                                />
                            </Grid> */}
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={filteredApprovers}
                                    getOptionLabel={a => a.label}
                                    value={filteredApprovers.find(a => a.id === formData.approverId) || null}
                                    onChange={(_, v) =>
                                        setFormData(f => ({
                                            ...f,
                                            approverId: v?.id || null,
                                            approverName: v?.label || ''
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Approver" required fullWidth />
                                    )}
                                    disableClearable
                                />


                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" mt={3}>
                            <Button onClick={closeForm} sx={{ mr: 2 }} variant="outlined" color="secondary">
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this leave request?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog> */}
        </Box>
    );
};

export default ShortLeaveManager;