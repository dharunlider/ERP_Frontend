import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const NoDataPage = () => {
  const noDataMessage = "No data available";

  return (
    <Paper
      elevation={1}
      sx={{
        mt: 4,
        p: 4,
        textAlign: 'center',
        // background: 'linear-gradient(135deg, #f9f9ff 0%, #f0f4ff 100%)',
          background: 'linear-gradient(135deg,rgb(211, 211, 214) 0%,hsl(240, 9.10%, 91.40%) 100%)',
        borderRadius: 3,
      }}
    >
      <img
        src="https://notion-emojis.s3-us-west-2.amazonaws.com/prod/svg-twitter/1f4d1.svg"
        alt="Empty"
        style={{ width: 80, marginBottom: 20 }}
      />
      <Typography variant="h6" sx={{ fontWeight: 600,mb: 1}}>
        No Data Available
      </Typography>
      {/* <Typography variant="body2" color="textSecondary">
        {noDataMessage}
      </Typography> */}
    </Paper>
  );
};

export default NoDataPage;
