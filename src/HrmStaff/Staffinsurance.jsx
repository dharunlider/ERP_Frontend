import React, { useEffect, useState } from 'react';
import axios from '../Axiosinstance';
import {
  Paper,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,useMediaQuery,
} from '@mui/material';

const Staffinsurance = ({ staffid }) => {
  const [insuranceData, setInsuranceData] = useState([]);
  const [loading, setLoading] = useState(true);
   const isMobile = useMediaQuery(('sm'));

  useEffect(() => {
    axios.get(`/insurance/staff/${staffid}`)
      .then((response) => {
        const data = response.data;
        console.log(data, "data"); // this should show an array
        setInsuranceData(data); // set the full array
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch insurance data:', error);
        setLoading(false);
      });
  }, [staffid]);

  if (loading) {
    return <CircularProgress sx={{ margin: 4 }} />;
  }

  if (!insuranceData || insuranceData.length === 0) {
    return (
      <Typography sx={{ margin: 4 }} color="error">
        No insurance records found.
      </Typography>
    );
  }

 
  return (
   <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
               <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{
                 '& .MuiTableCell-root': {
                   border: '1px solid rgba(224, 224, 224, 1)',
                   padding: isMobile ? '6px 8px' : '8px 12px',
                   fontSize: isMobile ? '0.75rem' : '0.875rem'
                 },
                 '& .MuiTableCell-head': {
                   backgroundColor: '#f5f5f5',
                   fontWeight: 'bold',
                   position: 'sticky',
                   top: 0,
                   zIndex: 1
                 }
               }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Insurance Book Number</strong></TableCell>
            <TableCell><strong>Provincial/City Code</strong></TableCell>
            <TableCell><strong>Health Insurance Number</strong></TableCell>
            <TableCell><strong>Registration of Medical Care</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {insuranceData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.bookNumber}</TableCell>
              <TableCell>{item.cityCode}</TableCell>
              <TableCell>{item.healthInsuranceNumber}</TableCell>
              <TableCell>{item.registrationOfMedicalCare}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Staffinsurance;
