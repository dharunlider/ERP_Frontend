import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Chip, Tooltip, Tab, Tabs,
  Avatar,

} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../Axiosinstance';
import { lightBlue, green, orange, red, deepPurple } from '@mui/material/colors';
import {
  Close,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NoDataPage from '../Nodatapage';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMap, setTeamMap] = useState({});

  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/tasks');
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/project-Teams');
      setProjects(res.data || []);
      const map = {};
      res.data.forEach(p => map[p.id] = p.teamMembers || []);
      setTeamMap(map);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const handleEditClick = (task) => {
    console.log("vvvv:", task);

    // You need to reverse-lookup the project and assigned staff
    const projectEntry = projects.find(p => p.projectName === task.projectName);
    const projectId = projectEntry?.id || '';

    const team = teamMap[projectId] || [];
    const staffEntry = team.find(m => m.name === task.assignedToName);
    const assignedToId = staffEntry?.id || '';

    setEditTask({
      ...task,
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      project: projectId,
      assignedTo: assignedToId,
      dueDate: task.dueDate || ''
    });

    setEditOpen(true);
  };


  const handleEditChange = (field, value) => {
    setEditTask(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'project' ? { assignedTo: '' } : {})
    }));
  };

  const handleEditSave = async () => {
    try {
      const payload = {
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        project: { id: editTask.project },
        assignedTo: { id: editTask.assignedTo },
        dueDate: editTask.dueDate
      };
      await axios.put(`/tasks/${editTask.id}`, payload);
      toast.success('Task updated successfully!');
      setEditOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.details || err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.response?.data?.details || err.response?.data?.message || 'Failed to delete task');
    }
  };
  const statusColors = {
    'TODO': lightBlue[500],
    'IN_PROGRESS': orange[500],
    'DONE': green[500],
    'BLOCKED': deepPurple[500],
    'OVERDUE': red[500]
  };
  function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function getInitials(name) {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <Box >
      <Tabs
        variant="fullWidth"
        TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          bgcolor: '##142a4f',
          padding: '8px 12px',
          // borderRadius: '12px',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#ffffff',
            // borderRadius: '8px',
            padding: '6px 18px',
            // margin: '0 8px',
            backgroundColor: '#142a4f',
            cursor: 'default'


          },
        }}
      >
        <Tab label="TASK LIST" />
      </Tabs>

      <Paper elevation={0} sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <TableContainer >
          <Table stickyHeader size="small" sx={{
            minWidth: 650,
            '& .MuiTableCell-root': {
              border: '1px solid rgba(224, 224, 224, 1)',
              padding: '8px 12px',
              fontSize: '0.875rem',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontFamily: 'Marquis',
              textTransform: 'uppercase',
            },
            '& .MuiTableCell-head': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            },
            '& .MuiTableRow-root:nth-of-type(odd)': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            },
            '& .MuiTableRow-root:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>


                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task, index) => {
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                const status = isOverdue ? 'OVERDUE' : task.status;

                return (
                  <TableRow
                    key={index}
                    hover

                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                        {task.description || 'No description'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={status.split('_').join(' ')}
                        size="small"
                        sx={{
                          backgroundColor: statusColors[status] + '20',
                          color: statusColors[status],
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: stringToColor(task.projectName || ''),
                            fontSize: 12
                          }}
                        >
                          {getInitials(task.projectName || 'NA')}
                        </Avatar>
                        <Typography variant="body2">
                          {task.projectName || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>


                    <TableCell>
                      {task.assignedToName ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: stringToColor(task.assignedToName),
                              fontSize: 12
                            }}
                          >
                            {getInitials(task.assignedToName)}
                          </Avatar>
                          <Typography variant="body2">
                            {task.assignedToName}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={isOverdue ? 'error.main' : 'text.primary'}
                        fontWeight={isOverdue ? 500 : 400}
                      >
                        {formatDate(task.dueDate)}
                        {isOverdue && (
                          <Box component="span" sx={{ ml: 1, color: 'error.main' }}>
                            • Overdue
                          </Box>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditClick(task)}
                            size="small"
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(task.id)}
                            size="small"
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableCell colSpan={8} align="center">
              <NoDataPage />
            </TableCell>
          </Table>
        </TableContainer>
        <ToastContainer position="bottom-right" autoClose={1000} />
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>Edit Task</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Update task details</Typography>
          </Box>
          <IconButton onClick={() => setEditOpen(false)} sx={{ color: 'inherit' }}>
            <Close />
          </IconButton>
        </Box>
        <DialogContent
          sx={{
            backgroundColor: '#f5f7fa',
            px: 2,
            py: 2,
          }}
        >
          {editTask && (
            <Box
              sx={{
                backgroundColor: '#fff',
                borderRadius: 2,
                p: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <TextField
                label="Task Title"
                variant="outlined"
                fullWidth
                size="small"
                value={editTask.title}
                onChange={(e) => handleEditChange('title', e.target.value)}
              />

              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                size="small"
                value={editTask.description}
                onChange={(e) => handleEditChange('description', e.target.value)}
              />

              <Box display="flex" gap={2}>
                <TextField
                  label="Status"
                  select
                  fullWidth
                  size="small"
                  value={editTask.status}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                >
                  {['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Due Date"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={editTask.dueDate}
                  onChange={(e) => handleEditChange('dueDate', e.target.value)}
                />
              </Box>

              <Box display="flex" gap={2}>
                <TextField
                  label="Project"
                  select
                  fullWidth
                  size="small"
                  value={editTask.project}
                  onChange={(e) => handleEditChange('project', e.target.value)}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Assign To"
                  select
                  fullWidth
                  size="small"
                  disabled={!editTask.project}
                  value={editTask.assignedTo}
                  onChange={(e) => handleEditChange('assignedTo', e.target.value)}
                >
                  {(teamMap[editTask.project] || []).map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            py: 1,
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Button onClick={() => setEditOpen(false)} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Save Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;
