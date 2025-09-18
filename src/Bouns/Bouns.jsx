import React, { useState, useEffect } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableHead, TableBody, TableRow, TableCell, IconButton, Typography,
    FormControl, InputLabel, Select, MenuItem, Stack, useMediaQuery, useTheme, TableContainer
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from '../Axiosinstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import CircularProgress from '@mui/material/CircularProgress';
import SearchBar from '../Constants/SearchBar';
import Nodatapage from '../Nodatapage.jsx';
import { saveAs } from "file-saver";


const Bonus = () => {
    const [bonusList, setBonusList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [formData, setFormData] = useState({ amount: '', bonusReason: '', bonusPeriod: '' });
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [selectedBonusId, setSelectedBonusId] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = React.useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [initialLoading, setInitialLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [fetchSize, setFetchSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBonus = bonusList.filter(bonus =>
        bonus.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredStaff = allStaff.filter(
        s => (!selectedRole || s.roleName === selectedRole) &&
            (!selectedDept || s.departmentName === selectedDept)
    );

    useEffect(() => {
        fetchInitialData();
        fetchBonusList(true);
    }, []);

    const fetchInitialData = async () => {
        try {
            const [staffRes, deptRes, roleRes] = await Promise.all([
                axios.get("/staff/allstaffs"),
                axios.get("/departments/all-departments"),
                axios.get("/roles/all"),
            ]);
            setAllStaff(staffRes.data);
            setDepartments(deptRes.data);
            setRoles(roleRes.data);
        } catch {
            toast.error("Error loading initial data");
        }
    };

    const fetchBonusList = async (reset = false) => {
        if (reset) {
            setInitialLoading(true);
        } else {
            if (loadingMore) return;
            setLoadingMore(true);
        }

        try {
            const params = {
                size: 10,
                ...(!reset && cursor && { cursorId: cursor }), // use cursor if not reset
                ...(filterText && { search: filterText }) // optional, if you have search functionality
            };

            const response = await axios.get('/bonus/all', { params });
            const newData = response.data.content || response.data;

            setBonusList(prev => reset ? newData : [...prev, ...newData]);

            setHasMore(newData.length >= 10);

            if (newData.length > 0) {
                setCursor(newData[newData.length - 1].bonusId); // assuming each item has a unique 'id'
            }

        } catch (error) {
            console.error('Error fetching bonus list:', error);
            toast.error('Failed to fetch bonus list');
        } finally {
            if (reset) {
                setInitialLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };






    const handleOpen = () => {
        setFormData({ amount: '', bonusReason: '', bonusPeriod: '' });
        setSelectedDept('');
        setSelectedRole('');
        setSelectedStaff('');
        setEditIndex(null);
        setSelectedBonusId(null);
        setErrors({});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setErrors({});
    };

    const validate = () => {
        const newErrors = {};
        if (!selectedStaff) newErrors.staff = 'Please select staff';
        if (!formData.amount) newErrors.amount = 'Amount is required';
        if (!formData.bonusReason) newErrors.reason = 'Bonus reason is required';
        if (!formData.bonusPeriod) newErrors.date = 'Bonus date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            amount: parseFloat(formData.amount),
            bonusReason: formData.bonusReason,
            bonusPeriod: formData.bonusPeriod,
            staff: { id: Number(selectedStaff) },
        };

        try {
            if (editIndex !== null) {
                await axios.put(`bonus/${selectedBonusId}`, payload);
                const updatedStaff = allStaff.find(s => s.id === Number(selectedStaff));
                toast.success("Bonus updated successfully");
                const updated = [...bonusList];
                updated[editIndex] = {
                    ...updated[editIndex],
                    ...payload,
                    staffName: updatedStaff?.name || updated[editIndex].staffName
                };
                setBonusList(updated);
                toast.success("Bonus updated successfully");
            } else {
                const res = await axios.post('bonus/assign', payload);
                toast.success("Bonus assigned successfully");
                const newBonus = res.data;
                setBonusList(prev => [newBonus, ...prev]);
            }
            setOpen(false);
        } catch {
            toast.error('Error saving bonus');
        }
    };

    const handleEdit = (index) => {
        const bonus = bonusList[index];
        const staffId = bonus.staff?.id || bonus.staffId;
        const staff = allStaff.find(s => s.id === staffId);

        setFormData({
            amount: bonus.amount,
            bonusReason: bonus.bonusReason,
            bonusPeriod: bonus.bonusPeriod,
        });
        setSelectedStaff(staffId.toString());
        setSelectedDept(staff?.departmentName || '');
        setSelectedRole(staff?.roleName || '');
        setEditIndex(index);
        setSelectedBonusId(bonus.bonusId || bonus.id);
        setOpen(true);
    };

    const handleDelete = async (index) => {
        const bonusId = bonusList[index].bonusId || bonusList[index].id;
        if (!bonusId) return toast.error('Bonus ID not found.');

        try {
            await axios.delete(`/bonus/${bonusId}`);
            setBonusList(prev => prev.filter((_, i) => i !== index));
            toast.success('Bonus deleted Successfully');
        } catch {
            toast.error('Failed to delete bonus entry');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleExport = async () => {
    try {
      let url = "/bonus/excel/export-bonus";

      // if both dates are selected → add params
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await axios.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "bonus_data.xlsx");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };


    return (
        <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
            <ToastContainer position="bottom-right" autoClose={3000} />
            <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      alignItems={isMobile ? "stretch" : "center"}
      flexWrap="wrap"
      gap={2}
      marginBottom={2}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={() => console.log("open modal")}
        fullWidth={isMobile}
        sx={{ height: "40px" }}
      >
        Add Bonus
      </Button>

      <SearchBar
        variant="outlined"
        value={searchTerm}
        placeholder="SEARCH BY STAFF NAME"
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* From Date */}
      <TextField
        type="date"
        label="From Date"
        InputLabelProps={{ shrink: true }}
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        size="small"
      />

      {/* To Date */}
      <TextField
        type="date"
        label="To Date"
        InputLabelProps={{ shrink: true }}
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        size="small"
      />

      <Button
        variant="contained"
        color="secondary"
        onClick={handleExport}
        fullWidth={isMobile}
        sx={{ ml: 'auto' }}
      >
        Export 
      </Button>
    </Box>

            <TableContainer >
                <Box
                    id="scrollable-table"
                    sx={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}
                >
 {initialLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                   ) :   
                    <InfiniteScroll
                        dataLength={bonusList.length}
                        next={() => fetchBonusList()}
                        hasMore={hasMore}
                        loader={<Box display="flex" justifyContent="center" py={2}><CircularProgress /></Box>}
                        endMessage={
                            <Box textAlign="center" p={2}>
                                <Typography variant="body2" color="textSecondary">
                                    No more bonus records to load.
                                </Typography>
                            </Box>
                        }

                        style={{ overflow: 'visible' }}
                    >
                        <Table size={isMobile ? "small" : "medium"}
                            sx={{
                                '& .MuiTableCell-root': {
                                    border: '1px solid rgba(224, 224, 224, 1)',
                                    padding: isMobile ? '6px 8px' : '8px 12px',
                                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                                    fontFamily: 'Marquis',
                                },
                                '& .MuiTableHead-root': {
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    backgroundColor: '#f5f5f5'
                                },
                                '& .MuiTableCell-head': {
                                    fontWeight: 'bold',
                                    backgroundColor: '#f5f5f5'
                                }
                            }}

                        >
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} >S.NO</TableCell>
                                    <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} >Staff Name</TableCell>
                                    <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} >Amount</TableCell>
                                    <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} >Reason</TableCell>
                                    <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} >Date</TableCell>
                                    <TableCell align="center" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} >Actions</TableCell>
                                </TableRow>
                            </TableHead>
                           <TableBody>
  {filteredBonus.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} align="center">
        <Nodatapage />
      </TableCell>
    </TableRow>
  ) : (
    filteredBonus.map((bonus, index) => (
      <TableRow key={bonus.id || index}>
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell align="center">{bonus.staffName}</TableCell>
                                        <TableCell align="center">{bonus.amount}</TableCell>
                                        <TableCell align="center">{bonus.bonusReason}</TableCell>
                                        <TableCell align="center">{bonus.bonusPeriod}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleEdit(index)}><Edit /></IconButton>
                                            <IconButton color="error" onClick={() => { setDeleteIndex(index); setConfirmOpen(true); }}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                              )  ))}
                            </TableBody>
                        </Table>
                    </InfiniteScroll>
                      }
                </Box>
            </TableContainer>

            {/* Confirm Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this bonus entry?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} variant="contained" color="secondary" >Cancel</Button>
                    <Button onClick={() => { handleDelete(deleteIndex); setConfirmOpen(false); }} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ bgcolor: '#142a4f', color: 'white', px: 2, py: 1, textAlign: 'center', borderRadius: 1 }}>
                        {editIndex !== null ? 'EDIT BONUS' : 'ADD BONUS'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={2}>
                        <FormControl fullWidth>
                            <InputLabel>Department</InputLabel>
                            <Select label="Department" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedStaff(''); }}>
                                {departments.map(d => <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select label="Role" value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setSelectedStaff(''); }}>
                                {roles.map(r => <MenuItem key={r.roleId} value={r.roleName}>{r.roleName}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth error={Boolean(errors.staff)}>
                            <InputLabel>Staff</InputLabel>
                            <Select
                                label="Staff"
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                            >
                                {filteredStaff.length > 0 ? (
                                    filteredStaff.map((s) => (
                                        <MenuItem key={s.id} value={s.id.toString()}>
                                            {s.name.toUpperCase()} -  {s.hrCode.toUpperCase()}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>No matching staff found</MenuItem>
                                )}
                            </Select>
                            {errors.staff && <Typography color="error">{errors.staff}</Typography>}
                        </FormControl>
                        <TextField label="Amount" type="number" fullWidth value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} error={Boolean(errors.amount)} helperText={errors.amount} />
                        <TextField label="Bonus Reason" fullWidth value={formData.bonusReason} onChange={(e) => setFormData({ ...formData, bonusReason: e.target.value })} error={Boolean(errors.reason)} helperText={errors.reason} />
                        <TextField label="Bonus Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.bonusPeriod} onChange={(e) => setFormData({ ...formData, bonusPeriod: e.target.value })} error={Boolean(errors.date)} helperText={errors.date} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" color="secondary" >Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        {editIndex !== null ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Bonus;
