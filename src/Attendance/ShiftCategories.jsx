import React, { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, FormControlLabel, Radio, RadioGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Select, Typography, useMediaQuery, Container, Button, FormLabel, Tabs, AppBar, Tab, CircularProgress,
} from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import axios from '../Axiosinstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditShift from './EditShift';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayMap = {
  Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY',
  Fri: 'FRIDAY', Sat: 'SATURDAY', Sun: 'SUNDAY'
};
function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const ShiftScheduler = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allStaffList, setAllStaffList] = useState([]);
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [staff, setStaff] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [repeatMode, setRepeatMode] = useState('default');
  const [defaultShift, setDefaultShift] = useState('');
  const [shiftOptions, setShiftOptions] = useState([]);
  const [weeklyShifts, setWeeklyShifts] = useState({
    Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: ''
  });
  const [specificShifts, setSpecificShifts] = useState({});
  const [specificDays, setSpecificDays] = useState([]);
  const [existingShifts, setExistingShifts] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [depRes, roleRes, staffRes, shiftRes, shiftsRes] = await Promise.all([
          axios.get('/departments/all-departments'),
          axios.get('/roles/all'),
          axios.get('/staff/allstaffs?size=100'),
          axios.get('/shift-category/get-all-workshifts'),
          axios.get('/work-shifts'),
        ]);

        setDepartments(depRes.data);
        setRoles(roleRes.data);
        setAllStaffList(staffRes.data);
        setExistingShifts(shiftsRes.data);
        const formattedShifts = shiftRes.data.map(shift => ({
          id: shift.id,
          label: `${shift.name} (${shift.workStartTime} - ${shift.workEndTime})`,
          value: shift.id,
        }));
        setShiftOptions(formattedShifts);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load dropdown data');
      }
    };

    fetchDropdownData();
  }, []);

  // Filter staff based on selected department and role
  useEffect(() => {
    if (department && role) {
      const filtered = allStaffList.filter(staff => {
        const staffDeptMatch = staff.departmentName?.toLowerCase() === department.toLowerCase();
        const staffRoleMatch = staff.roleName?.toLowerCase() === role.toLowerCase();
        return staffDeptMatch && staffRoleMatch;
      });
      setFilteredStaffList(filtered);
      if (filtered.length === 0) {
        toast.error('No staff found for the selected department and role');
      }

      // Reset selected staff if it's no longer in filtered options
      if (staff && !filtered.some(s => s.name === staff)) {
        setStaff('');
      }
    } else {
      setFilteredStaffList([]);
      setStaff('');
    }
  }, [department, role, allStaffList]);

  useEffect(() => {
    if (fromDate && toDate) {
      const diff = differenceInDays(toDate, fromDate) + 1;
      if (repeatMode === 'specific' && diff > 15) {
        const maxToDate = addDays(fromDate, 14);
        setToDate(maxToDate);
      }

      if (repeatMode === 'specific' && diff > 0) {
        const daysArr = Array.from({ length: diff }, (_, i) => addDays(fromDate, i));
        setSpecificDays(daysArr);

        // Load existing shifts for the selected staff and date range
        if (staff) {
          const staffObj = filteredStaffList.find(s => s.name === staff);
          if (staffObj) {
            const existingShift = existingShifts.find(
              shift => shift.staffName === staff &&
                shift.specificTimePeriod &&
                new Date(shift.fromDate) <= toDate &&
                new Date(shift.toDate) >= fromDate
            );

            if (existingShift) {
              const newSpecificShifts = {};
              daysArr.forEach(date => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const displayKey = format(date, 'dd-MM-yyyy');
                if (existingShift.dateToShiftCategoryIdMap && existingShift.dateToShiftCategoryIdMap[dateKey]) {
                  newSpecificShifts[displayKey] = existingShift.dateToShiftCategoryIdMap[dateKey];
                }
              });
              setSpecificShifts(newSpecificShifts);
            }
          }
        }
      } else {
        setSpecificDays([]);
      }
    } else {
      setSpecificDays([]);
    }
  }, [fromDate, toDate, repeatMode, staff, existingShifts]);

  const handleWeeklyShiftChange = (day, value) => {
    setWeeklyShifts(prev => ({ ...prev, [day]: value }));
  };

  const handleSpecificShiftChange = (dateStr, value) => {
    setSpecificShifts(prev => ({ ...prev, [dateStr]: value }));
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const staffObj = filteredStaffList.find(s => s.name === staff);
      const roleObj = roles.find(r => r.roleName.toLowerCase() === role.toLowerCase());
      const departmentObj = departments.find(d => d.name.toLowerCase() === department.toLowerCase());

      if (!staffObj || !roleObj || !departmentObj) {
        toast.error('Invalid Staff / Role / Department');
        setLoading(false);
        return;
      }

      let payload = {
        staff: { id: staffObj.id },
        role: { id: roleObj.roleId },
        department: { id: departmentObj.id },
      };

      if (repeatMode === 'default') {
        payload.shiftType = 'DEFAULT';
        payload.defaultShiftCategoryId = defaultShift;
      } else if (repeatMode === 'weekly') {
        payload.shiftType = 'WEEKLY';
        const dayToShiftCategoryIdMap = {};
        for (const day in weeklyShifts) {
          if (day !== 'Sat' && day !== 'Sun' && weeklyShifts[day]) {
            dayToShiftCategoryIdMap[dayMap[day]] = weeklyShifts[day];
          }
        }
        payload.dayToShiftCategoryIdMap = dayToShiftCategoryIdMap;
      } else if (repeatMode === 'specific') {
        payload.shiftType = 'SPECIFIC_PERIOD';
        payload.fromDate = format(fromDate, 'yyyy-MM-dd');
        payload.toDate = format(toDate, 'yyyy-MM-dd');

        const dateToShiftCategoryIdMap = {};
        specificDays.forEach(date => {
          const day = format(date, 'EEE');
          if (day !== 'Sat' && day !== 'Sun') {
            const displayKey = format(date, 'dd-MM-yyyy');
            const apiKey = format(date, 'yyyy-MM-dd');
            if (specificShifts[displayKey]) {
              dateToShiftCategoryIdMap[apiKey] = specificShifts[displayKey];
            }
          }
        });
        payload.dateToShiftCategoryIdMap = dateToShiftCategoryIdMap;
      }

      await axios.post('/work-shifts', payload);
      toast.success('Shift created successfully!');

      // Reset form fields
      setStaff('');
      setRole('');
      setDepartment('');
      setDefaultShift('');
      setWeeklyShifts({});
      setSpecificDays([]);
      setSpecificShifts({});
    } catch (error) {
      console.error('Failed to create shift:', error);
      toast.error('Failed to create shift. See console.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ backgroundColor: 'white', width: '100%' }}>
      <AppBar position="static" color="default" elevation={0} >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
          sx={{
            bgcolor: '#F0F4F8',
            padding: '8px 12px',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#142a4f',
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
          <Tab label="SHIFT CATEGORIES" {...a11yProps(0)} />
          <Tab label="EDIT SHIFTCATEGORIES" {...a11yProps(1)} />
        </Tabs>
      </AppBar>

      <TabPanel value={activeTab} index={0}>
        <Container maxWidth={false}>
          <Box display="flex" alignItems="center">
            <Typography fontSize={24} fontWeight={600} sx={{ mt: 3 }}>
              SHIFT CATEGORIES
            </Typography>
          </Box>
          <Box p={isMobile ? 2 : 4}>
            {/* Dropdowns */}
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={4}>
              <TextField
                select
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                fullWidth
              >
                {departments.map(dep => (
                  <MenuItem key={dep.id} value={dep.name}>{dep.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
              >
                {roles.map(role => (
                  <MenuItem key={role.roleId} value={role.roleName}>{role.roleName}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Staff"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                fullWidth
                disabled={!department || !role || filteredStaffList.length === 0}
              >
                {filteredStaffList.map(s => (
                  <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Calendar */}
            {repeatMode === 'specific' && (
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={4} mb={2}>
                <Box>
                  <Typography><b>From Date</b></Typography>
                  <Calendar
                    defaultActiveStartDate={new Date(today.getFullYear(), today.getMonth(), 1)}
                      minDate={today}
                    onChange={(date) => {
                      setFromDate(date);
                      if (isAfter(date, toDate)) setToDate(date);
                      const maxToDate = addDays(date, 15);
                      if (isAfter(toDate, maxToDate)) setToDate(maxToDate);
                    }}
                    value={fromDate}
                  />
                </Box>
                <Box>
                  <Typography><b>To Date</b></Typography>
                  <Calendar
                    defaultActiveStartDate={new Date(today.getFullYear(), today.getMonth(), 1)}
                    minDate={fromDate} // Prevent selecting before From Date
                    maxDate={addDays(fromDate, 15)} // ⬅ Allow only up to 15 days ahead
                    onChange={(date) => {
                      setToDate(date); // Just set the chosen date
                    }}
                    value={toDate}
                  />
                </Box>

              </Box>
            )}

            {/* Repeat Mode */}
            <Box mb={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormLabel
                  component="legend"
                  sx={{ mb: 1, fontWeight: 'bold', fontSize: 16, color: 'primary.main' }}
                >
                  Repeat Mode
                </FormLabel>

                <RadioGroup
                  row
                  value={repeatMode}
                  onChange={(e) => setRepeatMode(e.target.value)}
                  sx={{ gap: 4 }}
                >
                  <FormControlLabel
                    value="default"
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body1" sx={{ fontWeight: repeatMode === 'default' ? '600' : '400' }}>
                        Default (Same shift for all days)
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="weekly"
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body1" sx={{ fontWeight: repeatMode === 'weekly' ? '600' : '400' }}>
                        Repeat Weekly
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="specific"
                    control={<Radio color="primary" />}
                    label={
                      <Typography variant="body1" sx={{ fontWeight: repeatMode === 'specific' ? '600' : '400' }}>
                        Specific Time Period
                      </Typography>
                    }
                  />
                </RadioGroup>
              </Paper>
            </Box>

            {/* Shift Allocation Table */}
            <Typography variant="h6" mb={2}>DETAILED SHIFT ALLOCATION</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                    <TableCell><b>Staff</b></TableCell>
                    {repeatMode === 'default' && <TableCell><b>All Days</b></TableCell>}
                    {repeatMode === 'weekly' && weekDays.map(day => (
                      <TableCell
                        key={day}
                        sx={{
                          backgroundColor: (day === 'Sat' || day === 'Sun') ? '#ffebee' : 'inherit',
                          color: (day === 'Sat' || day === 'Sun') ? '#d32f2f' : 'inherit'
                        }}
                      >
                        <b>{day}</b>
                      </TableCell>
                    ))}
                    {repeatMode === 'specific' && specificDays.map(date => {
                      const day = format(date, 'EEE');
                      const isWeekend = day === 'Sat' || day === 'Sun';
                      return (
                        <TableCell
                          key={format(date, 'dd-MM-yyyy')}
                          sx={{
                            backgroundColor: isWeekend ? '#ffebee' : 'inherit',
                            color: isWeekend ? '#d32f2f' : 'inherit'
                          }}
                        >
                          <b>{format(date, 'dd-MM')}</b>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{staff || <em>Select Staff</em>}</TableCell>
                    {repeatMode === 'default' && (
                      <TableCell>
                        <Select
                          value={defaultShift}
                          onChange={(e) => setDefaultShift(e.target.value)}
                          fullWidth
                          size="small"
                        >
                          {shiftOptions.map(opt => (
                            <MenuItem key={opt.id} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    )}
                    {repeatMode === 'weekly' && weekDays.map(day => {
                      const isWeekend = day === 'Sat' || day === 'Sun';
                      return (
                        <TableCell
                          key={day}
                          sx={{ backgroundColor: isWeekend ? '#ffebee' : 'inherit' }}
                        >
                          <Select
                            value={weeklyShifts[day]}
                            onChange={(e) => handleWeeklyShiftChange(day, e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isWeekend}
                          >
                            {!isWeekend && shiftOptions.map(opt => (
                              <MenuItem key={opt.id} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                            {isWeekend && (
                              <MenuItem value="" disabled>Weekend - No Shift</MenuItem>
                            )}
                          </Select>
                        </TableCell>
                      );
                    })}
                    {repeatMode === 'specific' && specificDays.map(date => {
                      const day = format(date, 'EEE');
                      const isWeekend = day === 'Sat' || day === 'Sun';
                      const dateKey = format(date, 'dd-MM-yyyy');
                      const apiDateKey = format(date, 'yyyy-MM-dd');

                      // Check if this date has an existing shift
                      const existingShift = existingShifts.find(shift =>
                        shift.staffName === staff &&
                        shift.specificTimePeriod &&
                        shift.dateToShiftCategoryIdMap &&
                        shift.dateToShiftCategoryIdMap[apiDateKey]
                      );

                      const shiftValue = existingShift ?
                        existingShift.dateToShiftCategoryIdMap[apiDateKey] :
                        (specificShifts[dateKey] || '');

                      return (
                        <TableCell
                          key={dateKey}
                          sx={{ backgroundColor: isWeekend ? '#ffebee' : 'inherit' }}
                        >
                          <Select
                            value={isWeekend ? '' : shiftValue}
                            onChange={(e) => handleSpecificShiftChange(dateKey, e.target.value)}
                            fullWidth
                            size="small"
                            disabled={isWeekend}
                          >
                            {!isWeekend && shiftOptions.map(opt => (
                              <MenuItem key={opt.id} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                            {isWeekend && (
                              <MenuItem value="" disabled>Weekend - No Shift</MenuItem>
                            )}
                          </Select>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Cancel
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!staff || loading}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'Save'
                )}
              </Button>
            </Box>

          </Box>
        </Container>

        {/* Toast Container */}
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <EditShift />
      </TabPanel>
    </Box>
  );
};

export default ShiftScheduler;