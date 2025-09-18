import React, { useEffect, useState } from 'react';
import {
    Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, FormControlLabel, InputLabel, MenuItem, Select, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, FormHelperText,useTheme,useMediaQuery,
    IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast } from 'react-toastify';
import Nodatapage from "../Nodatapage";
import CircularProgress from '@mui/material/CircularProgress';
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import  SearchBar  from '../Constants/SearchBar';
import { ToastContainer } from 'react-toastify';

const LeavePolicyManager = () => {
    const [policies, setPolicies] = useState([]);
    const [filteredPolicies, setFilteredPolicies] = useState([]);
    const [roles, setRoles] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { role, featurePermissions } = useUser();
    const isAdmin = role === 'ADMIN';
    const canEditTimesheetAttendance = isAdmin || hasPermission(featurePermissions, 'TimesheetAttendance', 'EDIT');
    const canDeleteTimesheetAttendance = isAdmin || hasPermission(featurePermissions, 'TimesheetAttendance', 'DELETE');
    const canManageTimesheetAttendance = canEditTimesheetAttendance || canDeleteTimesheetAttendance;
    const canCreateTimesheetAttendance = isAdmin || hasPermission(featurePermissions, 'TimesheetAttendance', 'CREATE');
    const [searchTerm, setSearchTerm] = useState('');
    
    const emptyPolicy = {
        name: '',
        annualLeave: 0,
        sickLeave: 0,
        unpaidLeave: 0,
        maternityLeave: 0,
        paternityLeave: 0,
        isDefault: false,
        role: null
    };
    const [policy, setPolicy] = useState(emptyPolicy);

    useEffect(() => {
        fetchRoles();
        fetchPolicies();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = policies.filter(policy => 
                policy.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPolicies(filtered);
        } else {
            setFilteredPolicies(policies);
        }
    }, [searchTerm, policies]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/roles/all');
            setRoles(response.data);
        } catch (error) {
            toast.error('Failed to fetch roles');
        }
    };

    const fetchPolicies = async () => {
        try {
            const response = await axios.get('/leave-policy');
            setPolicies(response.data);
            setFilteredPolicies(response.data);
        } catch (error) {
            toast.error('Failed to fetch leave policies');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPolicy((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (e) => {
        setPolicy((prev) => ({ ...prev, isDefault: e.target.checked, role: null }));
    };

    const handleRoleChange = (e) => {
        setPolicy((prev) => ({ ...prev, role: { id: e.target.value } }));
    };

    const handleSubmit = async (e) => {
        const newErrors = {};

        if (!policy.name.trim()) {
            newErrors.name = 'Policy name is required';
        } else if (policy.name.length < 3) {
            newErrors.name = 'Policy name must be at least 3 characters';
        }

        ['annualLeave', 'sickLeave', 'unpaidLeave', 'maternityLeave', 'paternityLeave'].forEach((field) => {
            const value = policy[field];
            if (value === '' || isNaN(value) || value < 0) {
                newErrors[field] = 'Must be a number >= 0';
            }
        });

        if (!policy.isDefault && !policy.role?.id) {
            newErrors.role = 'Role is required if not default';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please correct the highlighted fields');
            return;
        }

        setErrors({});
        setLoading(true);

        const payload = {
            name: policy.name,
            annualLeave: Number(policy.annualLeave),
            sickLeave: Number(policy.sickLeave),
            unpaidLeave: Number(policy.unpaidLeave),
            maternityLeave: Number(policy.maternityLeave),
            paternityLeave: Number(policy.paternityLeave),
            default: policy.isDefault,
            roleId: policy.isDefault ? null : policy.role?.id
        };

        try {
            if (editingId) {
                await axios.put(`/leave-policy/${editingId}`, payload);
                toast.success('Policy updated successfully');
            } else {
                await axios.post('/leave-policy', payload);
                toast.success('Policy created successfully');
            }

            setOpen(false);
            setPolicy(emptyPolicy);
            setEditingId(null);
            fetchPolicies();
        } catch (err) {
            let errorMessage = 'Operation failed';
            
            if (err.response) {
                if (err.response.data) {
                    if (err.response.data.message === "Duplicate Value") {
                        errorMessage = "This policy name already exists. Please use a different name.";
                    } else if (err.response.data.details) {
                        errorMessage = Array.isArray(err.response.data.details) 
                            ? err.response.data.details.join(', ')
                            : err.response.data.details;
                    } else if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    } else if (err.response.data.error) {
                        errorMessage = err.response.data.error;
                    }
                } else {
                    errorMessage = `Server error: ${err.response.status}`;
                }
            }
            
            toast.error(errorMessage);
            console.error('Error details:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (policy) => {
        setPolicy({
            name: policy.name,
            annualLeave: policy.annualLeave,
            sickLeave: policy.sickLeave,
            unpaidLeave: policy.unpaidLeave,
            maternityLeave: policy.maternityLeave,
            paternityLeave: policy.paternityLeave,
            isDefault: policy.default,
            role: policy.role ? { id: policy.role.id } : null
        });
        setEditingId(policy.id);
        setOpen(true);
    };

    const handleDeleteClick = (policy) => {
        setPolicyToDelete(policy);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (policyToDelete) {
            try {
                await axios.delete(`/leave-policy/${policyToDelete.id}`);
                toast.success('Policy deleted successfully');
                fetchPolicies();
            } catch (err) {
                toast.error('Failed to delete policy');
            } finally {
                setDeleteDialogOpen(false);
                setPolicyToDelete(null);
            }
        }
    };

    return (
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'stretch' : 'center'} flexWrap="wrap" gap={2} marginBottom={2}>
            <ToastContainer position="bottom-right" autoClose={3000} />
            {canCreateTimesheetAttendance && (
                <Button variant="contained" color="primary" onClick={() => setOpen(true)} fullWidth={isMobile} sx={{ height: '40px' }}>
                    Create New Policy
                </Button>
            )}
            <SearchBar
                value={searchTerm}
                placeholder="Search by Name"
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
            />
            <TableContainer>
                <Table stickyHeader size="small"
                    sx={{
                        '& .MuiTableCell-root': {
                            border: '1px solid rgba(224, 224, 224, 1)',
                            padding: '8px 12px',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            fontFamily: 'Marquis',
                            whiteSpace: 'normal',
                            maxWidth: 120,
                        },
                        '& .MuiTableCell-head': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        },
                    }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.NO</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Annual</TableCell>
                            <TableCell>Sick</TableCell>
                            <TableCell>Unpaid</TableCell>
                            <TableCell>Maternity</TableCell>
                            <TableCell>Paternity</TableCell>
                            <TableCell>Default</TableCell>
                            <TableCell>Role</TableCell>
                            {canManageTimesheetAttendance && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPolicies.length > 0 ? (
                            filteredPolicies.map((p, index) => (
                                <TableRow hover key={p.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.name}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.annualLeave}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.sickLeave}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.unpaidLeave}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.maternityLeave}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.paternityLeave}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.default ? 'Yes' : 'No'}
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase", fontFamily: "Marquis", textAlign: "center" }}>
                                        {p.default ? 'N/A' : (p.role ? p.role.name : 'N/A')}
                                    </TableCell>
                                    {canManageTimesheetAttendance && (
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {canEditTimesheetAttendance && (
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(p)}
                                                    size="small"
                                                    sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }, padding: '4px' }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            )}
                                            {canDeleteTimesheetAttendance && (
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteClick(p)}
                                                    size="small"
                                                    sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }, padding: '4px' }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} align="center" >
                                    <Nodatapage />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Policy Form Dialog */}
            <Dialog open={open} onClose={() => { setOpen(false); setEditingId(null); setPolicy(emptyPolicy); setErrors({}); }} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit' : 'Create'} Leave Policy</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Policy Name"
                            name="name"
                            value={policy.name}
                            onChange={(e) => {
                                const value = e.target.value;
                                if ((/^[A-Za-z\s]*$/.test(value) || value === '') && value.length <= 50) {
                                    handleChange(e);
                                }
                            }}
                            error={!!errors.name}
                            helperText={errors.name}
                            margin="normal"
                            required
                            placeholder="Enter Policy Name (e.g. Year Leave Policy)"
                            inputProps={{ maxLength: 50 }}
                            sx={{
                                '& input::placeholder': {
                                    fontSize: '0.9rem',
                                    color: '#000',
                                },
                            }}
                        />

                        {['annualLeave', 'sickLeave', 'unpaidLeave', 'maternityLeave', 'paternityLeave'].map((field) => (
                            <TextField
                                key={field}
                                fullWidth
                                type="number"
                                name={field}
                                label={field.replace(/([A-Z])/g, ' $1')}
                                value={policy[field]}
                                onChange={handleChange}
                                error={!!errors[field]}
                                helperText={errors[field]}
                                margin="normal"
                                inputProps={{ min: 0 }}
                            />
                        ))}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={policy.isDefault}
                                    onChange={handleCheckbox}
                                    color="primary"
                                />
                            }
                            label="Set as Default Policy"
                        />

                        {!policy.isDefault && (
                            <FormControl fullWidth margin="normal" error={!!errors.role}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={policy.role?.id || ''}
                                    onChange={handleRoleChange}
                                    label="Role"
                                    required
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.roleId} value={role.roleId}>
                                            {role.roleName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" onClick={() => { setOpen(false); setEditingId(null); setPolicy(emptyPolicy); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update' : 'Save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Box>
                        Are you sure you want to delete the policy "{policyToDelete?.name}"?
                       
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)} 
                        variant="outlined" 
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        variant="contained" 
                        color="error"
                       
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeavePolicyManager;