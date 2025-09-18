import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Paper,
  MenuItem,
  Button,
  IconButton, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from '../Axiosinstance';
import CloseIcon from '@mui/icons-material/Close';
import Nodatapage from '../Nodatapage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from "../Contexts/Usercontext";
import Staffshift from './Staffshift';

const Workshift = () => {
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [allStaffOptions, setAllStaffOptions] = useState([]);
  const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dialogData, setDialogData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [workshiftMap, setWorkshiftMap] = useState({});
  const [noDataMessage, setNoDataMessage] = useState('');
  const { user, featurePermissions } = useUser();
  const isAdmin = role === 'ADMIN';
  const canViewHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'VIEW');
  const canEditHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'EDIT');
  const canDeleteHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'DELETE');
  const canManageHRM = canEditHRM || canDeleteHRM;
  const canCreateHRM = isAdmin || hasPermission(featurePermissions, 'HRM', 'CREATE');
  const [staffShifts, setStaffShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [publicHolidays, setPublicHolidays] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    axios.get('/departments/all-departments').then((res) => {
      setDepartmentOptions(res.data.map((dept) => dept.name));
    });

    axios.get('/roles/all').then((res) => {
      setRoleOptions(res.data.map((role) => role.roleName));
    });

    axios.get('/staff/allstaffs').then((res) => {
      setAllStaffOptions(res.data.map((staff) => ({
        id: staff.id,
        name: staff.name,
        hrCode: staff.hrCode,
        departmentName: staff.departmentName,
        roleName: staff.roleName
      })));
    });

    axios.get('/shift-category/get-all-workshifts').then((res) => {
      const shiftMap = {};
      res.data.forEach(item => shiftMap[item.id] = item);
      setWorkshiftMap(shiftMap);
    });
  }, []);

  useEffect(() => {
    const year = new Date().getFullYear();
    axios.get(`/public-holidays/${year}`).then((res) => {
      const holidayMap = {};
      res.data.forEach((holiday) => {
        holidayMap[holiday.date] = holiday.name;
      });
      setPublicHolidays(holidayMap);
    });
  }, []);

  // Filter staff based on selected department and role
  useEffect(() => {
    if (department && role) {
      const filtered = allStaffOptions.filter(staff =>
        staff.departmentName === department &&
        staff.roleName === role
      );

      setFilteredStaffOptions(filtered);

      if (filtered.length === 0) {
        toast.error('No staff found for the selected department and role');
      }

      // Reset selected staff if it's no longer in filtered options
      if (selectedStaff && !filtered.some(staff => staff.id === selectedStaff)) {
        setSelectedStaff('');
      }
    } else {
      setFilteredStaffOptions([]);
      setSelectedStaff('');
    }
  }, [department, role, allStaffOptions]);

  const resetData = () => {
    setStartDate(new Date());
    setStaffShifts([]);
    setActiveShifts([]);
    setNoDataMessage('No data available for the selected filters.');
  };

  const handleFilter = async () => {
    setNoDataMessage('');

    if (!department || !role || !selectedStaff) {
      resetData();
      toast.error('Please select department, role and staff');
      return;
    }

    try {
      const res = await axios.get(`/work-shifts/staff/${selectedStaff}`);

      if (!res.data || res.data.length === 0) {
        resetData();
        return;
      }
      setStaffShifts(res.data);

      const specificShift = res.data.find(s => s.shiftType === 'SPECIFIC_PERIOD');
      const weeklyShift = res.data.find(s => s.shiftType === 'WEEKLY');
      const defaultShift = res.data.find(s => s.shiftType === 'DEFAULT');

      const active = [];
      if (specificShift) active.push(specificShift);
      if (weeklyShift) active.push(weeklyShift);
      if (defaultShift) active.push(defaultShift);

      setActiveShifts(active);

      if (active.length === 0) {
        resetData();
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      resetData();
    }
  };

  const handleDayClick = (date) => {
    const dateStr = date.toLocaleDateString('en-CA');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    if (publicHolidays[dateStr]) return;

    let shiftData = null;

    for (const shift of activeShifts) {
      if (shift.shiftType === 'SPECIFIC_PERIOD' && shift.dateToShiftCategoryIdMap?.[dateStr]) {
        const shiftId = shift.dateToShiftCategoryIdMap[dateStr];
        shiftData = workshiftMap[shiftId];
        break;
      } else if (shift.shiftType === 'WEEKLY' && shift.dayToShiftCategoryIdMap?.[dayName]) {
        const shiftId = shift.dayToShiftCategoryIdMap[dayName];
        shiftData = workshiftMap[shiftId];
        break;
      } else if (shift.shiftType === 'DEFAULT' && shift.defaultShiftCategoryId) {
        shiftData = workshiftMap[shift.defaultShiftCategoryId];
        break;
      }
    }

    if (shiftData) {
      setDialogData(shiftData);
      setOpenDialog(true);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = date.toLocaleDateString('en-CA');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    if (publicHolidays[dateStr]) {
      return (
        <Box textAlign="center" mt={0} pb={1}>
          <Box
            sx={{
              backgroundColor: '#ffe0e0',
              color: 'black',
              borderLeft: '4px solid #e53935',
              borderRadius: '4px',
              p: '6px 10px',
              fontSize: '0.75rem',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              HOLIDAY
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {publicHolidays[dateStr]}
            </Typography>
          </Box>
        </Box>
      );
    }

    let shiftData = null;
    for (const shift of activeShifts) {
      if (shift.shiftType === 'SPECIFIC_PERIOD') {
        if (shift.fromDate && shift.toDate) {
          const fromDate = new Date(shift.fromDate);
          const toDate = new Date(shift.toDate);
          const currentDate = new Date(dateStr);

          const isInDateRange = currentDate >= fromDate && currentDate <= toDate;
          const hasShiftCategory = !!shift.dateToShiftCategoryIdMap?.[dateStr];

          if (isInDateRange && hasShiftCategory) {
            const shiftId = shift.dateToShiftCategoryIdMap[dateStr];
            shiftData = workshiftMap[shiftId];
            break;
          }
        }
      }
      else if (shift.shiftType === 'WEEKLY' && shift.dayToShiftCategoryIdMap?.[dayName]) {
        const shiftId = shift.dayToShiftCategoryIdMap[dayName];
        shiftData = workshiftMap[shiftId];
        break;
      }
      else if (shift.shiftType === 'DEFAULT' && shift.defaultShiftCategoryId) {
        shiftData = workshiftMap[shift.defaultShiftCategoryId];
        break;
      }
    }

    if (!shiftData) return null;

    return (
      <div style={{ textAlign: 'center', marginTop: 0, paddingBottom: 10 }}>
        <button
          style={{
            backgroundColor: '#F6F6F6',
            color: '#666666',
            borderLeft: '4px solid #9fb6c7',
            borderRadius: '3px',
            padding: '5px 10px',
            fontSize: '0.7rem',
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDayClick(date);
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{shiftData.name.toUpperCase()}</div>
          <div>{shiftData.workStartTime} - {shiftData.workEndTime}</div>
        </button>
      </div>
    );
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          bgcolor: '#F0F4F8',
          padding: '8px 12px',
          // borderRadius: '12px',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#142a4f',
            // borderRadius: '8px',
            padding: '6px 18px',
            // margin: '0 8px',
            backgroundColor: '#ffffff',
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
        <Tab label="WORK SHIFT" />
        <Tab label="STAFF SHIFT" />
      </Tabs>
      <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>
        {activeTab === 0 && (
          <Box mb={3} p={2}>
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <Typography
              gutterBottom
              fontSize={24}
              fontWeight={600}
              fontFamily="Marquis"
              sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <AccessTimeIcon fontSize="medium" />
              WORK SHIFT
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="dept-label">Department</InputLabel>
                  <Select
                    labelId="dept-label"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    label="Department"
                  >
                    {departmentOptions.map((dept, index) => (
                      <MenuItem key={index} value={dept}>
                        {dept.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    label="Role"
                  >
                    {roleOptions.map((r, index) => (
                      <MenuItem key={index} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="staff-label">Staff</InputLabel>
                  <Select
                    labelId="staff-label"
                    label="Staff"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    disabled={!department || !role || filteredStaffOptions.length === 0}
                  >
                    {filteredStaffOptions.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.name} ({staff.hrCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFilter}
                  fullWidth
                  sx={{ height: '100%' }}
                  disabled={!selectedStaff}
                >
                  Filter
                </Button>
              </Grid>
            </Grid>

            {noDataMessage && (
              <Typography color="error" mt={2}>{noDataMessage}</Typography>
            )}

            {staffShifts.length > 0 ? (
              <Box mt={4}
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
                    backgroundColor: '#f5eed5',
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
                    backgroundColor: '#d6d6eb',
                  },
                  '& .react-calendar__tile--active': {
                    backgroundColor: '#c2c2e0 !important',
                    color: '#000',
                  },
                  '& .react-calendar__month-view__weekdays__weekday': {
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    border: '1px solid #ccc',
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
                <Calendar
                  value={startDate}
                  tileContent={tileContent}
                  onClickDay={handleDayClick}
                />
              </Box>
            ) : (
              <Nodatapage />
            )}

            <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              maxWidth="xs"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  p: 0,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                },
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  color: 'primary.main',
                  px: 3,
                  py: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                SHIFT DETAILS
                <IconButton
                  aria-label="close"
                  onClick={() => setOpenDialog(false)}
                  sx={{
                    color: 'grey.500',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers sx={{ px: 3, py: 2 }}>
                {dialogData ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        SHIFT NAME
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {dialogData.name.toUpperCase()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        WORK START-TIME
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {dialogData.workStartTime}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        WORK END-TIME
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {dialogData.workEndTime}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography color="text.secondary">No shift data found.</Typography>
                )}
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="contained" onClick={() => setOpenDialog(false)}>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {activeTab === 1 && (
          <Box >
            <Staffshift />
          </Box>
        )}
      </Box>
    </>
  );
};

export default Workshift;