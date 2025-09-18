import React, { useEffect, useState } from "react";
import axios from "../Axiosinstance";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Grid,
    Paper,
    Button,
} from "@mui/material";
import { toast } from "react-toastify";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts";
import { useTheme, useMediaQuery } from "@mui/material";



const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57"];

const AttendanceChart = () => {
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [allStaffOptions, setAllStaffOptions] = useState([]);
    const [filteredStaffOptions, setFilteredStaffOptions] = useState([]);
    const [department, setDepartment] = useState("");
    const [role, setRole] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    // Inside your component
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDropdowns = async () => {
        try {
            const [staffRes, deptRes, rolesRes] = await Promise.all([
                axios.get("/staff/allstaffs"),
                axios.get("/departments/all-departments"),
                axios.get("/roles/all"),
            ]);
            console.log(rolesRes.data, "rolesRes");
            setAllStaffOptions(staffRes.data || []);
            setDepartments(deptRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error("Dropdown API fetch error:", error);
        }
    };

    const fetchChartData = async (staffId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/approval-process/percentage-leaves/${staffId}`);
            const leaves = res.data.percentageLeavesTaken || {};

            const formatted = Object.entries(leaves).map(([type, value]) => ({
                leaveType: type.replace(/_/g, " "),
                percentage: parseFloat(value.replace("%", "")),
            }));

            setChartData(formatted);

            if (formatted.length === 0) {
                toast.error("No leave data found for the selected staff.");
            }
        } catch (err) {
            toast.error("Error fetching leave chart data.");
            console.error(err);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    const resetData = () => {
        setChartData([]);
    };

    const handleFilter = async () => {
        if (!department || !role || !selectedStaff) {
            resetData();
            toast.error("Please select department, role and staff");
            return;
        }

        await fetchChartData(selectedStaff);
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (department && role) {
            // Find the selected department and role objects
            const selectedDept = departments.find(d => String(d.id) === String(department));
            const selectedRole = roles.find(r => String(r.roleId) === String(role));

            const filtered = allStaffOptions.filter(
                (staff) =>
                    staff.departmentName === selectedDept?.name &&
                    staff.roleName === selectedRole?.roleName
            );

            setFilteredStaffOptions(filtered);

            if (filtered.length === 0) {
                toast.error("No staff found for the selected department and role");
            }

            if (selectedStaff && !filtered.some((s) => String(s.id) === String(selectedStaff))) {
                setSelectedStaff("");
            }
        } else {
            setFilteredStaffOptions([]);
            setSelectedStaff("");
        }
    }, [department, role, allStaffOptions, departments, roles, selectedStaff]);


    return (
        <Box m={2}>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Staff Leave Usage
                </Typography>

                <Grid container spacing={2} mt={1}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                label="Department"
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={String(dept.id)}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                label="Role"
                            >
                                {roles.map((roleItem) => (
                                    <MenuItem key={roleItem.roleId} value={String(roleItem.roleId)}>
                                        {roleItem.roleName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Staff</InputLabel>
                            <Select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                label="Staff"
                                disabled={filteredStaffOptions.length === 0}
                            >
                                {filteredStaffOptions.length > 0 ? (
                                    filteredStaffOptions.map((staff) => (
                                        <MenuItem key={staff.id} value={staff.id}>
                                            {staff.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled value="">
                                        {department && role ? "No staff available" : "Select department & role first"}
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Box mt={2} textAlign="right">
                    <Button variant="contained" onClick={handleFilter}>
                        View Chart
                    </Button>
                </Box>

                <Box
                    height={isMobile ? 300 : 400}
                    width="100%"
                    position="relative"
                >
                    {loading ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <CircularProgress />
                        </Box>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    top: 10,
                                    right: isMobile ? 10 : 30,
                                    left: isMobile ? 30 : 60,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tickFormatter={(tick) => `${tick}%`}
                                    label={{
                                        value: "Usage %",
                                        position: "insideBottomRight",
                                        offset: -5,
                                        fill: "#666",
                                        fontSize: isMobile ? 10 : 12,
                                    }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="leaveType"
                                    width={isMobile ? 100 : 160}
                                    tick={{ fontSize: isMobile ? 10 : 14, fill: "#333" }}
                                />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend />
                                <Bar dataKey="percentage" barSize={isMobile ? 18 : 22}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography
                            align="center"
                            color="textSecondary"
                            mt={6}
                            fontStyle="italic"
                        >
                            Please select filters and click "View Chart" to display data.
                        </Typography>
                    )}
                </Box>

            </Paper>
        </Box>
    );
};

export default AttendanceChart;
