import React, { useState, useRef, useEffect } from "react";
import {
  Typography, Button, Container, Grid, Box, Tab, Paper, Tabs, Stack, Divider, TextField,
} from "@mui/material";
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Email, Phone, ListAlt, Message, RocketLaunch } from "@mui/icons-material";
import ChatIcon from '@mui/icons-material/Chat';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { useNavigate } from "react-router-dom";
import LocationOn from '@mui/icons-material/LocationOn';
import InputAdornment from '@mui/material/InputAdornment';
import HomeFooter from "./Constants/HomeFooter";
import { motion } from "framer-motion";
import Navbar from "./Constants/Navbar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Domain from '@mui/icons-material/Domain';
import axios from './Axiosinstance';

const HomePage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null); // This is the correct state
  const servicesRef = useRef(null);
  const serviceCardRefs = useRef([]);
  const navigate = useNavigate();
  const contactRef = useRef(null);
  const MotionBox = motion(Box);
  const MotionTypography = motion(Typography);
  const MotionButton = motion(Button);
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
    companyName: "",
    productlist: "",
    companyAddress: ""
  });


  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For the phone number field, ensure only numbers are entered and limit to 10 digits
    if (name === "number") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return; // Stop further processing for the phone number field
    }

    // For other fields, update the state as usual
    setFormData({ ...formData, [name]: value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.number,
      products: formData.productlist
        ? formData.productlist.split(",").map((p) => p.trim())
        : [],
      companyName: formData.companyName,
      description: formData.message,
      companyAddress: formData.companyAddress
    };

    try {
      const response = await axios.post("/contact", payload);
      if (response.status === 200 || response.status === 201) {
        toast.success("Thank you! Your information has been submitted.");
        setFormData({
          name: "",
          email: "",
          number: "",
          message: "",
          companyName: "",
          productlist: "",
          companyAddress: ""
        });
      } else {
        alert("There was a problem. Please try again.");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      alert("Something went wrong. Please try again later.");
    }
  };
  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  // Toggle expanded state for a specific feature
  const toggleExpanded = (index, event) => {
    event.stopPropagation();
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  // Handle clicks anywhere in the document
  useEffect(() => {
    const handleClickAnywhere = () => {
      if (expandedIndex !== null) {
        setExpandedIndex(null);
      }
    };
    document.addEventListener('click', handleClickAnywhere);
    return () => {
      document.removeEventListener('click', handleClickAnywhere);
    };
  }, [expandedIndex]);

  const toggleService = (index, event) => {
    event.stopPropagation(); // Prevent event from bubbling up
    setExpandedIndex(index);
  };
  const scop = [
    {
      title: "HRM Integration",
      summary: "Streamline employee management effortlessly.",
      points: [
        "Automate payroll processing, attendance tracking, and leave management to reduce manual errors.",
        "Manage performance reviews, employee feedback, and development plans to boost productivity.",
        "Centralize employee data with secure cloud access for seamless HR operations."
      ],
      image: "Ac5.jpg",
    },
    {
      title: "CRM Module",
      summary: "Enhance your customer relationship management.",
      points: [
        "Track and nurture leads through customized sales pipelines and activity reminders.",
        "Automate customer communication workflows with email campaigns and follow-up notifications.",
        "Analyze customer data to identify trends and optimize marketing strategies."
      ],
      image: "Ac6.jpg",
    },
    {
      title: "PRODUCT",
      summary: "Simplify your financial operations.",
      points: [
        "Automate invoicing, billing, and payment collection with integrated payment gateways.",
        "Generate real-time financial reports and dashboards for better decision making.",
        "Manage inventory and track product lifecycle from procurement to sales."
      ],
      image: "Ac7.avif",
    },
    {
      title: "LEADS",
      summary: "Track potential sales opportunities and manage leads effectively.",
      points: [
        "Capture leads from multiple channels and assign to sales representatives automatically.",
        "Prioritize and score leads based on engagement and potential to improve conversion rates.",
        "Monitor sales activities and pipeline health with real-time analytics."
      ],
      image: "Ac8.jpg",
    },
    {
      title: "TIMESHEET",
      summary: "Record and manage employee work hours and project timesheets.",
      points: [
        "Track employee work hours accurately with clock-in/out and manual entry options.",
        "Allocate timesheets to projects for precise billing and resource planning.",
        "Generate reports to analyze productivity and optimize workforce utilization."
      ],
      image: "Ac9.jpg",
    },
    {
      title: "RECRUITMENT",
      summary: "Recruitment processes, job postings, and applicant tracking seamlessly.",
      points: [
        "Post job openings on multiple platforms and track application status in one place.",
        "Automate applicant screening and schedule interviews to streamline hiring.",
        "Maintain a talent pool database for future recruitment needs and workforce planning."
      ],
      image: "Ac10.jpg",
    },
  ];
  const [activeTab, setActiveTab] = useState(0);
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  // Animation for content fade & slide
  const contentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };
  const prod = [
    {
      title: "Lider ERP",
      image: "CC1.jpg",
      description: `A powerful ERP system designed to streamline business operations—from finance and inventory to sales and HR.

Key Taken:
• Real-time business dashboard • Inventory & warehouse control • Finance, billing & expenses • HR, payroll & attendance • Workflow automation • Role-based access`
    },
    {
      title: "Impulz (LMS)",
      image: "CC2.jpg",
      description: `A modern LMS built for educational institutions to create, manage, and track learning effectively.

Key Taken:
• Student & batch management • Interactive course creation • Attendance & grading • Assignments & tests • Real-time analytics • Role-based access`
    },
    {
      title: "Urban (Gatekeeper App)",
      image: "CC3.jpg",
      description: `A smart gatekeeping app enhancing residential and corporate security through digital visitor management.

Key Taken:
• Digital check-in/verification • Resident alerts & approvals • Staff/delivery tracking • Emergency alerts • Visitor logs • QR/OTP-based entry`
    },
    {
      title: "Pathway (Transport App)",
      image: "Ac4.jpg",
      description: `A transport terminal app to manage bus routes, reduce delays, and offer real-time tracking.

Key Taken:
• Live bus tracking • Route monitoring • Driver & vehicle info • Smart pickup/drop alerts • Digital logs • Route transparency`
    },
  ];
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };
  const services = [
    {
      image: "Ac2.webp",
      title: "HR Management",
      description: "ERP simplifies HR tasks with employee record management, attendance tracking, leave automation, performance evaluation, training programs, and compliance management",
    },
    {
      image: "Ac3.jpeg",
      title: "CRM Integration",
      description: "ERP system is By reducing manual tasks such as attendance tracking, payroll processing, and leave management, an ERP ensures that HR teams can focus on more strategic initiatives rather than repetitive administrative work.",
    },
    {
      image: "Ac4.jpg",
      title: "Accounting & Finance",
      description: "ERP centralizes customer data, tracks leads, manages opportunities, provides support, automates marketing, and integrates with other systems, fostering customer engagement and driving business growth.",
    },
  ];
  const zoomInRotate = {
    hidden: { opacity: 0, scale: 0.8, rotate: -4 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.2,
        type: "spring",
        stiffness: 100
      }
    })
  };

  return (
    <>
      <Navbar contactRef={contactRef} /> {/* Pass the ref to Navbar */}

      <Box
        sx={{
          position: "relative",
          backgroundImage: "url('/images/Ac1.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          color: "white",
          py: 20,
          fontFamily: "Marquis",
          overflow: "hidden",
        }}
      >
        {/* Optional blur layer */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(8px)",
            zIndex: 0,
          }}
        />

        <Container sx={{ position: "relative", zIndex: 1 }}>
          <MotionTypography
            variant="h1"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            sx={{
              fontWeight: "bold",
              color: "white",
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              fontFamily: "Marquis",
            }}
          >
            LIDER ERP EMPOWERING YOUR BUSINESS
          </MotionTypography>

          <MotionTypography
            variant="h4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            sx={{
              mb: 3,
              fontSize: { xs: "1rem", md: "1.5rem" },
              fontFamily: "Marquis",
              color: "white",
              maxWidth: "1300px",
              letterSpacing: "1.3px",
            }}
          >
            Empower your business with LIDER ERP. Cloud-based solution for small
            to large enterprises. Seamlessly integrate HRM, CRM, and Accounting
            functionalities in the cloud. Maximize efficiency with 20+ extensions
            and Project Management module.
          </MotionTypography>

          <MotionButton
            variant="contained"
            color="success"
            size="large"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            onClick={() => navigate('/login')}
            sx={{
              fontWeight: 'bold',
              fontFamily: 'Marquis',
            }}
          >
            Get Started
          </MotionButton>
        </Container>
      </Box>
      {/* Services Section */}
      <Box
        ref={servicesRef}
        sx={{
          background: "linear-gradient(135deg, #ffffff, #bbdefb)",
          py: 8,
          fontFamily: "Marquis",
        }}
      >
        <Container>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              textAlign: "center",
              mb: 8,
              color: "#1e3a8a",
              fontFamily: "'Marquis', serif",
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              textTransform: "uppercase",
              letterSpacing: 1,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 4,
                backgroundColor: "#1e40af",
                borderRadius: 2,
              },
            }}
          >
            OUR SERVICES
          </Typography>
          <br />
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.02)",
                        boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
                      },
                      fontFamily: "Marquis",
                    }}
                  >
                    {/* Image Section */}
                    <Box
                      component="img"
                      src={`/images/${service.image}`}
                      alt={service.title}
                      sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />

                    {/* Content Section */}
                    <Box sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          // textAlign: "center",
                          fontFamily: "Marquis",
                          color: "#1976d2",
                          mb: 1,
                          fontSize: "1.5rem",
                        }}
                      >
                        {service.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#333",
                          mb: 2,
                          fontFamily: "Marquis",
                          fontSize: "1rem",
                          height: expandedIndex === index ? "auto" : "3rem",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: expandedIndex === index ? "unset" : 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {service.description}
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"

                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(index, e);
                        }}
                      >
                        {expandedIndex === index ? "Show Less" : "Show More"}
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Scope Section */}
      <Box sx={{ background: "linear-gradient(135deg, #ffffff, #bbdefb)", py: 6 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              textAlign: "center",
              mb: 8,
              color: "#1e3a8a",
              fontFamily: "'Marquis', serif",
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              textTransform: "uppercase",
              letterSpacing: 1,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 4,
                backgroundColor: "#1e40af",
                borderRadius: 2,
              },
            }}
          >
            OUR SCOPE
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="scrollable"
            allowScrollButtonsMobile
            textColor="primary"
            indicatorColor="primary"
            sx={{
              mb: 5,
              width: '100%',
              maxWidth: { xs: '400px', sm: '100%' }, // 2 tabs * minWidth(120px) = 240px for mobile
              overflowX: 'auto',
              "& .MuiTabs-flexContainer": {
                gap: 2, // spacing between tabs
              },
              "& .MuiTab-root": {
                fontWeight: "bold",
                fontFamily: "Marquis",
                fontSize: { xs: "1rem", md: "1.3rem" },
                textTransform: "capitalize",
                px: 4,
                py: 1.5,
                borderRadius: 3,
                minWidth: 120,
                transition: "all 0.3s ease",
                color: "#555",
                backgroundColor: "transparent",
                "&:hover": {
                  color: "#1976d2",
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                },
              },
              "& .Mui-selected": {
                color: "#fff !important",
                backgroundColor: "#1976d2",
                boxShadow: "0 4px 10px rgba(25, 118, 210, 0.4)",
                "&:hover": {
                  backgroundColor: "#115293",
                },
              },
              "& .MuiTabs-indicator": {
                height: 4,
                borderRadius: 2,
                backgroundColor: "#1976d2",
                marginBottom: -4,
                transition: "all 0.3s ease",
              },
            }}
          >
            {scop.map((item, index) => (
              <Tab key={index} label={item.title} />
            ))}
          </Tabs>
          {/* Content Section */}
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 5, md: 8 },            // increased padding
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.9)",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: 6,                         // increased gap between sides
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              {/* Left side text */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"                  // increased from h5 to h4
                  sx={{
                    fontWeight: "bold",
                    color: "#1976d2",
                    fontFamily: "Marquis",
                    mb: 1,
                  }}
                >
                  {scop[activeTab].title}
                </Typography>
                <Typography
                  variant="h6"                  // increased from subtitle1 to h6
                  sx={{
                    fontFamily: "Marquis",
                    fontSize: { xs: "1.25rem", md: "1.5rem" }, // larger font size
                    color: "#555",
                    mb: 3,                      // increased margin bottom
                  }}
                >
                  {scop[activeTab].summary}
                </Typography>
                <Box component="ul" sx={{ pl: 4, color: "#444", fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
                  {scop[activeTab].points.map((point, idx) => (
                    <li key={idx} style={{ marginBottom: 12 }}>
                      {point}
                    </li>
                  ))}
                </Box>
              </Box>
              {/* Right side image */}
              <Box
                sx={{
                  flex: 1,
                  maxWidth: 600,                // increased width
                  height: 350,                  // increased height
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={`/images/${scop[activeTab].image}`}
                  alt={scop[activeTab].title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
      {/* support   Section */}
      <Box
        sx={{
          maxWidth: "100%",
          mx: "auto",
          p: { xs: 4, md: 8 },
          backgroundColor: "#e3f2fd",
          borderRadius: 3,
          boxShadow: "0 12px 35px rgba(25, 118, 210, 0.15)",
        }}
      >
        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            textAlign: "center",
            mb: 8,
            color: "#1e3a8a",
            fontFamily: "'Marquis', serif",
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            textTransform: "uppercase",
            letterSpacing: 1,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 4,
              backgroundColor: "#1e40af",
              borderRadius: 2,
            },
          }}
        >
          How Can We Help?
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h6"
          sx={{
            maxWidth: 700,
            mx: "auto",
            color: "#424242",
            fontWeight: "500",
            textAlign: "center",
            mb: 6,
            fontSize: { xs: "1rem", md: "1.25rem" },
            lineHeight: 1.6,
          }}
        >
          Empowering your business with smart solutions tailored to drive growth, boost efficiency, and lead the future of your industry.
        </Typography>

        {/* Horizontal Scrollable Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 4,
            px: 2,
          }}
        >
          {[
            {
              icon: <ContactPhoneIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
              title: "Contact Sales",
              desc: "Talk directly with our sales team to find the perfect solutions tailored for your business.",
            },
            {
              icon: <SupportAgentIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
              title: "Get Award-Winning Support",
              desc: "Our 24/7 support portal lets you find answers quickly or connect with specialists for expert assistance.",
            },
            {
              icon: <ChatIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
              title: "Chat With Our Product Team",
              desc: "Get personalized, industry-specific insights and discover the right solutions to elevate your business.",
            },
          ].map((item, idx) => (
            <Box
              key={idx}
              component={motion.div}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              sx={{
                width: 300,
                textAlign: "center",
              }}
            >
              {item.icon}
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, color: "#1565c0" }}>
                {item.title}
              </Typography>
              <Typography sx={{ color: "#555", fontSize: "0.95rem", mt: 1, mb: 2 }}>
                {item.desc}
              </Typography>
              <Button variant="text" color="primary">
                {item.button}
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
      <br />
      {/* lider  Section */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 900,
          textAlign: "center",
          mb: 8,
          color: "#1e3a8a",
          fontFamily: "'Marquis', serif",
          fontSize: { xs: "1.75rem", md: "2.5rem" },
          textTransform: "uppercase",
          letterSpacing: 1,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 4,
            backgroundColor: "#1e40af",
            borderRadius: 2,
          },
        }}
      >
        Our Products
      </Typography>
      <br /><br /><br />
      <Box
        sx={{
          textAlign: { xs: "center", md: "left" },      // Keep left-align on desktop
          px: { xs: 1, md: 4 },                          // Add more padding on desktop
          mx: { xs: "auto", md: 0 },                     // Center on mobile, default on desktop
          ml: { md: "auto" },                            // Slight right shift on desktop
          maxWidth: { md: "75%" },                       // Prevent too much stretch
        }}
      >

        <Grid
          container
          spacing={{ xs: 4, md: 10 }}
          sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 } }}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {prod.map((item, index) => (
            <Grid
              container
              key={index}
              spacing={{ xs: 3, md: 6 }}
              direction={index % 2 === 0 ? "row" : "row-reverse"}
              alignItems="center"
              justifyContent="center" // Center align on all screens
              component={motion.div}
              variants={fadeInUp}
            >
              {/* Image Section */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.4s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                    mx: "auto", // center the image box
                    maxWidth: { xs: "100%", sm: 400 },
                  }}
                >
                  <img
                    src={`/images/${item.image}`}
                    alt={item.title}
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      aspectRatio: "4 / 3",
                      borderRadius: "12px",
                    }}
                  />
                </Box>
              </Grid>

              {/* Text Section */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    textAlign: { xs: "center", md: "center" }, // centered for all screens now
                    px: { xs: 1, md: 3 },
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: "#1d4ed8",
                      mb: 2,
                      fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.75rem" },
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      lineHeight: 1.8,
                      color: "#374151",
                      mb: 1.5,
                    }}
                  >
                    {item.description.split("Key Taken:")[0].trim()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      color: "#475569",
                      lineHeight: 1.7,
                      backgroundColor: "#f8fafc",
                      borderLeft: "4px solid #2563eb",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      fontStyle: "italic",
                      display: "inline-block",
                      mx: "auto",
                    }}
                  >
                    <strong>Key Taken:</strong>{" "}
                    {item.description
                      .split("Key Taken:")[1]
                      ?.replace(/\n• /g, " ")
                      ?.replace(/\n/g, " ")
                      .trim()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Grid>


      </Box>
      {/* Contact Form Section */}
      <Box
        ref={contactRef}
        sx={{
          background: "linear-gradient(to bottom right, #e0f2f1, #e3f2fd)",
          py: 10,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              textAlign: "center",
              mb: 8,
              color: "#1e3a8a",
              fontFamily: "'Marquis', serif",
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              textTransform: "uppercase",
              letterSpacing: 1,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 80,
                height: 4,
                backgroundColor: "#1e40af",
                borderRadius: 2,
              },
            }}
          >
            Contact Us
          </Typography>
          <Paper
            elevation={5}
            sx={{
              borderRadius: 4,
              p: 4,
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* RIGHT: INFO PANEL */}
            <Box
              sx={{
                flex: 1,
                background: "linear-gradient(135deg, #2196f3, #64b5f6)",
                color: "#ffffff",
                p: 3,
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textTransform: "uppercase",
                }}
              >
                <RocketLaunch /> Let’s Do It!
              </Typography>
              <Divider sx={{ borderColor: "#fff", mb: 2 }} />
              <Stack spacing={1.5}>
                <Typography variant="body1">
                  • Develop a strong brand identity and marketing strategy to attract customers.
                </Typography>
                <Typography variant="body1">
                  • Assemble a skilled, diverse team to execute your business plan.
                </Typography>
                <Typography variant="body1">
                  • Embrace AI, cloud, and analytics for a modern edge.
                </Typography>
                <Typography variant="body1">
                  • Collaborate with others to grow faster and expand reach.
                </Typography>
              </Stack>
            </Box>
            {/* LEFT: FORM */}
            <Box sx={{ flex: 1 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      InputProps={{ startAdornment: <Email sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      inputProps={{
                        pattern: "[0-9]{10}",
                        inputMode: "numeric",
                        maxLength: 10,
                      }}
                      required
                      InputProps={{ startAdornment: <Phone sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Domain />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Add Product List"
                      name="productlist"
                      value={formData.productlist}
                      onChange={handleInputChange}
                      required
                      InputProps={{ startAdornment: <ListAlt sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Address"
                      name="companyAddress"
                      multiline
                      rows={3}
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      InputProps={{ startAdornment: <Message sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} textAlign="center">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 1,
                          px: 5,
                          py: 1.5,
                          background: "linear-gradient(to right, #1976d2, #0d47a1)",
                          borderRadius: 2,
                          fontWeight: "bold",
                          ":hover": {
                            background: "linear-gradient(to right, #0d47a1, #1976d2)",
                          },
                        }}
                      >
                        Submit
                      </Button>
                      <ToastContainer position="bottom-right" autoClose={3000} />
                    </Box>
                  </Grid>
                </Grid>
              </form>

            </Box>
          </Paper>
        </Container>
      </Box>
      <HomeFooter />
    </>
  );
};
export default HomePage;