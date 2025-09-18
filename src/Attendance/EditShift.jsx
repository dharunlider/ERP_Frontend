import React, { useState, useEffect } from "react";
import axios from '../Axiosinstance';
import {
  Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, FormLabel,
  InputLabel, useMediaQuery, useTheme, RadioGroup, FormControlLabel, Radio,
  CircularProgress, TextField
} from "@mui/material";
import { Edit, Delete, Close } from "@mui/icons-material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, addDays, differenceInDays, isAfter, isBefore, isWithinInterval, parseISO } from "date-fns";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmDialog from '../Constants/ConfirmDialog';
import { alpha } from '@mui/material/styles';

const weekDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

// Simple SearchBar component implementation
const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{ mb: 2 }}
    />
  );
};

const ShiftCategoriesTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [shiftOptions, setShiftOptions] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [shiftIdToDelete, setShiftIdToDelete] = useState(null);
  const [loading, setLoading] = useState({
    shifts: false,
    categories: false,
    save: false,
    staff: false,
    departments: false,
    roles: false
  });
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [editData, setEditData] = useState({
    staffId: "",
    departmentId: "",
    roleId: "",
    repeatMode: "",
    defaultShiftCategoryId: "",
    weeklyShifts: {},
    specificShifts: {},
    fromDate: new Date(),
    toDate: new Date()
  });
  const [specificDays, setSpecificDays] = useState([]);

  const showToast = (message, type = "success") => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({
          ...prev,
          shifts: true,
          categories: true,
          staff: true,
          departments: true,
          roles: true
        }));

        const [
          shiftsRes,
          categoriesRes,
          staffRes,
          departmentsRes,
          rolesRes
        ] = await Promise.all([
          axios.get('/work-shifts'),
          axios.get('/shift-category/get-all-workshifts'),
          axios.get('/staff/allstaffs'),
          axios.get('/departments/all-departments'),
          axios.get('/roles/all')
        ]);

        setShifts(Array.isArray(shiftsRes?.data) ? shiftsRes.data : []);
        setShiftOptions(Array.isArray(categoriesRes?.data)
          ? categoriesRes.data.map(shift => ({
            id: shift.id,
            label: `${shift.name} (${shift.workStartTime} - ${shift.workEndTime})`
          }))
          : []);
        setStaffOptions(Array.isArray(staffRes?.data) ? staffRes.data : []);
        setDepartmentOptions(Array.isArray(departmentsRes?.data) ? departmentsRes.data : []);
        setRoleOptions(Array.isArray(rolesRes?.data) ? rolesRes.data : []);

      } catch (error) {
        showToast("Failed to load data: " + (error.response?.data?.details || error.response?.data?.message || error.message), "error");
        console.error("API Error:", error);
      } finally {
        setLoading(prev => ({
          ...prev,
          shifts: false,
          categories: false,
          staff: false,
          departments: false,
          roles: false
        }));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editData.repeatMode === "specific" && editData.fromDate && editData.toDate) {
      const diff = differenceInDays(editData.toDate, editData.fromDate) + 1;
      const days = diff > 0 ?
        Array.from({ length: diff }, (_, i) => addDays(editData.fromDate, i)) :
        [];

      // Initialize specificShifts with all dates in the range
      const newSpecificShifts = { ...editData.specificShifts };
      days.forEach(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        if (!newSpecificShifts[dateKey]) {
          newSpecificShifts[dateKey] = "";
        }
      });

      setSpecificDays(days);
      setEditData(prev => ({ ...prev, specificShifts: newSpecificShifts }));
    } else {
      setSpecificDays([]);
    }
  }, [editData.fromDate, editData.toDate, editData.repeatMode]);

  // const handleEdit = (shift) => {
  //   setCurrentShift(shift);

  //   // Determine repeat mode based on shiftType
  //   const repeatMode = shift.shiftType === "DEFAULT" ? "default" :
  //     shift.shiftType === "WEEKLY" ? "weekly" : "specific";

  //   const matchedStaff = staffOptions.find(s => s.name === shift.staffName);
  //   const matchedDepartment = departmentOptions.find(d => d.name === shift.departmentName);
  //   const matchedRole = roleOptions.find(r => r.roleName === shift.roleName);
    
  //   // Initialize editData with proper values
  //   const newEditData = {
  //     staffId: matchedStaff?.id?.toString() || "",
  //     departmentId: matchedDepartment?.id?.toString() || "",
  //     roleId: matchedRole?.roleId?.toString() || "",
  //     repeatMode,
  //     defaultShiftCategoryId: shift.defaultShiftCategoryId || "",
  //     weeklyShifts: shift.dayToShiftCategoryIdMap || {},
  //     specificShifts: shift.dateToShiftCategoryIdMap || {},
  //     fromDate: shift.fromDate ? new Date(shift.fromDate) : new Date(),
  //     toDate: shift.toDate ? new Date(shift.toDate) : new Date()
  //   };

  //   // For specific period shifts, ensure all dates in the range are included
  //   if (repeatMode === "specific" && shift.fromDate && shift.toDate) {
  //     const fromDate = new Date(shift.fromDate);
  //     const toDate = new Date(shift.toDate);
  //     const diff = differenceInDays(toDate, fromDate) + 1;
  //     const days = diff > 0 ?
  //       Array.from({ length: diff }, (_, i) => addDays(fromDate, i)) :
  //       [];

  //     // Initialize specificShifts with all dates in the range
  //     days.forEach(day => {
  //       const dateKey = format(day, "yyyy-MM-dd");
  //       if (!newEditData.specificShifts[dateKey]) {
  //         newEditData.specificShifts[dateKey] = "";
  //       }
  //     });
  //   }

  //   setEditData(newEditData);
  //   setOpenEditModal(true);
  // };

  const handleEdit = (shift) => {
  setCurrentShift(shift);

  // Determine repeat mode based on shiftType
  const repeatMode = shift.shiftType === "DEFAULT" ? "default" :
    shift.shiftType === "WEEKLY" ? "weekly" : "specific";

  const matchedStaff = staffOptions.find(s => s.name === shift.staffName);
  const matchedDepartment = departmentOptions.find(d => d.name === shift.departmentName);
  const matchedRole = roleOptions.find(r => r.roleName === shift.roleName);
  
  // Initialize specificShifts with all dates in the range, including empty ones
  let specificShifts = {};
  if (shift.dateToShiftCategoryIdMap) {
    specificShifts = { ...shift.dateToShiftCategoryIdMap };
  }

  // Ensure all dates in range are included, even if empty
  if (repeatMode === "specific" && shift.fromDate && shift.toDate) {
    const fromDate = new Date(shift.fromDate);
    const toDate = new Date(shift.toDate);
    const diff = differenceInDays(toDate, fromDate) + 1;
    
    if (diff > 0) {
      Array.from({ length: diff }, (_, i) => {
        const date = addDays(fromDate, i);
        const dateKey = format(date, "yyyy-MM-dd");
        if (!specificShifts[dateKey]) {
          specificShifts[dateKey] = ""; // Initialize empty if not set
        }
      });
    }
  }

  setEditData({
    staffId: matchedStaff?.id?.toString() || "",
    departmentId: matchedDepartment?.id?.toString() || "",
    roleId: matchedRole?.roleId?.toString() || "",
    repeatMode,
    defaultShiftCategoryId: shift.defaultShiftCategoryId?.toString() || "",
    weeklyShifts: shift.dayToShiftCategoryIdMap || {},
    specificShifts,
    fromDate: shift.fromDate ? new Date(shift.fromDate) : new Date(),
    toDate: shift.toDate ? new Date(shift.toDate) : new Date()
  });

  setOpenEditModal(true);
};

  const handleDeleteShift = (id) => {
    setShiftIdToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/work-shifts/${shiftIdToDelete}`);
      setShifts(shifts.filter(shift => shift.id !== shiftIdToDelete));
      showToast("Shift deleted successfully");
    } catch (error) {
      showToast("Failed to delete shift: " + (error.response?.data?.details || error.response?.data?.message || error.message), "error");
    } finally {
      setConfirmDialogOpen(false);
      setShiftIdToDelete(null);
    }
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleShiftChange = (key, value) => {
    if (editData.repeatMode === "weekly") {
      setEditData(prev => ({
        ...prev,
        weeklyShifts: {
          ...prev.weeklyShifts,
          [key]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        specificShifts: {
          ...prev.specificShifts,
          [key]: value
        }
      }));
    }
  };

  // const handleSave = async () => {
  //   try {
  //     setLoading(prev => ({ ...prev, save: true }));

  //     // Filter out dates outside the current range and empty shifts
  //     const filteredSpecificShifts = Object.fromEntries(
  //       Object.entries(editData.specificShifts)
  //         .filter(([date]) => {
  //           const dateObj = parseISO(date);
  //           return isWithinInterval(dateObj, {
  //             start: editData.fromDate,
  //             end: editData.toDate
  //           });
  //         })
  //         .filter(([_, shiftId]) => shiftId !== "") 
  //     );

  //     const payload = {
  //       staff: { id: parseInt(editData.staffId) },
  //       department: { id: parseInt(editData.departmentId) },
  //       role: { id: parseInt(editData.roleId) },
  //       shiftType:
  //         editData.repeatMode === "default"
  //           ? "DEFAULT"
  //           : editData.repeatMode === "weekly"
  //             ? "WEEKLY"
  //             : "SPECIFIC_PERIOD",
  //       ...(editData.repeatMode === "default" && {
  //         defaultShiftCategoryId: parseInt(editData.defaultShiftCategoryId),
  //       }),
  //       ...(editData.repeatMode === "weekly" && {
  //         dayToShiftCategoryIdMap: editData.weeklyShifts
  //       }),
  //       ...(editData.repeatMode === "specific" && {
  //         fromDate: format(editData.fromDate, "yyyy-MM-dd"),
  //         toDate: format(editData.toDate, "yyyy-MM-dd"),
  //         dateToShiftCategoryIdMap: filteredSpecificShifts
  //       }),
  //     };

  //     let response;
  //     if (currentShift) {
  //       response = await axios.put(`/work-shifts/${currentShift.id}`, payload);
  //       setShifts(shifts.map(s => s.id === currentShift.id ? response.data : s));
  //       showToast("Shift updated successfully");
  //     } else {
  //       response = await axios.post('/work-shifts', payload);
  //       setShifts(prev => [...prev, response.data]);
  //       showToast("Shift created successfully");
  //     }
  //     setOpenEditModal(false);
  //   } catch (error) {
  //     showToast(`Failed to ${currentShift ? "update" : "create"} shift: ${error.response?.data?.details || error.response?.data?.message || error.message}`, "error");
  //   } finally {
  //     setLoading(prev => ({ ...prev, save: false }));
  //   }
  // };


  const handleSave = async () => {
  try {
    setLoading(prev => ({ ...prev, save: true }));

    // Process specific shifts - ensure all dates in range are included
    let processedSpecificShifts = {};
    if (editData.repeatMode === "specific") {
      const { fromDate, toDate, specificShifts } = editData;
      const diff = differenceInDays(toDate, fromDate) + 1;
      
      // Initialize with all dates in range
      processedSpecificShifts = Array.from({ length: diff }, (_, i) => {
        const date = addDays(fromDate, i);
        const dateKey = format(date, "yyyy-MM-dd");
        return [dateKey, specificShifts[dateKey] || ""];
      }).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

      // Filter out empty shifts if needed
      processedSpecificShifts = Object.fromEntries(
        Object.entries(processedSpecificShifts)
          .filter(([_, shiftId]) => shiftId !== "")
      );
    }

    const payload = {
      staff: { id: parseInt(editData.staffId) },
      department: { id: parseInt(editData.departmentId) },
      role: { id: parseInt(editData.roleId) },
      shiftType:
        editData.repeatMode === "default"
          ? "DEFAULT"
          : editData.repeatMode === "weekly"
            ? "WEEKLY"
            : "SPECIFIC_PERIOD",
      ...(editData.repeatMode === "default" && {
        defaultShiftCategoryId: parseInt(editData.defaultShiftCategoryId),
      }),
      ...(editData.repeatMode === "weekly" && {
        dayToShiftCategoryIdMap: editData.weeklyShifts
      }),
      ...(editData.repeatMode === "specific" && {
        fromDate: format(editData.fromDate, "yyyy-MM-dd"),
        toDate: format(editData.toDate, "yyyy-MM-dd"),
        dateToShiftCategoryIdMap: processedSpecificShifts
      }),
    };

    let response;
    if (currentShift) {
      response = await axios.put(`/work-shifts/${currentShift.id}`, payload);
      setShifts(shifts.map(s => s.id === currentShift.id ? response.data : s));
      showToast("Shift updated successfully");
    } else {
      response = await axios.post('/work-shifts', payload);
      setShifts(prev => [...prev, response.data]);
      showToast("Shift created successfully");
    }
    setOpenEditModal(false);
  } catch (error) {
    showToast(`Failed to ${currentShift ? "update" : "create"} shift: ${error.response?.data?.details || error.response?.data?.message || error.message}`, "error");
  } finally {
    setLoading(prev => ({ ...prev, save: false }));
  }
};

  const renderShiftTable = () => {
    const days = editData.repeatMode === "weekly" ? weekDays : specificDays;
    const shifts = editData.repeatMode === "weekly" ? editData.weeklyShifts : editData.specificShifts;

    if (days.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No days available for selection
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
              <TableCell><b>Day/Date</b></TableCell>
              <TableCell><b>Shift</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day, i) => {
              const isWeekend = typeof day === 'string'
                ? day === "SATURDAY" || day === "SUNDAY"
                : format(day, "EEEE").toUpperCase() === "SATURDAY" ||
                format(day, "EEEE").toUpperCase() === "SUNDAY";

              const dayKey = typeof day === 'string' ? day : format(day, "yyyy-MM-dd");
              const dayLabel = typeof day === 'string'
                ? day.charAt(0) + day.slice(1).toLowerCase()
                : format(day, "EEE, dd-MM");

              return (
                <TableRow key={i} sx={{
                  backgroundColor: isWeekend ? alpha(theme.palette.error.main, 0.1) : "inherit",
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}>
                  <TableCell sx={{
                    color: isWeekend ? theme.palette.error.main : "inherit",
                    fontWeight: 500
                  }}>
                    {dayLabel}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={isWeekend ? "" : (shifts[dayKey] || "")}
                      onChange={(e) => handleShiftChange(dayKey, e.target.value)}
                      fullWidth
                      size="small"
                      disabled={isWeekend || loading.categories}
                    >
                      {loading.categories ? (
                        <MenuItem disabled>Loading shifts...</MenuItem>
                      ) : (
                        shiftOptions.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const filteredData = shifts.filter(shift =>
    shift.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        placeholder="Search by staff name..."
      />

      <TableContainer component={Paper} elevation={3} sx={{ mb: 3 }}>
        <Table sx={{ border: 1, borderColor: 'grey.400' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[300] }}>
              {['S.NO', 'STAFF', 'DEPARTMENT', 'ROLE', 'SHIFT PATTERN', 'ACTIONS'].map((heading) => (
                <TableCell
                  key={heading}
                  align="center"
                  sx={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    border: 1,
                    borderColor: 'grey.400',
                  }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading.shifts ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, border: 1, borderColor: 'grey.400' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, border: 1, borderColor: 'grey.400' }}>
                  <Typography>No shift data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((shift, index) => (
                <TableRow key={shift.id} hover>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>{index + 1}</TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>
                    {shift.staffName?.toUpperCase() || 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400', textTransform: 'uppercase' }}>
                    {shift.departmentName?.toUpperCase() || 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>
                    {shift.roleName?.toUpperCase() || 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ textTransform: 'uppercase', border: 1, borderColor: 'grey.400' }}>
                    {shift.shiftType === 'DEFAULT'
                      ? `Default: ${shiftOptions.find(opt => opt.id === shift.defaultShiftCategoryId)?.label || 'Not set'}`
                      : shift.shiftType === 'WEEKLY'
                        ? 'Weekly Pattern'
                        : `Specific Period (${format(new Date(shift.fromDate), 'dd/MM/yyyy')} - ${format(new Date(shift.toDate), 'dd/MM/yyyy')})`}
                  </TableCell>
                  <TableCell align="center" sx={{ border: 1, borderColor: 'grey.400' }}>
                    <IconButton
                      onClick={() => handleEdit(shift)}
                      color="primary"
                      disabled={loading.save}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteShift(shift.id)}
                      color="error"
                      disabled={loading.save}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this shift?"
        confirmText="Delete"
      />

      <Dialog
        open={openEditModal}
        onClose={() => !loading.save && setOpenEditModal(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#142a4f', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ textAlign: 'center', width: '100%' }}>{currentShift ? "EDIT" : "ADD"} SHIFT ALLOCATION</Typography>
            <IconButton
              onClick={() => !loading.save && setOpenEditModal(false)}
              edge="end"
              color="inherit"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Box mb={3}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Staff</InputLabel>
                <Select
                  value={editData.staffId?.toString() || ""}
                  onChange={(e) => handleChange("staffId", e.target.value)}
                  label="Staff"
                  disabled={loading.staff}
                >
                  {loading.staff ? (
                    <MenuItem disabled>Loading staff...</MenuItem>
                  ) : staffOptions.length > 0 ? (
                    staffOptions.map(staff => (
                      <MenuItem key={staff.id} value={staff.id.toString()}>
                        {staff.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No staff available</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editData.departmentId?.toString() || ""}
                  onChange={(e) => handleChange("departmentId", e.target.value)}
                  label="Department"
                  disabled={loading.departments}
                >
                  {loading.departments ? (
                    <MenuItem disabled>Loading departments...</MenuItem>
                  ) : departmentOptions.length > 0 ? (
                    departmentOptions.map(dept => (
                      <MenuItem key={dept.id} value={dept.id.toString()}>
                        {dept.name.toUpperCase()}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments available</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editData.roleId?.toString() || ""}
                  onChange={(e) => handleChange("roleId", e.target.value)}
                  label="Role"
                  disabled={loading.roles}
                >
                  {loading.roles ? (
                    <MenuItem disabled>Loading roles...</MenuItem>
                  ) : roleOptions.length > 0 ? (
                    roleOptions.map(role => (
                      <MenuItem key={role.roleId} value={role.roleId.toString()}>
                        {role.roleName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No roles available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box mb={3}>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: "bold" }}>Repeat Mode</FormLabel>
            <RadioGroup
              row={!isMobile}
              value={editData.repeatMode}
              onChange={(e) => handleChange("repeatMode", e.target.value)}
              sx={{ gap: 2 }}
            >
              <FormControlLabel value="default" control={<Radio />} label="Default (Same shift all days)" />
              <FormControlLabel value="weekly" control={<Radio />} label="Weekly Pattern" />
              <FormControlLabel value="specific" control={<Radio />} label="Specific Period" />
            </RadioGroup>
          </Box>

          {editData.repeatMode === "default" && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Default Shift</InputLabel>
              <Select
                value={editData.defaultShiftCategoryId || ""}
                onChange={(e) => handleChange("defaultShiftCategoryId", e.target.value)}
                label="Default Shift"
                disabled={loading.categories}
              >
                {loading.categories ? (
                  <MenuItem disabled>Loading shifts...</MenuItem>
                ) : shiftOptions.length > 0 ? (
                  shiftOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No shifts available</MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          {/* {editData.repeatMode === "specific" && (
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                Select Date Range
              </Typography>
              <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={4}>
                <Box>
                  <Typography>From Date</Typography>
                  <Calendar
                    onChange={(date) => {
                      if (isAfter(date, editData.toDate)) {
                        handleChange('toDate', date);
                      }
                      handleChange('fromDate', date);
                    }}
                    value={editData.fromDate}
                  />
                </Box>
                <Box>
                  <Typography>To Date</Typography>
                  <Calendar
                    onChange={(date) => {
                      if (isBefore(date, editData.fromDate)) {
                        handleChange('fromDate', date);
                      }
                      handleChange('toDate', date);
                    }}
                    value={editData.toDate}
                  />
                </Box>
              </Box>
            </Box>
          )} */}

{editData.repeatMode === "specific" && (
  <Box mb={3}>
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
      Select Date Range
    </Typography>
    <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={4}>
      <Box>
        <Typography>From Date</Typography>
        <Calendar
          minDate={new Date()} // Only allow today and future dates
          onChange={(date) => {
            // Prevent selecting dates after max range
            const maxToDate = addDays(date, 14); // 15 days including start
            if (isAfter(editData.toDate, maxToDate)) {
              handleChange("toDate", maxToDate);
            }
            handleChange("fromDate", date);
          }}
          value={editData.fromDate}
        />
      </Box>
      <Box>
        <Typography>To Date</Typography>
        <Calendar
          minDate={editData.fromDate || new Date()} // Only future dates after fromDate
          maxDate={addDays(editData.fromDate || new Date(), 14)} // 15 days max range
          onChange={(date) => {
            handleChange("toDate", date);
          }}
          value={editData.toDate}
        />
      </Box>
    </Box>
  </Box>
)}

          {(editData.repeatMode === "weekly" || editData.repeatMode === "specific") && (
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                {editData.repeatMode === "weekly" ? "Weekly Shifts" : "Daily Shifts"}
              </Typography>
              {renderShiftTable()}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            disabled={loading.save}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading.save}
            variant="contained"
            color="primary"
            startIcon={loading.save ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {currentShift ? "Update Shift" : "Create Shift"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftCategoriesTab;