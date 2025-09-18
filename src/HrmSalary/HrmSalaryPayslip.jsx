// Payslip.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Container, FormControl, InputLabel, Select, MenuItem,
  Paper, Tabs, Tab, useMediaQuery, useTheme
} from "@mui/material";
import axios from "../Axiosinstance";
import EmployeePayslip from "../HrmSalary/EmployeePayslip.jsx";
import { hasPermission } from '../Constants/UtilFunctions';
import { useUser } from '../Contexts/Usercontext.jsx';

const Payslip = () => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const { role, featurePermissions, userId } = useUser();
  const isAdmin = role === 'ADMIN';
  const canCreateSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'CREATE');
  const canViewSettings = isAdmin || hasPermission(featurePermissions, 'Settings', 'VIEW');
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selfStaffId, setSelfStaffId] = useState(null);

  const showEmployeeTab = canViewSettings;  // For ADMIN or those with 'Settings:VIEW'
  const showSelfTab = Boolean(userId);

  const tabList = [];

if (showEmployeeTab) tabList.push("EMPLOYEE PAYSLIP");
if (showSelfTab) tabList.push("MY SALARY SLIP");

const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchInitialData();
    setSelfStaffId(userId || null);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [staffRes, deptRes, roleRes] = await Promise.all([
        axios.get("/staff/allstaffs"),
        axios.get("/departments/all-departments"),
        axios.get("/roles/all"),
      ]);
      setAllStaff(staffRes.data);
      setDepartments(deptRes.data);
      setRoles(roleRes.data);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  // const fetchSelfStaffId = async () => {
  //     try {
  //         const res = await axios.get("/auth/me");
  //         console.log(res.data,"res.data")
  //         setSelfStaffId(res.data.staffId);
  //     } catch (err) {
  //         console.error("Failed to load self staff ID", err);
  //     }
  // };

  const filteredStaff = allStaff.filter(
    (s) =>
      (!selectedRole || s.roleName === selectedRole) &&
      (!selectedDept || s.departmentName === selectedDept)
  );

  const handleTabChange = (e, val) => {
    setActiveTab(val);
    setSelectedRole("");
    setSelectedDept("");
    setSelectedStaff("");
  };
  console.log(userId, "userid")
  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        TabIndicatorProps={{ style: { backgroundColor: "transparent" } }}
        sx={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          bgcolor: "#F0F4F8",
          padding: "8px 12px",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#142a4f",
            padding: "6px 18px",
            backgroundColor: "#ffffff",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundColor: "#e6ecf3",
            },
            "&.Mui-selected": {
              backgroundColor: "#142a4f",
              color: "#ffffff",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            },
          },
        }}
      >
         {tabList.map((label, index) => (
    <Tab key={index} label={label} />
  ))}
      </Tabs>

     {tabList[activeTab] === "EMPLOYEE PAYSLIP" && (
        <Container maxWidth={false} sx={{ py: 4, px: isMobile ? 2 : 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              display: "flex",
              flexDirection: "row",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >

            <FormControl size="medium" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedStaff("");
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.roleId} value={role.roleName}>
                    {role.roleName.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="medium" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDept}
                label="Department"
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedStaff("");
                }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.name}>
                    {dept.name.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="medium" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>Staff</InputLabel>
              <Select
                value={selectedStaff}
                label="Staff"
                onChange={(e) => setSelectedStaff(e.target.value)}
              >
                {filteredStaff.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          {selectedStaff && (
            <EmployeePayslip staffId={selectedStaff} withFilters={true} />
          )}
        </Container>
      )}

     {tabList[activeTab] === "MY SALARY SLIP" && userId && (
        <Container maxWidth={false} sx={{ py: 4, px: isMobile ? 2 : 4 }}>
          <EmployeePayslip staffId={selfStaffId} withFilters={false} />
        </Container>
      )}
    </>
  );
};

export default Payslip;
