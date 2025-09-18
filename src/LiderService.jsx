import React, { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Container,
  Grid,
  useTheme,
  Button,
  Modal,
  Fade,
  Backdrop,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,Divider,
} from '@mui/material';
import HomeFooter from "./Constants/HomeFooter";
import {
  PhoneAndroid as AppIcon,
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Storage as StorageIcon,
  Computer as ComputerIcon,
  Videocam as VideoCallIcon,
  Share as FileShareIcon,
  Group as GroupIcon,
  Cloud as CloudIconMUI,
  DataUsage as DataAnalyticsIcon,
  Storage as CloudStorageIcon,
  LocationOn as DataCenterIcon,
  Timeline as EfficiencyIcon,
} from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaletteIcon from '@mui/icons-material/Palette';
import BrushIcon from '@mui/icons-material/Brush';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DevicesIcon from '@mui/icons-material/Devices';
import BugReportIcon from '@mui/icons-material/BugReport';
import SearchIcon from '@mui/icons-material/Search';
import CompareIcon from '@mui/icons-material/Compare';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TimelineIcon from '@mui/icons-material/Timeline';
import Navbar from "./Constants/Navbar";
import { useNavigate } from "react-router-dom";

function LiderService() {
  const theme = useTheme();
    const navigate = useNavigate();
  const [openWebDesign, setOpenWebDesign] = useState(false);
  const [openAppDevelopment, setOpenAppDevelopment] = useState(false);
  const [openCloudDataAnalytics, setOpenCloudDataAnalytics] = useState(false);
  const [openGraphicDesign, setOpenGraphicDesign] = useState(false);
  const [openSoftwareTesting, setOpenSoftwareTesting] = useState(false);
  const [openDigitalTransformation, setOpenDigitalTransformation] = useState(false);

  // Handle modal open/close
  const handleOpenWebDesign = () => setOpenWebDesign(true);
  const handleCloseWebDesign = () => setOpenWebDesign(false);

  const handleOpenAppDevelopment = () => setOpenAppDevelopment(true);
  const handleCloseAppDevelopment = () => setOpenAppDevelopment(false);

  const handleOpenCloudDataAnalytics = () => setOpenCloudDataAnalytics(true);
  const handleCloseCloudDataAnalytics = () => setOpenCloudDataAnalytics(false);

  const handleOpenGraphicDesign = () => setOpenGraphicDesign(true);
  const handleCloseGraphicDesign = () => setOpenGraphicDesign(false);

  const handleOpenSoftwareTesting = () => setOpenSoftwareTesting(true);
  const handleCloseSoftwareTesting = () => setOpenSoftwareTesting(false);

  const handleOpenDigitalTransformation = () => setOpenDigitalTransformation(true);
  const handleCloseDigitalTransformation = () => setOpenDigitalTransformation(false);

  // Services Data with consistent styling
  const services = [
    {
      title: "WEB APPLICATION & WEB DESIGN",
      image: "WebApplication.png", 
      // icon: <WebIcon sx={{ fontSize: 50, color: theme.palette.primary.main, filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.5))', fontFamily:"Marquis" }} />,
      description: "We craft visually stunning, user-friendly, and fully responsive websites and web applications tailored specifically to your business goals. Whether you're launching a new brand or enhancing an existing digital presence, our web design solutions ensure seamless performance across all devices, intuitive navigation.",
      modalContent: (
        <>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: theme.palette.primary.dark, 
            textAlign: 'center' ,
            fontFamily:"Marquis"
          }}>
            WEB APPLICATION & WEB DESIGN
          </Typography>
          <List>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <CodeIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis" }}>
                    WEB DEVELOPMENT
                  </Typography>
                }
                secondary="The process of creating, building, and maintaining websites. Includes web design, publishing, programming, and database management."
                sx={{fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <DesignIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' ,fontFamily:"Marquis"}}>
                    WEB DESIGN
                  </Typography>
                }
                secondary="Focuses on the visual aesthetics and usability of a website, ensuring it is visually appealing and user-friendly."
                sx={{ fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <StorageIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis" }}>
                    HOSTING & SERVERS
                  </Typography>
                }
                secondary="Websites are files stored on servers, which are computers that host (store files for) websites."
                sx={{fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <ComputerIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis" }}>
                    CMS DEVELOPMENT
                  </Typography>
                }
                secondary="Content Management Systems (CMS) like WordPress allow easy management of website content without coding."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "APPLICATION DEVELOPMENT",
      image: "Applicationdev.png", 
      // icon: <AppIcon sx={{ fontSize: 50, color: theme.palette.primary.main, filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.5))',fontFamily:"Marquis" }} />,
      description: "We develop high-performance mobile applications for iOS and Android platforms.",
      modalContent: (
        <>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: theme.palette.primary.dark, 
            textAlign: 'center',
            fontFamily:"Marquis"
          }}>
            APPLICATION DEVELOPMENT
          </Typography>
          <List>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <GroupIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:"Marquis" }}>
                    MESSENGER APPS
                  </Typography>
                }
                secondary="In today's digital world, messenger apps are becoming increasingly popular. They offer a convenient way to communicate with friends, family, and colleagues."
                sx={{  fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <VideoCallIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:"Marquis" }}>
                    VIDEO CALLING
                  </Typography>
                }
                secondary="Many messenger apps offer additional features such as video calling, making them even more useful for staying connected with those around you."
                sx={{fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <FileShareIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' , fontFamily:"Marquis" }}>
                    FILE SHARING
                  </Typography>
                }
                secondary="File sharing is another useful feature offered by many messenger apps, allowing users to share documents, images, and more."
                sx={{fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <AppIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis"  }}>
                    CHOOSING THE RIGHT APP
                  </Typography>
                }
                secondary="Each type of messenger app has its own advantages and disadvantages, so it's important to consider which one is right for your needs before making a decision."
                sx={{ fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "CLOUD & DATA ANALYTICS",
            image: "cloud.png", 
      // icon: <CloudIcon sx={{ fontSize: 50, color: theme.palette.primary.main, filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.5))',   fontFamily:"Marquis" }} />,
      description: "We provide cloud solutions and data analytics to drive your business growth.",
      modalContent: (
        <>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: theme.palette.primary.dark, 
            textAlign: 'center' ,
            fontFamily:"Marquis"
          }}>
            CLOUD & DATA ANALYTICS
          </Typography>
          <List>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <CloudStorageIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' ,fontFamily:"Marquis"}}>
                    CLOUD STORAGE
                  </Typography>
                }
                secondary="A computer is a machine that can be programmed to carry out sequences of arithmetic or logical operations (computation) automatically."
                sx={{ fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <DataAnalyticsIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis" }}>
                    DATA ANALYTICS
                  </Typography>
                }
                secondary="Computer system resources, especially data storage (cloud storage) and computing power, without direct active management by the user."
                sx={{fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <DataCenterIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis" }}>
                    DATA CENTERS
                  </Typography>
                }
                secondary="Large clouds often have functions distributed over multiple locations, each of which is a data center."
                sx={{ fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <EfficiencyIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis" }}>
                    EFFICIENCY
                  </Typography>
                }
                secondary="The large-scale computing power available to more users through time-sharing, optimizing the infrastructure, platform, and applications, and increasing efficiency for end users."
                sx={{ fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "GRAPHIC DESIGN",
      image: "graphics1.png", 
      // icon: <GraphicDesignIcon sx={{ fontSize: 50, fontFamily:"Marquis" ,color: theme.palette.primary.main, filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.5))' }} />,
      description: "We ensure software quality through rigorous testing and debugging, and by adhering to industry-standard development practices",
      modalContent: (
        <>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: theme.palette.primary.dark, 
            textAlign: 'center' ,
            fontFamily:"Marquis" 
          }}>
            GRAPHIC DESIGN
          </Typography>
          <List>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <PaletteIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' ,fontFamily:"Marquis" }}>
                    VISUAL IDENTITY
                  </Typography>
                }
                secondary="Creating brand identity through logos, typography, and color schemes to establish a strong brand presence."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <BrushIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis"  }}>
                    ILLUSTRATION & ARTWORK
                  </Typography>
                }
                secondary="Designing custom illustrations and digital artwork to enhance branding and storytelling."
                sx={{fontFamily:"Marquis", fontSize:"20px"  }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <PictureAsPdfIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' ,fontFamily:"Marquis" }}>
                    PRINT & DIGITAL DESIGN
                  </Typography>
                }
                secondary="Crafting engaging visuals for both print and digital platforms, including magazines, brochures, and infographics."
                sx={{fontFamily:"Marquis", fontSize:"20px"  }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <DevicesIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',fontFamily:"Marquis"  }}>
                    UI/UX DESIGN
                  </Typography>
                }
                secondary="Ensuring seamless and user-friendly design for websites and mobile applications."
                sx={{ fontFamily:"Marquis", fontSize:"20px"  }}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "SOFTWARE TESTING",
      image: "softwaretesting.png", 
      // icon: <BugReportIcon sx={{ fontSize: 50, fontFamily:"Marquis", color: theme.palette.primary.main, filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.5))' }} />,
      description: "We ensure software quality through rigorous testing and debugging, and by adhering to industry-standard development practices.",
      modalContent: (
        <>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: theme.palette.primary.dark, 
            textAlign: 'center' ,
            fontSize:"20px",
            fontFamily:" Marquis"
          }}>
            SOFTWARE TESTING
          </Typography>
          <List>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <SearchIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:" Marquis" }}>
                    FINDING ERRORS
                  </Typography>
                }
                secondary="Software testing helps in identifying defects and missing requirements before the product launch."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <CompareIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:" Marquis" }}>
                    EXPECTED Vs. ACTUAL
                  </Typography>
                }
                secondary="Testing ensures the actual software output matches the expected outcomes."
                sx={{fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <AssessmentIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:" Marquis" }}>
                    ANALYSIS & EVALUATION
                  </Typography>
                }
                secondary="Examining and evaluating different aspects of the software product before release."
                sx={{ fontFamily:"Marquis", fontSize:"20px"}}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <AutoModeIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:" Marquis" }}>
                    MANUAL & AUTOMATED TESTING
                  </Typography>
                }
                secondary="Professional testers use a combination of manual and automated testing tools for quality assurance."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <BugReportIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:" Marquis" }}>
                    REPORTING BUGS
                  </Typography>
                }
                secondary="After testing, bugs are reported to the development team for fixes and improvements."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "DIGITAL TRANSFORMATION",
      image: "Digitransfor.png", 
      // icon: <AutoModeIcon sx={{ fontSize: 50, fontFamily:" Marquis", color: theme.palette.primary.main, filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.5))' }} />,
      description: "We help businesses modernize operations and adopt cutting-edge digital technologies.",
      modalContent: (
        <>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 3, 
            color: theme.palette.primary.dark, 
            textAlign: 'center' ,
            fontSize:"20px",
             fontFamily:" Marquis"
          }}>
            DIGITAL TRANSFORMATION SOLUTIONS
          </Typography>
          <List>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <TimelineIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',  fontFamily:" Marquis"}}>
                    BUSINESS PROCESS OPTIMIZATION
                  </Typography>
                }
                secondary="We analyze and redesign workflows to improve efficiency and reduce operational costs."
                sx={{fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <CloudIconMUI sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontFamily:" Marquis" }}>
                    CLOUD MIGRATION
                  </Typography>
                }
                secondary="Seamless transition of your business applications and data to secure cloud platforms."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <DataAnalyticsIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' ,  fontFamily:" Marquis"}}>
                    DATA-DRIVEN DECISION MAKING
                  </Typography>
                }
                secondary="Implement advanced analytics to transform raw data into actionable business insights."
                sx={{fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
            <ListItem sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon sx={{ minWidth: '40px', marginTop: '8px' }}>
                <DevicesIcon sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold',  fontFamily:" Marquis"}}>
                    CUSTOMER EXPERIENCE TRANSFORMATION
                  </Typography>
                }
                secondary="Redesign customer interactions with omnichannel digital solutions."
                sx={{ fontFamily:"Marquis", fontSize:"20px" }}
              />
            </ListItem>
          </List>
        </>
      ),
    }
  ];

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

      {/* body sections */}
      <Box sx={{
        background: "linear-gradient(135deg, #f5f7fa, #e3f2fd)",
        py: 8,
      }}>
        {/* Main Content */}
<Grid container spacing={4} justifyContent="center">
  {services.map((service, index) => (
    <Grid item xs={12} md={10} key={index}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          px: 2,
          py: 3,
          maxWidth: '100%',
          mx: 'auto',
          borderBottom: '1px solid #ddd',
        }}
      >
        {/* Left - Icon and Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: { xs: '100%', sm: '40%' },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src={`/images/${service.image}`}
              alt={service.title}
              style={{
                width: '70%',
                height: '70%',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.7rem',
              fontFamily: 'Marquis',
              color: '#0D47A1',
            }}
          >
            {service.title}
          </Typography>
        </Box>

        {/* Vertical Divider */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 3,
            display: { xs: 'none', sm: 'block' },
            borderColor: '#ccc',
          }}
        />

        {/* Right - Description and Button */}
        <Box
          sx={{
            flexGrow: 1,
            width: { xs: '100%', sm: '60%' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.3rem',
              mb: 2,
              fontFamily: 'Marquis',
              color: '#333',
            }}
          >
            {service.description}
          </Typography>

          <Button
                      variant="outlined"
                      color="primary"
                      onClick={
                        service.title === "WEB APPLICATION & WEB DESIGN"
                          ? handleOpenWebDesign
                          : service.title === "APPLICATION DEVELOPMENT"
                            ? handleOpenAppDevelopment
                            : service.title === "GRAPHIC DESIGN"
                              ? handleOpenGraphicDesign
                              : service.title === "CLOUD & DATA ANALYTICS"
                                ? handleOpenCloudDataAnalytics
                                : service.title === "SOFTWARE TESTING"
                                  ? handleOpenSoftwareTesting
                                  : service.title === "DIGITAL TRANSFORMATION"
                                    ? handleOpenDigitalTransformation
                                    : undefined
                      }
                      sx={{
                        fontWeight: 'bold',
                        mt: 2,
                        fontFamily: 'Marquis',
                        color: "#1976d2",
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main,
                          color: theme.palette.background.paper,
                        },
                      }}
                    >
                      Learn More
                    </Button>
                    
        </Box>

        
      </Box>

      
    </Grid>
  ))}
</Grid>


          {/* Modals for each service */}
          <Modal
            open={openWebDesign}
            onClose={handleCloseWebDesign}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={openWebDesign}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: 600,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                }}
              >
                {services.find(service => service.title === "WEB APPLICATION & WEB DESIGN")?.modalContent}
                <Box sx={{ textAlign: 'right', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseWebDesign}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          <Modal
            open={openAppDevelopment}
            onClose={handleCloseAppDevelopment}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={openAppDevelopment}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: 600,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                }}
              >
                {services.find(service => service.title === "APPLICATION DEVELOPMENT")?.modalContent}
                <Box sx={{ textAlign: 'right', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseAppDevelopment}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          <Modal
            open={openCloudDataAnalytics}
            onClose={handleCloseCloudDataAnalytics}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={openCloudDataAnalytics}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: 600,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                }}
              >
                {services.find(service => service.title === "CLOUD & DATA ANALYTICS")?.modalContent}
                <Box sx={{ textAlign: 'right', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseCloudDataAnalytics}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          <Modal
            open={openGraphicDesign}
            onClose={handleCloseGraphicDesign}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={openGraphicDesign}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: 600,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                }}
              >
                {services.find(service => service.title === "GRAPHIC DESIGN")?.modalContent}
                <Box sx={{ textAlign: 'right', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseGraphicDesign}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          <Modal
            open={openSoftwareTesting}
            onClose={handleCloseSoftwareTesting}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={openSoftwareTesting}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: 600,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                }}
              >
                {services.find(service => service.title === "SOFTWARE TESTING")?.modalContent}
                <Box sx={{ textAlign: 'right', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseSoftwareTesting}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          <Modal
            open={openDigitalTransformation}
            onClose={handleCloseDigitalTransformation}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
          >
            <Fade in={openDigitalTransformation}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                  maxWidth: 600,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                }}
              >
                {services.find(service => service.title === "DIGITAL TRANSFORMATION")?.modalContent}
                <Box sx={{ textAlign: 'right', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseDigitalTransformation}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

        {/* Footer */}
        <Box
          sx={{
            textAlign: 'center',
            background: "linear-gradient(135deg, #f5f7fa, #e3f2fd)",
            mt: 6,
          }}
        >
          <HomeFooter />
        </Box>
      </Box>
    </Box>
  );
}

export default LiderService;