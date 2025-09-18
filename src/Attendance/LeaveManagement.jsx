import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, Grid, Tooltip, Typography, Paper,
  useMediaQuery, useTheme, Divider, Chip, Stack, MenuItem, Select, FormControl
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import axios from '../Axiosinstance';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { styled } from '@mui/material/styles';
import Leavetab from './LeaveTab';
import LinearProgress from '@mui/material/LinearProgress';

const LeaveCard = styled(Card)(({ theme, bgcolor }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${bgcolor} 0%, ${theme.palette.background.paper} 100%)`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
  }
}));

const LeaveIconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: color,
  color: theme.palette.common.white,
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: 40,
    height: 40,
    marginRight: theme.spacing(1)
  }
}));

const LeaveManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isStaff, setIsStaff] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [staffId, setStaffId] = useState(null);

  useEffect(() => {
    const userIdFromSession = sessionStorage.getItem('userId');
    const authoritiesFromSession = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    setIsStaff(authoritiesFromSession.includes('TYPE_STAFF'));

    if (userIdFromSession) {
      setStaffId(userIdFromSession);
    }
  }, []);

  useEffect(() => {
    if (staffId) {
      fetchLeaveBalances();
    }
  }, [staffId, selectedYear]);

  const fetchLeaveBalances = async () => {
    try {
      const response = await axios.get(`/leave-balance/staff/${staffId}/year/${selectedYear}`);
      setLeaveBalances(response.data);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const getLeaveValues = (leaveType) => {
    const leaveBalance = leaveBalances.find(item => 
      item.leaveType === leaveType.toUpperCase().replace(' ', '_')
    );
    
    if (!leaveBalance) return { taken: '--', max: '--' };
    
    return {
      taken: leaveBalance.used ?? '--',
      max: leaveBalance.maxAllowed ?? '--'
    };
  };

  const leaveTypes = [
    { 
      label: 'Sick Leave',
      icon: <MedicalServicesIcon />,
      color: '#4e79a7',
      bgcolor: 'rgba(78, 121, 167, 0.08)',
      apiKey: 'SICK_LEAVE'
    },
    {
      label: 'Annual Leave',
      icon: <BeachAccessIcon />,
      color: '#59a14f',
      bgcolor: 'rgba(89, 161, 79, 0.08)',
      apiKey: 'ANNUAL_LEAVE'
    },
    {
      label: 'Unpaid Leave',
      icon: <MoneyOffIcon />,
      color: '#79706e',
      bgcolor: 'rgba(121, 112, 110, 0.08)',
      apiKey: 'UNPAID_LEAVE'
    },
    {
      label: 'Maternity Leave',
      icon: <PregnantWomanIcon />,
      color: '#d37295',
      bgcolor: 'rgba(211, 114, 149, 0.08)',
      apiKey: 'MATERNITY_LEAVE'
    },
    {
      label: 'Paternity Leave',
      icon: <ChildCareIcon />,
      color: '#f28e2c',
      bgcolor: 'rgba(242, 142, 44, 0.08)',
      apiKey: 'PATERNITY_LEAVE'
    }
  ];

  // Generate year options (current year and previous 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Container maxWidth="xlg" sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 4 : 6 }}>
      <Paper elevation={0} sx={{
        p: isMobile ? 2 : 4,
        borderRadius: 4,
        background: theme.palette.background.paper,
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.03)'
      }}>
        {isStaff && (
          <>
            <Stack direction={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'flex-start' : 'center'} 
                  justifyContent="space-between" mb={4} spacing={isMobile ? 2 : 0}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <EventNoteIcon sx={{
                  fontSize: isMobile ? 28 : 36,
                  color: theme.palette.primary.main,
                  background: 'rgba(25, 118, 210, 0.1)',
                  borderRadius: '50%',
                  p: 1
                }} />
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                  USED LEAVE SUMMARY
                </Typography>
                {!isMobile && (
                  <Chip
                    label={`Year ${selectedYear}`}
                    color="primary"
                    size="small"
                    sx={{ ml: 1, fontWeight: 500 }}
                  />
                )}
              </Stack>
              
              <FormControl size="small" sx={{ minWidth: 120, mt: isMobile ? 1 : 0 }}>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Select year' }}
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Divider sx={{ mb: 4, borderColor: 'rgba(0,0,0,0.08)' }} />

            <Grid container spacing={isMobile ? 2 : 3}>
              {leaveTypes.map(({ label, icon, color, bgcolor, apiKey }) => {
                const { taken, max } = getLeaveValues(apiKey);
                const hasData = taken !== '--' && max !== '--';
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={label}>
                    <LeaveCard bgcolor={bgcolor}>
                      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant={isMobile ? 'subtitle2' : 'h6'} color="text.secondary" mb={0.5}>
                              {label}
                            </Typography>
                            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} color="text.primary">
                              {taken}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hasData ? `of ${max} total` : 'No data'}
                            </Typography>
                          </Box>

                          <Tooltip
                            title={
                              hasData
                                ? `${taken} days used of ${max} total`
                                : 'No leave data available'
                            }
                            arrow
                          >
                            <InfoIcon
                              fontSize="small"
                              sx={{
                                color: 'rgba(0,0,0,0.23)',
                                '&:hover': { color: theme.palette.primary.main }
                              }}
                            />
                          </Tooltip>
                        </Stack>

                        

                        <Stack direction="row" alignItems="center" mt={isMobile ? 1.5 : 3}>
                          <LeaveIconWrapper color={color}>
                            {React.cloneElement(icon, { fontSize: isMobile ? 'small' : 'medium' })}
                          </LeaveIconWrapper>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: color,
                                fontWeight: 500,
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                display: 'block'
                              }}
                            >
                              {hasData ? `${taken} days used` : 'Not applicable'}
                            </Typography>
                            {!isMobile && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                  display: 'block'
                                }}
                              >
                                {hasData ? `${((taken / max) * 100).toFixed(0)}% used` : ''}
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        {hasData && (
                          <Box mt={2}>
                            <LinearProgress
                              variant="determinate"
                              value={(taken / max) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: color
                                }
                              }}
                            />
                          </Box>
                        )}

                      </CardContent>
                    </LeaveCard>
                  </Grid>
                );
              })}
            </Grid>

            {leaveBalances.length === 0 && (
              <Box textAlign="center" mt={4} py={6} sx={{ background: 'rgba(0,0,0,0.02)', borderRadius: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No leave usage data available
                </Typography>
              </Box>
            )}
            <Box pt={2} sx={{ textAlign: 'right'}}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleDateString('en-GB').replaceAll('/', '-')}
              </Typography>
            </Box>
          </>
        )}
        {!isStaff && <Leavetab />}
      </Paper>
    </Container>
  );
};

export default LeaveManagement;