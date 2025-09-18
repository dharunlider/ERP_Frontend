import React, { useEffect, useState } from 'react';
import {
    Box, TextField, MenuItem, Button, Grid, Paper, Tab, Tabs, Container,
    IconButton, Typography, Stack,
    Chip,
    FormControl,
    InputLabel,
    Select,
    InputAdornment
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import axios from '../Axiosinstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskOverview from './TaskOverview';
import {
    Assignment as AssignmentIcon,
    Title as TitleIcon,
    Notes as NotesIcon,
    Event as EventIcon,
    Add as AddIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import Specifictask from './Specifictask';

const TaskCompoundForm = () => {
    const [projects, setProjects] = useState([]);
    const [teams, setTeams] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const tabHeaders = ["TASK OVERVIEW", "TASK", "SPECIFIC TASK"];
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [taskList, setTaskList] = useState([
        {
            title: '',
            description: '',
            status: 'TODO',
            assignedTo: '',
            project: '',
            team: '',
            dueDate: ''
        }
    ]);

    useEffect(() => {
        axios.get('/project-Teams')
            .then(res => {
                console.log("team API response:", res.data);
                setTeams(res.data);
            })
            .catch(err => console.error('Failed to fetch teams:', err));
    }, []);

    useEffect(() => {
        axios.get('/projects')
            .then(res => {
                console.log("Projects API response:", res.data);
                setProjects(res.data);
            })
            .catch(err => console.error('Failed to fetch projects:', err));
    }, []);

    const handleChange = (index, field, value) => {
        const updated = [...taskList];
        updated[index][field] = value;
        if (field === 'project') {
            updated[index].assignedTo = '';
            updated[index].team = '';
        }
        if (field === 'team') {
            updated[index].assignedTo = '';
        }
        setTaskList(updated);
    };

    const addTaskForm = () => {
        setTaskList([
            ...taskList,
            {
                title: '',
                description: '',
                status: 'TODO',
                assignedTo: '',
                project: '',
                team: '',
                dueDate: ''
            }
        ]);
    };

    const removeTaskForm = (index) => {
        const updated = [...taskList];
        updated.splice(index, 1);
        setTaskList(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = taskList.map(task => ({
            title: task.title,
            description: task.description,
            status: task.status,
            assignedTo: { id: task.assignedTo },
            project: { id: task.project },
            dueDate: task.dueDate
        }));

        try {
            await axios.post('/tasks', payload);
            toast.success('Tasks created successfully!');
            setTaskList([{
                title: '',
                description: '',
                status: 'TODO',
                assignedTo: '',
                project: '',
                team: '',
                dueDate: ''
            }]);
        } catch (err) {
            console.error('Submit error:', err);
            toast.error(
                err.response?.data?.details ||
                err.response?.data?.message ||
                'Failed to submit tasks.'
            );
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons={isMobile ? 'auto' : false}
                allowScrollButtonsMobile
                TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    bgcolor: '#F0F4F8',
                    padding: '8px 12px',
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#142a4f',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.3s ease-in-out',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            backgroundColor: '#e6ecf3',
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#142a4f',
                            color: '#ffffff',
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                        },
                    },
                    '& .MuiTabs-scrollButtons': {
                        color: '#142a4f',
                    },
                }}
            >
                {tabHeaders.map((header, index) => (
                    <Tab key={index} label={header} />
                ))}
            </Tabs>

            <Paper style={{ padding: '14px', margin: '14px' }}>
                {activeTab === 0 && (
                    <Container maxWidth="xlg" sx={{ py: 2 }}>
                        <TaskOverview />
                    </Container>
                )}

                {activeTab === 1 && (
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            p: 4,
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    mb: 4,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    gap: 2,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                    }}
                                >
                                    <AssignmentIcon fontSize="large" color="primary" />
                                    TASK BATCH CREATOR
                                </Typography>

                                <Chip
                                    label={`${taskList.length} Task${taskList.length !== 1 ? 's' : ''}`}
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: 14,
                                    }}
                                />
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    {taskList.map((task, index) => {
                                        const taskProject = projects.find(p => p.id === task.project);
                                        const teamOptions = teams.filter(team =>
                                            team.projectName === taskProject?.name ||
                                            team.projectId === task.project
                                        );
                                        const memberOptions = teams.find(team => team.id === task.team)?.teamMembers || [];

                                        return (
                                            <Paper key={index} sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: 'background.paper',
                                                position: 'relative',
                                                '&:hover': {
                                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)'
                                                }
                                            }}>
                                                {taskList.length > 1 && (
                                                    <IconButton
                                                        onClick={() => removeTaskForm(index)}
                                                        sx={{
                                                            position: 'absolute',
                                                            right: 16,
                                                            top: 16,
                                                            color: 'error.main'
                                                        }}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                )}

                                                <Grid container spacing={2.5}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" sx={{
                                                            fontWeight: 600,
                                                            color: 'text.secondary',
                                                            mb: 1
                                                        }}>
                                                            Task #{index + 1}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Task title"
                                                            value={task.title}
                                                            onChange={(e) => handleChange(index, 'title', e.target.value)}
                                                            fullWidth
                                                            required
                                                            variant="filled"
                                                            size="small"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <TitleIcon color="action" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            label="Description"
                                                            value={task.description}
                                                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                                                            fullWidth
                                                            required
                                                            variant="filled"
                                                            size="small"
                                                            multiline
                                                            rows={2}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <NotesIcon color="action" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>


                                                    <Grid item xs={12} md={4}>
                                                        <FormControl fullWidth size="small" variant="filled">
                                                            <InputLabel>Project</InputLabel>
                                                            <Select
                                                                value={task.project}
                                                                onChange={(e) => handleChange(index, 'project', e.target.value)}
                                                            >

                                                                {projects.length > 0 ? (
                                                                    projects.map(project => (
                                                                        <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled>No projects available</MenuItem>
                                                                )
                                                                }
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} md={4}>
                                                        <FormControl fullWidth size="small" variant="filled" disabled={!task.project}>
                                                            <InputLabel>Team</InputLabel>
                                                            <Select
                                                                value={task.team || ''}
                                                                onChange={(e) => handleChange(index, 'team', e.target.value)}
                                                            >
                                                                {teamOptions.length > 0 ? (
                                                                    teamOptions.map(team => (
                                                                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled>No teams available</MenuItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} md={4}>
                                                        <FormControl fullWidth size="small" variant="filled" disabled={!task.team}>
                                                            <InputLabel>Assignee</InputLabel>
                                                            <Select
                                                                value={task.assignedTo || ''}
                                                                onChange={(e) => handleChange(index, 'assignedTo', e.target.value)}
                                                            >
                                                                {memberOptions.length > 0 ? (
                                                                    memberOptions.map(member => (
                                                                        <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>
                                                                    ))
                                                                ) : (
                                                                    <MenuItem disabled>No members available</MenuItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>


                                                    <Grid item xs={12} md={4}>
                                                        <FormControl fullWidth size="small" variant="filled">
                                                            <InputLabel>Status</InputLabel>
                                                            <Select
                                                                value={task.status}
                                                                onChange={(e) => handleChange(index, 'status', e.target.value)}
                                                                label="Status"
                                                            >
                                                                {['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'].map(status => (
                                                                    <MenuItem key={status} value={status}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Box sx={{
                                                                                width: 8,
                                                                                height: 8,
                                                                                borderRadius: '50%',
                                                                                bgcolor: status === 'TODO' ? 'grey.500' :
                                                                                    status === 'IN_PROGRESS' ? 'warning.main' : 'success.main'
                                                                            }} />
                                                                            {status.split('_').join(' ')}
                                                                        </Box>
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>


                                                    <Grid item xs={12} md={4}>
                                                        <TextField
                                                            type="date"
                                                            label="Due date"
                                                            InputLabelProps={{ shrink: true }}
                                                            value={task.dueDate}
                                                            onChange={(e) => handleChange(index, 'dueDate', e.target.value)}
                                                            fullWidth
                                                            variant="filled"
                                                            size="small"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <EventIcon color="action" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>

                                                </Grid>
                                            </Paper>
                                        );
                                    })}
                                </Stack>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'space-between',
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        mt: 4,
                                        pt: 3,
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={addTaskForm}
                                        sx={{
                                            px: 3,
                                            py: 1,
                                            borderRadius: 1,
                                            width: { xs: '100%', sm: 'auto' },
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                        }}
                                    >
                                        Add Task
                                    </Button>

                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            sx={{
                                                px: 4,
                                                boxShadow: 'none',
                                                width: { xs: '100%', sm: 'auto' },
                                                '&:hover': {
                                                    boxShadow: 'none',
                                                },
                                            }}
                                        >
                                            Create Tasks
                                        </Button>
                                    </Box>
                                </Box>
                            </form>
                        </Box>
                        <ToastContainer position="bottom-right" autoClose={1000} />
                    </Container>
                )}

                {activeTab === 2 && (
                    <Container maxWidth="xlg" sx={{ py: 2 }}>
                        <Specifictask />
                    </Container>
                )}
            </Paper>
        </>
    );
};

export default TaskCompoundForm;