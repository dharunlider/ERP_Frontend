import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, InputLabel, Select, Chip, FormControl, TableRow, Paper, Button, Modal, Box, Typography, IconButton, TextField, useMediaQuery, useTheme, InputAdornment, MenuItem
} from '@mui/material';
import { Close, Edit, Delete, Add, Search } from '@mui/icons-material';
import NoDataPage from '../Nodatapage';
import axios from '../Axiosinstance';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { deleteEntity } from '../Constants/DeleteEntity';
import { toast, ToastContainer } from 'react-toastify';

const initialModalData = {
    staffId: "",
    subject: "",
    relatedReason: "EmergencyLeave",
    maximumNumberToAssign: "",
    daySelections: [{ date: "", type: "", startTime: "", endTime: "" }]
};



const ResponsiveLeaveTable = () => {
    const [open, setOpen] = useState(false);
    const [modalData, setModalData] = useState(initialModalData);
    const [editId, setEditId] = useState(null);
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [ToDelete, setToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const currentUserId = JSON.parse(sessionStorage.getItem('userId'));
    const currentUserName = JSON.parse(sessionStorage.getItem('userName'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isStaff, setIsStaff] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch staff data on component mount
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/approval-process/emergency-leaves/${userId}`);
            console.log("Emergency leaves API response:", res.data);
            setRows(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    const filteredRows = rows.filter(row =>
        (row.leaveAppliedStaffName ?? "").toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (row.subject ?? "").toLowerCase().includes(searchTerm.toLowerCase().trim())
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
            staffId: row.leaveAppliedStaffId || "",
            subject: row.subject || "",
            relatedReason: row.relatedReason || "EmergencyLeave",
            daySelections: row.daySelection && row.daySelection.length > 0
                ? row.daySelection.map(day => ({
                    date: day.date || "",
                    type: day.type || "FULL",
                    startTime: day.type === "HALF" ? day.startTime || "" : "",
                    endTime: day.type === "HALF" ? day.endTime || "" : ""
                }))
                : [{ date: "", type: "FULL", startTime: "", endTime: "" }]
        });

        setEditId(id);
        setOpen(true);
    };





    const handleDelete = (id) => {
        setToDelete(id);
        setConfirmDialogOpen(true);
    };
    const confirmDelete = async () => {
        deleteEntity({
            endpoint: '/approval-process',
            entityId: ToDelete,
            fetchDataCallback: () => fetchData(),
            onFinally: () => {
                setConfirmDialogOpen(false);
                setToDelete(null);
            },
            onErrorMessage: 'Failed to delete EmergencyLeave. Please try again.'
        });
    };

    const handleChange = (e) => setModalData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDaySelectionChange = (index, field, value) => {
        const updated = [...modalData.daySelections];
        updated[index][field] = value;
        setModalData(prev => ({ ...prev, daySelections: updated }));
    };

    const addNewDaySelection = () => setModalData(prev => ({
        ...prev,
        daySelections: [...prev.daySelections, { date: "", type: "", startTime: "", endTime: "" }]
    }));

    const removeDaySelection = (index) => setModalData(prev => ({
        ...prev,
        daySelections: prev.daySelections.filter((_, i) => i !== index)
    }));

    const handleSubmit = async () => {
        try {
            const selectedStaff = staffList.find(staff => staff.id === modalData.staffId) || {
                id: currentUserId,
                name: currentUserName
            };

            const requestPayload = {
                subject: modalData.subject,
                relatedReason: modalData.relatedReason,
                daySelections: modalData.daySelections.map(day => ({
                    date: day.date,
                    type: day.type,
                    startTime: day.type === "HALF" ? day.startTime : null,
                    endTime: day.type === "HALF" ? day.endTime : null
                }))
            };

            if (editId) {
                await axios.put(`/approval-process/emergency-leave/${editId}`, requestPayload);
                toast.success("Leave request updated successfully");
            } else {
                await axios.post(`/approval-process/emergency-leave/${modalData.staffId}`, requestPayload);
                toast.success("Leave request submitted successfully");
            }


            fetchData();

            handleClose();
        } catch (error) {
            console.error("Error submitting leave request:", error);
            toast.error("Failed to submit leave request");
        }
    };


    // Define font style
    const marquisFontStyle = {
        fontFamily: '"Marquis", sans-serif',
    };

    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        axios.get(`/project-Teams/lead/${userId}`)
            .then(res => {
                console.log("team API response:", res.data.teamMembers);
                setTeams(res.data.teamMembers || []);
            })
            .catch(err => console.error('Failed to fetch teams:', err));
    }, []);

    // useEffect(() => {
    //     axios.get('/projects')
    //         .then(res => {
    //             console.log("Projects API response:", res.data);
    //             setProjects(res.data);
    //         })
    //         .catch(err => console.error('Failed to fetch projects:', err));
    // }, []);
    // useEffect(() => {
    //     if (modalData.projectId) {
    //         const selectedProject = projects.find(
    //             (p) => p.id === modalData.projectId
    //         );

    //         if (selectedProject) {
    //             const matchedTeam = teams.find(
    //                 (t) => t.projectName === selectedProject.name
    //             );

    //             if (matchedTeam) {
    //                 setStaffList(matchedTeam.teamMembers || []);
    //             } else {
    //                 setStaffList([]);
    //             }
    //         }
    //     } else {
    //         setStaffList([]);
    //     }
    // }, [modalData.projectId, projects, teams]);
    const userId = Number(sessionStorage.getItem("userId")); // convert to number

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
                <Table sx={{ minWidth: isMobile ? 'auto' : 650, minWidth: 650, '& .MuiTableCell-root': tableCellStyles }} size={isMobile ? "small" : "medium"}>
                    <TableHead >
                        <TableRow>
                            {['S.NO', 'NAME', 'APPLIED DATE', 'RELATED', 'LEAVE COUNTS'].map((header) => (
                                <TableCell
                                    key={header}
                                    align="center"
                                    sx={{
                                        fontWeight: 'bold',
                                        borderRight: '1px solid',
                                        borderColor: 'divider',
                                        p: isMobile ? 1 : 'normal',
                                        textAlign: 'center',

                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" >
                                    <NoDataPage />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableHead>
                    <TableBody>
                        {filteredRows.map((row, index) => (
                            <TableRow
                                key={row.id}

                                hover
                            >
                                <TableCell align="center"
                                    sx={{
                                        borderRight: '1px solid',
                                        borderColor: 'divider',

                                        p: isMobile ? 1 : 'normal',

                                    }}
                                >
                                    {index + 1}
                                </TableCell>
                                {['leaveAppliedStaffName', 'daySelection', 'relatedReason', 'maximumNumberToAssign'].map((field) => (
                                    <TableCell
                                        key={field}
                                        align="center"
                                        sx={{
                                            borderRight: '1px solid',
                                            borderColor: 'divider',
                                            p: isMobile ? 1 : 'normal',

                                        }}
                                    >
                                        {field === "daySelection" ? (
                                            row.daySelection?.map((d, i) => (
                                                <Chip
                                                    key={i}
                                                    label={new Date(d.date).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric"
                                                    })}
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: "0.6rem", mr: 0.5, mt: 0.4 }}
                                                />
                                            ))
                                        ) : (
                                            row[field]
                                        )}

                                    </TableCell>
                                ))}

                                {/* <TableCell sx={{ p: isMobile ? 1 : 'normal', }}>
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
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ConfirmDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this EmergencyLeave?"
                confirmText="Delete"
            />
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
                        {/* <TextField
                            fullWidth
                            select
                            label="Project"
                            name="projectId"
                            value={modalData.projectId || ""}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2, ...marquisFontStyle }}
                            InputProps={{ sx: marquisFontStyle }}
                            InputLabelProps={{ sx: marquisFontStyle }}
                        >
                            {projects.map((proj) => (
                                <MenuItem key={proj.id} value={proj.id} sx={marquisFontStyle}>
                                    {proj.name}
                                </MenuItem>
                            ))}
                        </TextField> */}

                        {/* Staff Dropdown (filtered by project) */}
                        <TextField
                            fullWidth
                            select
                            label="Applying For"
                            name="staffId"
                            value={modalData.staffId || ""}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            sx={{ ...marquisFontStyle }}
                            InputProps={{ sx: marquisFontStyle }}
                            InputLabelProps={{ sx: marquisFontStyle }}
                        >
                            {teams.length > 0 ? (
                                teams
                                    .filter(member => member.id !== userId)
                                    .map(member => (
                                        <MenuItem key={member.id} value={member.id} sx={marquisFontStyle}>
                                            {member.name}
                                        </MenuItem>
                                    ))
                            ) : (
                                <MenuItem disabled>Not found</MenuItem>
                            )}
                        </TextField>






                        <TextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={modalData.subject || ''}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            sx={{ mb: 2, ...marquisFontStyle }}
                            InputProps={{ sx: marquisFontStyle }}
                            InputLabelProps={{ sx: marquisFontStyle }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel sx={marquisFontStyle}>Related Reason</InputLabel>
                            <Select
                                name="relatedReason"
                                value={modalData.relatedReason || ''}
                                onChange={handleChange}
                                sx={marquisFontStyle}
                                label="Related Reason"
                            >
                                <MenuItem value="EmergencyLeave" sx={marquisFontStyle}>Emergency Leave</MenuItem>
                                {/* Add other leave types if needed */}
                            </Select>
                        </FormControl>

                        <Typography variant="subtitle1" mt={2} mb={1} sx={marquisFontStyle}>
                            <strong>Leave Dates:</strong>
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
                                    {/* Date */}
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

                                    {/* Type */}
                                    <TextField
                                        fullWidth
                                        label="Type"
                                        select
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
                                        {['FULL', 'HALF'].map((opt) => (
                                            <MenuItem key={opt} value={opt} sx={marquisFontStyle}>
                                                {opt}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {/* Remove Button */}
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

                                {/*Conditional Rendering for HALF */}
                                {day.type === "HALF" && (
                                    <Box
                                        display="flex"
                                        flexDirection={isMobile ? "column" : "row"}
                                        gap={2}
                                        mt={1}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Start Time"
                                            type="time"
                                            InputLabelProps={{
                                                shrink: true,
                                                sx: marquisFontStyle
                                            }}
                                            value={day.startTime || ""}
                                            onChange={(e) => handleDaySelectionChange(i, "startTime", e.target.value)}
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
                                            label="End Time"
                                            type="time"
                                            InputLabelProps={{
                                                shrink: true,
                                                sx: marquisFontStyle
                                            }}
                                            value={day.endTime || ""}
                                            onChange={(e) => handleDaySelectionChange(i, "endTime", e.target.value)}
                                            margin="normal"
                                            variant="outlined"
                                            size="small"
                                            sx={marquisFontStyle}
                                            InputProps={{
                                                sx: marquisFontStyle
                                            }}
                                        />
                                    </Box>
                                )}
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
                            Add Leave Date
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