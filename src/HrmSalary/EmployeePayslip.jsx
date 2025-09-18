// Props: staffId (optional), withFilters (default true)
import React, { useEffect, useState } from "react";
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableHead,
    TableRow, Typography, Divider, Button, CircularProgress, Alert
} from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import axios from "../Axiosinstance";
import Nodatapage from "../Nodatapage";

const PayslipView = ({ staffId, withFilters }) => {
    const [payslip, setPayslip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [staffDetails, setStaffDetails] = useState({});

    useEffect(() => {
        if (staffId) {
            fetchPayslip(staffId);
            fetchStaffDetails(staffId);
        }
    }, [staffId]);

    const fetchStaffDetails = async (staffId) => {
        try {
            const res = await axios.get("/staff/allstaffs");
            const staff = res.data.find((item) => item.id === staffId);
            if (staff) {
                setStaffDetails({
                    name: staff.name,
                    role: staff.roleName,
                    department: staff.departmentName
                });
            }
        } catch (err) {
            console.error("Failed to fetch staff details", err);
        }
    };


    useEffect(() => {
        if (staffId) fetchPayslip(staffId);
    }, [staffId]);

    const fetchPayslip = async (staffId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/payslip/staff/${staffId}`);
            if (res.data.length > 0) {
                setPayslip(res.data[0]);
            } else {
                setError("No payslip data found.");
            }
        } catch {
            setError("Failed to fetch payslip.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!payslip?.id) return;
        setDownloading(true);
        try {
            const response = await axios.get(`/payslip/payslip/${payslip.id}/pdf`, {
                responseType: "blob"
            });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Payslip-${payslip.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            alert("Failed to download PDF.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return payslip ? (
        
        <Card sx={{ my: 4, borderRadius: 3, boxShadow: 4, overflowX: 'auto' }}>
            <CardContent>
                <Typography variant="h5" align="center" fontWeight={600}>PAYSLIP SUMMARY</Typography>
                <Divider sx={{ my: 2 }} />
                <Table sx={{ borderCollapse: 'collapse', width: '100%' }}>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell align="center"><strong>S.NO</strong></TableCell>
                            <TableCell align="center"><strong>STAFF NAME</strong></TableCell>
                            <TableCell align="center"><strong>ROLE</strong></TableCell>
                            <TableCell align="center"><strong>DEPARTMENT</strong></TableCell>
                            <TableCell align="center"><strong>NET SALARY</strong></TableCell>
                            <TableCell align="center"><strong>GROSS</strong></TableCell>
                            <TableCell align="center"><strong>LOP DAYS</strong></TableCell>
                            <TableCell align="center"><strong>ACTIONS</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center">1</TableCell>
                            <TableCell align="center">{staffDetails.name || '—'}</TableCell>
                            <TableCell align="center">{staffDetails.role || '—'}</TableCell>
                            <TableCell align="center">{staffDetails.department.toUpperCase() || '—'}</TableCell>
                            <TableCell align="center">₹{payslip.netSalary?.toFixed(2)}</TableCell>
                            <TableCell align="center">₹{payslip.grossSalary?.toFixed(2)}</TableCell>
                            <TableCell align="center">{payslip.lopDays}</TableCell>
                            <TableCell align="center">
                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={downloading}
                                    onClick={handleDownload}
                                    sx={{
                                        background: 'linear-gradient(45deg, #1e88e5, #3f739c)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: 2
                                    }}
                                    startIcon={<DownloadIcon />}
                                >
                                    {downloading ? "Downloading…" : "Download"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    ) : (
        <Nodatapage />
    );
};


export default PayslipView;
