import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Box, TextField, Menu, MenuItem, InputAdornment,
  useMediaQuery, useTheme, CircularProgress, TableContainer
} from '@mui/material';
import {
  Search, FileDownload as ExportIcon
} from '@mui/icons-material';
import axios from '../Axiosinstance';

const Staffcontact = ({ staffid }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Search term state

  // Fetch data from API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
       const response = await axios.get(`/staff-contracts/by-staff/${staffid}`);
        const formattedData = response.data.map((item, index) => ({
          id: index + 1,
          contractCode: item.contractCode,
          contractId: item.contractId?.id ?? 'N/A',
          staff: item.staff?.id ?? 'N/A',
          start: item.startDate,
          end: item.endDate,
          status: item.contractStatus,
          panCard: item.note ?? '-', // adjust if needed
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching staff contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  // Filter data based on search term (case-insensitive)
  const filteredData = data.filter(row =>
    row.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.contractId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.staff.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleExportClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Paper sx={{ p: 3, overflow: 'hidden' }}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <TextField
          variant="outlined"
          placeholder="Search Contact Code ..."
          value={searchTerm}            // Bind value
          onChange={handleSearchChange} // Update on change
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            style: { height: '40px' },
          }}
          style={{
            maxWidth: isMobile ? '100%' : '300px',
            marginRight: isMobile ? '0' : '16px'
          }}
          fullWidth={isMobile}
        />

        {!isMobile && <Box flexGrow={1} />}

        <Button
          variant="contained"
          startIcon={<ExportIcon />}
          style={{
            height: '40px',
            marginLeft: isMobile ? '0' : 'auto'
          }}
          fullWidth={isMobile}
          onClick={handleExportClick}
        >
          Export
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleCloseMenu}>Export to PDF</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Export to Excel</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Export to CSV</MenuItem>
          <MenuItem onClick={handleCloseMenu}>Print</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ position: 'relative', minHeight: 200 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{
              '& .MuiTableCell-root': {
                border: '1px solid rgba(224, 224, 224, 1)',
                padding: isMobile ? '6px 8px' : '8px 12px',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              },
              '& .MuiTableCell-head': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>CONTRACT CODE</TableCell>
                  <TableCell>CONTRACT ID</TableCell>
                  <TableCell>STAFF ID</TableCell>
                  <TableCell>START DATE</TableCell>
                  <TableCell>END DATE</TableCell>
                  <TableCell>STATUS</TableCell>
                  {/* <TableCell>PAN CARD</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.contractCode}</TableCell>
                      <TableCell>{row.contractId}</TableCell>
                      <TableCell>{row.staff}</TableCell>
                      <TableCell>{row.start}</TableCell>
                      <TableCell>{row.end}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      {/* <TableCell>{row.panCard}</TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};

export default Staffcontact;
