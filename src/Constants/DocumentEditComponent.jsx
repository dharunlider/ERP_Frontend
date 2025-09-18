import React, { useState, useEffect } from 'react';
import axios from "../Axiosinstance";
import { toast } from 'react-toastify';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Chip,
    Tooltip,
    Stack,
    Paper,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    CloudUpload,
    Delete,
    Visibility,
    CheckCircleOutline,
    ErrorOutline
} from '@mui/icons-material';
import { uploadFileToCloudinary } from '../Constants/Documentuploadfunction';


const DocumentEditComponent = ({
    open,
    onClose,
    editingId,
    refreshData,
    initialDocumentUrl = null
}) => {
    const [saving, setSaving] = useState(false);
    const [documentCloudinaryUrl, setDocumentCloudinaryUrl] = useState(initialDocumentUrl);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Extract file name from URL
    useEffect(() => {
        if (initialDocumentUrl) {
            const decodedName = decodeURIComponent(initialDocumentUrl.split('/').pop());
            setFileName(decodedName);
        }
    }, [initialDocumentUrl]);

    const handleDocumentUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB');
            toast.error('File size exceeds 10MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Upload PDF, JPG, or PNG');
            toast.error('Invalid file type');
            return;
        }

        setUploading(true);
        setError('');
        setUploadSuccess(false);

        try {
            const cloudinaryUrl = await uploadFileToCloudinary(file, 'document');
            if (cloudinaryUrl) {
                setDocumentCloudinaryUrl(cloudinaryUrl);
                setFileName(file.name);
                setUploadSuccess(true);
                toast.success('Uploaded successfully!');
            }
        } catch (err) {
            setError('Upload failed');
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // const handleRemoveDocument = () => {
    //     setDocumentCloudinaryUrl(null);
    //     setFileName('');
    //     setError('');
    //     setUploadSuccess(false);
    // };



    const handleViewDocument = () => {
        if (documentCloudinaryUrl) {
            window.open(documentCloudinaryUrl, '_blank');
        } else {
            toast.info('No document uploaded to view.');
            // OR: alert('No document uploaded to view.');
        }
    };


    const handleSave = async () => {
        if (!documentCloudinaryUrl) {
            setError('Please upload a document');
            toast.error('Please upload a document');
            return;
        }

        try {
            setSaving(true);
            const payload = { document: documentCloudinaryUrl };
            await axios.patch(`/approval-process/${editingId}/document`, payload);
            toast.success('Document updated!');
            onClose();
            refreshData();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.details || 'Update failed');
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setDocumentCloudinaryUrl(initialDocumentUrl);
        setFileName(initialDocumentUrl ? decodeURIComponent(initialDocumentUrl.split('/').pop()) : '');
        setError('');
        setUploadSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
                This request has been approved. You can only update the document.
            </DialogTitle>

            <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 12, top: 12 }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Upload File (PDF, JPG, PNG - max 10MB)
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mb={2}>
                        <Tooltip title="Upload Document">
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                disabled={uploading}
                                sx={{ borderStyle: 'dashed', minWidth: 120 }}
                            >
                                Upload
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleDocumentUpload}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </Button>
                        </Tooltip>

                        <Tooltip title={documentCloudinaryUrl ? "View Document" : "No document uploaded"}>
                            <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={handleViewDocument}
                                sx={{
                                    minWidth: 120,
                                    color: 'primary.main',
                                    borderColor: 'primary.main',
                                    opacity: documentCloudinaryUrl ? 1 : 0.5,
                                    cursor: 'pointer',
                                }}
                            >
                                View
                            </Button>
                        </Tooltip>
                        {/* <Tooltip title="Remove Document">
                            <span>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    disabled={!documentCloudinaryUrl}
                                    onClick={handleRemoveDocument}
                                    sx={{ minWidth: 120 }}
                                >
                                    Remove
                                </Button>
                            </span>
                        </Tooltip> */}
                    </Stack>

                    {fileName && (
                        <Box
                            mt={3}
                            p={2}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                                border: '1px solid',
                                borderColor: 'grey.300',
                                borderRadius: 2,
                                backgroundColor: 'grey.50',
                            }}
                        >
                            <Box display="flex" alignItems="center">
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: 'primary.light',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2,
                                    }}
                                >
                                    <Typography variant="h6" color="primary">
                                        📄
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                    {fileName}
                                </Typography>
                            </Box>
                        </Box>
                    )}


                    {uploadSuccess && (
                        <Chip
                            icon={<CheckCircleOutline />}
                            label="Upload successful"
                            color="success"
                            sx={{ mt: 2 }}
                        />
                    )}

                    {error && (
                        <Chip
                            icon={<ErrorOutline />}
                            label={error}
                            color="error"
                            sx={{ mt: 2 }}
                        />
                    )}
                </Paper>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button onClick={handleClose} variant="outlined" color="secondary" sx={{ minWidth: 120 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving || !documentCloudinaryUrl}
                    sx={{ minWidth: 120 }}
                >
                    {saving ? 'Updating...' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DocumentEditComponent;
