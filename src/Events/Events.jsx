import React, { useState, useEffect } from "react";
import {
    Paper, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell,
    Button, Box, TextField, Grid, InputAdornment, IconButton, Tooltip,
    useMediaQuery, useTheme, TableContainer, CircularProgress, Dialog,
    DialogTitle, DialogContent, DialogActions, MenuItem
} from "@mui/material";
import { Add, Search, Edit, Delete } from "@mui/icons-material";
import axios from "../Axiosinstance";
import { toast } from "react-toastify";
import ConfirmDialog from "../Constants/ConfirmDialog";
import Nodatapage from "../Nodatapage.jsx";
import NewEvent from "./NewEvent.jsx";
import SearchBar from "../Constants/SearchBar";

const Events = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [activeTab, setActiveTab] = useState(0);
    const [eventData, setEventData] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [eventIdToDelete, setEventIdToDelete] = useState('');
    const [selectedEvent, setSelectedEvent] = useState({});
    const [loading, setLoading] = useState(true);

    // ✅ Fetch all events (no pagination)
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/notices");
            console.log(response.data, "response.data")
            setEventData(response.data);
        } catch (err) {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filterText]);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const handleEdit = (id) => {
        const evt = eventData.find((e) => e.id === id);
        if (evt) {
            setSelectedEvent(evt);
            setEditModalOpen(true);
        }
    };

    const handleDeleteEvent = (id) => {
        setEventIdToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/notices/${eventIdToDelete}`);
            toast.success("Event deleted successfully");
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.details || err.response?.data?.message || 'Failed to fetch events');
        } finally {
            setConfirmDialogOpen(false);
            setEventIdToDelete(null);
        }
    };

    const filteredEventData = eventData.filter(row =>
    row.title.toLowerCase().includes(filterText.toLowerCase())
);

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                TabIndicatorProps={{ style: { backgroundColor: "transparent" } }}
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "5px",
                    bgcolor: "#F0F4F8",
                    padding: "8px 12px",
                    "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "#142a4f",
                        backgroundColor: "#ffffff",
                        "&.Mui-selected": {
                            backgroundColor: "#142a4f",
                            color: "#ffffff",
                        },
                    },
                }}
            >
                <Tab label="EVENT LIST" />
                <Tab label="ADD EVENT" />
            </Tabs>

            <Box sx={{ p: isMobile ? 2 : 3, minHeight: "100vh" }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    {activeTab === 0 ? (
                        <>
                            {/* Search + Add Button */}
                            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">

                                <Grid item xs={12} sm="auto" justifyContent="flex-start">
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => setActiveTab(1)}
                                        size={isMobile ? "small" : "medium"}
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            '&:hover': { backgroundColor: theme.palette.primary.dark },
                                            whiteSpace: 'nowrap',
                                            width: '100%', // Ensures it takes full width on mobile
                                            maxWidth: isMobile ? 'none' : '200px', // Controls max width for larger screens
                                        }}
                                    >
                                        Add Event
                                    </Button>
                                </Grid>

                                <Grid item xs={12} sm="auto" sx={{ flexGrow: 1 }}>
                                    <SearchBar
                                        variant="outlined"
                                        placeholder="SEARCH BY TITLE"
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        style={{
                                            maxWidth: isMobile ? '100%' : '300px',
                                            marginRight: isMobile ? '0' : '16px'
                                        }}
                                        fullWidth={isMobile}
                                    />
                                </Grid>

                            </Grid>

                            {/* Table */}
                            <TableContainer
                                component={Paper}
                                sx={{ maxHeight: "calc(100vh - 300px)", overflow: "auto" }}
                            >
                                {loading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : filteredEventData.length === 0 ? (
                                    <Nodatapage />
                                ) : (
                                    <Table
                                        sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: 0 }}
                                        size={isMobile ? "small" : "medium"}
                                        stickyHeader
                                    >
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                                {[
                                                    "ID",
                                                    "TITLE",
                                                    "TYPE",
                                                    "START DATE",
                                                    "END DATE",
                                                    "DESCRIPTION",
                                                    "ACTIONS",
                                                ].map((heading, index) => (
                                                    <TableCell
                                                        key={heading}
                                                        align="center"
                                                        sx={{
                                                            fontWeight: "bold",
                                                            position: "sticky",
                                                            top: 0,
                                                            backgroundColor: "#f5f5f5",
                                                            zIndex: 1,
                                                            borderRight: index < 7 ? "1px solid #e0e0e0" : "none",
                                                        }}
                                                    >
                                                        {heading}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredEventData.map((row, index) => (


                                                <TableRow
                                                    key={row.id}
                                                    sx={{
                                                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                                                        "&:hover": { backgroundColor: "#f0f0f0" },
                                                    }}
                                                >
                                                    <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell
                                                        align="center"
                                                        sx={{
                                                            textTransform: "uppercase",
                                                            fontFamily: "Marquis",
                                                            borderRight: "1px solid #e0e0e0",
                                                        }}
                                                    >
                                                        {row.title}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                                                        {row.type}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                                                        {new Date(row.startDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                                                        {new Date(row.endDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                                                        {row.description}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                gap: 1,
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    onClick={() => handleEdit(row.id)}
                                                                    size={isMobile ? "small" : "medium"}
                                                                    sx={{
                                                                        color: theme.palette.primary.main,
                                                                        "&:hover": {
                                                                            backgroundColor: "rgba(25, 118, 210, 0.08)",
                                                                        },
                                                                    }}
                                                                >
                                                                    <Edit fontSize={isMobile ? "small" : "medium"} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    onClick={() => handleDeleteEvent(row.id)}
                                                                    size={isMobile ? "small" : "medium"}
                                                                    sx={{
                                                                        color: theme.palette.error.main,
                                                                        "&:hover": {
                                                                            backgroundColor: "rgba(211, 47, 47, 0.08)",
                                                                        },
                                                                    }}
                                                                >
                                                                    <Delete fontSize={isMobile ? "small" : "medium"} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TableContainer>
                        </>
                    ) : (
                        <NewEvent
                            onAddSuccess={() => {
                                fetchEvents();
                                setActiveTab(0);
                            }}
                            onClose={() => setActiveTab(0)}
                        />
                    )}

                    {/* Confirm Delete */}
                    <ConfirmDialog
                        open={confirmDialogOpen}
                        onClose={() => setConfirmDialogOpen(false)}
                        onConfirm={confirmDelete}
                        title="Confirm Deletion"
                        message="Are you sure you want to delete this event?"
                        confirmText="Delete"
                    />

                    {/* Edit Modal */}
                    {/* Edit Modal */}
                    <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm">
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Title"
                                fullWidth
                                margin="normal"
                                value={selectedEvent.title || ""}
                                onChange={(e) =>
                                    setSelectedEvent({ ...selectedEvent, title: e.target.value })
                                }
                                required
                                error={!selectedEvent.title?.trim()}
                                helperText={!selectedEvent.title?.trim() ? "Title is required" : ""}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                value={selectedEvent.description || ""}
                                onChange={(e) =>
                                    setSelectedEvent({ ...selectedEvent, description: e.target.value })
                                }
                                required
                                error={!selectedEvent.description?.trim()}
                                helperText={!selectedEvent.description?.trim() ? "Description is required" : ""}
                            />
                            <TextField
                                label="Type"
                                select
                                fullWidth
                                margin="normal"
                                value={selectedEvent.type || ""}
                                onChange={(e) =>
                                    setSelectedEvent({ ...selectedEvent, type: e.target.value })
                                }
                                required
                                error={!selectedEvent.type}
                                helperText={!selectedEvent.type ? "Type is required" : ""}
                            >
                                <MenuItem value="EVENT">EVENT</MenuItem>
                                <MenuItem value="NOTICE">NOTICE</MenuItem>
                                <MenuItem value="MEETING">MEETING</MenuItem>
                            </TextField>
                            <TextField
                                label="Start Date"
                                type="datetime-local"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                value={selectedEvent.startDate ? selectedEvent.startDate.slice(0, 16) : ""}
                                onChange={(e) =>
                                    setSelectedEvent({ ...selectedEvent, startDate: e.target.value })
                                }
                                required
                                error={!selectedEvent.startDate}
                                helperText={!selectedEvent.startDate ? "Start Date is required" : ""}
                            />
                            <TextField
                                label="End Date"
                                type="datetime-local"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                value={selectedEvent.endDate ? selectedEvent.endDate.slice(0, 16) : ""}
                                onChange={(e) =>
                                    setSelectedEvent({ ...selectedEvent, endDate: e.target.value })
                                }
                                required
                                error={
                                    !selectedEvent.endDate ||
                                    (selectedEvent.startDate && selectedEvent.endDate && selectedEvent.startDate > selectedEvent.endDate)
                                }
                                helperText={
                                    !selectedEvent.endDate
                                        ? "End Date is required"
                                        : selectedEvent.startDate > selectedEvent.endDate
                                            ? "End Date must be after Start Date"
                                            : ""
                                }
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={async () => {
                                    // 🔹 Run final validation before saving
                                    if (
                                        !selectedEvent.title?.trim() ||
                                        !selectedEvent.description?.trim() ||
                                        !selectedEvent.type ||
                                        !selectedEvent.startDate ||
                                        !selectedEvent.endDate ||
                                        selectedEvent.startDate > selectedEvent.endDate
                                    ) {
                                        toast.error("Please fix validation errors before saving");
                                        return;
                                    }

                                    try {
                                        const updatedEvent = {
                                            title: selectedEvent.title,
                                            description: selectedEvent.description,
                                            type: selectedEvent.type,
                                            startDate: selectedEvent.startDate,
                                            endDate: selectedEvent.endDate,
                                        };

                                        await axios.put(
                                            `/notices/${selectedEvent.id}`,
                                            updatedEvent
                                        );

                                        toast.success("Event updated successfully!");
                                        fetchEvents();
                                        setEditModalOpen(false);
                                    } catch (err) {
                                        toast.error(
                                            err.response?.data?.details ||
                                            err.response?.data?.message ||
                                            "Failed to update event"
                                        );
                                    }
                                }}
                                variant="contained"
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>


                </Paper>
            </Box>
        </>
    );
};

export default Events;
