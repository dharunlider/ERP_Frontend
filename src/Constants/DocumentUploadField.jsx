import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography
} from '@mui/material';
import { CloudUpload, Delete, Visibility, Description } from '@mui/icons-material';

const DocumentUploadField = ({
  title,
  description,
  fileType,
  onUpload,
  onRemove,
  fileUrl,
  cloudinaryUrl,
  uploading,
  fileName,
  error,
  inputId
}) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {description}
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mt={2}>
        {fileUrl ? (
          <Description sx={{ fontSize: 40, color: 'primary.main' }} />
        ) : (
          <Description sx={{ fontSize: 40, color: 'grey.400' }} />
        )}

        <Box flex={1}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              component="label"
              htmlFor={inputId}
              startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
              size="small"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                id={inputId}
                type="file"
                onChange={onUpload}
                disabled={uploading}
              />
            </Button>

            {fileUrl && (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.open(cloudinaryUrl || fileUrl, '_blank')}
                  startIcon={<Visibility />}
                  size="small"
                  disabled={uploading}
                >
                  View
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={onRemove}
                  startIcon={<Delete />}
                  size="small"
                  disabled={uploading}
                >
                  Remove
                </Button>
              </>
            )}
          </Box>

          {fileName && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uploaded File: <strong>{fileName}</strong>
            </Typography>
          )}

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}

          {cloudinaryUrl && (
            <Typography variant="body2" color="success.main" mt={1}>
              ✓ Document successfully uploaded
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default DocumentUploadField;
