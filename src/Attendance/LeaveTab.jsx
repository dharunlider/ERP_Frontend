import React, { useEffect, useState } from "react";
import {
  Tabs, Tab, Box, Typography, Table, TableBody, TableCell,
  TableHead, TableRow, Divider, Stack, CircularProgress
} from "@mui/material";
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from "../Axiosinstance";
import NoDataPage from "../Nodatapage";

const tabEndpoints = [
  { label: "Approved", url: "/approval-process/approved" },
  { label: "Pending", url: "/approval-process/pending" },
  { label: "Rejected", url: "/approval-process/rejected" },
];

export default function ApprovalStatusTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleTabChange = (e, val) => {
    setActiveTab(val);
    setData([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
  };

  const fetchData = async (reset = false) => {
    if (reset) {
      setInitialLoading(true);
      setCursor(null);
    } else {
      if (loadingMore) return;
      setLoadingMore(true);
    }

    try {
      const params = { size: 10 };
      if (cursor && !reset) params.cursor = cursor;

      const response = await axios.get(tabEndpoints[activeTab].url, { params });
      const newData = response.data || [];

      setData(prev => reset ? newData : [...prev, ...newData]);
      setHasMore(newData.length >= 10);

      if (newData.length > 0) {
        setCursor(newData[newData.length - 1].id);
      }
    } catch (error) {
      console.error("Error fetching approval data:", error);
      if (reset) setData([]);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [activeTab]);

  const renderTableHeader = () => (
    <TableRow>
      <TableCell align="center">S.NO</TableCell>
      <TableCell align="center">Subject</TableCell>
      <TableCell align="center">Reason</TableCell>
      <TableCell align="center">Assigned No</TableCell>
      <TableCell align="center">Approved By</TableCell>
      <TableCell align="center">Email</TableCell>
      <TableCell align="center">Staff Name</TableCell>
      <TableCell align="center">Staff Email</TableCell>
    </TableRow>
  );

  const renderTableBody = () =>
    data.map((row, index) => (
      <TableRow key={row.id}>
        <TableCell align="center">{index + 1}</TableCell>
        <TableCell align="center">{row.subject}</TableCell>
        <TableCell align="center">{row.relatedReason}</TableCell>
        <TableCell align="center">{row.maximumNumberToAssign}</TableCell>
        <TableCell align="center">{row.notificationReceivedToName}</TableCell>
        <TableCell align="center">{row.receivedPersonEmail}</TableCell>
        <TableCell align="center">{row.leaveAppliedStaffName}</TableCell>
        <TableCell align="center">{row.leaveAppliedStaffEmail}</TableCell>
      </TableRow>
    ));

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Stack direction="row" alignItems="center" mb={2} spacing={1.5}>
        <AssignmentIcon sx={{ fontSize: 36, background: 'rgba(25, 118, 210, 0.1)', borderRadius: '50%', p: 1 }} />
        <Typography variant="h5" fontWeight={700}>APPROVAL PROCESS STATUS</Typography>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

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
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#142a4f',
            backgroundColor: '#ffffff',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { backgroundColor: '#e6ecf3' },
            '&.Mui-selected': {
              backgroundColor: '#142a4f',
              color: '#ffffff',
              boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        {tabEndpoints.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      
      </Tabs>

      {initialLoading ? (
        <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>
      ) : data.length === 0 ? (
        <NoDataPage />
      ) : (
        <Box
          id="scrollable-table"
          sx={{
            width: '100%',
            overflowX: 'auto',
            maxHeight: '70vh',
            border: '1px solid #e0e0e0',
          }}
        >
          <InfiniteScroll
            dataLength={data.length}
            next={() => fetchData(false)}
            hasMore={hasMore}
            scrollableTarget="scrollable-table"
            loader={
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
              </Box>
            }
            endMessage={
              <Box textAlign="center" p={2}>
                <Typography variant="body2" color="textSecondary">
                  No more  data to load.
                </Typography>
              </Box>
            }
          >
            <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
              <TableHead
                sx={{
                  '& .MuiTableCell-root': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                {renderTableHeader()}
              </TableHead>
              <TableBody
                sx={{
                  '& .MuiTableCell-root': {
                    border: '1px solid rgba(224, 224, 224, 1)',
                    fontSize: '0.875rem',
                    padding: '8px 12px',
                  },
                }}
              >
                {renderTableBody()}
              </TableBody>
            </Table>
          </InfiniteScroll>
        </Box>
      )}
    </Box>
  );
}
