import React, { useState, useEffect, useCallback } from "react";
import {
    Box, TextField, Button, Typography, Card, CardContent, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Tooltip, Divider, Grid,CircularProgress,
} from "@mui/material";
import { toast } from 'react-toastify';
import axios from '../Axiosinstance';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from "dayjs";
import Calendar from "react-calendar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import "react-calendar/dist/Calendar.css";
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { downloadFile } from "../Constants/Constants";
import { FileDownload as ExportIcon } from '@mui/icons-material';

const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#fff9c4", // light yellow
        color: "#37474f", // dark grey text
        fontSize: "1.5rem",
        fontWeight: 500,
        padding: "10px 12px",
        borderRadius: 8,
        maxWidth: 220,
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        whiteSpace: "normal",
        lineHeight: 1.4,
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: "#fff9c4",
    },
}));
const PublicHoliday = () => {
    const [holidayEntries, setHolidayEntries] = useState([
        { name: "", date: "" }
    ]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [editIndex, setEditIndex] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [editLeaveName, setEditLeaveName] = useState("");
    const [editSelectedDate, setEditSelectedDate] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [groupedHolidays, setGroupedHolidays] = useState({});
    const Year = dayjs().year();
    const [isStaff, setIsStaff] = useState(false);
        const [downloading, setDownloading] = useState(false);

        const handleHolidayExport = useCallback(() => {
          downloadFile({
            url: '/public-holidays/leaves/export',
            filename: 'holiday_list.xlsx',
            onStart: () => setDownloading(true),
            onComplete: () => setDownloading(false),
            onError: (err) => {
              setDownloading(false);
              toast.error('Failed to export: ' + err.message);
            },
          });
        }, []);


    useEffect(() => {
        const authoritiesFromSession = JSON.parse(sessionStorage.getItem('authorities') || '[]');
        setIsStaff(authoritiesFromSession.includes('TYPE_STAFF'));
    }, []);

    const handleSave = async () => {
        const validEntries = holidayEntries.filter(
            (entry) => entry.name && entry.date
        );

        if (validEntries.length === 0) return;

        const newHolidays = validEntries.map((entry) => ({
            name: entry.name,
            date: dayjs(entry.date).format("YYYY-MM-DD"),
        }));

        try {
            const response = await axios.post("/public-holidays", newHolidays);
            const savedHolidays = response.data;

            const updated = [...holidays, ...savedHolidays];
            setHolidays(updated);
            setGroupedHolidays(groupByDate(updated));
            setHolidayEntries([{ name: "", date: "" }]);
             toast.success("Holidays saved successfully!");
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error("One or more holidays already exist.");
            } else {
                toast.error("Failed to save holidays. Please try again.");
            }
            console.error("Failed to save holidays:", error);
        }
    };

    useEffect(() => {
        axios
            .get(`/public-holidays/${Year}`)
            .then((res) => {
                const data = res.data;
                console.log(data, "hohhkofhkofj")
                setHolidays(data);
                const grouped = groupByDate(data);
                setGroupedHolidays(grouped);
            })

            .catch((err) => {
                console.error("Failed to fetch holidays", err);
            });
    }, [Year]);


    const handleEdit = (id) => {
        const index = holidays.findIndex((h) => h.id === id);
        if (index === -1) return;

        const holiday = holidays[index];
        setEditLeaveName(holiday.name);
        setEditSelectedDate(dayjs(holiday.date));
        setEditIndex(index);
        setEditModalOpen(true);
    };

    const handleDelete = async () => {
        const holidayToDelete = holidays[deleteIndex];

        if (!holidayToDelete?.id) {
            console.error("No valid ID found for deletion");
            return;
        }

        try {
            await axios.delete(`/public-holidays/${holidayToDelete.id}`);

            // Remove from state after successful API call
            const updated = holidays.filter((_, i) => i !== deleteIndex);
            setHolidays(updated);
            setGroupedHolidays(groupByDate(updated));
            setDeleteIndex(null);
            setConfirmDeleteOpen(false);
        } catch (error) {
            console.error("Failed to delete holiday:", error);
            // Optionally show error message to user
        }
    };

    const groupByDate = (holidayList) => {
        return holidayList.reduce((acc, holiday) => {
            const formattedDate = dayjs(holiday.date).format("DD-MM-YYYY");
            if (!acc[formattedDate]) acc[formattedDate] = [];
            acc[formattedDate].push(holiday);
            return acc;
        }, {});
    };

    const renderTileContent = ({ date, view }) => {
        if (view !== "month") return null;

        const str = dayjs(date).format("YYYY-MM-DD");
        const dayHolidays = holidays.filter((h) => h.date === str);
        if (dayHolidays.length === 0) return null;



        return (

            <CustomTooltip
                title={
                    <Box>
                        {dayHolidays.map((holiday, i) => (
                            <Typography key={i} variant="body2" sx={{ fontWeight: 500 }}>
                                {holiday.name}
                            </Typography>
                        ))}
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                            {dayjs(date).format("DD-MM-YYYY")}
                        </Typography>
                    </Box>
                }
                placement="top"
            >
                <Box
                    sx={{
                        mb: 1,
                        backgroundColor: "#ffe082",
                        color: "#37474f",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        py: 1,
                        borderRadius: 2,
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        lineHeight: 1.2,
                        cursor: "pointer",
                        overflow: "hidden",
                        '&:hover': {
                            backgroundColor: "#ffd54f",
                            transform: "scale(1.05)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    {dayHolidays.length === 1 ? dayHolidays[0].name : `${dayHolidays.length} Holidays`}
                </Box>
            </CustomTooltip>

        );
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>

            {/* Row 1 */}
            {!isStaff && (
                <Card sx={{ mb: 3, p: 2 }}>
                    {holidayEntries.map((entry, index) => (
                        <Grid
                                container
                            spacing={2}
                            key={index}
                            alignItems="center"
                            sx={{ mb: 1 }}
                        >
                            <Grid item xs={12} sm={5} md={4}>
                                <TextField
                                    label="Leave Name"
                                    value={entry.name}
                                    onChange={(e) => {
                                        const newEntries = [...holidayEntries];
                                        newEntries[index].name = e.target.value;
                                        setHolidayEntries(newEntries);
                                    }}
                                    fullWidth
                                    placeholder="Enter Leave Name (e.g. Independence Day)"
                                    InputProps={{
                                        style: { fontSize: '0.95rem' },
                                    }}
                                    inputProps={{
                                        maxLength: 50,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={5} md={4}>
                                <TextField
                                    label="Select Date"
                                    type="date"
                                    value={entry.date}
                                    onChange={(e) => {
                                        const newEntries = [...holidayEntries];
                                        newEntries[index].date = e.target.value;
                                        setHolidayEntries(newEntries);
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} sm={2} md={4}>
                                <Box display="flex" gap={1}>
                                    {holidayEntries.length > 1 && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                                const newEntries = holidayEntries.filter((_, i) => i !== index);
                                                setHolidayEntries(newEntries);
                                            }}
                                        >
                                            {/* ❌ */}close
                                        </Button>
                                    )}

                                    {index === holidayEntries.length - 1 && (
                                        <Button
                                            variant="outlined"
                                            onClick={() =>
                                                setHolidayEntries([...holidayEntries, { name: "", date: "" }])
                                            }
                                        >
                                            {/* ➕ */} Add
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    ))}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        sx={{ mt: 2 }}
                    >
                        Save
                    </Button>
                </Card>
            )}
            {/* Row 2 */}
            <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
                {/* List */}
                <Card sx={{ flex: 1, minHeight: 300 }}>
                    <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                         <Typography variant="h6" gutterBottom>
                           HOLIDAY LIST
                         </Typography>
                       
                         <Button
                           variant="contained"
                           size="small"
                           onClick={handleHolidayExport}
                           startIcon={<ExportIcon />}
                           disabled={downloading}
                         sx={{
                             height: '40px',
                             width: { xs: '100%', sm: 'auto' },
                             whiteSpace: 'nowrap',
                             alignSelf: { xs: 'stretch', sm: 'flex-end' },
                           }}
                         >
                           {downloading ? <CircularProgress size={20} /> : 'Export'}
                         </Button>
                       </Box>
                        <Divider sx={{ mb: 2 }} />
                        {holidays.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No holidays added yet.
                            </Typography>
                        )}
                        {Object.entries(groupedHolidays).map(([date, holidayGroup], groupIdx) => (
                            <Box
                                key={groupIdx}
                                sx={{
                                    mb: 2,
                                    px: 1,
                                    py: 1,
                                    // backgroundColor: "#e3f2fd",
                                    background: 'linear-gradient(90deg,rgb(209, 223, 209) 100%,rgb(223, 238, 224) 0%)',
                                    borderRadius: 1,
                                }}
                            >
                                {/* Date shown first */}
                                <Typography fontWeight={600} mb={1}>
                                    📅 {date}
                                </Typography>

                                {/* List of holidays under that date */}
                                {holidayGroup.map((h, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 0.5,
                                        }}
                                    >
                                        <Typography sx={{
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            "&:hover": { textDecoration: "none" },
                                        }}
                                            onClick={() => setCalendarDate(new Date(h.date))}>{h.name}</Typography>
                                        {!isStaff && (
                                            <Box display="flex" justifyContent="flex-end" width="100%" mt={1}>
                                                <IconButton onClick={() => handleEdit(h.id)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setDeleteIndex(holidays.indexOf(h));
                                                        setConfirmDeleteOpen(true);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" color="error" />
                                                </IconButton>
                                            </Box>
                                        )}
                                        {idx < holidays.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </CardContent>
                </Card>

                {/* Calendar */}
                <Card sx={{ flex: 1, minHeight: 300 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            HOLIDAY CALENDER
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                            sx={{
                                width: '100%',
                                '& .react-calendar': {
                                    width: '100% !important',
                                    maxWidth: '100% !important',
                                    border: 'none',
                                    fontFamily: 'inherit',
                                },
                                '& .react-calendar__month-view__days__day': {
                                    border: '1px solid #ccc',
                                    backgroundColor: '#f5eed5', // ✅ your custom light purple
                                    height: 100,
                                    width: 50,
                                    textAlign: 'center',
                                    verticalAlign: 'middle',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    flexDirection: 'column',
                                },
                                '& .react-calendar__tile--now': {
                                    backgroundColor: '#d6d6eb', // optional: slightly darker for today
                                },
                                '& .react-calendar__tile--active': {
                                    backgroundColor: '#c2c2e0 !important', // optional: darker for selected date
                                    color: '#000',
                                },
                                '& .react-calendar__month-view__weekdays__weekday': {
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    color: '#FFFFFF',
                                    fontSize: '1.25rem',
                                    border: '1px solid #ccc', // ✅ Border on each cell
                                    height: 100,
                                    width: 50,
                                    backgroundColor: '#1A2B48',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',

                                },
                                '& .react-calendar__month-view__weekdays__weekday abbr': {
                                    textDecoration: 'none'
                                },
                                '@media (max-width: 600px)': {
                                    '& .react-calendar__month-view__days__day': {
                                        height: 50,
                                    },
                                }
                            }}
                        >
                            <Calendar tileContent={renderTileContent} value={calendarDate}
                                onChange={setCalendarDate} />
                        </Box>


                    </CardContent>
                </Card>
            </Box>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <DialogTitle>
                    EDIT HOLIDAY
                    <IconButton
                        onClick={() => setEditModalOpen(false)}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Leave Name"
                        value={editLeaveName}
                        onChange={(e) => setEditLeaveName(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                        placeholder="Enter Leave Name (e.g. Pongal, Diwali)"
                        InputProps={{
                            style: { fontSize: '0.95rem' },
                        }}
                        inputProps={{
                            maxLength: 50,
                        }}
                    />

                    <Box
                        sx={{
                            width: { xs: '100%', sm: '48%', md: '42%' },
                            minWidth: 200,
                            "& .react-calendar": {
                                width: "100%",
                                border: "1px solid #cfd8dc",
                                borderRadius: 2,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                fontFamily: "'Inter', sans-serif",
                            },
                        }}
                    >

                        <Calendar
                            onChange={(date) => setEditSelectedDate(date)}
                            value={editSelectedDate}
                        />
                    </Box>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            const updatedHoliday = {
                                id: holidays[editIndex].id,
                                name: editLeaveName,
                                date: dayjs(editSelectedDate).format("YYYY-MM-DD"),
                            };

                            try {
                                await axios.put(`/public-holidays/${updatedHoliday.id}`, updatedHoliday);

                                const updated = [...holidays];
                                updated[editIndex] = updatedHoliday;
                                setHolidays(updated);
                                setGroupedHolidays(groupByDate(updated));
                                setEditModalOpen(false);
                                setEditIndex(null);
                            } catch (error) {
                                console.error("Failed to update holiday:", error);
                            }
                        }}
                        variant="contained"
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Delete */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this holiday?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer position="bottom-right" autoClose={1000} />
        </Box>

    );
};

export default PublicHoliday;