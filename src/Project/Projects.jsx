import React, { useState } from 'react';
import {
    Box, Container, Typography, TextField, Tab, Tabs, InputLabel, FormControl,
    Button, Grid, Select, MenuItem, Paper, LinearProgress, Autocomplete, Chip,
    TableHead, TableCell, Table, TableRow, TableBody, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { AttachMoney as AttachMoneyIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import Teams from './Teams'
import axios from '../Axiosinstance';
import { useEffect } from 'react'; // already imported probably
import CircularProgress from '@mui/material/CircularProgress';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import Nodatapage from "../Nodatapage";

const Project = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        plannedEndDate: '',
        status: 'Planned',
        baseAmount: '',
        manager: { id: '' }
    });
    const [projectList, setProjectList] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [submittedData, setSubmittedData] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchTerm, setSearchTerm] = useState('');
    const tabHeaders = ["PROJECT OVERVIEW", "PROJECT FORM", "TEAM"];
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [additionalCharges, setAdditionalCharges] = useState([]);
    const [newCharge, setNewCharge] = useState({
        description: '',
        amount: '',
        category: ''
    });



    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAddCharge = () => {
        if (newCharge.description && newCharge.amount) {
            setAdditionalCharges([...additionalCharges, {
                ...newCharge,
                amount: Number(newCharge.amount),
                dateAdded: new Date().toISOString().split('T')[0]
            }]);
            setNewCharge({
                description: '',
                amount: '',
                category: ''
            });
        }
    };

    const handleRemoveCharge = (index) => {
        const updatedCharges = [...additionalCharges];
        updatedCharges.splice(index, 1);
        setAdditionalCharges(updatedCharges);
    };


    useEffect(() => {
        if (activeTab === 0) {
            fetchProjects(true);
        }
    }, [activeTab]);
    useEffect(() => {
        fetchProjects(true);
    }, [searchTerm]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await axios.get("/staff/manager");
                console.log("Error fetching staff:", res.data);
                setStaffList(res.data || []);
            } catch (err) {
                console.error("Error fetching staff:", err);
                toast.error("Failed to load staff list");
            }
        };
        fetchStaff();
    }, []);

    const fetchProjects = async (reset = false) => {
        if (reset) {
            setInitialLoading(true);
        } else {
            if (loadingMore) return;
            setLoadingMore(true);
        }

        try {
            const params = {
                size: 10,
                ...(!reset && cursor && { cursor }),
                ...(searchTerm && { search: searchTerm })
            };

            const response = await axios.get('/projects', { params });
            const newData = response.data;

            setProjectList(prev =>
                reset ? newData : [...prev, ...newData]
            );
            setHasMore(newData.length >= 10);
            if (newData.length > 0) {
                setCursor(newData[newData.length - 1].id);
            }
        } catch (error) {
            console.error('Error fetching Project data:', error);
            toast.error('Failed to fetch Project. Please try again.');
        } finally {
            if (reset) {
                setInitialLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation checks
        if (!formData.name?.trim()) newErrors.name = 'Project name is required';
        if (!formData.description?.trim()) newErrors.description = 'Project description is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.baseAmount || Number(formData.baseAmount) <= 0) newErrors.baseAmount = 'Project amount is required';
        if (!formData.manager) newErrors.manager = 'Project manager is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error(`Please fix: ${Object.values(newErrors).join(', ')}`);
            return;
        }

        // Prepare payload in API format
        const payload = {
            name: formData.name,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            plannedEndDate: formData.plannedEndDate || null,
            status: formData.status,
            baseAmount: Number(formData.baseAmount),
            manager: { id: formData.manager },
            additionalCharges: additionalCharges.length > 0 ? additionalCharges : []
        };

        try {
            const response = await axios.post('/projects', payload);
            setSubmittedData(response.data);
            toast.success('Project saved successfully!');

            // Reset form
            setFormData({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                plannedEndDate: '',
                status: 'Planned',
                baseAmount: '',
                managerId: ''
            });
            setAdditionalCharges([]);

        } catch (error) {
            console.error('Error submitting project:', error);
            toast.error('Failed to save project. Please try again.');
        }
    };

    const handleEdit = (project) => {
        console.log("project:", project)
        setFormData({
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate,
            plannedEndDate: project.plannedEndDate || '',
            status: project.status,
            baseAmount: project.baseAmount || '',
            manager: { id: project.managerId || '' }
        });

        setAdditionalCharges(project.additionalCharges || []);
        setEditingId(project.id);
        setEditDialogOpen(true);
    };


    const isFormValid = () =>
        formData.name &&
        formData.description &&
        formData.startDate &&
        formData.endDate && formData.manager;

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            plannedEndDate: '',
            status: 'Planned',
            baseAmount: '',
            manager: { id: '' }
        });
        setAdditionalCharges([]); // Reset charges when closing dialog
        setNewCharge({
            description: '',
            amount: '',
            category: ''
        });
    };

    // const handleDelete = async (id) => {
    //   if (window.confirm("Are you sure you want to delete this project?")) {
    //     try {
    //       await axios.delete(`/projects/${id}`);
    //       toast.success("Project deleted successfully");
    //       fetchProjects();
    //     } catch (error) {
    //       toast.error("Failed to delete project");
    //       console.error("Delete error:", error);
    //     }
    //   }
    // };

    const handleDelete = async (id) => {
        setProjectToDelete(id);
        setDeleteDialogOpen(true);
    };


    const filteredProjects = projectList.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={1000} />
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons={isMobile ? 'auto' : false}
                allowScrollButtonsMobile
                TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                sx={{
                    bgcolor: '#F0F4F8',
                    marginBottom: '20px',
                    padding: isMobile ? '4px 8px' : '8px 12px',
                    overflowX: isMobile ? 'auto' : 'unset',
                    '& .MuiTabs-flexContainer': {
                        flexWrap: isMobile ? 'nowrap' : 'wrap',
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '14px' : '16px',
                        color: '#142a4f',
                        padding: isMobile ? '6px 12px' : '6px 18px',
                        whiteSpace: 'nowrap',
                        backgroundColor: '#ffffff',
                        borderRadius: '7px',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#e6ecf3',
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#142a4f',
                            color: '#ffffff',
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                        },
                    },
                }}
            >
                {tabHeaders.map((header, index) => (
                    <Tab key={index} label={header} />
                ))}
            </Tabs>

            <Paper style={{ padding: '14px', margin: '14px' }}>
                {activeTab === 0 && (
                    <Box>
                        <Box sx={{ p: 2 }}>
                            <TextField
                                label="Search by Project Name"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Box>
                        <Box sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                            {initialLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                    <CircularProgress />
                                </Box>

                            ) : (
                                <InfiniteScrollWrapper
                                    dataLength={filteredProjects.length}
                                    next={() => fetchProjects()}
                                    hasMore={hasMore}
                                    loading={loadingMore}
                                >
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
                                    }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell> Project Name</TableCell>
                                                <TableCell > Project Manager</TableCell>
                                                <TableCell>Progress</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Start Date</TableCell>
                                                <TableCell>End Date</TableCell>
                                                <TableCell>Amount</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredProjects.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        <Nodatapage />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredProjects.map((project, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{project.name}</TableCell>
                                                        <TableCell>{project.managerName}</TableCell>
                                                        <TableCell sx={{ width: '197px' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={project.completedPercentage ?? 0}
                                                                        sx={{
                                                                            height: 6,
                                                                            borderRadius: 3,
                                                                            backgroundColor: 'divider',
                                                                            '& .MuiLinearProgress-bar': {
                                                                                borderRadius: 3,
                                                                                backgroundColor: (theme) =>
                                                                                    (project.completedPercentage ?? 0) >= 100
                                                                                        ? theme.palette.success.main
                                                                                        : theme.palette.mode === 'light'
                                                                                            ? '#1976d2'
                                                                                            : '#90caf9'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                                                                    {Math.round(project.completedPercentage ?? 0)}%
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{project.status}</TableCell>
                                                        <TableCell>{project.startDate}</TableCell>
                                                        <TableCell>{project.endDate}</TableCell>
                                                        <TableCell>₹{project.baseAmount}</TableCell>
                                                        <TableCell>
                                                            <IconButton color="primary" onClick={() => handleEdit(project)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton color="error" onClick={() => {
                                                                setProjectToDelete(project.id);
                                                                setDeleteDialogOpen(true);
                                                            }}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </InfiniteScrollWrapper>
                            )}


                            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                                <DialogTitle>Confirm Delete</DialogTitle>
                                <DialogContent>
                                    <Typography>Are you sure you want to delete this project?</Typography>
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)} color="inherit">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await axios.delete(`/projects/${projectToDelete}`);
                                                toast.success('Project deleted successfully!');
                                                fetchProjects(true); // Refresh the table
                                            } catch (error) {
                                                toast.error('Failed to delete project');
                                                console.error(error);
                                            } finally {
                                                setDeleteDialogOpen(false);
                                                setProjectToDelete(null);
                                            }
                                        }}
                                        color="error"
                                        variant="contained"
                                    >
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="md">
                                <DialogTitle sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    p: 3,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>Edit Project</DialogTitle>
                                <DialogContent dividers>
                                    <Grid container spacing={3} sx={{ mt: 1 }}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Project Name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    label="Status"
                                                >
                                                    <MenuItem value="Planned">Planned</MenuItem>
                                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                                    <MenuItem value="Completed">Completed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Project Description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                label="Start Date"
                                                name="startDate"
                                                InputLabelProps={{ shrink: true }}
                                                value={formData.startDate}
                                                onChange={handleChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                label="End Date"
                                                name="endDate"
                                                InputLabelProps={{ shrink: true }}
                                                value={formData.endDate}
                                                onChange={handleChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                label="Planned End Date"
                                                name="plannedEndDate"
                                                InputLabelProps={{ shrink: true }}
                                                value={formData.plannedEndDate}
                                                onChange={handleChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Base Amount"
                                                name="baseAmount"
                                                value={formData.baseAmount}
                                                onChange={handleChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel id="manager-label">Project Manager</InputLabel>
                                                <Select
                                                    labelId="manager-label"
                                                    label="Project Manager"
                                                    value={formData.manager?.id || ''}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            manager: { id: e.target.value }
                                                        }))
                                                    }
                                                >

                                                    {staffList.map((staff) => (
                                                        <MenuItem key={staff.id} value={staff.id}>
                                                            {staff.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {/* Additional Charges Section in Edit Dialog */}
                                        <Grid item xs={12}>
                                            <Typography variant="h6" gutterBottom>
                                                Additional Charges
                                            </Typography>


                                            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} md={4}>
                                                        <TextField
                                                            fullWidth
                                                            label="Description"
                                                            value={newCharge.description}
                                                            onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                                                            size="small"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Amount"
                                                            type="number"
                                                            value={newCharge.amount}
                                                            onChange={(e) => setNewCharge({ ...newCharge, amount: e.target.value })}
                                                            size="small"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={3}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Category</InputLabel>
                                                            <Select
                                                                value={newCharge.category}
                                                                onChange={(e) => setNewCharge({ ...newCharge, category: e.target.value })}
                                                                label="Category"
                                                            >
                                                                <MenuItem value="EXTRA_FEATURE">Extra Feature</MenuItem>
                                                                <MenuItem value="SCOPE_CHANGE">Scope Change</MenuItem>
                                                                <MenuItem value="OTHER">Other</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} md={2}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={handleAddCharge}
                                                            sx={{
                                                                backgroundColor: 'primary.main',
                                                                color: 'white',
                                                                '&:hover': {
                                                                    backgroundColor: 'primary.dark',
                                                                    transform: 'scale(1.1)'
                                                                },
                                                                width: 40,
                                                                height: 40,
                                                                margin: '0 auto',
                                                                display: 'block'
                                                            }}
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </Paper>

                                            {/* Existing charges in a box */}
                                            {additionalCharges.length > 0 && (
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                        Current Additional Charges
                                                    </Typography>
                                                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                                        {additionalCharges.map((charge, index) => (
                                                            <Paper
                                                                key={index}
                                                                variant="outlined"
                                                                sx={{
                                                                    p: 1.5,
                                                                    mb: 1,
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    backgroundColor: 'grey.50'
                                                                }}
                                                            >
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {charge.description}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        ₹{charge.amount} • {charge.category} • {charge.dateAdded}
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveCharge(index)}
                                                                    sx={{ ml: 1 }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Paper>
                                                        ))}
                                                    </Box>
                                                </Paper>
                                            )}
                                        </Grid>
                                    </Grid>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={handleEditDialogClose} color="inherit">Cancel</Button>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                const updatePayload = {
                                                    ...formData,
                                                    additionalCharges: additionalCharges.length > 0 ? additionalCharges : []
                                                };
                                                console.log("Update payload:", updatePayload);
                                                await axios.put(`/projects/update/${editingId}`, updatePayload);
                                                toast.success('Project updated successfully!');
                                                fetchProjects(true);
                                                handleEditDialogClose();
                                            } catch (error) {
                                                toast.error('Failed to update project');
                                                console.error(error);
                                            }
                                        }}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Update
                                    </Button>
                                </DialogActions>
                            </Dialog>


                        </Box>
                    </Box>
                )}


                {activeTab === 1 && (
                    <Container maxWidth="xlg" sx={{ py: 2 }}>
                        <ToastContainer position="top-right" autoClose={3000} />
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                p: 3,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    PROJECT FORM
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Project Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={Boolean(errors.name)}
                                            helperText={errors.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={staffList}
                                            getOptionLabel={(option) => option.name || ""}
                                            value={staffList.find((staff) => staff.id === formData.manager) || null}
                                            onChange={(event, newValue) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    manager: newValue ? newValue.id : ""
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Project Manager"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Project Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            multiline
                                            rows={4}
                                            error={Boolean(errors.description)}
                                            helperText={errors.description}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                label="Status"
                                            >
                                                <MenuItem value="Planned">Planned</MenuItem>
                                                <MenuItem value="In Progress">In Progress</MenuItem>
                                                <MenuItem value="Completed">Completed</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Start Date"
                                            name="startDate"
                                            InputLabelProps={{ shrink: true }}
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            error={Boolean(errors.startDate)}
                                            helperText={errors.startDate}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="End Date"
                                            name="endDate"
                                            InputLabelProps={{ shrink: true }}
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            error={Boolean(errors.endDate)}
                                            helperText={errors.endDate}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Planned End Date"
                                            name="plannedEndDate"
                                            InputLabelProps={{ shrink: true }}
                                            value={formData.plannedEndDate}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Base Amount"
                                            name="baseAmount"
                                            value={formData.baseAmount}
                                            placeholder="Enter Base Amount"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only numbers
                                                if (/^\d*$/.test(value)) {
                                                    handleChange(e);
                                                }
                                            }}
                                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        />
                                    </Grid>


                                    <Grid item xs={12}>

                                        <Typography variant="h6" gutterBottom>
                                            Additional Charges
                                        </Typography>


                                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} md={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Description"
                                                        value={newCharge.description}
                                                        onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Amount"
                                                        type="number"
                                                        value={newCharge.amount}
                                                        onChange={(e) => setNewCharge({ ...newCharge, amount: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Category</InputLabel>
                                                        <Select
                                                            value={newCharge.category}
                                                            onChange={(e) => setNewCharge({ ...newCharge, category: e.target.value })}
                                                            label="Category"
                                                        >
                                                            <MenuItem value="EXTRA_FEATURE">Extra Feature</MenuItem>
                                                            <MenuItem value="SCOPE_CHANGE">Scope Change</MenuItem>
                                                            <MenuItem value="OTHER">Other</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} md={2}>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={handleAddCharge}
                                                        sx={{
                                                            backgroundColor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'primary.dark',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            width: 40,
                                                            height: 40,
                                                            margin: '0 auto',
                                                            display: 'block'
                                                        }}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Paper>

                                        {/* Existing charges in a box - same as edit dialog */}
                                        {additionalCharges.length > 0 && (
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                    Current Additional Charges
                                                </Typography>
                                                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                                                    {additionalCharges.map((charge, index) => (
                                                        <Paper
                                                            key={index}
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1.5,
                                                                mb: 1,
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                backgroundColor: 'grey.50'
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {charge.description}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    ₹{charge.amount} • {charge.category} • {charge.dateAdded}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleRemoveCharge(index)}
                                                                sx={{ ml: 1 }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Paper>
                                                    ))}
                                                </Box>
                                            </Paper>
                                        )}
                                    </Grid>

                                </Grid>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: { xs: 'center', sm: 'flex-end' },
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: 'center',
                                        mt: 4,
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="primary"
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={!isFormValid()}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Save Project
                                    </Button>
                                </Box>

                            </Box>
                        </Paper>
                    </Container>
                )}

                {activeTab === 2 && (

                    <Teams />
                )}

            </Paper>
        </>
    );
};

export default Project;
