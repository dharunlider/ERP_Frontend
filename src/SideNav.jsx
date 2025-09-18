import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
} from "@mui/icons-material";
import Role from "./Role";
import RolePermission from "./RolePermission";
import { useNavigate } from "react-router-dom";
import Staff from "./HrmStaff/Staff.jsx";
import { logout } from "./Axiosinstance";
import Settings from "./HrmSettings.jsx/Settings.jsx";
import Contract from "./Contract/Contract";
import Footer from "./Constants/Footer";
import HrmSalaryPayslip from "./HrmSalary/HrmSalaryPayslip";
import Department from "./Department/Department.jsx";
import Dashboard from "./HrmDashboard/Dashboard.jsx";
import Insurance from "./HrmInsurance/Insurance.jsx";
import Timesheet from "./Attendance/Timesheet";
import OverallTimesheet from "./Attendance/OverallTimesheet.jsx";
import UserCreatedNotification from "./Notifications/UserCreatedNotification.jsx";
import { useNotification } from './Constants/NotificationContext';
import { fetchUnreadNotifications } from './Notifications/UserCreatedNotification';
import { sidebarItems } from './Constants/Constants';
import LeaveManagement from "./Attendance/LeaveManagement.jsx";
import AccountCircle from '@mui/icons-material/AccountCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import Shift from "./Attendance/Shift.jsx";
import ShiftCategories from "./Attendance/ShiftCategories";
import Workshift from "./Attendance/Workshift.jsx";
import Profile from './Profile/Profile.jsx';
import { useUser } from './Contexts/Usercontext.jsx';
import { filterSidebarItems } from './Constants/UtilFunctions';
import AnnualLeaveManage from './LeaveSettings/AnnualLeaveManage.jsx';
import OverView from './OverView.jsx';
import Reports from './Reports/LeaveSummary.jsx';
import OverTime from "./Attendance/OverTime.jsx";
import Allrequest from './PermissionLeave/AllRequests.jsx';
import Projects from './Project/Projects.jsx';
import Tasks from './Task/Tasks.jsx';
import Incentive from './Bouns/Incentive.jsx';
import Customer from './Customer/Customer.jsx';
import Product from './Product/Product.jsx'
import Events from './Events/Events.jsx'
import Order from './Product/Order.jsx';
import LeadsCustomers from './Customer/Leads_Customers.jsx';
import CustomerOrderHistory from './Product/CustomerOrderHistory.jsx';
import Procurement from './Procurements/Procurement.jsx';
import Expense from './Expense/Expense.jsx';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTab, setSelectedTab] = useState("OverView");
  const [openDropdown, setOpenDropdown] = useState({
    hrm: false,
    project1: false,
    product1: false,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  // const [ setNotificationAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [setNotifications] = useState([]);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const { unseenCount, setUnseenCount } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const { user, featurePermissions, role, authorities } = useUser();


  console.log(featurePermissions, "user")
  console.log(user, "user")


  const filteredSidebarItems = filterSidebarItems(sidebarItems, featurePermissions, role, authorities);

  useEffect(() => {
    fetchUnreadNotifications(setUnseenCount);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown((prev) => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleProfileMenuClick = () => {
    setModalOpen(true);
  };

  const handleNotificationDrawerToggle = () => {
    setNotificationDrawerOpen(!notificationDrawerOpen);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  const handleAddNotification = (message) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message,
      read: false,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };


  const navigate = useNavigate();
  const tabContent = {
    overView: <div></div>,
    hrmDashboard: <Dashboard />,
    staff: <Staff />,
    contract: <Role />,
    insurance: <Insurance />,
    Timesheet: <Timesheet />,
    salary: <HrmSalaryPayslip />,
    settings: <Settings />,
    projects: <Projects />,
    bouns: <Incentive />,
    Tasks: <Tasks />,
    Leave: <LeaveManagement />,
    overalltimesheet: <OverallTimesheet />,
    Reports: <Reports />,
    OverView: <OverView />,
    LeaveSettings: <AnnualLeaveManage />,
    PermissionLeave: < Allrequest />,
    shift: <Shift />,
    ShiftCategories: <ShiftCategories />,
    Profile: <Profile />,
    workshift: <Workshift />,
    OverTime: <OverTime />,
    NewOrder: <RolePermission
      onRoleCreated={(roleData) => { }}
      onSuccess={(message) => handleAddNotification(message)}
      onCancel={() => setSelectedTab("role")}
    />,
    role: <Role />,
    leads: <Role />,
    customers: <RolePermission
      onRoleCreated={(roleData) => { }}
      onSuccess={(message) => handleAddNotification(message)}
      onCancel={() => setSelectedTab("role")}
    />,
    contract: <Contract />,
    department: <Department />,
    Customer: <Customer />,
    Product: <Product />,
    events: <Events />,
    Order: <Order />,
    LeadsCustomers: <LeadsCustomers />,
        CustomerOrderHistory: <CustomerOrderHistory />,
            Procurement: <Procurement />,
            Expense: <Expense />
  };
  return (
    <Box sx={{ display: "flex", bgcolor: "#F0F4F8", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ backgroundColor: "#142a4f", zIndex: 1201, boxShadow: 3 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleSidebarToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src="/images/liderlogo.png"
            alt="Lider Logo"
            sx={{ height: 50, cursor: "pointer", mr: 2 }}
            onClick={() => navigate("/")}
          />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleNotificationDrawerToggle}>
            <Badge badgeContent={unseenCount} color="error">
              <NotificationsIcon sx={{ fontSize: 28 }} />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleProfileMenuOpen} sx={{ ml: 3 }}>
            <ProfileIcon sx={{ fontSize: 36 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClick}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <Profile open={modalOpen} onClose={handleCloseModal} />

            {/* TimeSheet */}
            {role && role.toLowerCase() !== "admin" && (
              <MenuItem onClick={() => {
                setSelectedTab("Timesheet");
                handleProfileMenuClose();
              }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                Timesheet
              </MenuItem>
            )}
            
            {/* Logout */}
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                logout();
                navigate("/");
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              Log Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Notifications Drawer */}
      <Drawer
        anchor="right"
        open={notificationDrawerOpen}
        onClose={handleNotificationDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 350,
            backgroundColor: "#142a4f",
            pt: "64px",
          },
        }}
      >
        <UserCreatedNotification />
      </Drawer>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? 280 : 74,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarOpen ? 280 : 74,
            backgroundColor: "#142a4f",
            color: "#fff",
            transition: "width 0.3s",
            overflowX: "hidden",
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {filteredSidebarItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem
                button
                onClick={() => handleTabChange(item.tab)}
                sx={{
                  display: "flex",
                  flexDirection: sidebarOpen ? "row" : "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 1.3,
                  mb: 0.5,
                  px: sidebarOpen ? 2 : 1,
                  backgroundColor: selectedTab === item.tab ? "#5794eb" : "inherit",
                  color: selectedTab === item.tab ? "#fffff" : "#fffff",
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#5794eb",
                    color: "#fff",
                  },
                  minHeight: 50,
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, color: "inherit", fontSize: 28, mb: sidebarOpen ? 0 : 0.5 }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen ? (
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: "bold", fontSize: 15 }}>
                        {item.text}
                      </Typography>
                    }
                    sx={{ ml: 2 }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ textAlign: "center", fontSize: 10, fontWeight: "bold" }}>
                    {item.text}
                  </Typography>
                )}
                {item.nestedItems && sidebarOpen && (
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDropdownToggle(item.tab); }} sx={{ ml: "auto", color: "inherit", p: 0 }}>
                    {openDropdown[item.tab] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </ListItem>
              {item.nestedItems && (
                <Collapse in={openDropdown[item.tab]} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {item.nestedItems.map((nestedItem) => (
                      <ListItem
                        button
                        key={nestedItem.text}
                        onClick={() => handleTabChange(nestedItem.tab)}
                        sx={{
                          pl: sidebarOpen ? 5 : 1,
                          py: 1,
                          backgroundColor: selectedTab === nestedItem.tab ? "#5794eb" : "inherit",
                          color: selectedTab === nestedItem.tab ? "#fffff" : "#cbd5e1",
                          borderRadius: 1,
                          justifyContent: "center",
                          flexDirection: sidebarOpen ? "row" : "column",
                          transition: "0.3s",
                          "&:hover": {
                            backgroundColor: "#5794eb",
                            color: "#fffff",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, fontSize: 22, color: "inherit", mb: sidebarOpen ? 0 : 0.5 }}>
                          {nestedItem.icon}
                        </ListItemIcon>
                        {sidebarOpen ? (
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: "bold", fontSize: 14 }}>
                                {nestedItem.text}
                              </Typography>
                            }
                            sx={{ ml: 2 }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: 9, textAlign: "center", fontWeight: "bold" }}>
                            {nestedItem.text}
                          </Typography>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // p: 3,
          mt: "64px",
          marginLeft: sidebarOpen ? (isMobile ? '0px' : '20px') : "0px",
          transition: "margin-left 0.3s",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "rgb(233, 248, 240)",
          // position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgb(233, 248, 240)",
            zIndex: -1,
          }
        }}
      >
        <Box sx={{
          backgroundColor: "rgb(233, 248, 240)",
          borderRadius: 2,
          boxShadow: 1,
          p: 3,
          minHeight: "calc(100vh - 128px)"
        }}>
          {tabContent[selectedTab]}
        </Box>
        <Box sx={{ py: 3 }}>
          <Footer />
        </Box>
      </Box>
    </Box>
  );

};

export default Layout;