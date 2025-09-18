import React, { useState, useEffect } from 'react';
import {
    Paper,
    Button,
    Typography,
    Box,
    TextField,
    Grid,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { Save, Cancel, Add, People, Search, Close, MoreVert } from '@mui/icons-material';
import { features, checkboxNames } from "./Constants/Constants";
import axios from "./Axiosinstance";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const EditRole = ({ currentRole, onSave, onCancel, onTabChange }) => {
    const [role, setRole] = useState(currentRole);
    const [roleNameError, setRoleNameError] = useState(false);
    const [checkedPermissions, setCheckedPermissions] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [staffDialogOpen, setStaffDialogOpen] = useState(false);
    const [staffMembers, setStaffMembers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [exportAnchorEl, setExportAnchorEl] = useState(null);

    // Initialize permissions from current role
    useEffect(() => {
        if (currentRole?.features) {
            const initialPermissions = {};
            currentRole.features.forEach(fp => {
                const featurePermissions = {};
                fp.permissions.forEach(permission => {
                    const permissionName = permission.permissionName.charAt(0).toUpperCase() + 
                                         permission.permissionName.slice(1).toLowerCase();
                    featurePermissions[permissionName] = permission.isGranted;
                });
                initialPermissions[fp.featureName] = featurePermissions;
            });
            setCheckedPermissions(initialPermissions);
        }
    }, [currentRole]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRole(prev => ({
            ...prev,
            [name]: value.toUpperCase()
        }));
    };

    const handleCheckboxChange = (feature, permission) => {
        setCheckedPermissions(prev => ({
            ...prev,
            [feature]: {
                ...prev[feature],
                [permission]: !prev[feature]?.[permission],
            },
        }));
    };

    const handleAddNewRole = () => {
        if (onTabChange) {
            onTabChange(1);
            onCancel();
        }
    };

    const handleShowStaffs = async () => {
        setStaffDialogOpen(true);
        setLoadingStaff(true);
        try {
            const response = await axios.get(`/roles/${currentRole.roleId}/staff`);
            setStaffMembers(response.data);
        } catch (error) {
            toast.error('Failed to load staff members');
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [['Full Name']],
            body: filteredStaff.map(staff => [staff.fullName]),
            styles: { font: 'helvetica', fontSize: 10 },
            headStyles: { fillColor: [25] }
        });
        doc.save(`Staff_${currentRole.roleName}.pdf`);
        handleExportClose();
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredStaff.map(staff => ({
            'Full Name': staff.fullName
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
        XLSX.writeFile(workbook, `Staff_${currentRole.roleName}.xlsx`);
        handleExportClose();
    };

    const exportToCSV = () => {
        const headers = ['Full Name'];
        const csvData = [
            headers.join(','),
            ...filteredStaff.map(staff => `"${staff.fullName}"`)
        ].join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Staff_${currentRole.roleName}.csv`);
        handleExportClose();
    };

    const filteredStaff = staffMembers.filter(staff =>
        staff.fullName.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleSave = async () => {
        if (!role.roleName?.trim()) {
            setRoleNameError(true);
            return;
        }

        setRoleNameError(false);
        setIsSubmitting(true);

        try {
            const featurePermissions = features.map(feature => {
                const permissions = checkboxNames[feature] || ["View", "Create", "Edit", "Delete"];
                const permissionsObj = permissions.reduce((acc, permission) => {
                    const permKey = permission.split(" ")[0].toUpperCase();
                    acc[permKey] = !!checkedPermissions[feature]?.[permission];
                    return acc;
                }, {});
                return { feature, permissions: permissionsObj };
            });

            const updatedRole = {
                ...role,
                featurePermissions,
                name: role.roleName.toUpperCase()
            };

            await axios.put(`/roles/${role.roleId}`, updatedRole);
            toast.success('Role updated successfully!');
            onSave(updatedRole);
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error(error.response?.data?.details||error.response?.data?.message || 'Failed to update role');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCheckboxes = (feature) => {
        const permissions = checkboxNames[feature] || ["View", "Create", "Edit", "Delete"];
        return (
            <Box display="flex" flexDirection="column">
                {permissions.map((permission, index) => (
                    <FormControlLabel
                        key={index}
                        control={
                            <Checkbox
                                size="small"
                                checked={!!checkedPermissions[feature]?.[permission]}
                                onChange={() => handleCheckboxChange(feature, permission)}
                                color="primary"
                            />
                        }
                        label={
                            <span style={{
                                fontFamily: "Marquis",
                                fontSize: "16px",
                                textTransform: "uppercase",
                                color: checkedPermissions[feature]?.[permission] ? 'primary.main' : 'text.secondary'
                            }}>
                                {permission}
                            </span>
                        }
                    />
                ))}
            </Box>
        );
    };

    return (
        <>           
            <Paper style={{ padding: '24px', backgroundColor: "rgb(233, 248, 240)", minHeight: '100vh' }}>
                <Box mb={3}>
                    <Typography variant="h4" gutterBottom style={{
                        fontFamily: "Marquis",
                        fontSize: "30px",
                        textTransform: 'uppercase'
                    }}>
                        EDIT ROLE
                    </Typography>
                </Box>

                <Paper style={{ padding: '24px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" mb={2}>
                                {/* <Tooltip title="Add new role">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAddNewRole}
                                        startIcon={<Add />}
                                        sx={{
                                            textTransform: 'uppercase',
                                            fontFamily: "Marquis",
                                            mr: 1
                                        }}
                                    >
                                        Add New Role
                                    </Button>
                                </Tooltip> */}
                                {/* <Tooltip title="View staff with this role">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleShowStaffs}
                                        startIcon={<People />}
                                        sx={{
                                            textTransform: 'uppercase',
                                            fontFamily: "Marquis"
                                        }}
                                    >
                                        Show Staff
                                    </Button>
                                </Tooltip> */}
                            </Box>

                            <TextField
                                fullWidth
                                label="ROLE NAME"
                                name="roleName"
                                value={role.roleName || ''}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                error={roleNameError}
                                helperText={roleNameError ? "Role Name is required" : ""}
                                inputProps={{
                                    style: {
                                        textTransform: 'uppercase',
                                        fontFamily: "Marquis"
                                    }
                                }}
                                InputLabelProps={{
                                    style: {
                                        textTransform: 'uppercase',
                                        fontFamily: "Marquis"
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom style={{
                                fontFamily: "Marquis",
                                textTransform: 'uppercase',
                                marginBottom: '16px'
                            }}>
                                Current Permissions
                            </Typography>
                              <Box
                                              sx={{
                                                width: '100%',
                                                height: '70vh',
                                                overflow: 'auto',
                                                position: 'relative'
                                              }}
                                            >
                                              <Table
                                                sx={{
                                                  '& .MuiTableCell-root': {
                                                    border: '1px solid rgba(224, 224, 224, 1)',
                                                    padding: '8px 12px',
                                                    fontSize: '0.875rem',
                                                    fontFamily: "Marquis"
                                                  },
                                                  '& .MuiTableCell-head': {
                                                    backgroundColor: '#f5f5f5',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 1
                                                  }
                                                }}
                                                size="small"
                                                stickyHeader
                                              >
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{
                                            border: "1px solid #ddd",
                                            padding: "8px",
                                            width: "25%",
                                            fontSize: "18px",
                                            backgroundColor: "#f5f5f5",
                                            textTransform: 'uppercase',
                                            fontFamily: "Marquis"
                                        }}>
                                            <b>FEATURES</b>
                                        </TableCell>
                                        <TableCell style={{
                                            border: "1px solid #ddd",
                                            padding: "8px",
                                            width: "25%",
                                            backgroundColor: "#f5f5f5",
                                            fontSize: "18px",
                                            textTransform: 'uppercase',
                                            fontFamily: "Marquis"
                                        }}>
                                            <b>CAPABILITIES</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {features.map((feature, index) => (
                                        <TableRow key={index}>
                                            <TableCell style={{
                                                border: "1px solid #ddd",
                                                padding: "8px",
                                                fontFamily: "Marquis",
                                                fontSize: "16px",
                                                textTransform: 'uppercase',
                                                backgroundColor: checkedPermissions[feature] ? 'rgba(25, 118, 210, 0.04)' : 'inherit'
                                            }}>
                                                {feature}
                                            </TableCell>
                                            <TableCell style={{
                                                border: "1px solid #ddd",
                                                padding: "8px",
                                                backgroundColor: checkedPermissions[feature] ? 'rgba(25, 118, 210, 0.04)' : 'inherit'
                                            }}>
                                                {renderCheckboxes(feature)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" mt={3}>
                                <Button
                                    variant="outlined"
                                    onClick={onCancel}
                                    startIcon={<Cancel />}
                                    sx={{
                                        mr: 1,
                                        textTransform: 'uppercase',
                                        fontFamily: "Marquis"
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    startIcon={<Save />}
                                    disabled={isSubmitting}
                                    sx={{
                                        textTransform: 'uppercase',
                                        fontFamily: "Marquis"
                                    }}
                                >
                                    {isSubmitting ? "Updating..." : "Update"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Staff Dialog */}
                <Dialog
                    open={staffDialogOpen}
                    onClose={() => setStaffDialogOpen(false)}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{ style: { borderRadius: '12px' } }}
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" style={{ fontFamily: "Marquis", textTransform: 'uppercase' }}>
                                Staff Members with {currentRole?.roleName} Role
                            </Typography>
                            <IconButton onClick={() => setStaffDialogOpen(false)}>
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                            <TextField
                                variant="outlined"
                                placeholder="Search staff..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                    style: {
                                        height: '40px',
                                        fontFamily: "Marquis"
                                    },
                                }}
                                sx={{ width: '300px' }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleExportClick}
                                endIcon={<MoreVert />}
                                style={{ height: '40px', marginLeft: 'auto' }}
                            >
                                Export
                            </Button>
                            <Menu
                                anchorEl={exportAnchorEl}
                                open={Boolean(exportAnchorEl)}
                                onClose={handleExportClose}
                            >
                                <MenuItem onClick={exportToPDF} sx={{ fontFamily: "Marquis" }}>Export to PDF</MenuItem>
                                <MenuItem onClick={exportToExcel} sx={{ fontFamily: "Marquis" }}>Export to Excel</MenuItem>
                                <MenuItem onClick={exportToCSV} sx={{ fontFamily: "Marquis" }}>Export to CSV</MenuItem>
                            </Menu>
                        </Box>

                        {loadingStaff ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Table sx={{
                                '& .MuiTableCell-root': {
                                    border: '1px solid rgba(224, 224, 224, 1)',
                                    padding: '8px 12px',
                                    fontSize: '0.875rem'
                                },
                                '& .MuiTableCell-head': {
                                    backgroundColor: '#f5f5f5',
                                    fontWeight: 'bold'
                                }
                            }} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Full Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredStaff.length > 0 ? (
                                        filteredStaff.map((staff) => (
                                            <TableRow key={staff.id} hover>
                                                <TableCell style={{ textTransform: 'uppercase' }}>{staff.fullName}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" style={{ fontFamily: "Marquis" }}>
                                                {staffMembers.length === 0
                                                    ? 'No staff members assigned to this role'
                                                    : 'No matching staff members found'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setStaffDialogOpen(false)}
                            sx={{
                                textTransform: 'uppercase',
                                fontFamily: "Marquis"
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </>
    );
};

export default EditRole;