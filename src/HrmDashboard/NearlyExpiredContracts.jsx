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
import { Search, Download, Info } from '@mui/icons-material';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '@mui/material/styles';
import axios from '../Axiosinstance';
import Nodatapage from "../Nodatapage";

const NearlyExpiredContracts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [contractsData, setContractsData] = useState([]);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch contracts data
  const fetchContracts = async () => {
    try {
      const response = await axios.get('/staff/get-expired-contract-active-staffs');
      setContractsData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contracts. Please try again.');
      console.error('Error fetching contracts:', err);
    } finally {
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Export functions
  const handleExportClick = (event) => setAnchorEl(event.currentTarget);
  const handleExportClose = () => setAnchorEl(null);

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Contract Code', 'Contract ID', 'Staff', 'Department', 'Status','hr_code ','Start Date', 'End Date', ]],
      body: contractsData.map((row) => [
        row.contractCode,
        row.contractId,
        row.staffName,
        row.departmentName,
        row.contractStatus,
        row.staffHrCode,
        row.startDate,
        row.endDate,
       
      ]),
    });
    doc.save('NearlyExpiredContracts.pdf');
    handleExportClose();
  };

  const exportToExcel = () => {
    const formattedData = contractsData.map(row => ({
      'Contract Code': row.contractCode,
      'Contract ID': row.contractId,
      'Staff': row.staffName,
      'Department': row.staffHrCode,
      'Start Date': row.startDate,
      'End Date': row.endDate,
     
      'Status': row.contractStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NearlyExpiredContracts');
    XLSX.writeFile(workbook, 'NearlyExpiredContracts.xlsx');
    handleExportClose();
  };

  const exportToCSV = () => {
    const headers = ['Contract Code', 'Contract ID', 'Staff', 'Department', 'Start Date', 'End Date', ];
    const csvData = [
      headers.join(','),
      ...contractsData.map(row =>
        [row.contractCode, row.contractId, row.staffName, row.departmentName, row.startDate, row.endDate].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'NearlyExpiredContracts.csv');
    handleExportClose();
  };

  const handlePrint = () => {
    window.print();
    handleExportClose();
  };

  // Filter contracts data
  const filteredContracts = contractsData?.filter((row) =>
    Object.values({
      contractCode: row.contractCode,
      contractId: row.contractId,
      staffName: row.staffName,
      department: row.departmentName,
      hrcode:row.staffHrCode,
      startDate: row.startDate,
      endDate: row.endDate,
   
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
              Nearly Expired Contracts
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
            List of Nearly Expired Contracts
          </Typography>
          <Box flexGrow={1} />
          <TextField
            variant="outlined"
            placeholder="Search contracts..."
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
            placeholder="Search contracts..."
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
              fontSize: isMobile ? '0.75rem' : '0.875rem'
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
              <TableCell align="center" >CONTRACT CODE</TableCell>
              <TableCell align="center" >CONTRACT ID</TableCell>
              <TableCell align="center" >STAFF</TableCell>
              <TableCell align="center" >DEPARTMENT</TableCell>
              <TableCell align="center" >START DATE</TableCell>
              <TableCell align="center" >END DATE</TableCell>
            
              <TableCell align="center" >STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {error ? (
              <TableRow>
               <TableCell colSpan={9} align="center" >
                  <Nodatapage />
                </TableCell>
              </TableRow>
            ) : filteredContracts?.length > 0 ? (
              filteredContracts.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {index + 1 || '-'}
                  </TableCell>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.contractCode || '-'}
                  </TableCell>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.contractId || '-'}
                  </TableCell>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.staffName || '-'}
                  </TableCell>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.staffHrCode || '-'}
                  </TableCell>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.startDate || '-'}
                  </TableCell>
                  <TableCell align="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                    {row.endDate || '-'}
                  </TableCell>
                
                  <TableCell align="center" style={{
                    textTransform: "uppercase",
                    fontFamily: "Marquis",
                    color: row.contractStatus === 'ACTIVE' ? 'green' : 'red'
                  }}>
                    {row.contractStatus || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
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

export default NearlyExpiredContracts;