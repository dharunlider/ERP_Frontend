import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = [
    { label: "About Us", path: "/about-us/lider" },
    { label: "Services", path: "/lider-service" },
    { label: "Careers", path: "/careers" },
    { label: "Blog", path: "/blog" },
    { label: "Contact", path: "/contact" }, 
  ];

  const handleClick = (path) => {
    if (path.includes("#")) {
      // Navigate to home page and let it scroll to section
      navigate("/", { state: { scrollTo: path.split("#")[1] } });
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#0d1b2a", color: "#ffffff", pt: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
              Lider Tech
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: "#cbd5e1" }}>
              We provide reliable technology solutions with a commitment to
              innovation, quality, and client success. Empowering businesses
              through software and engineering excellence.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Quick Links
            </Typography>
            {footerLinks.map((link, i) => (
              <Typography
                key={i}
                variant="body2"
                onClick={() => handleClick(link.path)}
                sx={{
                  mb: 1.2,
                  color: "#cbd5e1",
                  cursor: "pointer",
                  "&:hover": { color: "#90caf9" },
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Contact Us
            </Typography>
            <Stack spacing={1} sx={{ color: "#cbd5e1", fontSize: 14 }}>
              <div>
                <Typography sx={{ fontWeight: "bold" }}>India Office</Typography>
                <span>Lider Technology Solution Pvt. Ltd.</span>
                <span>381, TH Road Thiruvottiyur, Chennai - 600019</span>
                <span>Tamil Nadu, India</span>
                <span>+91 9840369993</span>
              </div>
              <Divider sx={{ my: 2, backgroundColor: "#334155" }} />
              <div>
                <Typography sx={{ fontWeight: "bold" }}>Singapore Office</Typography>
                <span>207, Serangoon Central #10-186</span>
                <span>Singapore - 550207</span>
                <span>+65 8612 1295</span>
              </div>
            </Stack>
          </Grid>
        </Grid>

        {/* Social Media Section */}
        <Divider sx={{ my: 5, backgroundColor: "#334155" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            pb: 4,
          }}
        >
          <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
            © 2025 Lider Technology Solutions. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <IconButton sx={{ color: "#90caf9" }}>
              <FacebookIcon />
            </IconButton>
            <IconButton sx={{ color: "#90caf9" }}>
              <TwitterIcon />
            </IconButton>
            <IconButton sx={{ color: "#90caf9" }}>
              <LinkedInIcon />
            </IconButton>
            <IconButton sx={{ color: "#f87171" }}>
              <YouTubeIcon />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
