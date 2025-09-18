import { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import { Save, Close } from "@mui/icons-material";
import axios from "../Axiosinstance";
import { toast } from "react-toastify";

const NewEvent = ({ onAddSuccess, onClose }) => {
    const [event, setEvent] = useState({
        title: "",
        description: "",
        type: "",
        startDate: "",
        endDate: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvent((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        const newErrors = {};

        if (!event.title.trim()) newErrors.title = "Title is required";
        if (!event.description.trim())
            newErrors.description = "Description is required";
        if (!event.startDate) newErrors.startDate = "Start Date is required";
        if (!event.endDate) newErrors.endDate = "End Date is required";
        if (event.startDate && event.endDate && event.startDate > event.endDate) {
            newErrors.endDate = "End Date must be after Start Date";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            await axios.post("/notices", event);
            toast.success("Event created successfully");

            setEvent({
                title: "",
                description: "",
                type: "",
                startDate: "",
                endDate: "",
            });

            if (onAddSuccess) onAddSuccess();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to save event. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography
                variant="h6"
                gutterBottom
                sx={{ mb: 3, textTransform: "uppercase", fontFamily: "Marquis" }}
            >
                New Event
            </Typography>

            <Grid container spacing={2}>
                {/* Title */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={event.title}
                        onChange={handleChange}
                        required
                        error={!!errors.title}
                        helperText={errors.title}
                        inputProps={{
                            maxLength: 100,
                            placeholder: "Enter Event Title (e.g. Annual Company Party)",
                        }}
                    />
                </Grid>

                {/* Type */}
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        name="type"
                        value={event.type}
                        onChange={handleChange}
                    >
                        <MenuItem value="EVENT">EVENT</MenuItem>
                        <MenuItem value="NOTICE">NOTICE</MenuItem>
                        <MenuItem value="MEETING">MEETING</MenuItem>
                    </TextField>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Description"
                        name="description"
                        value={event.description}
                        onChange={handleChange}
                        required
                        error={!!errors.description}
                        helperText={errors.description}
                        inputProps={{
                            maxLength: 500,
                            placeholder: "Enter Event Description",
                        }}
                    />
                </Grid>

                {/* Dates */}
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="Start Date"
                        name="startDate"
                        InputLabelProps={{ shrink: true }}
                        value={event.startDate}
                        onChange={handleChange}
                        required
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="End Date"
                        name="endDate"
                        InputLabelProps={{ shrink: true }}
                        value={event.endDate}
                        onChange={handleChange}
                        required
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                    />
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ mr: 2 }}
                    startIcon={<Close />}
                    disabled={loading}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </Box>
        </Paper>
    );
};

export default NewEvent;
