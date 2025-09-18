import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography, Tab, Tabs,
    InputAdornment, IconButton, Button,
    useTheme, useMediaQuery,MenuItem ,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from '../Axiosinstance';
import EditIcon from "@mui/icons-material/Edit";
import Nodatapage from "../Nodatapage";

const LeadsTable = () => {
    const [search, setSearch] = useState("");
    const [leads, setLeads] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        companyName: "",
        products: "",
        status: "",
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await axios.get("/contact");
            const contacts = response.data?.content || [];
            setLeads(contacts);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (lead) => {
        try {

            setSelectedLead(lead);
            setFormData({
                name: lead.name || "",
                email: lead.email || "",
                companyName: lead.companyName || "",
                products: lead.products?.join(", ") || "",
                status: lead.status || "",
            });
            setOpen(true);
        } catch (error) {
            console.error("Error fetching lead details:", error);
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                ...formData,
                products: formData.products.split(",").map((p) => p.trim()),
            };

            await axios.put(`/contact/${selectedLead.id}`, payload);

            setOpen(false);
            fetchLeads(); // refresh table
        } catch (error) {
            console.error("Error updating lead:", error);
        }
    };
    // Filter leads/customers
    const filteredLeads = leads?.filter(
        (lead) =>
            lead.name?.toLowerCase().includes(search.toLowerCase())

    );

    return (
        <Box sx={{ p: 3 }}>

            <Tabs
                variant="fullWidth"
                TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '5px',
                    bgcolor: '#142a4f',
                    padding: '8px 12px',
                    mb: 2,
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#F0F4F8',
                        padding: '6px 18px',
                        backgroundColor: '#142a4f',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#142a4f',
                        },

                    },
                }}
            >
                <Tab label=" Leads & Customers" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }} />
            </Tabs>
            {/* Search Bar */}
            <TextField
                placeholder="Search leads/customers"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    sx: {
                        height: '40px',
                        textTransform: 'uppercase',
                        fontFamily: 'Marquis',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                    },
                }}
                sx={{
                    maxWidth: isMobile ? '100%' : '300px', mb: 2
                }}
            />


            {/* Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 500, overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <Table stickyHeader size="small" sx={{ minWidth: 650, '& .MuiTableCell-root': tableCellStyle }}>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>S.No</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Email</b></TableCell>
                            <TableCell><b>companyName</b></TableCell>
                            <TableCell><b>Products</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead, index) => (
                                <TableRow hover key={lead.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{lead.name}</TableCell>
                                    <TableCell>{lead.email}</TableCell>
                                    <TableCell>{lead.companyName}</TableCell>
                                    <TableCell>{lead.products}</TableCell>
                                    <TableCell>{lead.status}</TableCell>
                                    <TableCell >
                                        <IconButton color="primary" onClick={() => handleEdit(lead)}>
                                            <EditIcon />
                                        </IconButton>
                                        {/* <IconButton color="error" onClick={() => handleDelete(entity.id)}>
                                            <DeleteIcon />
                                        </IconButton> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Nodatapage />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{
                    backgroundColor: '#142a4f',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 2,
                 
                }}>Edit Lead</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Company Name"
                        value={formData.companyName}
                        onChange={(e) =>
                            setFormData({ ...formData, companyName: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Products (comma separated)"
                        value={formData.products}
                        onChange={(e) =>
                            setFormData({ ...formData, products: e.target.value })
                        }
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Status"
                        select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="Lead">Lead</MenuItem>
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Customer">Customer</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const tableCellStyle = {
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
    }
};

export default LeadsTable;
