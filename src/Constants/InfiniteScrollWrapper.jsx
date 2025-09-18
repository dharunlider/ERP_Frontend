// InfiniteScrollWrapper.jsx
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Box, CircularProgress, Typography } from '@mui/material';

const InfiniteScrollWrapper = ({
  dataLength,
  next,
  hasMore,
  loading,
  children,
  endMessage = 'No more items to load',
  loader = (
    <Box display="flex" justifyContent="center" p={2}>
      <CircularProgress />
    </Box>
  ),

}) => {
  return (

      <InfiniteScroll
        dataLength={dataLength}
        next={next}
        hasMore={hasMore}
        loader={hasMore && loading ? loader : null} // Only show loader if hasMore AND loading
        endMessage={
          !hasMore && dataLength > 0 && ( // Only show end message if no more data AND we have some data
            <Box textAlign="center" p={2}>
              <Typography variant="body2" color="textSecondary">
                {endMessage}
              </Typography>
            </Box>
          )
        }
        style={{ overflow: 'visible', }}
      
      >
        {children}
      </InfiniteScroll>
   
  );
};

export default InfiniteScrollWrapper;