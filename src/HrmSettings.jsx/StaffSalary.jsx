import React, { useState, useEffect } from 'react';
import {
    Paper, useMediaQuery, useTheme, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Box, CircularProgress, TextField
} from '@mui/material';
import axios from '../Axiosinstance';
import Nodatapage from "../Nodatapage";
const EmployeSalary = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [salaryData, setSalaryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalaryData = async () => {
            try {
                const response = await axios.get('/staff-contracts');
                const data = Array.isArray(response.data) ? response.data : [response.data];
                setSalaryData(data);
                setFilteredData(data);
            } catch (error) {
                console.error('Failed to fetch salary data:', error);
                setSalaryData([]);
                setFilteredData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSalaryData();
    }, []);

    // Filter data based on staff name
    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = salaryData.filter((row) =>
            row.staff?.name?.toLowerCase().includes(lowerSearch)
        );
        setFilteredData(filtered);
    }, [searchTerm, salaryData]);

    return (
  
        <Box style={{ padding: isMobile ? '12px' : '24px'}}>
            {/* <Typography variant="h6" gutterBottom>Employee Salary Details</Typography> */}

            {/* Search Input */}
            <TextField
                label="Search by Staff Name"
                variant="outlined"
                fullWidth
                size="small"
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    maxWidth: isMobile ? '100%' : '300px',
                    marginRight: isMobile ? '0' : '16px',   
                }}
            />

            {loading ? (
                <Box textAlign="center" mt={4}><CircularProgress /></Box>
            ) :  (
                <TableContainer>
                    <Table sx={{
                        '& .MuiTableCell-root': {
                            border: '1px solid rgba(224, 224, 224, 1)',
                            padding: isMobile ? '6px 8px' : '8px 12px',
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                        },
                        '& .MuiTableCell-head': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        },
                        minWidth: isMobile ? '600px' : undefined
                    }} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontFamily: "Marquis" }} align="center">S.NO</TableCell>
                                <TableCell style={{ fontFamily: "Marquis" }} align="center">STAFF NAME</TableCell>
                                {/* <TableCell style={{  fontFamily: "Marquis" }} align="center">SALARY TYPE</TableCell> */}
                                <TableCell style={{ fontFamily: "Marquis" }} align="center">CONTRACT ID</TableCell>
                                <TableCell style={{ fontFamily: "Marquis" }} align="center">PAYMENT MODE</TableCell>
                                <TableCell style={{ fontFamily: "Marquis" }} align="center">AMOUNT</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                             {filteredData.length === 0 ? (
                                <TableRow>
                          <TableCell colSpan={8}   >
                            <Nodatapage />
                          </TableCell>
                        </TableRow>
                      ) : (  
                            filteredData.map((row,index) => (
                                <TableRow key={row.id}>
                                    <TableCell align="center">{index+1}</TableCell>
                                    <TableCell align="center">{row.staff?.name || '—'}</TableCell>
                                    {/* <TableCell align="center">{row.salaryForm?.salaryName || '—'}</TableCell> */}
                                    <TableCell align="center">{row.contractId?.contractId || '—'}</TableCell>
                                    <TableCell align="center">{row.salaryForm?.paymentMode || '—'}</TableCell>
                                    <TableCell align="center">{row.salaryForm?.amount?.toLocaleString() || '—'}</TableCell>
                                </TableRow>
                           ) ))}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}
     
         </Box>
    );
};

export default EmployeSalary;
