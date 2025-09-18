import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Collapse,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionIcon from "@mui/icons-material/Description";
import BuildIcon from "@mui/icons-material/Build";
import SettingsIcon from "@mui/icons-material/Settings";

const Navbar = ({ contactRef }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElAbout, setAnchorElAbout] = useState(null);
  const [anchorElServices, setAnchorElServices] = useState(null);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleAboutMenuOpen = (e) => setAnchorElAbout(e.currentTarget);
  const handleAboutMenuClose = () => setAnchorElAbout(null);
  const handleServicesMenuOpen = (e) => setAnchorElServices(e.currentTarget);
  const handleServicesMenuClose = () => setAnchorElServices(null);
  const handleMobileAboutToggle = () => setMobileAboutOpen(!mobileAboutOpen);
  const handleMobileServicesToggle = () => setMobileServicesOpen(!mobileServicesOpen);

  const handleContactUsClick = () => {
    if (window.location.pathname === "/") {
      contactRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo(0, 0);
      navigate("/", { state: { scrollToContact: true } });
    }
  };

  useEffect(() => {
    if (window.location.pathname === "/" && location.state?.scrollToContact) {
      setTimeout(() => {
        contactRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location]);

  const navItems = ["Home", "Liderproduct", "About", "Services", "Contact" , "Newsletter"];

  const aboutItems = [
    { text: "LIDER ERP", path: "/About/LiderErp", icon: <DescriptionIcon sx={{ mr: 1 }} /> },
    { text: "LIDER", path: "/about-us/lider", icon: <BuildIcon sx={{ mr: 1 }} /> },
  ];

  const servicesItems = [
    { text: "LIDER SERVICE", path: "/lider-service", icon: <SettingsIcon sx={{ mr: 1 }} /> },
  ];

  return (
    <>
      <AppBar position="fixed" color="inherit" elevation={4} sx={{ p: 1, background: `#e3f2fd`, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ px: 2, height: 64 }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}

          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src="/images/liderlogo.png"
              alt="Lider Logo"
              sx={{ height: 50, cursor: "pointer", mr: 1 }}
              onClick={() => navigate("/")}
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {navItems.map((text) => (
                <Box key={text}>
                  {text === "About" ? (
                    <>
                      <Button
                        color="inherit"
                        sx={{ fontSize: "18px", px: 3, py: 1 }}
                        onClick={handleAboutMenuOpen}
                        endIcon={<ArrowDropDownIcon />}
                      >
                        {text}
                      </Button>
                      <Menu anchorEl={anchorElAbout} open={Boolean(anchorElAbout)} onClose={handleAboutMenuClose} sx={{ mt: 1 }}>
                        {aboutItems.map((item) => (
                          <MenuItem
                            key={item.text}
                            onClick={() => {
                              handleAboutMenuClose();
                              navigate(item.path);
                            }}
                            sx={{ "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" }, transition: "background-color 0.3s ease", py: 1.5 }}
                          >
                            {item.icon}
                            <Typography variant="body1" sx={{ ml: 1 }}>{item.text}</Typography>
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  ) : text === "Services" ? (
                    <>
                      <Button
                        color="inherit"
                        sx={{ fontSize: "18px", px: 3, py: 1 }}
                        onClick={handleServicesMenuOpen}
                        endIcon={<ArrowDropDownIcon />}
                      >
                        {text}
                      </Button>
                      <Menu anchorEl={anchorElServices} open={Boolean(anchorElServices)} onClose={handleServicesMenuClose} sx={{ mt: 1 }}>
                        {servicesItems.map((item) => (
                          <MenuItem
                            key={item.text}
                            onClick={() => {
                              handleServicesMenuClose();
                              navigate(item.path);
                            }}
                            sx={{ "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" }, transition: "background-color 0.3s ease", py: 1.5 }}
                          >
                            {item.icon}
                            <Typography variant="body1" sx={{ ml: 1 }}>{item.text}</Typography>
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  ) : text === "Contact" ? (
                    <Button color="inherit" sx={{ fontSize: "18px", px: 3, py: 1 }} onClick={handleContactUsClick}>
                      {text}
                    </Button>
                  ) : (
                    <Button color="inherit" sx={{ fontSize: "18px", px: 3, py: 1 }} onClick={() => navigate(text === "Home" ? "/" : `/${text.toLowerCase()}`)}>
                      {text}
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && (
            <>
              <Button color="inherit" onClick={() => navigate("/login")} sx={{ fontSize: "18px", px: 4 }}>
                LogIn
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => navigate("/signup")} sx={{ fontSize: "18px", px: 1 }}>
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ "& .MuiDrawer-paper": { width: 250, top: 64 } }}
      >
        <List sx={{ width: 250 }}>
          {navItems.map((text) => (
            <React.Fragment key={text}>
              {text === "About" ? (
                <>
                  <ListItem button onClick={handleMobileAboutToggle}>
                    <ListItemText primary={text} />
                    {mobileAboutOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                  <Collapse in={mobileAboutOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {aboutItems.map((item) => (
                        <ListItem button key={item.text} sx={{ pl: 4 }} onClick={() => {
                          handleDrawerToggle();
                          navigate(item.path);
                        }}>
                          {item.icon}
                          <ListItemText primary={item.text} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : text === "Services" ? (
                <>
                  <ListItem button onClick={handleMobileServicesToggle}>
                    <ListItemText primary={text} />
                    {mobileServicesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                  <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {servicesItems.map((item) => (
                        <ListItem button key={item.text} sx={{ pl: 4 }} onClick={() => {
                          handleDrawerToggle();
                          navigate(item.path);
                        }}>
                          {item.icon}
                          <ListItemText primary={item.text} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : text === "Contact" ? (
                <ListItem button onClick={() => {
                  handleDrawerToggle();
                  handleContactUsClick();
                }}>
                  <ListItemText primary={text} />
                </ListItem>
              ) : (
                <ListItem button onClick={() => {
                  handleDrawerToggle();
                  navigate(text === "Home" ? "/" : `/${text.toLowerCase()}`);
                }}>
                  <ListItemText primary={text} />
                </ListItem>
              )}
            </React.Fragment>
          ))}
          <Divider />
          <ListItem button onClick={() => navigate("/login")}>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button onClick={() => navigate("/signup")}>
            <ListItemText primary="Sign Up" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );  
};

export default Navbar;
