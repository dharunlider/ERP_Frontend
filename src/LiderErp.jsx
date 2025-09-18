import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Stack,
  Button,
} from "@mui/material";
import HomeFooter from "./Constants/HomeFooter";
import Footer from "./Constants/Footer";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Navbar from "./Constants/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const features = [
  {
    title: "HRM Module",
    desc: "Manage employees, payroll, and contracts efficiently.",
    image: "HRM1.jpg",
    points: [
      "✅ Employee Management – Add, update, and manage employee records.",
      "✅ Payroll Processing – Automate salary calculations, deductions, and tax compliance.",
      "✅ Leave & Attendance – Track employee attendance and leave requests.",
      "✅ Recruitment Management – Streamline hiring and onboarding processes.",
    ],
  },
  {
    title: "Finance & Accounting",
    desc: "Automate invoicing, expenses, and financial reports.",
    image: "Finance.png",
    points: [
      "✅ Automated Invoicing – Generate and send invoices with automated tax calculations.",
      "✅ Expense Tracking – Monitor business expenses and categorize them efficiently.",
      "✅ Financial Reporting – Get real-time balance sheets, profit & loss reports.",
      "✅ Multi-Currency Support – Handle transactions in different currencies.",
    ],
  },
  {
    title: "Inventory Management",
    desc: "Track stock levels, purchase orders, and deliveries.",
    image: "inventery.jpg",
    points: [
      "✅ Stock Monitoring – Track product stock levels in real-time.",
      "✅ Purchase Order Management – Automate ordering and supplier tracking.",
      "✅ Warehouse Management – Optimize inventory storage and retrieval.",
      "✅ Barcode Integration – Use barcodes for accurate stock management.",
    ],
  },
  {
    title: "Sales & CRM",
    desc: "Handle customer relationships, sales leads, and invoices.",
    image: "CRM.png",
    points: [
      "✅ Customer Relationship Management – Maintain customer history and interactions.",
      "✅ Lead & Opportunity Tracking – Monitor sales pipeline and conversions.",
      "✅ Quotation & Billing – Generate professional quotations and invoices.",
      "✅ Integration with E-commerce – Sync with online sales channels.",
    ],
  },
  {
    title: "User-Friendly ",
    desc: "Get real-time insights and reports with an interactive dashboard.",
    image: "userfriendly.jpg",
    points: [
      "✅ Real-time Insights – View key performance metrics at a glance.",
      "✅ Customizable Reports – Generate reports based on business needs.",
      "✅ Role-Based Access – Provide different views for employees, managers, and admins.",
      "✅ Mobile Access – Monitor business performance on the go.",
    ],
  },
  {
    title: "Project Management",
    desc: "Plan, track, and collaborate on projects efficiently.",
    image: "ProjectManage.jpg",
    points: [
      "✅ Task Management – Assign tasks, set deadlines, and track progress.",
      "✅ Time Tracking – Log work hours for accurate project estimation.",
      "✅ Collaboration Tools – Share files, notes, and updates in real-time.",
      "✅ Agile & Scrum Support – Manage sprints and backlogs with ease.",
    ],
  },
  {
    title: "Procurement",
    desc: "Optimize purchasing and vendor management processes.",
    image: "Procurement.jpg",
    points: [
      "✅ Purchase Orders – Automate vendor orders and approvals.",
      "✅ Supplier Management – Maintain a database of trusted suppliers.",
      "✅ Budget Control – Track spending and avoid unnecessary costs.",
      "✅ Procurement Analytics – Get insights into purchasing trends.",
    ],
  },
  {
    title: "Manufacturing",
    desc: "Track production processes and optimize workflows.",
    image: "Manufacturing.jpg",
    points: [
      "✅ Production Planning – Schedule and manage manufacturing processes.",
      "✅ Work Order Management – Track work orders from start to completion.",
      "✅ Quality Control – Ensure product quality with inspections and checks.",
      "✅ Equipment Maintenance – Schedule and monitor machinery maintenance.",
    ],
  },
  {
    title: "Reporting & Analytics",
    desc: "Make data-driven decisions with powerful insights.",
    image: "Reporting & Analytics.jpg",
    points: [
      "✅ Business Intelligence – Use AI-powered analytics for forecasting.",
      "✅ Custom Reports – Generate reports tailored to business needs.",
      "✅ Data Visualization – Get insights using charts and graphs.",
      "✅ Export & Integration – Export reports in Excel, PDF, or CSV.",
    ],
  },
];

const LiderERP = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const featuresContainerRef = useRef(null);
  const featureCardRefs = useRef([]);
  const navigate = useNavigate();
const bgColors = ["#f9fbff", "#eef3f9"];

const imageSet = ["Ac5.jpg", "Ac6.jpg", "Ac7.avif" , "Ac8.jpg", "Ac9.jpg", "Ac10.jpg"];
const fadeInVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

  const toggleExpanded = (index, event) => {
    event.stopPropagation();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  useEffect(() => {
    featureCardRefs.current = featureCardRefs.current.slice(0, features.length);
  }, []);

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

  return (
    <Box>
      <Navbar />

      {/* Hero Section */}
   <Box
      sx={{
        position: 'relative',
        py: { xs: 10, sm: 18 },
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
     <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/images/Bc1.jpg')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'blur(10px)',
          transform: 'scale(1.05)', // to hide blur edges
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', // 40% black overlay
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Marquis',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: 'white',
          }}
        >
          WELCOME TO LIDER TECHNOLOGY
        </Typography>

        <Typography
          variant="h5"
          component="p"
          sx={{
            mb: 4,
            fontFamily: 'Marquis',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: 'white',
          }}
        >
          Empowering businesses with innovative IT solutions.
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 'bold',
            fontFamily: 'Marquis',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
          aria-label="Get Started"
          onClick={() => navigate('/login')}
        >
          Get Started
        </Button>
      </Container>
    </Box>






<Box
  sx={{
    background: "linear-gradient(135deg, #f0f4f8, #e2ecf5)",
    px: { xs: 2, sm: 3, md: 8 },
    py: { xs: 6, md: 8 },
    fontFamily: "'Montserrat', sans-serif",
  }}
>

  <Typography
    variant="h3"
    sx={{
      fontWeight: 900,
      textAlign: "center",
      mb: 2,
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
    Key Features
  </Typography>

  <Typography
    variant="subtitle1"
    sx={{
      textAlign: "center",
      mt: 4,
      mb: 8,
      fontWeight: 900,
      color: "#475569",
      maxWidth: "800px",
      mx: "auto",
      fontSize: { xs: "1rem", md: "1.15rem" },
      lineHeight: 1.8,
    }}
  >
    Discover the essential modules and functionalities designed to streamline operations, boost productivity, and drive your business forward.
  </Typography>

  


  <Box sx={{ display: "flex", justifyContent: "center" }}>
  <Grid container spacing={5} sx={{ maxWidth: 1400 }}>
    {features.map((feature, index) => (
      <Stack
        key={index}
        direction={{ xs: "column", md: index % 2 === 0 ? "row" : "row-reverse" }}
        spacing={{ xs: 4, md: 6 }}
        alignItems="center"
        justifyContent="center"
        component={motion.div}
        variants={fadeInVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        sx={{
          backgroundColor: bgColors[index % bgColors.length],
          py: { xs: 4, md: 6 },  // Less padding vertically on mobile
          px: { xs: 2, md: 2 },
          borderRadius: 2,
          mb: 5,
        }}
      >
        {/* Image */}
        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            transition: "transform 0.4s ease",
            "&:hover": { transform: "scale(1.03)" },
            width: { xs: "90%", sm: "70%", md: "40%" }, // 90% on xs for good fit
            mx: { xs: "auto", md: 0 }, // center align on mobile
          }}
        >
          <img
            src={`/images/${imageSet[index % imageSet.length]}`}
            alt={feature.title}
            style={{
              width: "100%",
              objectFit: "cover",
              aspectRatio: "4 / 3",
              borderRadius: "12px",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Box>

        {/* Text */}
        <Box
          sx={{
            width: { xs: "90%", md: "55%" },  // Reduce width on mobile & center
            textAlign: { xs: "center", md: "left" },
            px: { xs: 1, md: 0 },
            mx: { xs: "auto", md: 0 }, // center horizontally on mobile
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#1d4ed8",
              mb: 2,
              fontSize: { xs: "1.5rem", md: "1.75rem" },
            }}
          >
            {feature.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "#374151",
              mb: 2,
            }}
          >
            {feature.desc}
          </Typography>

          <Box
            component="ul"
            sx={{
              pl: 2,
              mb: 1,
              fontSize: "1rem",
              color: "#475569",
              lineHeight: 1.7,
              listStyle: "none",
              display: "inline-block",
              textAlign: "left", // Keep bullet text left aligned
              mx: { xs: "auto", md: 0 }, // center ul on mobile
              maxWidth: { xs: "100%", md: "auto" }, // prevent overflow
              overflowWrap: "break-word",
            }}
          >
            {feature.points.map((point, idx) => (
              <li key={idx} style={{ marginBottom: "8px" }}>
                <span style={{ marginRight: "10px", color: "#3b82f6" }}>🔹</span>
                {point.replace("✅ ", "")}
              </li>
            ))}
          </Box>
        </Box>
      </Stack>
    ))}
  </Grid>
</Box>

  
</Box>






    <HomeFooter />
    </Box>
  );
};

export default LiderERP;
