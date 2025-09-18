import React, { useState, useEffect } from 'react';
import axios from '../Axiosinstance';
import {
    Box, Button, TextField, Typography,
    Table, TableBody, TableCell, TableContainer, CircularProgress,
    TableHead, TableRow, Chip, useTheme, useMediaQuery
} from '@mui/material';
import Nodatapage from "../Nodatapage";
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper"

const MonthlyLeaveReport = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [rows, setRows] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchData(true);
    }, []);

    const fetchData = async (reset = false) => {
        if (reset) {
            setInitialLoading(true);
            setCursor(null);
        } else if (loadingMore) {
            return;
        }

        if (!reset) setLoadingMore(true);

        try {
            const params = {
                size: 10,
                ...(cursor && !reset && { cursor }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            };

            const response = await axios.get('/attendance/leaves/specific_period', { params });
            const newData = response.data || [];

            setRows(prev => reset ? newData : [...prev, ...newData]);
            setHasMore(newData.length === 10);
            if (newData.length > 0) setCursor(newData[newData.length - 1].id);
        } catch (err) {
            console.error('Data fetch error:', err);
            if (reset) setRows([]);
        } finally {
            if (reset) setInitialLoading(false);
            else setLoadingMore(false);
        }
    };

    const handleClearFilter = () => {
        setStartDate('');
        setEndDate('');
        setCursor(null);
        fetchData(true);

    };

  const handleExport = async () => {
    try {
        const params = new URLSearchParams();

        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await axios.get(`/attendance/export/leaves/specific_period?${params.toString()}`, {
            responseType: 'blob', 
        });

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Optional: set filename
        link.setAttribute('download', `Leave_Report_${startDate || ''}_${endDate || ''}.xlsx`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export failed:', err);
        alert('Failed to export data.');
    }
};


    return (
        <Box m={2}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                    width: '100%'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',

                    }}
                >
                    {/* Date Inputs */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', md: 'auto' } }}>
                        <TextField
                            type="date"
                            label="Start Date"
                            size="small"
                            sx={{
                                width: { xs: '100%', sm: 200 },
                                '& .MuiInputBase-root': { height: 40 },
                            }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            type="date"
                            label="End Date"
                            size="small"
                            sx={{
                                width: { xs: '100%', sm: 200 },
                                '& .MuiInputBase-root': { height: 40 },
                            }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', md: 'auto' } }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SearchIcon />}
                            sx={{ height: 40, minWidth: 120 }}
                            onClick={() => fetchData(true)}
                        >
                           Apply Filter 
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<ClearIcon />}
                            sx={{ height: 40, minWidth: 120 }}
                            onClick={handleClearFilter}
                        >
                            Clear Filter
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            sx={{ height: 40, minWidth: 140 }}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>
            </Box>

            <InfiniteScrollWrapper
                dataLength={rows.length}
                next={fetchData}
                hasMore={hasMore}
                loading={loadingMore}
            >
                <TableContainer>
                    <Table
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                            '& .MuiTableCell-root': {
                                border: '1px solid rgba(224, 224, 224, 1)',
                                padding: isMobile ? '6px 8px' : '8px 12px',
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                            },
                            '& .MuiTableHead-root': {
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                                backgroundColor: '#f5f5f5',
                            },
                            '& .MuiTableCell-head': {
                                fontWeight: 'bold',
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Employee Name</TableCell>
                                <TableCell>HR Code</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((row, index) => (
                                    <TableRow key={row.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.hrCode}</TableCell>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>{row.department}</TableCell>
                                        <TableCell>{row.role}</TableCell>
                                        <TableCell>
                                            {row.status === 'HD' && (
                                                <Chip label="Half Day" size="small" color="warning" variant="outlined" sx={{ fontWeight: 500 }} />
                                            )}
                                            {row.status === 'P_HD' && (
                                                <Chip label="Permission HD" size="small" color="info" variant="outlined" sx={{ fontWeight: 500 }} />
                                            )}
                                            {row.status === 'AB' && (
                                                <Chip label="Absent" size="small" color="error" variant="outlined" sx={{ fontWeight: 500 }} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                !initialLoading && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Nodatapage />
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </InfiniteScrollWrapper>

        </Box>
    );
};

export default MonthlyLeaveReport;
