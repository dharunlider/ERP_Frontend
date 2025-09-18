// OngoingEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "../Axiosinstance";
import { Box, Typography, IconButton, Collapse, Chip } from "@mui/material";
import { Close, ExpandLess, ExpandMore, Schedule } from "@mui/icons-material";

const OngoingEvents = () => {
    const [events, setEvents] = useState([]);
    const [expanded, setExpanded] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("/notices");

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const ongoing = res.data.filter(event => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    return start <= today && today <= end;
                });

                setEvents(ongoing);
            } catch (err) {
                console.error("Failed to fetch events:", err);
            }
        };

        fetchEvents();
    }, []);

    const handleClose = () => {
        setVisible(false);
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    // Function to format date with time
    const formatDateTime = (dateString) => {
        const options = { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        };
        return new Date(dateString).toLocaleString('en-US', options);
    };

    // Function to check if an event is happening right now (considering time)
    const isHappeningNow = (event) => {
        const now = new Date();
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return now >= start && now <= end;
    };

    if (!events.length || !visible) return null;

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 70,
                right: 20,
                zIndex: 1500,
                bgcolor: "rgba(47, 79, 148, 0.95)",
                borderRadius: 2,
                overflow: "hidden",
                minWidth: 320,
                maxWidth: 420,
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    bgcolor: "rgba(0,0,0,0.2)",
                    cursor: "pointer",
                }}
                onClick={toggleExpand}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                        // src="/images/Firecracker.gif"
                         src="/images/png-transparent-onam-boat-thumbnail.png"
                        alt="Firecracker"
                        style={{
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            pointerEvents: "none",
                        }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "white" }}>
                        Today Events ({events.length})
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                        size="small"
                        onClick={toggleExpand}
                        sx={{ color: "white", p: 0.5, mr: 0.5 }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={handleClose}
                        sx={{ color: "white", p: 0.5 }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </Box>

            {/* Events List */}
            <Collapse in={expanded}>
                <Box sx={{ maxHeight: 300, overflowY: "auto", p: 2 }}>
                    {events.map((event) => {
                        const start = new Date(event.startDate);
                        const end = new Date(event.endDate);
                        const today = new Date();
                        const isToday = today >= start && today <= end;
                        const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
                        const happeningNow = isHappeningNow(event);

                        return (
                            <Box
                                key={event.id}
                                sx={{
                                    mb: 2,
                                    pb: 2,
                                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                                    "&:last-child": { borderBottom: "none", mb: 0, pb: 0 },
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            color: "white",
                                            fontSize: "1rem",
                                            lineHeight: 1.3,
                                            flex: 1,
                                            mr: 1,
                                        }}
                                    >
                                        {event.title}
                                    </Typography>
                                    {happeningNow && (
                                        <Chip 
                                            label="LIVE" 
                                            size="small" 
                                            color="error" 
                                            sx={{ 
                                                fontSize: '0.7rem', 
                                                height: 20,
                                                '& .MuiChip-label': { px: 1 }
                                            }} 
                                        />
                                    )}
                                </Box>
                                
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "rgba(255,255,255,0.8)" }}>
                                    <Schedule sx={{ fontSize: "1rem", mr: 0.5 }} />
                                    <Typography sx={{ fontSize: "0.85rem" }}>
                                        {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    {/* <Typography
                                        sx={{
                                            color: "rgba(255,255,255,0.8)",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        {isToday
                                            ? "Happening today!"
                                            : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`}
                                    </Typography> */}
                                    
                                    {!happeningNow && new Date() < new Date(event.startDate) && (
                                        <Chip 
                                            label="UPCOMING" 
                                            size="small" 
                                            color="yellow" 
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.7rem', 
                                                height: 20,
                                                '& .MuiChip-label': { px: 1 }
                                            }} 
                                        />
                                    )}
                                </Box>
                                
                                {event.description && (
                                    <Typography
                                        sx={{
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize: "0.8rem",
                                            fontStyle: "Marquis",
                                            mt: 1,
                                        }}
                                    >
                                        {event.description.length > 100
                                            ? `${event.description.substring(0, 100)}...`
                                            : event.description}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Collapse>
        </Box>
    );
};

export default OngoingEvents;