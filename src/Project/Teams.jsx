import React, { useState, useEffect } from 'react';
import {
    Box, Button, Container, Grid, MenuItem, Paper, Select,
    TextField, Typography, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Autocomplete, Avatar, Chip, ListItemAvatar, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, Table, TableContainer, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import axios from '../Axiosinstance';
import { useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Nodatapage from "../Nodatapage";

import CircularProgress from '@mui/material/CircularProgress';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper"
import SearchBar from '../Constants/SearchBar';


const TeamForm = () => {
    const [open, setOpen] = useState(false);
    const [teams, setTeams] = useState([]);
    const [editId, setEditId] = useState(null);
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        // managerId: '',
        leadId: '',
        projectId: '',
        memberIds: []
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [membersSearch, setMembersSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    // Fetch teams (dummy function — replace with your GET API)
    const fetchTeams = async (reset = false) => {
        if (reset) {
            setInitialLoading(true);
        } else {
            if (loadingMore) return;
            setLoadingMore(true);
        }

        try {
            const params = {
                size: 10,
                ...(!reset && cursor && { cursor })
            };

            const response = await axios.get('project-Teams', { params });
            const newData = response.data;

            setTeams(prev => reset ? newData : [...prev, ...newData]);
            setHasMore(newData.length >= 10);

            if (newData.length > 0) {
                setCursor(newData[newData.length - 1].id);
            }
        } catch (error) {
            console.error("Fetch teams error:", error);
            toast.error("Failed to fetch teams. Please try again.");
        } finally {
            if (reset) {
                setInitialLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };


    useEffect(() => {
        fetchTeams(true);
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setFormData({
            name: '',
            description: '',
            // managerId: '',
            leadId: '',
            memberIds: [],
            projectId: ''
        });
        setEditId(null);
    };

    const handleEdit = (team) => {
        const matchedProjectId = team.projectId || projects.find(p => p.name === team.projectName)?.id || '';
        setFormData({
            name: team.name || '',
            description: team.description || '',
            // managerId: team.managerId || '',
            leadId: team.leadId || '',
            projectId: matchedProjectId,
            memberIds: team.teamMembers?.map(member => member.id) || [] // ✅ only IDs
        });

        setEditId(team.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditId(null);
        setFormData({
            name: '',
            description: '',
            // managerId: '',
            leadId: '',
            projectId: '',
            memberIds: []
        });
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // const handleMultiSelectChange = (event) => {
    //     const {
    //         target: { value },
    //     } = event;
    //     setFormData(prev => ({
    //         ...prev,
    //         memberIds: typeof value === 'string' ? value.split(',') : value,
    //     }));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name?.trim()) return toast.error("Team name is required");
        // if (!formData.managerId) return toast.error("Manager selection is required");
        if (!formData.description?.trim()) return toast.error("Description is required");
        if (!formData.leadId) return toast.error("Lead selection is required");
        if (!formData.projectId) return toast.error("Project selection is required");
        if (!formData.memberIds) return toast.error("Team members selection is required");
        try {
            if (editId) {
                await axios.put(`project-Teams/teams/${editId}`, formData);
                toast.success('Team updated successfully!');
            } else {
                await axios.post('project-Teams', formData);
                toast.success('Team created successfully!');
            }
            handleClose();
            fetchTeams(true);
        } catch (err) {
            let errorMessage = 'Something went wrong. Please try again.';

            if (err.response?.data) {
                const { details, message } = err.response.data;

                if (message === "Duplicate Value" && details?.includes("already exists")) {
                    // Extract IDs from "Value '12-20' already exists"
                    const match = details.match(/Value\s+'(\d+)-(\d+)'/);
                    if (match) {
                        const projectId = parseInt(match[1], 10);
                        const staffId = parseInt(match[2], 10);

                        const projectName = projects?.find(p => p.id === projectId)?.name || 'this project';
                        const staffName = staffs?.find(s => s.id === staffId)?.name || 'This staff';

                        errorMessage = `${staffName} is already assigned to another team in ${projectName}.`;
                    } else {
                        errorMessage = "Already assigned to another team in this project.";
                    }
                } else {
                    errorMessage = details || message || errorMessage;
                }
            }

            toast.error(errorMessage);
            console.error("Submit error:", err);
        }
    }


    const [staffs, setStaffs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [teamLeads, setTeamLeads] = useState([]);

    useEffect(() => {
        const fetchTeamLeads = async () => {
            try {
                const response = await axios.get("/staff/teamleads");
                setTeamLeads(response.data); // assume API returns array of {id, name, hrCode, roleName}
            } catch (err) {
                console.error("Error fetching team leads:", err);
                toast.error("Failed to load team leads");
            }
        };

        fetchTeamLeads();
    }, []);
    const fetchStaffs = async () => {
        try {
            const res = await axios.get('/staff/allstaffs');
            setStaffs(res.data);
        } catch (err) {
            console.error('Fetch staffs error:', err);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await axios.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error('Fetch projects error:', err);
        }
    };

    useEffect(() => {

        fetchStaffs();
        fetchProjects();
    }, []);


    const handleDelete = async (id) => {
        setTeamToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`project-Teams/${teamToDelete}`);
            toast.success("Team deleted successfully!");
            fetchTeams(true);
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete team.");
        } finally {
            setDeleteDialogOpen(false);
            setTeamToDelete(null);
        }
    };

    function stringToColor(string) {
        let hash = 0;
        let i;

        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }

        return color;
    }

    // Get initials from name
    function getInitials(name) {
        return name.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    const filterOptions = (options, { inputValue }) => {
        return options.filter(option =>
            option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.hrCode.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const filteredData = teams.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <Container maxWidth="xlg">
            <ToastContainer position="bottom-right" autoClose={3000} />

            {/* <Typography variant="h4" >Teams</Typography> */}

            <Box>

                <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'stretch' : 'center'} flexWrap="wrap" gap={2} marginBottom={2}>

                    <Button variant="contained" color="primary" onClick={handleOpen} fullWidth={isMobile} sx={{ height: '40px' }}>
                        ADD TEAM
                    </Button>

                    <SearchBar
                        variant="outlined"

                        value={searchTerm}
                        placeholder="Search by Name"
                        onChange={(e) => setSearchTerm(e.target.value)}

                    />

                </Box>

                <Box mt={2}>
                    {initialLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box


                        >
                            <InfiniteScrollWrapper
                                dataLength={teams.length}
                                next={fetchTeams}
                                hasMore={hasMore}
                                loading={loadingMore}

                            >
                                <TableContainer>
                                    <Table
                                        size={isMobile ? 'small' : 'medium'}
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
                                            '& .MuiTableRow-root:nth-of-type(odd)': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                            },
                                            '& .MuiTableRow-root:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                            }
                                        }}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">Project Name</TableCell>
                                                <TableCell align="center">Team Name</TableCell>
                                                <TableCell align="center">Description</TableCell>
                                                {/* <TableCell align="center">Manager</TableCell> */}

                                                <TableCell align="center">Lead</TableCell>

                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Nodatapage />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredData.map((team) => (
                                                    <TableRow key={team.id}>
                                                        <TableCell align="center">{team.projectName}</TableCell>
                                                        <TableCell align="center">{team.name}</TableCell>
                                                        <TableCell align="center">{team.description}</TableCell>
                                                        {/* <TableCell align="center">{team.managerName}</TableCell> */}

                                                        <TableCell align="center">{team.leadName}</TableCell>

                                                        <TableCell align="center">
                                                            <IconButton color="primary" onClick={() => handleEdit(team)} aria-label="edit">
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton color="error" onClick={() => handleDelete(team.id)} aria-label="delete">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </InfiniteScrollWrapper>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Modal Form */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this team?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>


            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '10px' } }}>
                <DialogTitle sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 2,
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }}>
                    {editId ? "Edit Team" : "Create New Team"}
                </DialogTitle>

                <DialogContent sx={{ py: 3, mt: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {/* Team Name */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Team Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    variant="filled"
                                    size="small"
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: {
                                            borderRadius: '8px',
                                            backgroundColor: 'action.hover',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': { borderColor: 'text.primary', backgroundColor: 'action.selected' },
                                            '&.Mui-focused': { borderColor: 'primary.main', backgroundColor: 'background.paper' }
                                        }
                                    }}
                                    InputLabelProps={{ sx: { fontWeight: 500 } }}
                                />
                            </Grid>

                            {/* Team Description */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    name="description"
                                    label="Team Description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    variant="filled"
                                    size="small"
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: {
                                            borderRadius: '8px',
                                            backgroundColor: 'action.hover',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': { borderColor: 'text.primary', backgroundColor: 'action.selected' },
                                            '&.Mui-focused': { borderColor: 'primary.main', backgroundColor: 'background.paper' }
                                        }
                                    }}
                                    InputLabelProps={{ sx: { fontWeight: 500 } }}
                                />
                            </Grid>

                            {/* Manager and Lead */}
                            <Grid item container spacing={2} xs={12}>
                                {/* Manager - Using Autocomplete for better search */}
                                {/* <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={staffs}
                                        getOptionLabel={(option) => option.name}
                                        filterOptions={filterOptions}
                                        value={staffs.find(user => user.id === formData.managerId) || null}
                                        onChange={(event, newValue) => {
                                            handleChange({
                                                target: {
                                                    name: 'managerId',
                                                    value: newValue?.id || ''
                                                }
                                            });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Manager"
                                                variant="filled"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <MenuItem {...props}>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: '0.75rem',
                                                            bgcolor: stringToColor(option.name)
                                                        }}
                                                    >
                                                        {getInitials(option.name)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={option.name}
                                                    secondary={`${option.hrCode} • ${option.roleName}`}
                                                    primaryTypographyProps={{ fontWeight: 500 }}
                                                    secondaryTypographyProps={{ variant: 'caption' }}
                                                />
                                            </MenuItem>
                                        )}
                                    />
                                </Grid> */}
                                {/* Project */}
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <Autocomplete
                                            options={projects}
                                            getOptionLabel={(option) => option.name}
                                            value={projects.find(p => p.id === formData.projectId) || null}
                                            onChange={(e, newValue) => {
                                                handleChange({
                                                    target: {
                                                        name: 'projectId',
                                                        value: newValue?.id || ''
                                                    }
                                                });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Project"
                                                    variant="filled"
                                                    size="small"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        disableUnderline: true,
                                                        sx: {
                                                            borderRadius: '8px',
                                                            backgroundColor: 'action.hover',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            '&:hover': { backgroundColor: 'action.selected' },
                                                            '&.Mui-focused': { backgroundColor: 'background.paper' }
                                                        }
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        <Box sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '3px',
                                                            bgcolor: option.color || 'primary.main',
                                                            mr: 2
                                                        }} />
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography fontWeight={500}>{option.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {option.code || ''}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </li>
                                            )}
                                            sx={{
                                                '& .MuiAutocomplete-popupIndicator': { color: 'text.secondary' }
                                            }}
                                        />
                                    </FormControl>
                                </Grid>
                                {/* Lead - Using Autocomplete for better search */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={teamLeads}  // ✅ use API result instead of all staffs
                                        getOptionLabel={(option) => option.name}
                                        filterOptions={filterOptions}
                                        value={teamLeads.find(user => user.id === formData.leadId) || null}
                                        onChange={(event, newValue) => {
                                            handleChange({
                                                target: {
                                                    name: 'leadId',
                                                    value: newValue?.id || ''
                                                }
                                            });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Lead"
                                                variant="filled"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <MenuItem {...props}>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            fontSize: '0.75rem',
                                                            bgcolor: stringToColor(option.name)
                                                        }}
                                                    >
                                                        {getInitials(option.name)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={option.name}
                                                    secondary={`${option.hrCode} • ${option.roleName}`}
                                                    primaryTypographyProps={{ fontWeight: 500 }}
                                                    secondaryTypographyProps={{ variant: 'caption' }}
                                                />
                                            </MenuItem>
                                        )}
                                    />
                                </Grid>

                            </Grid>

                            {/* Team Members - Custom filtered Select */}
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={staffs}
                                    getOptionLabel={(option) => option.name}
                                    filterSelectedOptions
                                    value={staffs.filter(user => formData.memberIds.includes(user.id))}
                                    onChange={(event, newValue) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            memberIds: newValue.map(user => user.id)
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Team Members"
                                            placeholder="Search team members..."
                                            variant="filled"
                                            size="small"
                                        />
                                    )}
                                    renderTags={(selectedUsers, getTagProps) =>
                                        selectedUsers.map((user, index) => (
                                            <Chip
                                                {...getTagProps({ index })}
                                                key={user.id}
                                                label={user.name}
                                                avatar={
                                                    <Avatar
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            fontSize: '0.6rem',
                                                            bgcolor: stringToColor(user.name)
                                                        }}
                                                    >
                                                        {getInitials(user.name)}
                                                    </Avatar>
                                                }
                                                sx={{ borderRadius: '6px' }}
                                            />
                                        ))
                                    }
                                    renderOption={(props, user, { selected }) => (
                                        <li {...props}>
                                            <Checkbox checked={selected} sx={{ mr: 1 }} />
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        fontSize: '0.75rem',
                                                        bgcolor: stringToColor(user.name)
                                                    }}
                                                >
                                                    {getInitials(user.name)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.name}
                                                secondary={`${user.hrCode} • ${user.roleName}`}
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </li>
                                    )}
                                />

                            </Grid>

                        </Grid>

                        <DialogActions sx={{ mt: 4, px: 0 }}>
                            <Button
                                onClick={handleClose}
                                variant="text"
                                color="inherit"
                                sx={{
                                    borderRadius: '8px',
                                    px: 3,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    color: 'text.secondary'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: '8px',
                                    px: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                {editId ? "Save Changes" : "Create Team"}
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default TeamForm;
