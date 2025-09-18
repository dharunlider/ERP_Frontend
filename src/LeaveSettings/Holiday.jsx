import React, { useState, useEffect } from 'react';
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormControlLabel, IconButton,
  InputAdornment, InputLabel, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, useMediaQuery,
  useTheme, Typography, Tabs, Tab
} from '@mui/material';
import { Add, Delete, Edit, FileDownload, Search } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import PublicHoliday from './PublicHoliday';
import * as XLSX from 'xlsx';
import axios from '../Axiosinstance';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Nodatapage from "../Nodatapage";
import CircularProgress from '@mui/material/CircularProgress';

const HolidayTab = () => {


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  return (

    <Box sx={{ p: 2, }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          bgcolor: '#F0F4F8',
          padding: '8px 12px',
          // borderRadius: '12px',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#142a4f',
            // borderRadius: '8px',
            padding: '6px 18px',
            // margin: '0 8px',
            backgroundColor: '#ffffff',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: '#e6ecf3',
            },
            '&.Mui-selected': {
              backgroundColor: '#142a4f',
              color: '#ffffff',
              boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <Tab label="PUBLIC HOLIDAYS" />
      </Tabs>

      {activeTab === 0 && (
        <Box >
          <PublicHoliday />
        </Box>
      )}


    </Box>
  );
};

export default HolidayTab;