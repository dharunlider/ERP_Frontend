import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
  TextField,
  Menu,
  MenuItem,
  InputAdornment,
  Typography,
  useMediaQuery,
  IconButton,
  Toolbar,
  AppBar,
  CircularProgress
} from '@mui/material';
import { Search, Download } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '@mui/material/styles';
import axios from '../Axiosinstance';
import Nodatapage from "../Nodatapage";

const Birthdays = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [birthdaysData, setBirthdaysData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch birthdays data
  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/staff/birthdays-this-month');
      setBirthdaysData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch birthdays. Please try again.');
      console.error('Error fetching birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  // Export functions
  const handleExportClick = (event) => setAnchorEl(event.currentTarget);
  const handleExportClose = () => setAnchorEl(null);

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['HR Code', 'Full Name', 'Email', 'Department', 'Birthday', 'Gender', 'Status']],
      body: birthdaysData.map((row) => [
        row.hrCode,
        row.name,
        row.email,
        row.departmentName,
        row.birthday,
        row.gender,
        row.status,
      ]),
    });
    doc.save('BirthdaysThisMonth.pdf');
    handleExportClose();
  };

  const exportToExcel = () => {
    const formattedData = birthdaysData.map(row => ({
      'HR Code': row.hrCode,
      'Full Name': row.name,
      'Email': row.email,
      'Department': row.departmentName,
      'Birthday': row.birthday,
      'Gender': row.gender,
      'Status': row.status,
      'Role': row.roleName
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BirthdaysThisMonth');
    XLSX.writeFile(workbook, 'BirthdaysThisMonth.xlsx');
    handleExportClose();
  };

  const exportToCSV = () => {
    const headers = ['HR Code', 'Full Name', 'Email', 'Department', 'Birthday', 'Gender', 'Status'];
    const csvData = [
      headers.join(','),
      ...birthdaysData.map(row =>
        [row.hrCode, row.name, row.email, row.departmentName, row.birthday, row.gender, row.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'BirthdaysThisMonth.csv');
    handleExportClose();
  };

  const handlePrint = () => {
    window.print();
    handleExportClose();
  };

  // Filter birthdays data
  const filteredBirthdays = birthdaysData.filter((row) =>
    Object.values({
      hrCode: row.hrCode,
      name: row.name,
      email: row.email,
      departmentName: row.departmentName,
      birthday: row.birthday,
      gender: row.gender,
      status: row.status
    }).some(
      value => value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  return (
    <Paper style={{
      padding: isMobile ? '8px' : '24px',
      overflow: 'hidden',
      width: 'auto'
    }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              style={{
                color: 'black',
                fontWeight: 'bold',
                flexGrow: 1,
                textTransform: "uppercase",
                fontFamily: "Marquis",
                fontSize: '0.9rem'
              }}
            >
              Birthdays
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleExportClick}
              edge="end"
            >
              <Download />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box display="flex" alignItems="center" marginBottom="16px">
          <Typography
            variant="h6"
            component="div"
            style={{
              color: 'black',
              fontWeight: 'bold',
              marginRight: '16px',
              textTransform: "uppercase",
              fontFamily: "Marquis"
            }}
          >
            Birthday in this Month
          </Typography>
          <Box flexGrow={1} />
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              style: { height: '40px' },
            }}
            style={{ maxWidth: '300px', marginRight: '16px' }}
          />
          <Button
            variant="contained"
            onClick={handleExportClick}
            sx={{
              height: '40px',
              textTransform: 'uppercase',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0', // Slightly darker for hover
              }
            }}
          >
            Export
          </Button>

        </Box>
      )}

      {/* Mobile Search */}
      {isMobile && (
        <Box marginBottom="16px">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              style: { height: '40px' },
            }}
          />
        </Box>
      )}

      {/* Loading and Error States */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Table Container with Scroll */}
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
          }
        }}
      >
        <Table
          sx={{
            minWidth: isMobile ? '700px' : '100%',
            '& .MuiTableCell-root': {
              border: '1px solid rgba(224, 224, 224, 1)',
              padding: isMobile ? '6px 8px' : '8px 12px',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            },
            '& .MuiTableCell-head': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              fontWeight: "bold",
              fontFamily: "roboto"
            },
            '& .MuiTableRow-root:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
          size={isMobile ? "small" : "medium"}
        >
          <TableHead>
            <TableRow>
              <TableCell align="center" >S.NO</TableCell>
              <TableCell align="center" >HR CODE</TableCell>
              <TableCell align="center" >FULL NAME</TableCell>
              <TableCell align="center" >EMAIL</TableCell>
              <TableCell align="center" >DEPARTMENT</TableCell>
              <TableCell align="center" >BIRTHDAY</TableCell>
              <TableCell align="center" >GENDER</TableCell>
              <TableCell align="center" >STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredBirthdays.length > 0 ? (
              filteredBirthdays.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {index + 1 || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.hrCode || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.name || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.email || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.departmentName || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.birthday || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.gender || '-'}
                  </TableCell>
                  <TableCell align="center"  style={{
                    textTransform: "uppercase",
                    fontFamily: "Marquis",
                    color: row.status === 'Active' ? 'green' : 'red'
                  }}>
                    {row.status || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                   <TableCell colSpan={9} align="center" >
                <Nodatapage />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleExportClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
        <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
        <MenuItem onClick={exportToCSV}>Export to CSV</MenuItem>
        <MenuItem onClick={handlePrint}>Print</MenuItem>
      </Menu>
    </Paper>
  );
};

export default Birthdays;