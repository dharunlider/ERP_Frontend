import React, { useState, useEffect } from 'react';
import axios from "../Axiosinstance";
import { format, isSameDay, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Box, Button, TextField, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip, InputAdornment, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Add, Delete, Edit, Search, Event as EventIcon, Close as CloseIcon } from '@mui/icons-material';
import Nodatapage from "../Nodatapage";
import dayjs from 'dayjs';
import DocumentUploadField from '../Constants/DocumentUploadField';
import { uploadFileToCloudinary } from '../Constants/Documentuploadfunction';
import DocumentEditComponent from '../Constants/DocumentEditComponent';

const leaveTypes = [
  { value: "annualLeave", label: "Annual Leave" },
  { value: "sickLeave", label: "Sick Leave" },
  { value: "maternityLeave", label: "Maternity Leave" },
  { value: "paternityLeave", label: "Paternity Leave" },
  { value: "CompOff", label: "Compoff Leave" },
];

const ApprovalProcessTab = ({ value, isStaff, data = [], loading = false, refreshData = () => { } }) => {
  console.log(data, "sdasdasdad")
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject: '', related: '', department: '', role: '', notificationRecipient: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [allStaff, setAllStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [showCompoffModal, setShowCompoffModal] = useState(false);
  const [compoffType, setCompoffType] = useState('');
  const [nextDateAfterCompoff, setNextDateAfterCompoff] = useState('');
  const currentUserId = Number(JSON.parse(sessionStorage.getItem('userId')));
  const [maternityLeaveStart, setMaternityLeaveStart] = useState('');
  const [maternityLeaveEnd, setMaternityLeaveEnd] = useState('');
  const [staffOptions, setStaffOptions] = useState([]);
  const [documentEditOpen, setDocumentEditOpen] = useState(false);
  const [documentEditData, setDocumentEditData] = useState(null);

  // Define all the state variables that were missing
  const [documentCloudinaryUrl, setdocumentCloudinaryUrl] = useState(null);
  const [document, setdocument] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState({
    document: false,
  });
  const [documentError, setDocumentError] = useState({
    document: '',
  });

  useEffect(() => {
    setFilteredData(searchTerm.trim() === '' ? data :
      data.filter(item =>
        item.leaveAppliedStaffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notificationReceivedToName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.relatedReason?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  // Handler for file upload
  const handledocument = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const cloudinaryUrl = await uploadFileToCloudinary(file, 'document');
    if (cloudinaryUrl) {
      setdocumentCloudinaryUrl(cloudinaryUrl);
      setdocument(URL.createObjectURL(file));
      setFileName(file.name);
      toast.success('document uploaded successfully!');
    }
  };

  const handleRemoveDocument = (type) => {
    switch (type) {
      case 'document':
        setdocumentCloudinaryUrl(null);
        setdocument(null);
        setFileName('');
        break;
    }
  };

  const handleSave = async () => {
    if (formData.subject.length < 5 || formData.subject.length > 100) {
      toast.error('Subject should be between 5-100 characters');
      return;
    }

    const payload = {
      subject: formData.subject,
      fromDate: maternityLeaveStart,
      toDate: maternityLeaveEnd,
      relatedReason: formData.related === 'CompOff' ? 'CompOff' : formData.related,
      notificationReceivedTO: { id: formData.notificationRecipient },
      // Add the uploaded file URL to the payload
      document: documentCloudinaryUrl
    };

    if (formData.related === 'CompOff') {
      payload.compOffLeaveType = compoffType?.toUpperCase();

      if (compoffType === 'leave') {
        if (!nextDateAfterCompoff) {
          toast.error('Please select Compensation Working Date');
          return;
        }
        if (selectedDates.length === 0) {
          toast.error('Please select at least one date for compoff leave');
          return;
        }

        payload.daySelections = selectedDates.map(d => ({
          date: format(new Date(d.date), 'yyyy-MM-dd'),
          type: d.type,
          ...(d.type === 'HALF' && { startTime: d.fromTime, endTime: d.toTime })
        }));
        payload.compensatoryWork = format(new Date(nextDateAfterCompoff), 'yyyy-MM-dd');
      }
      else if (compoffType === 'incentive') {
        if (!nextDateAfterCompoff) {
          toast.error('Please select Compensatory Work Date');
          return;
        }
        payload.compensatoryWork = format(new Date(nextDateAfterCompoff), 'yyyy-MM-dd');
      }
    }
    else {
      payload.daySelections = selectedDates.map(d => ({
        date: format(new Date(d.date), 'yyyy-MM-dd'),
        type: d.type,
        ...(d.type === 'HALF' && { startTime: d.fromTime, endTime: d.toTime })
      }));
    }
    try {
      setSaving(true);
      const endpoint = editingId
        ? `/approval-process/${editingId}`
        : '/approval-process';

      const method = editingId ? 'put' : 'post';

      const response = await axios[method](endpoint, payload);

      toast.success(`Leave Application ${editingId ? 'updated' : 'created'} successfully!`);

      handleDialogClose();
      refreshData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(error.response?.data?.details || `Failed to ${editingId ? 'update' : 'create'} approval process`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get(`/project-Teams/lead-manager/${currentUserId}`);
        console.log("staff:", res.data);
        // const options = [
        //   { value: res.data.leadId, label: res.data.leadName, role: res.data.leadRole },
        //   { value: res.data.managerId, label: res.data.managerName, role: res.data.managerRole },
        // ];

         const flatOptions = res.data.flatMap(item => [
        { value: item.leadId, label: item.leadName, role: item.leadRole },
        { value: item.managerId, label: item.managerName, role: item.managerRole }
      ]);

       const options = flatOptions.reduce((acc, current) => {
        if (!acc.some(opt => opt.value === current.value)) {
          acc.push(current);
        }
        return acc;
      }, []);

        setStaffOptions(options);
        console.log(options, "staffOptions");
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };

    fetchStaff();
  }, []);

  const handleEdit = (index, row) => {
    const status = (row.status || 'PENDING').toUpperCase();
    const isApproved = status === 'APPROVED';

    // For approved requests, open the DocumentEditComponent
    if (isApproved) {
      setDocumentEditData({
        id: row.id,
        documentUrl: row.document
      });
      setDocumentEditOpen(true);
      return;
    }

    // Original edit logic for non-approved requests
    const recipientId = row.notificationReceivedTo?.id ||
      row.notificationReceiverId ||
      row.notoficationReceiverId;

    const staffMember = allStaff.find(s => s.id === recipientId) || {};
    const matchedLeaveType = leaveTypes.find(lt =>
      lt.label === row.relatedReason || lt.value === row.relatedReason
    );

    setFormData({
      subject: row.subject || '',
      related: matchedLeaveType?.value || leaveTypes[0]?.value || '',
      notificationRecipient: recipientId ? String(recipientId) : '',
    });

    setSelectedDates(row.daySelection?.map(day => ({
      date: new Date(day.date),
      type: day.type || (day.startTime ? 'HALF' : 'FULL'),
      fromTime: day.startTime || '',
      toTime: day.endTime || ''
    }) || []));

    setNextDateAfterCompoff(row.compensatoryWork ?
      format(new Date(row.compensatoryWork), 'yyyy-MM-dd') :
      '');

    const normalizedCompoffType = row.compOffLeaveType ?
      row.compOffLeaveType.toLowerCase() : '';
    setCompoffType(normalizedCompoffType);

    if (
      matchedLeaveType?.value === 'maternityLeave' ||
      row.relatedReason === 'maternityLeave'
    ) {
      setMaternityLeaveStart(
        row.fromDate ? format(new Date(row.fromDate), 'yyyy-MM-dd') : ''
      );
      setMaternityLeaveEnd(
        row.toDate ? format(new Date(row.toDate), 'yyyy-MM-dd') : ''
      );
    } else {
      setMaternityLeaveStart('');
      setMaternityLeaveEnd('');
    }

    // Set the attachment if it exists
    if (row.document) {
      setdocumentCloudinaryUrl(row.document);
      setdocument(row.document);
      setFileName(row.document.split('/').pop()); // Extract filename from URL
    }

    setEditingId(row.id);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/approval-process/${selectedRow.id}`);
      toast.success('Deleted successfully!');
      refreshData();
      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete!');
      console.error(error);
    }
  };

  const handleDeleteDate = async (approvalProcessId, date) => {
    try {
      await axios.delete(`/approval-process/${approvalProcessId}/day-selection?date=${date}`);
      setSelectedDates(selectedDates.filter(d => !isSameDay(new Date(d.date), new Date(date))));
      refreshData();
      toast.success('Date deleted successfully!');
    } catch (error) {
      console.error('Error deleting date:', error);
      toast.error('Failed to delete date');
    }
  };

  const handleRelatedChange = (value) => {
    if (value === 'CompOff') {
      setShowCompoffModal(true);
    } else {
      setFormData(prev => ({ ...prev, related: value }));
      setCompoffType('');
      setNextDateAfterCompoff('');
    }
  };

  const handleCompoffTypeSelect = (type) => {
    setCompoffType(type);
    setShowCompoffModal(false);
    setFormData(prev => ({ ...prev, related: 'CompOff' }));
    if (type === 'incentive') {
      setNextDateAfterCompoff('');
    } else if (type === 'leave') {
      setFormData(prev => ({ ...prev, additionalDate: '' }));
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({ subject: '', related: '', department: '', role: '', notificationRecipient: '', additionalDate: '' });
    setSelectedDates([]);
    setCompoffType('');
    setNextDateAfterCompoff('');
    // Reset file upload state
    setdocument(null);
    setdocumentCloudinaryUrl(null);
    setFileName('');
    setFileError('');
  };

  const handleRecipientChange = (e) => {
    const selectedId = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      notificationRecipient: selectedId === currentUserId ? '' : String(selectedId)
    }));
    if (value !== 'maternityLeave') {
      setMaternityLeaveStart('');
      setMaternityLeaveEnd('');
    }
  };

  const tableCellStyles = {
    border: '1px solid rgba(224, 224, 224, 1)',
    padding: '8px 12px',
    fontSize: '0.875rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontFamily: 'Marquis',
    textTransform: 'uppercase',
    wordBreak: 'break-word',
    '&.MuiTableCell-head': {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
  };

  const calendarStyles = {
    '& .react-calendar__month-view__days__day': {
      border: '1px solid #ccc',
      backgroundColor: '#f5eed5',
      height: 50,
      width: 50,
      textAlign: 'center',
      verticalAlign: 'middle',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'column',
    },
    '& .react-calendar__tile--now': { backgroundColor: '#d6d6eb' },
    '& .react-calendar__tile--active': { backgroundColor: '#c2c2e0 !important', color: '#000' },
    '& .react-calendar__month-view__weekdays__weekday': {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#FFFFFF',
      fontSize: '0.75rem',
      border: '1px solid #ccc',
      height: 50,
      width: 50,
      backgroundColor: '#1A2B48',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    '& .react-calendar__month-view__weekdays__weekday abbr': { textDecoration: 'none' },
    '@media (max-width: 600px)': { '& .react-calendar__month-view__days__day': { height: 50 } }
  };

  const dateBoxStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 2,
    p: 1.2,
    boxShadow: 1,
  };

  const chipStyle = {
    fontWeight: 500,
    fontSize: '0.875rem',
    px: 1,
    backgroundColor: '#e3f2fd',
    color: 'rgb(241, 62, 89)',
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ height: '40px', width: { xs: '100%', sm: 'auto' } }}
        >
          New
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ height: '40px', width: { xs: '100%', sm: '250px', md: '300px', lg: '250px' } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
      </Box>

      <TableContainer sx={{ maxHeight: 500, overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 650, '& .MuiTableCell-root': tableCellStyles }}>
          <TableHead>
            <TableRow>
              {['S.NO', 'NAME', 'LEAVE APPLIED ON', 'LEAVE TYPE', 'APPROVER', 'STATUS', 'NO OF DAYS', 'ACTIONS'].map(header => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((row, index) => {
              const status = (row.status || 'PENDING').toUpperCase();
              const isDisabled = status === 'APPROVED' || status === 'REJECTED';

              return (
                <TableRow hover key={row.id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.leaveAppliedStaffName}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.4,
                        alignItems: 'center',
                        minWidth: '200px',
                      }}
                    >
                      {['annualLeave', 'sickLeave', 'paternityLeave', 'EmergencyLeave'].includes(row.relatedReason) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {leaveTypes.find((lt) => lt.value === row.relatedReason)?.label || row.relatedReason}
                          </Typography>

                          {row.daySelection && row.daySelection.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, justifyContent: 'center' }}>
                              {row.daySelection.map((item, i) => (
                                <Chip
                                  key={i}
                                  label={
                                    item.date
                                      ? `${dayjs(item.date).format('DD MMM')}${item.type === 'HALF' ? ' (Half)' : ''
                                      }`
                                      : 'No date'
                                  }
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem' }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No date
                            </Typography>
                          )}
                        </Box>
                      )}

                      {row.relatedReason === 'CompOff' && (
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {row.compOffLeaveType || 'Comp Off'}
                          </Typography>
                          {row.compensatoryWork ? (
                            <Chip
                              label={dayjs(row.compensatoryWork).format('DD MMM YYYY')}
                              color="primary"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', mt: 0.4 }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No date
                            </Typography>
                          )}
                        </Box>
                      )}

                      {row.relatedReason === 'maternityLeave' && (
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {leaveTypes.find((lt) => lt.value === row.relatedReason)?.label || row.relatedReason}
                          </Typography>
                          {row.fromDate && row.toDate ? (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={
                                  dayjs(row.fromDate).isSame(dayjs(row.toDate), 'day')
                                    ? dayjs(row.fromDate).format('DD MMM')
                                    : `${dayjs(row.fromDate).format('DD MMM')} - ${dayjs(row.toDate).format('DD MMM')}`
                                }
                                color="primary"
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem' }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No date
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{row.relatedReason}</TableCell>
                  <TableCell>{row.notificationReceivedToName}</TableCell>
                  <TableCell>
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        backgroundColor:
                          status === 'APPROVED' ? '#4caf50' :
                            status === 'REJECTED' ? '#f44336' : '#9e9e9e',
                        color: '#fff',
                        textTransform: 'uppercase',
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.maximumNumberToAssign}</TableCell>
                  <TableCell>
                    <Tooltip title={status === 'APPROVED' ? "Edit Document" : isDisabled ? "Cannot edit when status is APPROVED or REJECTED" : "Edit"} arrow>
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => !isDisabled || status === 'APPROVED' ? handleEdit(index, row) : null}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={isDisabled ? "Cannot delete when status is APPROVED or REJECTED" : "Delete"} arrow>
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedRow(row);
                              setConfirmDialogOpen(true);
                            }
                          }}
                          disabled={isDisabled}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow><TableCell colSpan={8} align="center"><Nodatapage /></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this approval process?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Compoff Type Selection Modal */}
      <Dialog open={showCompoffModal} onClose={() => setShowCompoffModal(false)}>
        <DialogTitle>Select Compoff Type</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleCompoffTypeSelect('leave')}
              sx={{ flex: 1 }}
            >
              Leave
            </Button>
            <Button
              variant="contained"
              onClick={() => handleCompoffTypeSelect('incentive')}
              sx={{ flex: 1 }}
            >
              Incentive
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Document Edit Component */}
      <DocumentEditComponent
        open={documentEditOpen}
        onClose={() => setDocumentEditOpen(false)}
        editingId={documentEditData?.id}
        refreshData={refreshData}
        initialDocumentUrl={documentEditData?.documentUrl}
      />

      {/* Main Approval Process Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <IconButton onClick={handleDialogClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}>
          <CloseIcon />
        </IconButton>
        <DialogTitle>{editingId ? 'Edit Approval Process' : 'Add Approval Process'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Related</InputLabel>
                <Select
                  value={formData.related}
                  label="Related"
                  onChange={(e) => handleRelatedChange(e.target.value)}
                  renderValue={(selected) => {
                    const selectedOption = leaveTypes.find(lt => lt.value === selected);
                    return selected === 'CompOff' && compoffType
                      ? `${selectedOption?.label} (${compoffType})`
                      : selectedOption?.label || '';
                  }}
                >
                  {leaveTypes.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6} mb={2}>
              <TextField
                select
                fullWidth
                label="Assign Staff Notification"
                value={formData.notificationRecipient}
                onChange={handleRecipientChange}
                required
              >
                {staffOptions.length > 0 ? (
                  staffOptions
                    .filter((option) => Number(option.value) !== Number(currentUserId))
                    .map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Typography variant="body1">
                          {option.label} <Typography component="span" variant="caption" color="text.secondary">
                            ({option.role})
                          </Typography>
                        </Typography>
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>No staff available</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" style={{ fontFamily: "Marquis", marginBottom: '16px' }}>
                DOCUMENT UPLOADS
              </Typography>

              <DocumentUploadField
                title="Document"
                description="Upload document(PDF, JPG, PNG - max 10MB)"
                fileType="document"
                onUpload={handledocument}
                onRemove={() => handleRemoveDocument('document')}
                fileUrl={document}
                cloudinaryUrl={documentCloudinaryUrl}
                uploading={uploadingDocument.document}
                error={documentError.document}
                fileName={fileName}
                inputId="document-upload"
              />
            </Grid>

            {formData.related === 'CompOff' && (
              <>
                {compoffType === 'leave' ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Compensation Working Date"
                        type="date"
                        value={nextDateAfterCompoff}
                        onChange={(e) => setNextDateAfterCompoff(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                        inputProps={{
                          min: format(new Date(), 'yyyy-MM-dd')
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box mt={4} sx={calendarStyles}>
                        <Calendar
                          onClickDay={(date) => {
                            const newDate = new Date(date);
                            const index = selectedDates.findIndex(d => isSameDay(new Date(d.date), newDate));
                            if (index === -1) {
                              setSelectedDates([...selectedDates, { date: newDate, type: 'FULL' }]);
                            } else {
                              const updated = [...selectedDates];
                              updated[index].type = updated[index].type === 'FULL' ? 'HALF' : null;
                              setSelectedDates(updated.filter(d => d.type !== null));
                            }
                          }}
                          tileDisabled={({ date }) => isBefore(date, startOfDay(new Date()))}
                        />
                        <Box mt={2}>
                          {selectedDates.map((dates, i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                              <Box display="flex" alignItems="center" gap={1} sx={dateBoxStyle}>
                                <EventIcon color="primary" />
                                <Chip
                                  label={format(new Date(dates.date), 'yyyy-MM-dd')}
                                  variant="outlined"
                                  color="error"
                                  onDelete={() => editingId ?
                                    handleDeleteDate(editingId, format(new Date(dates.date), 'yyyy-MM-dd')) :
                                    setSelectedDates(selectedDates.filter((_, idx) => idx !== i))}
                                  deleteIcon={<Tooltip title="Remove date"><DeleteIcon /></Tooltip>}
                                  sx={chipStyle}
                                />
                                <TextField
                                  select
                                  size="small"
                                  value={dates.type}
                                  onChange={(e) => {
                                    const updated = [...selectedDates];
                                    updated[i].type = e.target.value;
                                    if (e.target.value === 'FULL') {
                                      updated[i].fromTime = '';
                                      updated[i].toTime = '';
                                    }
                                    setSelectedDates(updated);
                                  }}
                                >
                                  {['FULL', 'HALF'].map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                  ))}
                                </TextField>
                                {dates.type === 'HALF' && (
                                  <>
                                    <TextField
                                      size="small"
                                      type="time"
                                      label="From"
                                      value={dates.fromTime}
                                      onChange={(e) => {
                                        const updated = [...selectedDates];
                                        updated[i].fromTime = e.target.value;
                                        setSelectedDates(updated);
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                    <TextField
                                      size="small"
                                      type="time"
                                      label="To"
                                      value={dates.toTime}
                                      onChange={(e) => {
                                        const updated = [...selectedDates];
                                        updated[i].toTime = e.target.value;
                                        setSelectedDates(updated);
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  </>
                ) : compoffType === 'incentive' ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Compensatory Work Date"
                      type="date"
                      value={nextDateAfterCompoff}
                      onChange={(e) => setNextDateAfterCompoff(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                ) : null}
              </>
            )}

            {formData.related === 'maternityLeave' ? (
              <Grid item xs={12}>
                <Box mt={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={maternityLeaveStart || ''}
                      onChange={(e) => setMaternityLeaveStart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      inputProps={{
                        min: format(new Date(), 'yyyy-MM-dd')
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={maternityLeaveEnd || ''}
                      onChange={(e) => setMaternityLeaveEnd(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      inputProps={{
                        min: maternityLeaveStart || format(new Date(), 'yyyy-MM-dd')
                      }}
                    />

                  </Box>
                  {maternityLeaveStart && maternityLeaveEnd && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2">
                        Selected Period: {format(new Date(maternityLeaveStart), 'MMM d, yyyy')} to {format(new Date(maternityLeaveEnd), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="body2">
                        Total Days: {differenceInDays(new Date(maternityLeaveEnd), new Date(maternityLeaveStart)) + 1}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            ) : formData.related !== 'CompOff' && (
              <Grid item xs={12}>
                <Box mt={4} sx={calendarStyles}>
                  <Calendar
                    onClickDay={(date) => {
                      const newDate = new Date(date);
                      const index = selectedDates.findIndex(d => isSameDay(new Date(d.date), newDate));

                      if (index === -1) {
                        setSelectedDates([...selectedDates, { date: newDate, type: 'FULL' }]);
                      } else {
                        const updated = [...selectedDates];
                        updated[index].type = updated[index].type === 'FULL' ? 'HALF' : null;
                        setSelectedDates(updated.filter(d => d.type !== null));
                      }
                    }}
                    tileDisabled={({ date }) => isBefore(date, startOfDay(new Date()))}
                  />

                  <Box mt={2}>
                    {selectedDates.map((dates, i) => (
                      <Box key={i} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} sx={dateBoxStyle}>
                          <EventIcon color="primary" />
                          <Chip
                            label={format(new Date(dates.date), 'yyyy-MM-dd')}
                            variant="outlined"
                            color="error"
                            onDelete={() => editingId ?
                              handleDeleteDate(editingId, format(new Date(dates.date), 'yyyy-MM-dd')) :
                              setSelectedDates(selectedDates.filter((_, idx) => idx !== i))}
                            deleteIcon={<Tooltip title="Remove date"><DeleteIcon /></Tooltip>}
                            sx={chipStyle}
                          />
                          <TextField
                            select
                            size="small"
                            value={dates.type}
                            onChange={(e) => {
                              const updated = [...selectedDates];
                              updated[i].type = e.target.value;
                              if (e.target.value === 'FULL') {
                                updated[i].fromTime = '';
                                updated[i].toTime = '';
                              }
                              setSelectedDates(updated);
                            }}
                          >
                            {['FULL', 'HALF'].map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </TextField>
                          {dates.type === 'HALF' && (
                            <>
                              <TextField
                                size="small"
                                type="time"
                                label="From"
                                value={dates.fromTime}
                                onChange={(e) => {
                                  const updated = [...selectedDates];
                                  updated[i].fromTime = e.target.value;
                                  setSelectedDates(updated);
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                size="small"
                                type="time"
                                label="To"
                                value={dates.toTime}
                                onChange={(e) => {
                                  const updated = [...selectedDates];
                                  updated[i].toTime = e.target.value;
                                  setSelectedDates(updated);
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
          <Button onClick={handleDialogClose} variant="outlined" color="secondary">Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ ml: 2 }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="bottom-right" autoClose={1000} />
    </>
  );
};

export default ApprovalProcessTab;