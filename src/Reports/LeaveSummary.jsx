import React, { useEffect, useState } from "react";
import axios from '../Axiosinstance';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Reportattendance from './Attendance';
import Reportleaveapplication from './Leaveapplication';
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MonthlyReports from "./MonthlyReports";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Reports() {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [leaveData, setLeaveData] = useState([]);
  const [search, setSearch] = useState('');


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredData = leaveData.filter(row =>
    row.staffName.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get('/approval-process/summary/all');
        console.log(response.data, "leave summary")
        setLeaveData(response.data);
      } catch (error) {
        console.error('Error fetching leave data:', error);
      }
    };

    fetchLeaveData();
  }, []);


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
        <Tab label="LEAVE SUMMARY" />
        <Tab label="ATTENDANCE" />
        <Tab label="LEAVE APPLICATION" />
        <Tab label="MONTHLY REPORTS" />
      </Tabs>
      <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, boxShadow: 1 }}>

        {activeTab === 0 && (
          <Box p={2}>
            <Grid container spacing={2} mb={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="outlined"
                  fullWidth
                  size="small" // reduces default height
                  placeholder="Search.."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    sx: {
                      height: 46, // optional: further reduce height
                      borderRadius: 2,
                      fontSize: '0.85rem',
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      paddingRight: '8px',
                    },
                  }}
                />

              </Grid>
              <Grid item xs={12} sm={8}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Box mt={4}>
              <TableContainer>
                <Table stickyHeader size="small"
                  sx={{
                    '& .MuiTableCell-root': {
                      border: '1px solid rgba(224, 224, 224, 1)',
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      whiteSpace: 'normal',
                      maxWidth: 120,
                      fontFamily: 'Marquis',
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
                      {/* <TableCell>Total Annual Leave</TableCell> */}
                      {months.map(month => (
                        <TableCell key={month}>{month}</TableCell>
                      ))}
                      <TableCell>Total Days Off</TableCell>
                      {/* <TableCell>Leave Days Allowed</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row, index) => (
                        <TableRow hover key={index}>
                          <TableCell>{row.staffId}</TableCell>
                          <TableCell
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              minWidth: '200px',
                            }}
                          >
                            {row.staffName}
                          </TableCell>
                          {/* <TableCell>{row.maxLeaves?.ANNUAL_LEAVE ?? '-'}</TableCell> */}
                          {months.map((month, i) => (
                            <TableCell key={i}>
                              {row.monthWiseLeaves?.[month] ?? '-'}
                            </TableCell>
                          ))}
                          <TableCell>{row.totalLeavesTaken ?? 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={months.length + 4}
                          align="center"
                          sx={{ py: 3, fontStyle: 'italic', color: 'gray' }}
                        >
                          No matching records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>

                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box >
            <Reportattendance />
          </Box>
        )}

        {activeTab === 2 && (
          <Box >
            <Reportleaveapplication />
          </Box>
        )}
             {activeTab === 3 && (
          <Box >
            <MonthlyReports />
          </Box>
        )}
      </Box>
    </>
  );
}
