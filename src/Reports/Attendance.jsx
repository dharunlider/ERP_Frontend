import React, { useEffect, useState } from "react";
import axios from '../Axiosinstance';
import {
  Box,
  Grid, CircularProgress, Typography, Paper,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const tableHeaders = [
  "S.NO",
  "NAME",
  "ROLE",
  "POLICY NAME",
  "TOTAL LEAVES TAKEN",
  "SICK LEAVE",
  "ANNUAL LEAVE",
  "MATERNITY LEAVE",
  "PATERNITY LEAVE",
];

const LeaveSummaryTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`approval-process/summary/all?year=${year}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]); // <== refetch data when year changes

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const cellSx = {
    textTransform: "uppercase",
    fontFamily: "Marquis",
    wordWrap: "break-word",
    wordBreak: "break-word",
    whiteSpace: "normal",
    textAlign: "center",
    maxWidth: 150,
  };

  return (
    <Box m={2}>
      <Typography variant="h5" gutterBottom>
        Staff Leave Summary
      </Typography>

      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <TextField
          label="Year"
          size="small"
          value={year}
          onChange={handleYearChange}
          type="number"
        />
        <Button variant="outlined" onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small" stickyHeader sx={{
          '& th': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            textTransform: 'uppercase',
            border: '1px solid rgba(224, 224, 224, 1)',
            padding: '8px 12px',
            fontSize: '0.875rem',
            fontFamily: 'Marquis',
          },
          '& td': {
            border: '1px solid rgba(224, 224, 224, 1)',
            padding: '8px 12px',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            fontFamily: 'Marquis',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
          },
        }}>
          <TableHead>
            <TableRow>
              {tableHeaders.map(header => (
                <TableCell sx={cellSx} key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} align="center" sx={{ fontStyle: 'italic', color: 'gray' }}>
                  No matching records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((staff, index) => (
                <TableRow key={staff.staffId}>
                  <TableCell sx={cellSx}>{index + 1}</TableCell>
                  <TableCell sx={cellSx}>{staff.staffName}</TableCell>
                  <TableCell sx={cellSx}>{staff.role?.name}</TableCell>
                  <TableCell sx={cellSx}>{staff.policyName}</TableCell>
                  <TableCell sx={cellSx}>{staff.totalLeavesTaken}</TableCell>
                  <TableCell sx={cellSx}>{staff.leavesTaken?.SICK_LEAVE || 0}</TableCell>
                  <TableCell sx={cellSx}>{staff.leavesTaken?.ANNUAL_LEAVE || 0}</TableCell>
                  <TableCell sx={cellSx}>{staff.leavesTaken?.MATERNITY_LEAVE || 0}</TableCell>
                  <TableCell sx={cellSx}>{staff.leavesTaken?.PATERNITY_LEAVE || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LeaveSummaryTable;
