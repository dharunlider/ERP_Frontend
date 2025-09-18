import React, { useState } from 'react';
import axios from '../Axiosinstance';
import {
    Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, InputAdornment, Chip, MenuItem, Select
} from '@mui/material';
import { Search, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import Nodatapage from "../Nodatapage";
import { toast, ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import {formatMinutesToHours}  from '../Constants/UtilFunctions'

const statusStyles = {
    APPROVED: {
        label: 'Approved',
        icon: <CheckCircle fontSize="small" />,
        chipColor: 'success',
    },
    REJECTED: {
        label: 'Rejected',
        icon: <Cancel fontSize="small" />,
        chipColor: 'error',
    },
    PENDING: {
        label: 'Pending',
        icon: <HourglassEmpty fontSize="small" />,
        chipColor: 'warning',
    },
};

const StatusDropdown = ({ status = '', onChange, row }) => {
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
                MenuProps={{
                    PaperProps: {
                        sx: { borderRadius: 1 },
                    },
                }}
            >
                <MenuItem value="APPROVED">
                    <Chip
                        icon={<CheckCircle fontSize="small" />}
                        label="Approved"
                        color="success"
                        size="small"
                        sx={{ borderRadius: '8px', fontWeight: 500 }}
                    />
                </MenuItem>
                <MenuItem value="REJECTED">
                    <Chip
                        icon={<Cancel fontSize="small" />}
                        label="Rejected"
                        color="error"
                        size="small"
                        sx={{ borderRadius: '8px', fontWeight: 500 }}
                    />
                </MenuItem>
            </Select>
        </Box>
    );
};

export default function PermissionLeaveApprovals({ data = [], refreshData = () => { } }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleStatusChange = async (newStatus, row) => {
        try {
            await axios.post(
                `/PermissionLeaveApply/${row.id}/approve`,
                { status: newStatus },
                {
                    params: { approverId: row.leaveAppliedStaffId },
                }
            );
            toast.success(`Status updated to ${newStatus}`);
            refreshData(); // call parent to refresh
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredData = data.filter(row =>
        (row.leaveAppliedStaffName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(filteredData,"filteredData");

    return (
        <Box sx={{ width: '100%' }}>
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
                            <TableCell>DATE APPLIED</TableCell>
                            <TableCell>RELATED</TableCell>
                            <TableCell>STATUS</TableCell>
                            <TableCell>HOURS COUNT</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row, index) => (
                                <TableRow hover key={row.id || index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.leaveAppliedStaffName}</TableCell>
                                    <TableCell align='center'>{row.permissionAppliedDate}</TableCell>
                                    <TableCell>{row.subject}</TableCell>
                                    <TableCell>
                                        <StatusDropdown
                                            status={row.status}
                                            onChange={handleStatusChange}
                                            row={row}
                                        />
                                    </TableCell>
                                    <TableCell>{formatMinutesToHours(row.duration)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Nodatapage />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ToastContainer position="bottom-right" autoClose={1000} />
        </Box>
    );
}
