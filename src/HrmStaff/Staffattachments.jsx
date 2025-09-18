import React from 'react';
import { createTheme, ThemeProvider, Box, Typography, Paper } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const theme = createTheme({
  typography: {
    fontFamily: '"Marquis", sans-serif',
  },
});

const Staffattachments = () => {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log('Files uploaded:', acceptedFiles);
      // You can upload files to the server here
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h5" gutterBottom align="left">
  Upload Staff Attachments
</Typography>


        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #888',
            padding: 4,
            borderRadius: 2,
            backgroundColor: isDragActive ? '#e0f7fa' : '#fafafa',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <Typography>
            {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
          </Typography>
        </Box>

        {acceptedFiles.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle1">Uploaded Files:</Typography>
            <ul>
              {acceptedFiles.map((file) => (
                <li key={file.path}>{file.path} - {file.size} bytes</li>
              ))}
            </ul>
          </Box>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default Staffattachments;
