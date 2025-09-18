import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        width: "100%",
        height: isMobile ? "40px" : "50px",
        backgroundColor: "rgb(230, 246, 237)",
        color: theme.palette.text.secondary,
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-end",
        padding: isMobile ? "0 10px" : "0 30px",
        boxSizing: "border-box",
        "@media print": {
          position: "absolute",
          bottom: 0,
          width: "100%",
          display: "flex",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: isMobile ? "0.65rem" : "0.85rem",
          fontWeight: "bold",
          textAlign: isMobile ? "center" : "right",
          flexWrap: "wrap",
        }}
      >
        © 2025 Powered By Lider Technology | All Rights Reserved{" "}
        <img
          src="/images/liderlogo.png"
          alt="Lider Technology Logo"
          style={{
            height: isMobile ? 16 : 20,
            marginLeft: isMobile ? 4 : 8,
          }}
        />
      </Typography>
    </Box>
  );
};

export default Footer;
