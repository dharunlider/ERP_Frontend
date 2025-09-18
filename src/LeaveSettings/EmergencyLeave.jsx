import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Modal, Box, Typography, IconButton, TextField, useMediaQuery, useTheme, InputAdornment, MenuItem
} from '@mui/material';
import { Close, Edit, Delete, Add, Search } from '@mui/icons-material';
import NoDataPage from '../Nodatapage';
import axios from '../Axiosinstance';

const initialModalData = {
    staffId: "",
    subject: "",
    relatedReason: "",
    maximumNumberToAssign: "",
    daySelections: [{ date: "", type: "" }]
};

const sampleData = [];

const ResponsiveLeaveTable = () => {
    const [open, setOpen] = useState(false);
    const [modalData, setModalData] = useState(initialModalData);
    const [editId, setEditId] = useState(null);
    const [rows, setRows] = useState(sampleData);
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Fetch staff data on component mount
    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const response = await axios.get('/staff/allstaffs/dropdown');
                setStaffList(response.data);
            } catch (error) {
                console.error('Error fetching staff data:', error);
            }
        };
        fetchStaffData();
    }, []);

    const filteredRows = rows.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.related.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.appliedDate.includes(searchTerm)
    );

    const handleOpen = () => {
        setModalData(initialModalData);
        setEditId(null);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleEdit = (id) => {
        const row = rows.find(r => r.id === id);
        setModalData({
            staffId: row.staffId,
            subject: row.related,
            relatedReason: row.related.toUpperCase().replace(' ', ''),
            maximumNumberToAssign: row.leaveCounts,
            daySelections: [{ date: row.appliedDate, type: "" }]
        });
        setEditId(id);
        setOpen(true);
    };

    const handleDelete = (id) => setRows(rows.filter(r => r.id !== id));

    const handleChange = (e) => setModalData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDaySelectionChange = (index, field, value) => {
        const updated = [...modalData.daySelections];
        updated[index][field] = value;
        setModalData(prev => ({ ...prev, daySelections: updated }));
    };

    const addNewDaySelection = () => setModalData(prev => ({
        ...prev,
        daySelections: [...prev.daySelections, { date: "", type: "" }]
    }));

    const removeDaySelection = (index) => setModalData(prev => ({
        ...prev,
        daySelections: prev.daySelections.filter((_, i) => i !== index)
    }));

    const handleSubmit = () => {
        const selectedStaff = staffList.find(staff => staff.id === modalData.staffId);
        const newRow = {
            id: editId || Math.max(...rows.map(r => r.id), 0) + 1,
            staffId: modalData.staffId,
            name: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : "",
            appliedDate: modalData.daySelections[0].date,
            related: modalData.subject,
            leaveCounts: modalData.maximumNumberToAssign
        };
        setRows(editId ? rows.map(r => r.id === editId ? newRow : r) : [...rows, newRow]);
        handleClose();
    };

    // Define font style
    const marquisFontStyle = {
        fontFamily: '"Marquis", sans-serif',
    };

    return (
        <Box sx={{ p: isMobile ? 2 : 3, ...marquisFontStyle }}>
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                mb: 3
            }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpen}
                    startIcon={<Add />}
                    sx={{ 
                        width: isMobile ? '100%' : 'auto',
                        ...marquisFontStyle 
                    }}
                >
                    ADD LEAVE
                </Button>
                <TextField
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                        sx: marquisFontStyle
                    }}
                    sx={{
                        width: isMobile ? '100%' : 400,
                        backgroundColor: 'background.paper',
                        ...marquisFontStyle
                    }}
                    size="small"
                    variant="outlined"
                />
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflowX: 'auto'
                }}
            >
                <Table sx={{ minWidth: isMobile ? 'auto' : 650 }} size={isMobile ? "small" : "medium"}>
                    <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                        <TableRow>
                            {['S.NO', 'NAME', 'APPLIED DATE', 'RELATED', 'LEAVE COUNTS', 'ACTIONS'].map((header) => (
                                <TableCell
                                    key={header}
                                    align="center"
                                    sx={{
                                        fontWeight: 'bold',
                                        borderRight: '1px solid',
                                        borderColor: 'divider',
                                        p: isMobile ? 1 : 'normal',
                                        textAlign: 'center',
                                        ...marquisFontStyle
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={marquisFontStyle}>
                                    <NoDataPage />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableHead>
                    <TableBody>
                        {filteredRows.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{
                                    '&:nth-of-type(even)': { bgcolor: theme.palette.action.hover },
                                    '&:last-child td': { borderBottom: 0 }
                                }}
                                hover
                            >
                                {['id', 'name', 'appliedDate', 'related', 'leaveCounts'].map((field) => (
                                    <TableCell
                                        key={field}
                                        sx={{
                                            borderRight: '1px solid',
                                            borderColor: 'divider',
                                            p: isMobile ? 1 : 'normal',
                                            ...marquisFontStyle
                                        }}
                                    >
                                        {row[field]}
                                    </TableCell>
                                ))}
                                <TableCell sx={{ p: isMobile ? 1 : 'normal', ...marquisFontStyle }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEdit(row.id)}
                                            size={isMobile ? "small" : "medium"}
                                        >
                                            <Edit fontSize={isMobile ? "small" : "medium"} />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(row.id)}
                                            size={isMobile ? "small" : "medium"}
                                        >
                                            <Delete fontSize={isMobile ? "small" : "medium"} />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isMobile ? '95%' : '30%',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: isMobile ? 2 : 4,
                    borderRadius: 2,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    ...marquisFontStyle
                }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography variant="h6" component="h2" sx={marquisFontStyle}>
                            {editId ? 'Edit Leave' : 'ADD NEW LEAVE'}
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <Close />
                        </IconButton>
                    </Box>
                    <Box component="form" noValidate autoComplete="off">
                        <TextField
                            fullWidth
                            select
                            label="Staff Name"
                            name="staffId"
                            value={modalData.staffId}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2, ...marquisFontStyle }}
                            InputProps={{
                                sx: marquisFontStyle
                            }}
                            InputLabelProps={{
                                sx: marquisFontStyle
                            }}
                        >
                            {staffList.map((staff) => (
                                <MenuItem 
                                    key={staff.id} 
                                    value={staff.id}
                                    sx={marquisFontStyle}
                                >
                                    {`${staff.name}`}
                                </MenuItem>
                            ))}
                        </TextField>
                        
                        {['Subject', 'Related Reason'].map((label) => (
                            <TextField
                                key={label}
                                fullWidth
                                label={label}
                                name={label.toLowerCase().replace(' ', '')}
                                value={modalData[label.toLowerCase().replace(' ', '')]}
                                onChange={handleChange}
                                margin="normal"
                                variant="outlined"
                                sx={{ mb: 2, ...marquisFontStyle }}
                                InputProps={{
                                    sx: marquisFontStyle
                                }}
                                InputLabelProps={{
                                    sx: marquisFontStyle
                                }}
                            />
                        ))}
                        
                        <Typography variant="subtitle1" mt={2} mb={1} sx={marquisFontStyle}>
                            <strong>Day Selections:</strong>
                        </Typography>
                        {modalData.daySelections.map((day, i) => (
                            <Box
                                key={i}
                                mb={2}
                                p={2}
                                border={1}
                                borderRadius={2}
                                borderColor="divider"
                                sx={{ bgcolor: theme.palette.grey[50] }}
                            >
                                <Box
                                    display="flex"
                                    flexDirection={isMobile ? 'column' : 'row'}
                                    alignItems={isMobile ? 'stretch' : 'center'}
                                    gap={2}
                                    mb={1}
                                >
                                    <TextField
                                        fullWidth
                                        label="Date"
                                        type="date"
                                        InputLabelProps={{ 
                                            shrink: true,
                                            sx: marquisFontStyle 
                                        }}
                                        value={day.date}
                                        onChange={(e) => handleDaySelectionChange(i, 'date', e.target.value)}
                                        margin="normal"
                                        variant="outlined"
                                        size="small"
                                        sx={marquisFontStyle}
                                        InputProps={{
                                            sx: marquisFontStyle
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Type"
                                        select
                                        SelectProps={{ 
                                            native: true,
                                            sx: marquisFontStyle
                                        }}
                                        value={day.type}
                                        onChange={(e) => handleDaySelectionChange(i, 'type', e.target.value)}
                                        margin="normal"
                                        variant="outlined"
                                        size="small"
                                        sx={marquisFontStyle}
                                        InputProps={{
                                            sx: marquisFontStyle
                                        }}
                                        InputLabelProps={{
                                            sx: marquisFontStyle
                                        }}
                                    >
                                        {['Full', 'Half', 'Quarter'].map((opt) => (
                                            <option key={opt} value={opt} style={marquisFontStyle}>{opt}</option>
                                        ))}
                                    </TextField>
                                    {modalData.daySelections.length > 1 && (
                                        <IconButton
                                            onClick={() => removeDaySelection(i)}
                                            color="error"
                                            size="small"
                                            sx={{
                                                alignSelf: isMobile ? 'flex-end' : 'center',
                                                mt: isMobile ? 0 : 1
                                            }}
                                        >
                                            <Close fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        ))}
                        <Button
                            variant="outlined"
                            onClick={addNewDaySelection}
                            fullWidth
                            sx={{ 
                                mb: 2,
                                ...marquisFontStyle 
                            }}
                            startIcon={<Add />}
                        >
                            Add Day Selection
                        </Button>
                        <Box
                            mt={3}
                            display="flex"
                            flexDirection={isMobile ? 'column-reverse' : 'row'}
                            justifyContent={isMobile ? 'stretch' : 'flex-end'}
                            alignItems="center"
                            gap={2}
                        >
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                fullWidth={isMobile}
                                sx={marquisFontStyle}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                fullWidth={isMobile}
                                sx={marquisFontStyle}
                            >
                                {editId ? 'Update' : 'Submit'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default ResponsiveLeaveTable;