import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Container, 
  TextField, 
  Button, 
  Divider, 
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import HomeFooter from './Constants/HomeFooter';
import Navbar from './Constants/Navbar';
import SendIcon from '@mui/icons-material/Send';

const Newsletter = () => {
  const theme = useTheme();
  
  // Newspaper sections
  const sections = [
    { 
      title: "HR Management", 
      content: "ERP simplifies HR tasks with employee record management, attendance tracking, leave automation, performance evaluation, training programs, and compliance management.",
      icon: "👥"
    },
    { 
      title: "Recruitment", 
      content: "Automated recruitment pipeline with applicant tracking, resume parsing, interview scheduling, and onboarding workflows. Reduce hiring time by 40%.",
      icon: "📋"
    },
    { 
      title: "Timesheet Management", 
      content: "Digital timesheets with project tracking, overtime calculation, and seamless payroll integration. Eliminate manual time tracking errors.",
      icon: "⏱️"
    },
    { 
      title: "Leads Management", 
      content: "Capture, score, and nurture leads through sales funnel. Automated follow-ups and conversion tracking increase sales by 25%.",
      icon: "📈"
    },
    { 
      title: "Product Management", 
      content: "End-to-end product lifecycle management from ideation to retirement. Inventory control, SKU management, and product analytics.",
      icon: "📦"
    },
    { 
      title: "CRM Module", 
      content: "360° customer view with interaction history, sales pipeline management, and customer support ticketing. Improve customer retention by 30%.",
      icon: "📱"
    },
   
  ];

  // Stats data
  const stats = [
    { value: "30%", label: "Reduction in admin tasks" },
    { value: "25%", label: "Faster recruitment" },
    { value: "40%", label: "Increase in sales leads" },
    { value: "99.9%", label: "Data accuracy" },
  ];

  return (
    <Box sx={{ 
      background: '#f5f1e6', 
      minHeight: '100vh',
      fontFamily: '"Times New Roman", Times, serif'
    }}>
      <Navbar />
      <br />
        <br />
          <br />
            <br />
      {/* Newspaper Masthead */}
      <Box sx={{ 
        background: '#2c3e50', 
        color: 'white', 
        py: 4,
        borderBottom: '3px double #e74c3c'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ 
            fontSize: '4rem', 
            fontWeight: 800, 
            textAlign: 'center',
            letterSpacing: 2,
            fontFamily: '"Playfair Display", serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            ERP LIDER
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            textAlign: 'center', 
            letterSpacing: 4,
            mt: 1,
            fontSize: '1.1rem'
          }}>
            Mindful Thoughts Driven By Passion
          </Typography>
          <Typography variant="subtitle2" sx={{ 
            textAlign: 'center', 
            mt: 2,
            borderTop: '1px solid rgba(255,255,255,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            py: 1
          }}>
            VOL. XLII, No. 15 • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Headline Story */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          mb: 4, 
          background: '#fffaf0',
          border: '1px solid #d4c9b1'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontFamily: '"Playfair Display", serif'
              }}>
                Revolutionizing Enterprise Management with Unified ERP Solutions
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                In today's fast-paced business environment, organizations are increasingly turning to comprehensive 
                Enterprise Resource Planning systems to streamline operations and gain competitive advantages. 
                Our latest ERP suite integrates all critical business functions into a single, unified platform.
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                By reducing manual tasks such as attendance tracking, payroll processing, and leave management, 
                an ERP ensures that HR teams can focus on more strategic initiatives rather than repetitive 
                administrative work. The CRM integration centralizes customer data, tracks leads, manages opportunities, 
                provides support, and automates marketing, fostering customer engagement and driving business growth.
              </Typography>
              <Typography variant="body1" paragraph sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.6,
                fontStyle: 'italic',
                borderLeft: '3px solid #e74c3c',
                pl: 2,
                ml: 2
              }}>
                "The implementation of our ERP system has transformed how we operate, creating unprecedented 
                efficiency across all departments"
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                border: '3px double #2c3e50', 
                p: 2,
                background: '#f8f5ed'
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  textAlign: 'center',
                  borderBottom: '1px solid #2c3e50',
                  pb: 1
                }}>
                  By The Numbers
                </Typography>
                <List>
                  {stats.map((stat, index) => (
                    <ListItem key={index} sx={{ borderBottom: '1px dashed #ccc' }}>
                      <ListItemText 
                        primary={<Typography variant="h4" sx={{ fontWeight: 700 }}>{stat.value}</Typography>} 
                        secondary={stat.label} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Divider */}
     
        
        {/* Modules Section */}
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          mb: 3,
          textAlign: 'center',
          fontFamily: '"Playfair Display", serif'
        }}>
          ERP MODULES IN-DEPTH
        </Typography>
           <Divider sx={{ 
          borderBottom: '3px double #e74c3c', 
          my: 4,
          '&::before, &::after': {
            borderTop: '1px solid #e74c3c'
          }
        }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {sections.map((section, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                height: '100%', 
                background: '#fffaf0',
                border: '1px solid #d4c9b1',
                '&:hover': {
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  borderBottom: '1px solid #e74c3c',
                  pb: 1
                }}>
                  <Typography variant="h4" sx={{ mr: 1 }}>{section.icon}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{section.title}</Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {section.content}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <br/>
        <br/><br/>
        {/* Subscription Section */}
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4, 
          background: '#2c3e50', 
          color: 'white',
          border: '3px double #e74c3c',
          borderRadius: '15px',
        }}>
          <Grid container alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontFamily: '"Playfair Display", serif'
              }}>
                Subscribe to the ERP LIDER
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                Get the latest insights on enterprise resource planning delivered to your inbox. 
                Stay informed about industry trends, best practices, and innovative solutions.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField
                  variant="outlined"
                  placeholder="Enter your email address"
                  type="email"
                  required
                  sx={{ 
                    mb: 2, 
                    background: 'white',
                    borderRadius: '0'
                  }}
                  InputProps={{
                    style: { borderRadius: 0 }
                  }}
                />
                <Button 
                  variant="contained" 
                  size="large" 
                  endIcon={<SendIcon />}
                  sx={{ 
                    bgcolor: '#e74c3c', 
                    color: 'white',
                    fontWeight: 700,
                    borderRadius: 0,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#c0392b'
                    }
                  }}
                >
                  Subscribe Now
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Footer Section */}
        <Box sx={{ 
          p: 3, 
          background: '#fffaf0',
          border: '1px solid #d4c9b1'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            About ERP LIDER
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
           We provide innovative solutions tailored to your unique goals. Our dedicated team is committed to delivering measurable results.
We provide a range of services designed to help startups and small businesses thrive.
Founded in 2023, My Startup Company has quickly become a leader in the startup and small business community.
Our team of experienced professionals is dedicated to helping businesses of all sizes achieve their goals.
          </Typography>
          <Typography variant="body2" sx={{ 
            mt: 2, 
            fontStyle: 'italic',
            textAlign: 'center',
            borderTop: '1px solid #d4c9b1',
            pt: 2
          }}>
            © {new Date().getFullYear()} ERP LIDER. All rights reserved.
          </Typography>
        </Box>
      </Container>
      
      <HomeFooter />
      
      {/* Newspaper-style background pattern */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'repeating-linear-gradient(#f5f1e6, #f5f1e6 24px, #d4c9b1 25px, #d4c9b1 26px)',
        opacity: 0.15,
        zIndex: -1,
        pointerEvents: 'none'
      }} />
    </Box>
  );
};

export default Newsletter;