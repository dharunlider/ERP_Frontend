
import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
  useTheme, useMediaQuery,
} from '@mui/material';
import { Add, Close, Edit, Delete, Search, MoreVert, Cancel } from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileDownload as ExportIcon, FilterList as FilterIcon
} from '@mui/icons-material';

const PayrollTemplate = () => {
  // State for PayrollTemp data
  const [PayrollTempData, setPayrollTempData] = useState([
    {
      id: 1,
      payrollTemplateName: 'Monthly Salary',
      role: 'Employee',
      position: 'Developer',
      manager: 'John Doe',
      departmentApplicable: 'IT',
      payrollTable: 'Primary',
      follower: 'Jane Smith'
    },
    {
      id: 2,
      payrollTemplateName: 'Contractor',
      role: 'Contractor',
      position: 'Designer',
      manager: 'SarahJohnsonSarahJohnsonSarahJohnson SarahJohnsonSarahJohnson',
      departmentApplicable: 'Creative',
      payrollTable: 'Allowance',
      follower: 'Mike Brown'
    }
  ]);

  const [openPayrollTempModal, setOpenPayrollTempModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPayrollTempId, setCurrentPayrollTempId] = useState(null);
  const [newPayrollTemp, setNewPayrollTemp] = useState({
    payrollTemplateName: '',
    role: '',
    position: '',
    manager: '',
    departmentApplicable: '',
    payrollTable: '',
    follower: '',
  });

  const [filterText, setFilterText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [nextId, setNextId] = useState(3);

  // Open modal for adding/editing PayrollTemp
  const handleOpenPayrollTempModal = () => {
    setOpenPayrollTempModal(true);
    setIsEditing(false);
    setNewPayrollTemp({
      payrollTemplateName: '',
      role: '',
      position: '',
      manager: '',
      departmentApplicable: '',
      payrollTable: '',
      follower: '',
    });
  };

  // Close modal
  const handleClosePayrollTempModal = () => {
    setOpenPayrollTempModal(false);
  };

  // Handle input change in modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayrollTemp({
      ...newPayrollTemp,
      [name]: value,
    });
  };

  // Open export menu
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close export menu
  const handleExportClose = () => {
    setAnchorEl(null);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'Template Name', 'Role', 'Position', 'Manager', 'Department', 'Payroll Table', 'Follower']],
      body: PayrollTempData.map((row) => [
        row.id,
        row.payrollTemplateName,
        row.role,
        row.position,
        row.manager,
        row.departmentApplicable,
        row.payrollTable,
        row.follower,
      ]),
    });
    doc.save('payroll-templates.pdf');
    handleExportClose();
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(PayrollTempData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PayrollTemplates');
    XLSX.writeFile(workbook, 'payroll-templates.xlsx');
    handleExportClose();
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Template Name', 'Role', 'Position', 'Manager', 'Department', 'Payroll Table', 'Follower'];
    const csvData = [
      headers.join(','),
      ...PayrollTempData.map(row =>
        [row.id, row.payrollTemplateName, row.role, row.position, row.manager,
        row.departmentApplicable, row.payrollTable, row.follower].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'payroll-templates.csv');
    handleExportClose();
  };

  // Print table
  const handlePrint = () => {
    window.print();
    handleExportClose();
  };

  // Add or edit PayrollTemp
  const handleAddPayrollTemp = () => {
    if (!newPayrollTemp.payrollTemplateName || !newPayrollTemp.role ||
      !newPayrollTemp.position || !newPayrollTemp.manager ||
      !newPayrollTemp.departmentApplicable || !newPayrollTemp.payrollTable ||
      !newPayrollTemp.follower) {
      alert('Please fill in all required fields.');
      return;
    }

    if (isEditing) {
      const updatedPayrollTempData = PayrollTempData.map((PayrollTemp) =>
        PayrollTemp.id === currentPayrollTempId
          ? { ...PayrollTemp, ...newPayrollTemp }
          : PayrollTemp
      );
      setPayrollTempData(updatedPayrollTempData);
    } else {
      const newPayrollTempData = {
        id: nextId,
        ...newPayrollTemp,
      };
      setPayrollTempData([...PayrollTempData, newPayrollTempData]);
      setNextId(nextId + 1);
    }

    handleClosePayrollTempModal();
  };

  // Edit PayrollTemp
  const handleEditPayrollTemp = (id) => {
    const PayrollTempToEdit = PayrollTempData.find((PayrollTemp) => PayrollTemp.id === id);
    if (PayrollTempToEdit) {
      setNewPayrollTemp(PayrollTempToEdit);
      setCurrentPayrollTempId(id);
      setIsEditing(true);
      setOpenPayrollTempModal(true);
    }
  };
  const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  // Delete PayrollTemp
  const handleDeletePayrollTemp = (id) => {
    const updatedPayrollTempData = PayrollTempData.filter((PayrollTemp) => PayrollTemp.id !== id);
    setPayrollTempData(updatedPayrollTempData);
  };

  // Filter PayrollTemp data
  const filteredPayrollTempData = PayrollTempData.filter((row) =>
    row.id.toString().includes(filterText) ||
    row.payrollTemplateName.toLowerCase().includes(filterText.toLowerCase()) ||
    row.role.toLowerCase().includes(filterText.toLowerCase()) ||
    row.position.toLowerCase().includes(filterText.toLowerCase()) ||
    row.manager.toLowerCase().includes(filterText.toLowerCase()) ||
    row.departmentApplicable.toLowerCase().includes(filterText.toLowerCase()) ||
    row.payrollTable.toLowerCase().includes(filterText.toLowerCase()) ||
    row.follower.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Paper style={{ padding: '24px' }}>
      {/* PayrollTemp Management Page */}

      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        gap={2}
        mb={2}
      >
        <Box sx={{ flex: isMobile ? '1 1 auto' : 'none', minWidth: isMobile ? '100%' : 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenPayrollTempModal}
            startIcon={<Add />}
            fullWidth={isMobile}
            sx={{ height: 40 }}
          >
            Add New Template
          </Button>
        </Box>

        <Box sx={{ flex: 1, minWidth: isMobile ? '100%' : 300 }}>
          <TextField
            variant="outlined"
            placeholder="Search templates..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              style: { height: 40 },
            }}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: isMobile ? '1 1 auto' : 'none', minWidth: isMobile ? '100%' : 'auto' }}>
          <Button
            variant="contained"
            onClick={handleExportClick}
            startIcon={<ExportIcon />}
            fullWidth={isMobile}
            sx={{ height: 40 }}
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleExportClose}>
            <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
            <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
            <MenuItem onClick={exportToCSV}>Export to CSV</MenuItem>
            <MenuItem onClick={handlePrint}>Print</MenuItem>
          </Menu>
        </Box>
      </Box>


      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Table sx={{
          '& .MuiTableCell-root': {
            border: '1px solid rgba(224, 224, 224, 1)',
            padding: '8px 12px',
            fontSize: '0.875rem'
          },
          '& .MuiTableCell-head': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold'
          }
        }} size="small">
          <TableHead>


            <TableRow>
              <TableCell style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>ID</TableCell>
              <TableCell style={{ minWidth: '150px' }}>TEMPLATE NAME</TableCell>
              <TableCell style={{ minWidth: '150px' }}>ROLE</TableCell>
              <TableCell style={{ minWidth: '150px' }}>POSITION</TableCell>
              <TableCell style={{ minWidth: '150px' }}>MANAGER</TableCell>
              <TableCell style={{ minWidth: '150px' }}>DEPARTMENT</TableCell>
              <TableCell style={{ minWidth: '150px' }}>PAYROLL TABLE</TableCell>
              <TableCell style={{ minWidth: '150px' }}>FOLLOWER</TableCell>
              <TableCell style={{ whiteSpace: 'nowrap', minWidth: '150px' }}>OPTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayrollTempData.length > 0 ? (
              filteredPayrollTempData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.id || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.payrollTemplateName || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.role || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.position || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.manager || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.departmentApplicable || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.payrollTable || '-'}</TableCell>
                  <TableCell style={{ whiteSpace: 'normal', wordWrap: 'break-word', textTransform: "uppercase", fontFamily: "Marquis" }}>{row.follower || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        onClick={() => handleEditPayrollTemp(row.id)}
                        color="primary"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        onClick={() => handleDeletePayrollTemp(row.id)}
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" style={{ fontStyle: 'italic' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Modal for Adding/Editing PayrollTemp */}
      <Dialog open={openPayrollTempModal} onClose={handleClosePayrollTempModal} maxWidth="sm" fullWidth>
           <Box sx={{ 
                bgcolor: '#142a4f', 
                color: 'white',
                px: 2, 
                py: 1, 
                borderRadius: 1,
                  textAlign: 'center' 
              }}>
   <DialogTitle>
          <Typography variant="h7" fontWeight="bold">
            {isEditing ? 'EDIT PAYROLL TEMPLATE' : 'NEW PAYROLL TEMPLATE'}
          </Typography>
        </DialogTitle>
                </Box>

     
        <DialogContent>
          <Grid container spacing={2} >
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Template Name"
                name="payrollTemplateName"
                value={newPayrollTemp.payrollTemplateName}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={newPayrollTemp.role}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={newPayrollTemp.position}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manager"
                name="manager"
                value={newPayrollTemp.manager}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                name="departmentApplicable"
                value={newPayrollTemp.departmentApplicable}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Payroll Table"
                name="payrollTable"
                value={newPayrollTemp.payrollTable}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              >
                <MenuItem value="Primary">Primary</MenuItem>
                <MenuItem value="Allowance">Allowance</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Follower"
                name="follower"
                value={newPayrollTemp.follower}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClosePayrollTempModal}
            color="primary"
            variant="outlined"
            startIcon={<Cancel />}

          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPayrollTemp}
            color="primary"
            variant="contained"
            startIcon={<Add />}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PayrollTemplate;