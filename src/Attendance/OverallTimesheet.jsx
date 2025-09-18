import {
  Paper, Typography, Grid, MenuItem, TextField, Divider, Chip,
  Box, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from '../Axiosinstance';
import React, { useState, useEffect } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useHolidayContext } from '../Contexts/HolidayContext';
import DownloadIcon from '@mui/icons-material/Download';
import { format24to12Hour } from '../Constants/UtilFunctions';
import { formatMinutesToHours } from '../Constants/UtilFunctions';
import { useWebSocket } from '../WebSocket/WebSocketContext';

const statusCodes = ['AL', 'U', 'HD', 'M', 'ML', 'NS'];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

const Timesheet = () => {

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [filters, setFilters] = useState({
    department: 'Non selected',
    role: 'Non selected',
    staffId: ''
  });

  const [timesheetData, setTimesheetData] = useState({});
  const [departmentData, setDepartmentData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceDetail, setAttendanceDetail] = useState(null);
  const { holidays } = useHolidayContext();
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [leaveDetail, setLeaveDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loginEditTime, setLoginEditTime] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoutEditTime, setLogoutEditTime] = useState('');
  const [shiftData, setShiftData] = useState(null);
  const [open, setOpen] = useState(false);
  const [holidayDetail, setHolidayDetail] = useState(null);
  const { subscribe, unsubscribe } = useWebSocket();


  useEffect(() => {
    if (!filters.staffId) return;
    axios
      .get(`/approval-process/approved-leaves/${filters.staffId}`)
      .then((res) => {
        // Flatten and retain full data
        const leaveData = res.data.flatMap(entry =>
          entry.daySelection.map(day => ({
            date: day.date,
            type: day.type,
            subject: entry.subject,
            relatedReason: entry.relatedReason,
            leaveId: entry.id,
          }))
        );
        setApprovedLeaves(leaveData);
      })
      .catch((err) => {
        console.error("Failed to fetch approved leaves", err);
        setApprovedLeaves([]);
      });
  }, [filters.staffId]);


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments/all-departments');
        setDepartmentData(response.data);
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get('/staff/allstaffs?size=100');
        setStaffData(response.data || []); // Adjust based on API response shape
      } catch (error) {
        console.error('Failed to fetch staff', error);
      }
    };

    fetchStaff();
  }, []);



  useEffect(() => {
   

    fetchAttendance();
  }, [filters.staffId]);

   const fetchAttendance = async () => {
      if (!filters.staffId) return;
      try {
        const response = await axios.get(`/attendance/staff/${filters.staffId}`);
        // Ensure dates are in correct format (YYYY-MM-DD)
        const formattedData = response.data.map(item => ({
          ...item,
          date: item.date.split('T')[0] // Remove time portion if exists
        }));
        setAttendanceData(formattedData);
      } catch (error) {
        console.error('Failed to fetch attendance', error);
        setAttendanceData([]);
      }
    };

      useEffect(() => {
        const handleWebSocketMessage = (message) => {
            console.log("Received WebSocket message:", message);
            setTimeout(() => {
                fetchAttendance(); // Delay ensures backend has committed transaction
            }, 300);
        };

        // Subscribe to the topic
        subscribe('/topic/attendance', handleWebSocketMessage);

        // Cleanup: unsubscribe when component unmounts
        return () => {
            unsubscribe('/topic/attendance');
        };
    }, [subscribe, unsubscribe, fetchAttendance]);



  const getCellStatus = (date) => {
    // Convert the calendar date to YYYY-MM-DD format in local time
    const dateKey = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];

    const holiday = holidays.find(h => h.date === dateKey);
    if (holiday) return `${holiday.name}`;

    const leave = approvedLeaves.find(l => l.date === dateKey);
    if (leave) return 'L';
    // Check manual entries first
    const manualStatus = timesheetData[filters.staffId]?.[dateKey];
    if (manualStatus) return manualStatus;

    // Then check attendance data (ensure API returns dates in YYYY-MM-DD format)
    const attendance = attendanceData.find(item => item.date === dateKey);
    return attendance?.status || null;
  };

  const handleDateClick = async (date) => {
    const dateKey = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString().split('T')[0];

    const holiday = holidays.find(h => h.date === dateKey);

    try {
      const shiftResponse = await axios.get('/work-shifts/category', {
        params: {
          staffId: filters.staffId,
          date: dateKey,
        },
      });
      setShiftData(shiftResponse.data);
    } catch (error) {
      console.error('Error fetching shift data:', error);
      setShiftData(null);
    }

    const matchedAttendance = attendanceData.find(record => record.date === dateKey);
    const matchedLeave = approvedLeaves.find(l => l.date === dateKey);
    setSelectedDate(dateKey);
    setAttendanceDetail(matchedAttendance || null);
    setLeaveDetail(matchedLeave || null);
    setHolidayDetail(holiday || null);
    setOpenModal(true);
  };

  const handleDownloadExcel = async () => {
    if (!filters.staffId) {
      alert('Please select a staff member first');
      return;
    }
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `/attendance/export/staff/${filters.staffId}/month`,
        {
          params: {
            year: selectedYear,
            month: selectedMonth + 1, // Adding 1 because months are 0-indexed in JavaScript
          },
          responseType: 'blob' // Important for file downloads
        }
      );
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `attendance_${filters.staffId}_${selectedYear}_${months[selectedMonth]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download Excel', error);
      alert('Failed to download attendance data');
    } finally {
      setIsDownloading(false);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const status = getCellStatus(date); // Your attendance status function
    const displayStatus = status || 'NA';
    const isStatusKnown = !!status;

    let statusColor;
    switch (status) {
      case 'P':
        statusColor = 'green';
        break;
      case 'AB':
        statusColor = 'red';
        break;
      case 'HD':
        statusColor = '#1f4182';
        break;
      default:
        statusColor = 'gray';
    }

    // Normalize date and check if it's a holiday
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === normalizedDate.getTime();
    });

    // You need to define how to check leave days:
    // For example, assuming you have approvedLeaveDates array with Date strings:
    const dateStr = normalizedDate.toDateString();
    const isLeaveDay = approvedLeaves.includes(dateStr);

    return (
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 5,
      }}>
        {holiday ? (
          <Tooltip title={holiday.name} arrow>
            <Chip
              label="H"
              size="small"
              style={{ backgroundColor: 'rgb(163, 36, 53)', color: 'white' }}
            />
          </Tooltip>
        ) : (
          <Chip
            label={isLeaveDay ? 'L' : displayStatus}
            size="small"
            style={{
              backgroundColor: isLeaveDay ? '#ff9800' : statusColor,
              color: 'white',
            }}
          />
        )}
      </div>
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const selectedStaff = staffData.find(staff => staff.id === filters.staffId);

  const joiningDate = selectedStaff?.createdDate
    ? dayjs(selectedStaff.createdDate).toDate()
    : null;

  const shouldShowCalendar = (
    filters.staffId &&
    selectedStaff &&
    filters.department === selectedStaff.departmentName
  );

  const handleSaveEdit = async () => {
    const editedData = {
      id: attendanceDetail.id,
      date: attendanceDetail.date,
      logInTime: `${attendanceDetail.date}T${loginEditTime}`,
      logoutTime: logoutEditTime
        ? `${attendanceDetail.date}T${logoutEditTime}`
        : null // ✅ send null if logoutEditTime is empty
    };

    try {
      // Update attendance data
      await axios.put(`/attendance/staff/edit-attendance/${editedData.id}`, editedData);

      // Re-fetch updated data
      const response = await axios.get(`/attendance/staff/${filters.staffId}`);
      const formattedData = response.data.map(item => ({
        ...item,
        date: item.date.split('T')[0],
      }));

      setAttendanceData(formattedData);
      const updatedRecord = formattedData.find(item => item.date === editedData.date);
      setAttendanceDetail(updatedRecord);
      setEditMode(false);
      setOpenModal(false);
      toast.success("Attendance record updated successfully.");
    } catch (error) {
      const errorMessage =
        error.response?.data?.details || error.response?.data?.message || "Failed to update attendance. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setLoginEditTime(attendanceDetail.loginTime?.slice(11, 16));
    setLogoutEditTime(attendanceDetail.logoutTime?.slice(11, 16));
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <AccessTimeIcon sx={{ fontSize: 28, mr: 1 }} />
        <Typography fontSize={24} fontWeight={600}>
          OVERALL TIMESHEET
        </Typography>
      </Box>
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            label="Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <MenuItem key={month} value={index}>{month}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            label="Department"
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <MenuItem value="Non selected">Non selected</MenuItem>
            {departmentData.map(dept => (
              <MenuItem key={dept.id} value={dept.name}>{dept.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            label="Staff"
            name="staffId"
            value={filters.staffId}
            onChange={handleFilterChange}
            disabled={!filters.department || filters.department === "Non selected"}
          >
            <MenuItem value="">Non selected</MenuItem>
            {staffData
              .filter(staff =>
                filters.department === "Non selected" ||
                staff.departmentName === filters.department
              )
              .map(staff => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name} ({staff.hrCode})
                </MenuItem>
              ))}
          </TextField>

        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadExcel}
            disabled={!filters.staffId || isDownloading}
            fullWidth
            sx={{ height: '100%' }}
          >
            {isDownloading ? 'Downloading...' : 'Export Excel'}
          </Button>
        </Grid>

      </Grid>

      <Divider sx={{ my: 2 }} />
      {/* Status Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {statusCodes.map(code => {
          const codeMeanings = {
            AL: 'Annual Leave',
            U: 'Unpaid Leave',
            HD: 'Half-day Leave',
            M: 'Maternity Leave',
            ML: 'Medical Leave',
            NS: 'No Show',
          };

          return (
            <Tooltip key={code} title={codeMeanings[code] || ''} arrow>
              <Chip label={code} variant="outlined" />
            </Tooltip>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />
      {/* Calendar View */}
      {!shouldShowCalendar ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          {!filters.staffId
            ? "Please select a staff member to view their calendar."
            : `Selected staff does not belong to "${filters.department}".`}
        </Typography>
      ) : (
        <Box
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
              backgroundColor: '#f5eed5', // ✅ your custom light purple
              height: 100,
              width: 50,
              textAlign: 'center',
              verticalAlign: 'middle',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            },
            '& .react-calendar__tile--now': {
              backgroundColor: '#d6d6eb', // optional: slightly darker for today
            },
            '& .react-calendar__tile--active': {
              backgroundColor: '#c2c2e0 !important', // optional: darker for selected date
              color: '#000',
            },
            '& .react-calendar__month-view__weekdays__weekday': {
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              fontSize: '1.25rem',
              border: '1px solid #ccc', // ✅ Border on each cell
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
            value={new Date(selectedYear, selectedMonth)}
            onClickDay={handleDateClick}
            tileContent={tileContent}
            calendarType="gregory"
            minDate={joiningDate}
          />
        </Box>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#1976d2" }}>Attendance Details</DialogTitle>
        <DialogContent dividers>

          {holidayDetail ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" alignItems="center">
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Date:</strong> {dayjs(holidayDetail.date).format('DD MMM YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Chip
                    label="PUBLIC HOLIDAY"
                    color="secondary"
                    sx={{ fontWeight: 'bold', backgroundColor: 'rgb(163, 36, 53)' }}
                  />
                </Grid>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Grid item xs={12}>
                  <Typography><strong>Holiday Name:</strong> {holidayDetail.name}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : attendanceDetail ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" alignItems="center">
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Date:</strong> {dayjs(attendanceDetail.date).format('DD MMM YYYY')}
                  </Typography>
                </Grid>

                {attendanceDetail && shiftData && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      <strong>Scheduled Shift:</strong> {format24to12Hour(shiftData.startTime)} - {format24to12Hour(shiftData.endTime)}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Chip
                    label={attendanceDetail.status}
                    color={
                      attendanceDetail.status === 'P' ? 'success' :
                        attendanceDetail.status === 'AB' ? 'error' :
                          attendanceDetail.status === 'LV' ? 'warning' :
                            'default'
                    }
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Grid>

                <Divider sx={{ width: '100%', my: 2 }} />
                {editMode ? (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        label="Login Time"
                        type="time"
                        fullWidth
                        value={loginEditTime}
                        onChange={(e) => setLoginEditTime(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Logout Time"
                        type="time"
                        fullWidth
                        value={logoutEditTime}
                        onChange={(e) => setLogoutEditTime(e.target.value)}
                      />
                    </Grid>
                  </>
                ) : (
                  <>                                <Grid item xs={6} display="flex" alignItems="center">
                    <LoginIcon color="action" sx={{ mr: 1 }} />
                    <Typography>
                      <strong>Login:</strong> {attendanceDetail.loginTime ? dayjs(attendanceDetail.loginTime).format('hh:mm A') : 'N/A'}
                    </Typography>
                  </Grid>
                    <Grid item xs={6} display="flex" alignItems="center">
                      <LogoutIcon color="action" sx={{ mr: 1 }} />
                      <Typography>
                        <strong>Logout:</strong> {attendanceDetail.logoutTime ? dayjs(attendanceDetail.logoutTime).format('hh:mm A') : 'N/A'}
                      </Typography>
                    </Grid>
                  </>)}
                <Grid item xs={12} display="flex" alignItems="center">
                  <AccessTimeIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography>
                    <strong>Worked Duration:</strong> {formatMinutesToHours(attendanceDetail.totalWorkedDurationMinutes)}
                  </Typography>
                </Grid>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Grid item xs={6}>
                  <Typography><strong>Early Login:</strong> {attendanceDetail.isEarlyLogin ? <DoneIcon color="success" /> : <CloseIcon color="error" />}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Late Login:</strong> {attendanceDetail.isLateLogin ? <DoneIcon color="error" /> : <CloseIcon color="success" />}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Early Logout:</strong> {attendanceDetail.isEarlyLogout ? <DoneIcon color="warning" /> : <CloseIcon color="success" />}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Late Logout:</strong> {attendanceDetail.isLateLogout ? <DoneIcon color="info" /> : <CloseIcon color="disabled" />}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : leaveDetail ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" alignItems="center">
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    <strong>DATE:</strong> {dayjs(leaveDetail.date).format('DD MMM YYYY')}
                  </Typography>
                </Grid>

                {leaveDetail && shiftData && (
                  <Grid item xs={12} display="flex" alignItems="center">
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      <strong>SHIFT TIMINGS:</strong> {format24to12Hour(shiftData.startTime)} - {format24to12Hour(shiftData.endTime)}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Chip label="LEAVE" color="warning" sx={{ fontWeight: 'bold' }} />
                </Grid>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Grid item xs={6}>
                  <Typography><strong>SUBJECT:</strong> {leaveDetail.subject.toUpperCase()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>REASON:</strong> {leaveDetail.relatedReason.toUpperCase()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>TYPE:</strong> {leaveDetail.type.toUpperCase() || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>No data available for this date.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {attendanceDetail && !editMode && (
            <Button onClick={handleEditClick} variant="outlined" color="primary">Edit</Button>
          )}
          {editMode && (
            <Button onClick={handleSaveEdit} variant="contained" color="success">Save</Button>
          )}
          <Button onClick={() => setOpenModal(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Timesheet;
