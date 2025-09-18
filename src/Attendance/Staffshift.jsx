import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Grid, Paper, Button, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from '../Axiosinstance';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast, ToastContainer } from 'react-toastify';
import Nodatapage from '../Nodatapage';
import { useUser } from '../Contexts/Usercontext.jsx';

const Workshift = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [dialogData, setDialogData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [workshiftMap, setWorkshiftMap] = useState({});
  const [staffShifts, setStaffShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [publicHolidays, setPublicHolidays] = useState({});
  const [noDataMessage, setNoDataMessage] = useState('');
  const { userId } = useUser();

  useEffect(() => {
    axios.get('/shift-category/get-all-workshifts').then((res) => {
      const shiftMap = {};
      res.data.forEach(item => shiftMap[item.id] = item);
      setWorkshiftMap(shiftMap);
    });

    const year = new Date().getFullYear();
    axios.get(`/public-holidays/${year}`).then((res) => {
      const holidayMap = {};
      res.data.forEach(holiday => {
        holidayMap[holiday.date] = holiday.name;
      });
      setPublicHolidays(holidayMap);
    });

    if (userId) {
      fetchShiftData(userId);
    } else {
      setNoDataMessage('User ID not found.');
    }
  }, [userId]);

  const fetchShiftData = async (id) => {
    try {
      const res = await axios.get(`/work-shifts/staff/${id}`);

      if (!res.data || res.data.length === 0) {
        setStaffShifts([]);
        setActiveShifts([]);
        setNoDataMessage('No shift data available for this staff.');
        return;
      }

      setStaffShifts(res.data);
      const specific = res.data.find(s => s.shiftType === 'SPECIFIC_PERIOD');
      const weekly = res.data.find(s => s.shiftType === 'WEEKLY');
      const def = res.data.find(s => s.shiftType === 'DEFAULT');

      const active = [];
      if (specific) active.push(specific);
      if (weekly) active.push(weekly);
      if (def) active.push(def);

      setActiveShifts(active);
    } catch (err) {
      console.error(err);
      setNoDataMessage('Error loading shift data.');
    }
  };

  const handleDayClick = (date) => {
    const dateStr = date.toLocaleDateString('en-CA');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    if (publicHolidays[dateStr]) return;

    let shiftData = null;

    for (const shift of activeShifts) {
      if (shift.shiftType === 'SPECIFIC_PERIOD' && shift.dateToShiftCategoryIdMap?.[dateStr]) {
        shiftData = workshiftMap[shift.dateToShiftCategoryIdMap[dateStr]];
        break;
      } else if (shift.shiftType === 'WEEKLY' && shift.dayToShiftCategoryIdMap?.[dayName]) {
        shiftData = workshiftMap[shift.dayToShiftCategoryIdMap[dayName]];
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
          <Box sx={{
            backgroundColor: '#ffe0e0',
            color: 'black',
            borderLeft: '4px solid #e53935',
            borderRadius: '4px',
            p: '6px 10px',
            fontSize: '0.75rem',
            width: '100%'
          }}>
            <Typography variant="subtitle2" fontWeight="bold">HOLIDAY</Typography>
            <Typography variant="caption">{publicHolidays[dateStr]}</Typography>
          </Box>
        </Box>
      );
    }

    let shiftData = null;
    for (const shift of activeShifts) {
      if (shift.shiftType === 'SPECIFIC_PERIOD') {
        const from = new Date(shift.fromDate);
        const to = new Date(shift.toDate);
        const current = new Date(dateStr);
        const hasShift = !!shift.dateToShiftCategoryIdMap?.[dateStr];
        if (current >= from && current <= to && hasShift) {
          shiftData = workshiftMap[shift.dateToShiftCategoryIdMap[dateStr]];
          break;
        }
      } else if (shift.shiftType === 'WEEKLY' && shift.dayToShiftCategoryIdMap?.[dayName]) {
        shiftData = workshiftMap[shift.dayToShiftCategoryIdMap[dayName]];
        break;
      } else if (shift.shiftType === 'DEFAULT' && shift.defaultShiftCategoryId) {
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

  return (
    <Paper sx={{ p: 3 }}>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Typography fontSize={24} fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTimeIcon /> Staff SHIFT
      </Typography>

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
          <Calendar value={startDate} tileContent={tileContent} onClickDay={handleDayClick} />
        </Box>
      ) : (
        <Nodatapage />
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          SHIFT DETAILS
          <IconButton onClick={() => setOpenDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {dialogData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">SHIFT NAME</Typography>
                <Typography>{dialogData.name.toUpperCase()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">START TIME</Typography>
                <Typography>{dialogData.workStartTime}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">END TIME</Typography>
                <Typography>{dialogData.workEndTime}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography>No shift data found.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Workshift;
