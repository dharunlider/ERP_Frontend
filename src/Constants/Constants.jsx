import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PaidIcon from "@mui/icons-material/Paid";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CategoryIcon from "@mui/icons-material/Category";
import HistoryIcon from "@mui/icons-material/History";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from '@mui/icons-material/Event';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from '../Axiosinstance'


export const services = [
  {
    title: "HRM",
    description:
      "ERP simplifies HR tasks with employee record management, attendance tracking, leave automation, performance evaluation, training programs, and compliance management",
    // icon: CodeIcon,
    image: "HRM3.jpg",
    sx: { fontFamily: "Marquis", textAlign: "left" },
  },
  {
    title: "STAFF MANAGEMENT",
    description:
      "ERP system is By reducing manual tasks such as attendance tracking, payroll processing, and leave management, an ERP ensures that HR teams can focus on more strategic initiatives rather than repetitive administrative work.",
    // icon: Group,
    image: "Staffmanage.jpg",
    sx: { fontFamily: "Marquis" },
  },
  {
    title: "CLIENT MANAGEMENT",
    description:
      "ERP centralizes customer data, tracks leads, manages opportunities, provides support, automates marketing, and integrates with other systems, fostering customer engagement and driving business growth.",
    // icon: DesignServicesIcon,
    image: "Clientmanage.png",
    sx: { fontFamily: "Marquis" },
  },
];

export const scop = [
  {
    title: " HRM ",
    description:
      "Manage employee information, attendance, and performance efficiently",
    // icon: PersonIcon,
    image: "HRM2.jpg",
    sx: { fontFamily: "Marquis" },
  },
  {
    title: " CRM ",
    description:
      "Track and manage customer relationships, sales, and interactions seamlessly.",
    // icon: BusinessCenterIcon,
    image: "CRM.png",
    sx: { fontFamily: "Marquis" },
  },
  {
    title: "PRODUCT",
    description: "Handle inventory, product catalogs, and pricing efficiently, accurately, and seamlessly",
    // icon: ShoppingCartIcon,
    image: "Product1.png",
    sx: { fontFamily: "Marquis" },
  },
  {
    title: " LEADS ",
    description:
      "Track potential sales opportunities and manage leads effectively.",
    // icon: TrendingUpIcon,
    image: "Leads.jpg",
    sx: { fontFamily: "Marquis" },
  },
  {
    title: "TIMESHEET",
    description:
      "Record and manage employee work hours and project timesheets.",
    // icon: AccessTimeIcon,
    image: "Timesheet.png",
    sx: { fontFamily: "Marquis" },
  },
  {
    title: " RECRUITMENT ",
    description:
      "Recruitment processes, job postings, and applicant tracking seamlessly.",
    // icon: GroupsIcon,
    image: "recuritment.png",
    sx: { fontFamily: "Marquis" },
  },
];


export const features = [
  "Bulk PDF Export",
  "Contracts",
  "Customers",
  "Invoices",
  "Payments",
  "Projects",
  "Reports",
  "Settings",
  "Staff",
  "Products",
  "HRM",
  "TimesheetAttendance",
];

// Define the possible capabilities (permissions) for each feature
export const checkboxNames = {
  "Bulk PDF Export": ["View", "Create", "Edit", "Delete"],
  Contracts: ["View", "Create", "Edit", "Delete"],
  Customers: ["View", "Create", "Edit", "Delete"],
  Invoices: ["View", "Create", "Edit", "Delete"],
  Payments: ["View ", "Create", "Edit", "Delete"],
  Projects: [
    "View",
    "Create",
    "Edit",
    "Delete",
  ],
  Reports: ["View", "Create", "Edit", "Delete"],
  Settings: ["View", "Create", "Edit", "Delete"],
  Staff: ["View", "Create", "Edit", "Delete"],
  Products: ["View ", "Create", "Edit", "Delete"],
  HRM: ["View", "Create", "Edit", "Delete"],
  TimesheetAttendance: ["View", "Create", "Edit", "Delete"],
};

export const sidebarItems = [
  { text: "OVER VIEW", tab: "OverView", icon: <DashboardIcon /> },
  {
    text: "HRM",
    tab: "hrm",
    icon: <GroupsIcon />,
    nestedItems: [
      { text: "DASHBOARD", tab: "hrmDashboard", icon: <DashboardIcon /> },
      { text: "STAFF", tab: "staff", icon: <PeopleIcon /> },
      { text: "CONTRACT", tab: "contract", icon: <WorkHistoryIcon /> },
      { text: "INSURANCE", tab: "insurance", icon: <HealthAndSafetyIcon /> },
      { text: "SALARY PAYSLIP", tab: "salary", icon: <PaidIcon /> },
      { text: "SETTINGS", tab: "settings", icon: <SettingsIcon /> },
    ],
  },
  {
    text: "ATTENDANCE",
    tab: "timesheet",
    icon: <AccessTimeIcon />,
    nestedItems: [
      { text: "TIMESHEET", tab: "Timesheet", icon: <AccessTimeIcon /> },
      { text: "LEAVE", tab: "Leave", icon: <CategoryIcon /> },
      { text: "OVER ALL TIMESHEET", tab: "overalltimesheet", icon: <HistoryIcon /> },
      { text: "SHIFT", tab: "shift", icon: <WorkHistoryIcon /> },
      { text: "SHIFT CATEGORIES", tab: "ShiftCategories", icon: <CategoryIcon /> },
      { text: "WORK SHIFT", tab: "workshift", icon: <WorkHistoryIcon /> },
      { text: "OVER TIME", tab: "OverTime", icon: < ScheduleIcon /> },
      { text: "LEAVE SETTINGS", tab: "LeaveSettings", icon: <SettingsIcon /> },
      { text: "LEAVE PERMISSION", tab: "PermissionLeave", icon: <HourglassEmptyIcon /> },
      { text: "REPORTS", tab: "Reports", icon: < FileCopyIcon /> },
    ],
  },
   {
    text: "BONUS & INCENTIVE",
    tab: "bouns",
    icon: <GroupsIcon />,
  },
  {
    text: "PROJECT",
    tab: "project",
    icon: <GroupsIcon />,
    nestedItems: [
      { text: "PROJECT", tab: "projects", icon: <DashboardIcon /> },
        { text: "TASKS", tab: "Tasks", icon: <DashboardIcon /> },
    ],
  },
  {
    text: "ROLE",
    tab: "role",
    icon: <ManageAccountsIcon />,
    permission: { module: 'Settings', action: 'VIEW' }
  },
  {
    text: "DEPARTMENT",
    tab: "department",
    icon: <ApartmentIcon />,
  },
  {
    text: "CUSTOMER",
    tab: "Customer",
    icon: <HandshakeIcon />,
  },
  {
    text: "PRODUCT",
    tab: "product",
    icon: <ShoppingBagIcon />,
    nestedItems: [
      { text: "PRODUCT", tab: "Product", icon: <ShoppingBagIcon /> },
      { text: "ORDER", tab: "Order", icon: <ShoppingCartIcon />  },
      { text: "CUSTOMER ORDER HISTORY", tab: "CustomerOrderHistory", icon: <HistoryIcon />  },
    ]
  },
     {
    text: "LEADS",
    tab: "LeadsCustomers",
    icon: <HandshakeIcon />
  },
  {
    text: "PROCUREMENT",
    tab: "Procurement",
    icon: <RequestQuoteIcon />
  },
  {
    text: "EVENTS",
    tab: "events",
    icon: <EventIcon />,
  },
 {
    text: "EXPENSE",
    tab: "Expense",
    icon: <RequestQuoteIcon />,
  },
];

export const downloadFile = async ({
  url,
  filename = "download.xlsx",
  axiosInstance = axios,
  onStart,
  onComplete,
  onError,
}) => {
  try {
    onStart?.();
    const response = await axiosInstance.get(url, { responseType: "blob" });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
    onComplete?.();
  } catch (error) {
    console.error("Download failed:", error);
    onError?.(error);
  }
};
