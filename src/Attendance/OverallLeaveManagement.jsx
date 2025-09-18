  import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Card, CardContent,
  Chip, Button, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, TextField,
  InputAdornment, Menu, MenuItem, FormControl,
  InputLabel, Select, useMediaQuery, useTheme,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon, CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon, Pending as PendingIcon,
  EventNote as LeaveIcon, Visibility as ReportIcon,
  History as HistoryIcon, Close as CloseIcon,
  Search as SearchIcon, FileDownload as ExportIcon,
  FilterList as FilterIcon, MoreVert as MoreIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

const PAGE_SIZE = 10; // Number of items to load per page

const OverallLeaveManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tableContainerRef = useRef(null);

  // Sample data - replace with your actual data source
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      department: "Development",
      leaveDates: "15/06/2023 - 17/06/2023",
      days: 3,
      reason: "Family function",
      status: "Approved",
      approvedBy: "Manager Smith",
      leaveType: "PL",
      photo: "",
      joiningDate: "15/03/2021"
    },
  ]);
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // State for dialogs
  const [openReport, setOpenReport] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  // Simulate loading more data
  useEffect(() => {
    if (page === 1) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // For demo purposes, we'll just stop loading after page 5
      if (page >= 5) {
        setHasMore(false);
      }
    }, 1000);
  }, [page]);

  // Add scroll event listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Calculate statistics
  const totalEmployees = employees.length;
  const leaveApplied = employees.length;
  const pendingApproval = employees.filter(e => e.status === "Pending").length;
  const approvedLeaves = employees.filter(e => e.status === "Approved").length;
  const rejectedLeaves = employees.filter(e => e.status === "Rejected").length;
  const onLeaveToday = employees.filter(e => {
    // Check if today's date falls within any leave dates (simplified for demo)
    const today = new Date();
    const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    return e.status === "Approved" && e.leaveDates.includes(todayStr);
  }).length;

  // Get unique departments and status options
  const departments = [...new Set(employees.map(emp => emp.department))];
  const leaveTypes = [...new Set(employees.map(emp => emp.leaveType))];
  const statusOptions = ['All', 'Approved', 'Pending', 'Rejected'];

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter;
    const matchesLeaveType = leaveTypeFilter === 'All' || employee.leaveType === leaveTypeFilter;

    return matchesSearch && matchesStatus && matchesDepartment && matchesLeaveType;
  });

  // For demo purposes, we'll paginate the filtered data
  const displayedData = filteredEmployees.slice(0, page * PAGE_SIZE);

  // Export functions
  const handleExport = (type) => {
    const exportData = displayedData.map(emp => ({
      Name: emp.name,
      Department: emp.department,
      'Leave Dates': emp.leaveDates,
      Days: emp.days,
      Reason: emp.reason,
      'Leave Type': emp.leaveType,
      Status: emp.status,
      'Approved By': emp.approvedBy || ''
    }));

    if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave_Management");
      XLSX.writeFile(workbook, "Leave_Management_Report.xlsx");
    } else if (type === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(exportData));
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "Leave_Management_Report.csv";
      link.click();
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // Generate complete leave history for an employee (from joining date to present)
  const generateCompleteLeaveHistory = (employee) => {
    const history = [];
    const today = new Date();
    const joiningDate = new Date(employee.joiningDate.split('/').reverse().join('/'));

    // Generate random data for demonstration
    for (let d = new Date(joiningDate); d <= today; d.setMonth(d.getMonth() + 1)) {
      // Randomly decide if employee took leave this month
      if (Math.random() > 0.7) {
        const leaveDays = Math.floor(Math.random() * 3) + 1;
        const startDate = new Date(d);
        startDate.setDate(Math.floor(Math.random() * 15) + 1);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + leaveDays - 1);

        const leaveTypes = ["PL", "CL", "ML", "EL"];
        const statusOptions = ["Approved", "Approved", "Approved", "Rejected", "Pending"];
        const approvers = ["Manager Smith", "HR Manager", "Director Brown", ""];

        history.push({
          id: Math.random().toString(36).substring(7),
          date: `${startDate.getDate().toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}/${startDate.getFullYear()} - ${endDate.getDate().toString().padStart(2, '0')}/${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate.getFullYear()}`,
          days: leaveDays,
          reason: ["Family function", "Medical", "Personal work", "Vacation", "Wedding", "Family emergency"][Math.floor(Math.random() * 6)],
          status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
          approvedBy: approvers[Math.floor(Math.random() * approvers.length)],
          leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)]
        });
      }
    }

    return history;
  };

  // Filter the complete history based on selected filters
  const filteredHistory = selectedEmployee?.completeHistory?.filter(record => {
    const recordDate = new Date(record.date.split(' - ')[0].split('/').reverse().join('-'));
    const startDate = reportStartDate ? new Date(reportStartDate) : null;
    const endDate = reportEndDate ? new Date(reportEndDate) : null;

    const matchesDate =
      (!startDate || recordDate >= startDate) &&
      (!endDate || recordDate <= endDate);

    const matchesStatus = reportStatusFilter === 'All' || record.status === reportStatusFilter;

    return matchesDate && matchesStatus;
  });

  // Export function for employee report
  const handleExportEmployeeReport = (employee) => {
    if (!employee || !filteredHistory) return;

    const exportData = filteredHistory.map(record => ({
      'Leave Dates': record.date,
      Days: record.days,
      Reason: record.reason,
      'Leave Type': record.leaveType,
      Status: record.status,
      'Approved By': record.approvedBy || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave_History");
    XLSX.writeFile(workbook, `${employee.name}_Leave_Report.xlsx`);
  };

  // Handle opening reports
  const handleOpenReport = (employee) => {
    setSelectedEmployee({
      ...employee,
      completeHistory: generateCompleteLeaveHistory(employee)
    });
    setOpenReport(true);
  };

  const handleOpenHistory = (employee) => {
    setSelectedEmployee(employee);
    setOpenHistory(true);
  };

  // Handle closing dialogs
  const handleCloseReport = () => {
    setOpenReport(false);
    setSelectedEmployee(null);
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedEmployee(null);
  };

  // Handle edit menu
  const [editAnchorEl, setEditAnchorEl] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleMenuOpen = (event, employee) => {
    setEditAnchorEl(event.currentTarget);
    setEditingEmployee(employee);
  };

  const handleMenuClose = () => {
    setEditAnchorEl(null);
    setEditingEmployee(null);
  };

  // Handle status change
  const handleStatusChange = (employeeId, newStatus) => {
    setEmployees(employees.map(emp =>
      emp.id === employeeId ? { ...emp, status: newStatus } : emp
    ));
    handleMenuClose();
  };

  return (
    <Box>
      <Box mt={2} sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        gap: 2
      }}>
      </Box>
<Grid container spacing={isMobile ? 1 : 2} sx={{ width: '100%', mb: 4 }}>
  {[
    {
      icon: <PersonIcon sx={{ fontSize: isMobile ? 24 : 30, color: '#1976d2' }} />,
      title: "TOTAL EMPLOYEES",
      value: totalEmployees
    },
    {
      icon: <LeaveIcon sx={{ fontSize: isMobile ? 24 : 30, color: '#0288d1' }} />,
      title: "LEAVE APPLIED",
      value: leaveApplied
    },
    {
      icon: <PendingIcon sx={{ fontSize: isMobile ? 24 : 30, color: '#fbc02d' }} />,
      title: "PENDING APPROVAL",
      value: pendingApproval
    },
    {
      icon: <ApprovedIcon sx={{ fontSize: isMobile ? 24 : 30, color: '#388e3c' }} />,
      title: "APPROVED LEAVES",
      value: approvedLeaves
    },
    {
      icon: <RejectedIcon sx={{ fontSize: isMobile ? 24 : 30, color: '#d32f2f' }} />,
      title: "REJECTED LEAVES",
      value: rejectedLeaves
    },
    {
      icon: <PersonIcon sx={{ fontSize: isMobile ? 24 : 30, color: '#7b1fa2' }} />,
      title: "ON LEAVE TODAY",
      value: onLeaveToday
    }
  ].map((stat, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <Card
        elevation={3}
        sx={{
          borderLeft: `6px solid ${stat.icon.props.sx.color}`,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {stat.icon}
            <Typography variant="subtitle2" sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              fontSize: isMobile ? '0.75rem' : '0.85rem'
            }}>
              {stat.title}
            </Typography>
          </Box>

          <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
            {stat.value}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{
            fontSize: isMobile ? '0.65rem' : '0.75rem'
          }}>
            {/* You can optionally add a description here if desired */}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
      {/* Search and Filter Section - Responsive Layout */}
      <Box sx={{
        mb: 3,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <TextField
          size="small"
          placeholder="Search by name..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: isMobile ? '100%' : 250, bgcolor: 'white', }}
          fullWidth={isMobile}
        />

        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 180, bgcolor: 'white', }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            {statusOptions.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 180, bgcolor: 'white', }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            label="Department"
          >
            <MenuItem value="All">All Departments</MenuItem>
            {departments.map(dept => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 180, bgcolor: 'white', }}>
          <InputLabel>Leave Type</InputLabel>
          <Select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            label="Leave Type"
          >
            <MenuItem value="All">All Types</MenuItem>
            {leaveTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('All');
            setDepartmentFilter('All');
            setLeaveTypeFilter('All');
          }}
          fullWidth={isMobile}
          sx={{ bgcolor: 'white' }}
        >
          Clear Filters
        </Button>
      </Box>

      {/* Leave Management Summary Table */}
      <Typography variant={isMobile ? "h6" : "h5"} style={{
        textTransform: "uppercase",
        fontFamily: "Marquis",
        fontWeight: "bold",
        marginBottom: '16px'
      }}>
        Leave Management Summary
      </Typography>

      {/* Table Container with Sticky Headers and Infinite Scroll */}
      <Box sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        height: isMobile ? '60vh' : '70vh',
        mb: 3
      }}>
        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          sx={{
            maxHeight: isMobile ? '60vh' : '70vh',
            position: 'relative',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '3px'
            }
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              '& .MuiTableCell-root': {
                border: '1px solid rgba(224, 224, 224, 1)',
                padding: isMobile ? '6px 8px' : '8px 12px',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontFamily: "Roboto"
              },
              '& .MuiTableCell-head': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                '&:first-of-type': {
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  backgroundColor: '#f5f5f5 !important'
                },
                '&:last-child': {
                  position: 'sticky',
                  right: 0,
                  zIndex: 3,
                  backgroundColor: '#f5f5f5 !important'
                }
              },
              '& .MuiTableRow-root': {
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>EMPLOYEE</TableCell>
                {!isMobile && <TableCell>DEPARTMENT</TableCell>}
                <TableCell>LEAVE DATES</TableCell>
                <TableCell>DAYS</TableCell>
                {!isMobile && <TableCell>REASON</TableCell>}
                <TableCell>LEAVE TYPE</TableCell>
                <TableCell>STATUS</TableCell>
                {!isMobile && <TableCell>APPROVED BY</TableCell>}
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedData.length > 0 ? (
                displayedData.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell sx={{
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'white',
                      zIndex: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{
                          width: isMobile ? 24 : 32,
                          height: isMobile ? 24 : 32,
                          mr: 1
                        }}>
                          {employee.photo ?
                            <img src={employee.photo} alt={employee.name} /> :
                            <PersonIcon fontSize="small" />
                          }
                        </Avatar>
                        <Typography style={{
                          textTransform: "uppercase",
                          fontFamily: "Marquis",
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }}>
                          {isMobile ? employee.name.split(' ')[0] : employee.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    {!isMobile && (
                      <TableCell style={{
                        textTransform: "uppercase",
                        fontFamily: "Marquis"
                      }}>
                        {employee.department}
                      </TableCell>
                    )}
                    <TableCell style={{
                      textTransform: "uppercase",
                      fontFamily: "Marquis",
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}>
                      {employee.leaveDates}
                    </TableCell>
                    <TableCell style={{
                      textTransform: "uppercase",
                      fontFamily: "Marquis",
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}>
                      {employee.days}
                    </TableCell>
                    {!isMobile && (
                      <TableCell style={{
                        textTransform: "uppercase",
                        fontFamily: "Marquis",
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}>
                        {employee.reason}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={employee.leaveType}
                        color="primary"
                        size="small"
                        sx={{
                          fontSize: isMobile ? '0.6rem' : '0.75rem',
                          minWidth: isMobile ? 40 : 80
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isMobile ?
                          (employee.status === "Approved" ? "A" :
                            employee.status === "Pending" ? "P" : "R") :
                          employee.status}
                        color={
                          employee.status === "Approved" ? "success" :
                            employee.status === "Pending" ? "warning" : "error"
                        }
                        size="small"
                        sx={{
                          fontSize: isMobile ? '0.6rem' : '0.75rem',
                          minWidth: isMobile ? 40 : 80
                        }}
                      />
                    </TableCell>
                    {!isMobile && (
                      <TableCell style={{
                        textTransform: "uppercase",
                        fontFamily: "Marquis",
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}>
                        {employee.approvedBy || "-"}
                      </TableCell>
                    )}
                    <TableCell sx={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: 'white',
                      zIndex: 1
                    }}>
                      <Box display="flex" alignItems="center">
                        <Tooltip title="View Full Report">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenReport(employee)}
                            color="primary"
                          >
                            <ReportIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Previous Leave History">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenHistory(employee)}
                            color="secondary"
                          >
                            <HistoryIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Tooltip>

                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, employee)}
                        >
                          <MoreIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>

                        <Menu
                          anchorEl={editAnchorEl}
                          open={Boolean(editAnchorEl && editingEmployee?.id === employee.id)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleStatusChange(employee.id, "Approved")}>
                            <ApprovedIcon color="success" sx={{ mr: 1 }} /> Approve
                          </MenuItem>
                          <MenuItem onClick={() => handleStatusChange(employee.id, "Rejected")}>
                            <RejectedIcon color="error" sx={{ mr: 1 }} /> Reject
                          </MenuItem>
                          <MenuItem onClick={() => handleStatusChange(employee.id, "Pending")}>
                            <PendingIcon color="warning" sx={{ mr: 1 }} /> Set as Pending
                          </MenuItem>
                        </Menu>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 9} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No employees match your search criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 9} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!hasMore && displayedData.length > 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 6 : 9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No more records to show
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Full Leave Report Dialog */}
      <Dialog
        open={openReport}
        onClose={handleCloseReport}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant={isMobile ? "h6" : "h5"} style={{
              textTransform: "uppercase",
              fontFamily: "Marquis"
            }}>
              {selectedEmployee?.name}'s Complete Leave History
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<ExportIcon />}
                onClick={() => handleExportEmployeeReport(selectedEmployee)}
                sx={{ mr: 1 }}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? "Export" : "Export Report"}
              </Button>
              <IconButton onClick={handleCloseReport} size={isMobile ? "small" : "medium"}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEmployee && (
            <Box>
              <Box display="flex" alignItems="center" mb={3} style={{
                textTransform: "uppercase",
                fontFamily: "Marquis",
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <Avatar sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  mr: isMobile ? 0 : 2,
                  mb: isMobile ? 1 : 0
                }}>
                  {selectedEmployee.photo ?
                    <img src={selectedEmployee.photo} alt={selectedEmployee.name} /> :
                    <PersonIcon fontSize="large" />
                  }
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"}>{selectedEmployee.name}</Typography>
                  <Typography variant={isMobile ? "body1" : "subtitle1"}>{selectedEmployee.department}</Typography>
                  <Typography variant="body2">Joining Date: {selectedEmployee.joiningDate}</Typography>
                </Box>
              </Box>

              <Box
                mb={3}
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {[{
                  label: 'Start Date',
                  value: reportStartDate,
                  onChange: setReportStartDate
                }, {
                  label: 'End Date',
                  value: reportEndDate,
                  onChange: setReportEndDate
                }].map((field, idx) => (
                  <TextField
                    key={idx}
                    size="small"
                    type="date"
                    label={field.label}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: isMobile ? '100%' : 180 }}
                    fullWidth={isMobile}
                  />
                ))}

                <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 180 }} fullWidth={isMobile}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={reportStatusFilter}
                    label="Status"
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                  >
                    {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status === 'All' ? 'All Statuses' : status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setReportStartDate('');
                    setReportEndDate('');
                    setReportStatusFilter('All');
                  }}
                  fullWidth={isMobile}
                >
                  Clear Filters
                </Button>
              </Box>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom style={{
                    textTransform: "uppercase",
                    fontFamily: "Marquis"
                  }}>
                    <strong>Leave Summary:</strong>
                  </Typography>
                  <Typography>Total Leaves Taken: {filteredHistory?.length || 0}</Typography>
                  <Typography>Approved Leaves: {filteredHistory?.filter(h => h.status === "Approved").length || 0}</Typography>
                  <Typography>Rejected Leaves: {filteredHistory?.filter(h => h.status === "Rejected").length || 0}</Typography>
                  <Typography>Pending Leaves: {filteredHistory?.filter(h => h.status === "Pending").length || 0}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom style={{
                    textTransform: "uppercase",
                    fontFamily: "Marquis"
                  }}>
                    <strong>Current Leave Status:</strong>
                  </Typography>
                  <Typography>Current Status:
                    <Chip
                      label={selectedEmployee.status}
                      color={
                        selectedEmployee.status === "Approved" ? "success" :
                          selectedEmployee.status === "Pending" ? "warning" : "error"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography>Leave Dates: {selectedEmployee.leaveDates}</Typography>
                  <Typography>Days: {selectedEmployee.days}</Typography>
                  <Typography>Reason: {selectedEmployee.reason}</Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom style={{
                textTransform: "uppercase",
                fontFamily: "Marquis"
              }}>
                <strong>Complete Leave History:</strong>
              </Typography>
              <Box sx={{
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                height: isMobile ? '40vh' : '50vh'
              }}>
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: isMobile ? '40vh' : '50vh',
                    position: 'relative',
                    // overflow: 'auto'
                  }}   
                >
                  <Table
                    stickyHeader
                    size="small"
                    sx={{
                      '& .MuiTableCell-root': {
                        border: '1px solid rgba(224, 224, 224, 1)',
                        // padding: isMobile ? '6px 8px' : '8px 12px',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        fontFamily: "Roboto"
                      },
                      '& .MuiTableCell-head': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>LEAVE DATES</TableCell>
                        <TableCell>DAYS</TableCell>
                        <TableCell>REASON</TableCell>
                        <TableCell>LEAVE TYPE</TableCell>
                        <TableCell>STATUS</TableCell>
                        <TableCell>APPROVED BY</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory?.length > 0 ? (
                        filteredHistory.map((record, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.days}</TableCell>
                            <TableCell>{record.reason}</TableCell>
                            <TableCell>
                              <Chip label={record.leaveType} color="primary" size="small" />
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={record.status}
                                color={
                                  record.status === "Approved" ? "success" :
                                    record.status === "Pending" ? "warning" : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{record.approvedBy || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body1" color="text.secondary">
                              No records match your filters
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReport} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Previous Leave History Dialog */}
      <Dialog
        open={openHistory}
        onClose={handleCloseHistory}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center" style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
            <Typography variant={isMobile ? "h6" : "h5"}>
              {selectedEmployee?.name}'s Previous Leave History
            </Typography>
            <IconButton onClick={handleCloseHistory} size={isMobile ? "small" : "medium"}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box>
              <Box display="flex" alignItems="center" mb={3} style={{
                textTransform: "uppercase",
                fontFamily: "Marquis",
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <Avatar sx={{
                  width: isMobile ? 56 : 64,
                  height: isMobile ? 56 : 64,
                  mr: isMobile ? 0 : 2,
                  mb: isMobile ? 1 : 0
                }}>
                  {selectedEmployee.photo ?
                    <img src={selectedEmployee.photo} alt={selectedEmployee.name} /> :
                    <PersonIcon fontSize="large" />
                  }
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{selectedEmployee.name}</Typography>
                  <Typography variant={isMobile ? "body1" : "subtitle1"} style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>{selectedEmployee.department}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom style={{ textTransform: "uppercase", fontFamily: "Marquis" }}>
                <strong>Previous Leave Records:</strong>
              </Typography>

              <TableContainer component={Paper}>
                <Table sx={{
                  '& .MuiTableCell-root': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    padding: isMobile ? '6px 8px' : '8px 12px',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  },
                  '& .MuiTableCell-head': {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }
                }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Leave Dates</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Approved By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Sample data - replace with actual employee history */}
                    <TableRow>
                      <TableCell>01/05/2023 - 03/05/2023</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>Family function</TableCell>
                      <TableCell>PL</TableCell>
                      <TableCell>
                        <Chip label="Approved" color="success" size="small" />
                      </TableCell>
                      <TableCell>Manager Smith</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>15/04/2023</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>Medical checkup</TableCell>
                      <TableCell>ML</TableCell>
                      <TableCell>
                        <Chip label="Approved" color="success" size="small" />
                      </TableCell>
                      <TableCell>HR Manager</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10/03/2023 - 12/03/2023</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>Personal work</TableCell>
                      <TableCell>CL</TableCell>
                      <TableCell>
                        <Chip label="Rejected" color="error" size="small" />
                      </TableCell>
                      <TableCell>Director Brown</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OverallLeaveManagement;