import React from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Container,
  Card,
  CardContent,
  Grid,
  useTheme,
  Button,
} from '@mui/material';
import HomeFooter from "./Constants/HomeFooter";
import {
  Business as BusinessIcon,
  Code as CodeIcon,
  Cloud as CloudIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Footer from "./Constants/Footer";
import Navbar from "./Constants/Navbar";
import { useNavigate } from "react-router-dom";

function Lider() {
  const theme = useTheme();

  const navigate = useNavigate();


  return (
    <Box>
      {/* Navbar */}
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

      {/* Body sections */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #f5f7fa, #e3f2fd)",
          py: 8,
        }}
      >
        {/* Main Content */}
        <Container>
          {/* About Us Section */}
       <Box sx={{ my: 6 }}>
  <Card
    elevation={3}
    sx={{
      background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
      transition: "all 0.3s ease-in-out",
      height: "100%",
      borderRadius: "16px",
      fontFamily: "Marquis",
      "&:hover": {
        transform: "scale(1.02)",
        boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
        background: "linear-gradient(135deg, #ffffff, #bbdefb)",
      },
    }}
  >
    <CardContent>
      <Grid container spacing={4} alignItems="center">
        {/* Left Side: Icon + Heading */}
        <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img
              src="/images/AboutUs1.jpg"
              alt="About Us"
              style={{ width: "80px", marginBottom: "16px" }}
            />
            <Typography
              variant="h4"
              component="h3"
              sx={{
                color: "#0f172a",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontFamily: "Marquis",
                fontSize: "1.75rem",
              }}
            >
              About Us
            </Typography>
          </Box>
        </Grid>

        {/* Right Side: Lists */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem sx={{ alignItems: "flex-start", py: 2 }}>
                  <Box sx={{ minWidth: 40, display: "flex", justifyContent: "center", pt: "4px" }}>
                    <GroupIcon sx={{ color: "#0288d1", fontSize: "30px" }} />
                  </Box>
                  <ListItemText
                    primary="We provide innovative solutions tailored to your unique goals. Our dedicated team is committed to delivering measurable results."
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      fontFamily: "Marquis",
                      fontSize: "18px",
                    }}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
                <ListItem sx={{ alignItems: "flex-start", py: 2 }}>
                  <Box sx={{ minWidth: 40, display: "flex", justifyContent: "center", pt: "4px" }}>
                    <GroupIcon sx={{ color: "#0288d1", fontSize: "30px" }} />
                  </Box>
                  <ListItemText
                    primary="We provide a range of services designed to help startups and small businesses thrive."
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      fontFamily: "Marquis",
                      fontSize: "18px",
                    }}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem sx={{ alignItems: "flex-start", py: 2 }}>
                  <Box sx={{ minWidth: 40, display: "flex", justifyContent: "center", pt: "4px" }}>
                    <GroupIcon sx={{ color: "#0288d1", fontSize: "30px" }} />
                  </Box>
                  <ListItemText
                    primary="Founded in 2023, My Startup Company has quickly become a leader in the startup and small business community."
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      fontFamily: "Marquis",
                      fontSize: "18px",
                    }}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
                <ListItem sx={{ alignItems: "flex-start", py: 2 }}>
                  <Box sx={{ minWidth: 40, display: "flex", justifyContent: "center", pt: "4px" }}>
                    <GroupIcon sx={{ color: "#0288d1", fontSize: "30px" }} />
                  </Box>
                  <ListItemText
                    primary="Our team of experienced professionals is dedicated to helping businesses of all sizes achieve their goals."
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      fontFamily: "Marquis",
                      fontSize: "18px",
                    }}
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Box>

          {/* Our Purpose Section */}
          <Box sx={{ my: 6 }}>
            <Card elevation={3} sx={{
              background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
              transition: "all 0.3s ease-in-out",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: "16px",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
                background: "linear-gradient(135deg, #ffffff, #bbdefb)",
              },
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.dark,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: 'Marquis',
                    mb: 3,
                    mt: 2,
                    ml: 3,

                  }}
                >
                  <img src="/images/our purpose.jpg" alt="purpose" style={{ width: '40px', marginRight: '10px' }} />
                  Our Purpose
                </Typography>

                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Lidertechnology is an IT Services Company based in India, specializing in Managed IT Infrastructure Services.
We empower businesses with reliable, scalable, and cost-effective technology solutions."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="The company is committed to providing a good work environment for its team and clients."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="It develops customized applications and websites tailored to user requirements.
Our focus is on creating seamless, user-friendly experiences that drive engagement."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="By delivering personalized solutions, Lidertechnology adds significant value to its clients' business operations."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Lider Technology Solutions Section */}
          <Box sx={{ my: 6 }}>
            <Card elevation={3} sx={{
              background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
              transition: "all 0.3s ease-in-out",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: "16px",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
                background: "linear-gradient(135deg, #ffffff, #bbdefb)",
              },
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.dark,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: 'Marquis',
                    mb: 3,
                    mt: 2,
                    ml: 3,
                  }}
                >
                  <img src="/images/lider.jpg" alt="purpose" style={{ width: '40px', marginRight: '10px' }} />
                  Lider Technology Solutions
                </Typography>

                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Technology solutions companies play an increasingly crucial role in today's digital landscape.
They drive innovation, streamline operations, and help organizations stay competitive."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Among the many firms in this space, Lider Technology Solutions distinguishes itself through innovation, efficacy, and customer-centricity."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="The company is dedicated to providing customized strategies and services that address the specific needs of each client.
Our client-centric approach ensures optimal outcomes and long-term success."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Lider's operations are guided by a strong customer-centric approach, making it the foundation of the company's philosophy."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Our Company Section */}
          <Box sx={{ my: 6 }}>
            <Card elevation={3} sx={{
              background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
              transition: "all 0.3s ease-in-out",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: "16px",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
                background: "linear-gradient(135deg, #ffffff, #bbdefb)",
              },
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.dark,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: 'Marquis',
                    mb: 3,
                    mt: 2,
                    ml: 3,
                  }}
                >
                 <img src="/images/ourcompany1.png" alt="purpose" style={{ width: '40px', marginRight: '10px' }} />
                  Our Company
                </Typography>

                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="The enterprise Application Development Company in Chennai, India, delivering scalable and efficient digital solutions across industries."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="With a highly ingenious and futuristic development team, we develop and deploy industry-best, in-demand Android and iOS applications."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="We offer high-end services at sensible price tags, ensuring top-tier quality without compromising on cost-efficiency."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Our applications are stable and secure, with advanced threat defense mechanisms incorporated, along with ongoing support to ensure long-term performance."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Technologies Used Now Section */}
          <Box sx={{ my: 6 }}>
            <Card elevation={3} sx={{
              background: "linear-gradient(135deg, #ffffff, #e3f2fd)",
              transition: "all 0.3s ease-in-out",
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: "16px",
          
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
                background: "linear-gradient(135deg, #ffffff, #bbdefb)",
              },
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.dark,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontFamily: 'Marquis',
                    
                    mb: 3,
                    ml: 3,
                    mt: 2
                  }}
                >
                  <img src="/images/technologies.jpg" alt="purpose" style={{ width: '40px', marginRight: '10px' }} />
                  Technologies Used Now
                </Typography>

                <Grid container spacing={3} alignItems="stretch">
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Develop a strong brand identity and invest in marketing strategies to increase awareness and attract customers to your startup."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Assemble a talented and diverse team with the skills and expertise required to execute your business plan effectively."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Embrace cloud computing, data analytics, artificial intelligence (AI), and other emerging technologies to gain a competitive edge."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <ListItem sx={{ alignItems: 'flex-start', py: 2, minHeight: '90px' }}>
                        <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'center', pt: '4px' }}>
                          <GroupIcon sx={{ color: theme.palette.secondary.main, fontSize: "30px" }} />
                        </Box>
                        <ListItemText
                          primary="Collaborate with other companies, industry associations, and ecosystems to explore new markets, share resources, and accelerate growth."
                          primaryTypographyProps={{ fontWeight: 'medium', fontFamily: "Marquis", fontSize: "20px" }}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Container>

        {/* Footer */}
        <Box
          sx={{
            mt: 6,
            fontFamily: 'Marquis',
            background: "linear-gradient(135deg, #f5f7fa, #e3f2fd)",
          }}
        >
            <HomeFooter />
        </Box>
      </Box>
    </Box>
  );
}

export default Lider;