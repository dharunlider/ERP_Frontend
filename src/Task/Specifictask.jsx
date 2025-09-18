import React, { useEffect, useState } from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    Paper,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Box,
    Avatar,
    Chip,
    CircularProgress,
    Divider,Tab,Tabs
} from '@mui/material';
import axios from '../Axiosinstance';
import { format } from 'date-fns';

const Specifictask = () => {
    const [tasks, setTasks] = useState([{ project: '', assignedTo: '', availableStaffs: [] }]);
    const [projects, setProjects] = useState([]);
    const [staffTasks, setStaffTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [staffLoading, setStaffLoading] = useState(false);

    useEffect(() => {
        fetchProjectTeams();
    }, []);

    const fetchProjectTeams = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/project-Teams');
            setProjects(res.data || []);
        } catch (err) {
            console.error('Failed to fetch project teams:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffTasks = async (staffId) => {
        setStaffLoading(true);
        try {
            const res = await axios.get(`/tasks/staff/${staffId}`);
            setStaffTasks(res.data || []);
        } catch (err) {
            console.error('Failed to fetch tasks for staff:', err);
            setStaffTasks([]);
        } finally {
            setStaffLoading(false);
        }
    };

    const handleTaskChange = (index, field, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[index][field] = value;

        if (field === 'project') {
            const selectedProject = projects.find(p => p.id === Number(value));
            if (selectedProject) {
                const combinedStaff = [
                    { id: selectedProject.managerId, name: selectedProject.managerName },
                    { id: selectedProject.leadId, name: selectedProject.leadName },
                    ...(selectedProject.teamMembers || [])
                ];

                const uniqueStaff = Array.from(
                    new Map(combinedStaff.map(staff => [staff.id, staff])).values()
                );

                updatedTasks[index].availableStaffs = uniqueStaff;
                updatedTasks[index].assignedTo = '';
            } else {
                updatedTasks[index].availableStaffs = [];
                updatedTasks[index].assignedTo = '';
            }
        }

        if (field === 'assignedTo' && value) {
            fetchStaffTasks(value);
        }

        setTasks(updatedTasks);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in progress':
                return 'warning';
            case 'pending':
                return 'default';
            case 'overdue':
                return 'error';
            default:
                return 'info';
        }
    };

    return (
       <Paper elevation={3} sx={{ padding: 2, margin: 2, borderRadius: 2, overflow: 'hidden' }}>
  {/* Header Tabs */}
  <Tabs
    variant="fullWidth"
    TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
    sx={{
      '& .MuiTabs-flexContainer': {
        justifyContent: 'center',
        bgcolor: '#142a4f', // Fixed color code
        borderRadius: '12px',
        padding: 1,
      },
      '& .MuiTab-root': {
        textTransform: 'none',
        fontWeight: 'bold',
        fontSize: { xs: '14px', sm: '16px' }, // Responsive font
        color: '#ffffff',
        py: 1,
        px: 2,
        minHeight: 'auto',
        cursor: 'default',
        '&.Mui-selected': { color: '#fff' },
      },
    }}
  >
    <Tab label="TASK ASSIGNMENT DASHBOARD" />
  </Tabs>

  <Divider sx={{ my: 2 }} />

  {/* Task Assignment Section */}
  <Box sx={{ mb: 4 }}>
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
      ASSIGN TASKS TO TEAM MEMBERS
    </Typography>

    <Grid container spacing={2} sx={{ mt: 1 }}>
      {tasks.map((task, index) => (
        <React.Fragment key={index}>
          {/* Project Selector - Responsive columns */}
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              select
              label="Select Project"
              value={task.project}
              onChange={(e) => handleTaskChange(index, 'project', e.target.value)}
              variant="outlined"
              size="small"
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.projectName}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          {/* Team Member Selector */}
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              select
              label="Assign To Team Member"
              value={task.assignedTo}
              onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)}
              disabled={!task.availableStaffs?.length || loading}
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            >
              {task.availableStaffs?.length ? (
                task.availableStaffs.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Select a project first</MenuItem>
              )}
            </TextField>
          </Grid>

          {/* Add spacing on mobile between rows */}
          <Grid item xs={12} sx={{ display: { xs: 'block', sm: 'none' }, height: 8 }} />
        </React.Fragment>
      ))}
    </Grid>
  </Box>

  <Divider sx={{ my: 3 }} />

  {/* Assigned Tasks Table */}
  <Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
      ASSIGNED TASK DETAILS
    </Typography>

    {staffLoading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    ) : staffTasks.length > 0 ? (
      <Paper elevation={2} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <TableContainer>
          <Table
            size="small"
            stickyHeader
            sx={{
              minWidth: 650,
              '& .MuiTableCell-root': {
                border: '1px solid rgba(224, 224, 224, 1)',
                px: 1.5,
                py: 1,
                fontSize: '0.875rem',
              },
              '& .MuiTableCell-head': {
                bgcolor: '#f5f5f5',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell align="center">Title</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Project</TableCell>
                <TableCell align="center">Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffTasks.map((task, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 'medium' }}>{task.title}</TableCell>
                  <TableCell sx={{ 
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {task.description}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{task.projectName}</TableCell>
                  <TableCell>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    ) : (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography variant="body1" color="text.secondary">
          {tasks[0]?.assignedTo
            ? "No tasks found for the selected team member."
            : "Please select a project and team member to view their tasks."}
        </Typography>
      </Paper>
    )}
  </Box>
</Paper>
    );
};

export default Specifictask;