// utils/uploadFileToCloudinary.js
export const uploadFileToCloudinary = async (file) => {
  if (!file) return null;

  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error('Only PDF, JPEG, PNG, and Word documents are allowed');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB');
  }

  const presetNames = [
    'erp_unsigned_upload',
    'erp_unsigned_upload_0',
    'erp_unsigned_upload0',
    'unsigned_upload',
    'ml_default'
  ];

  let response;
  let lastError;

  for (const presetName of presetNames) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', presetName);

      response = await fetch('https://api.cloudinary.com/v1_1/dn8zkmwt1/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) break;

      const errorData = await response.json();
      lastError = errorData;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response || !response.ok) {
    throw new Error(`All presets failed. Last error: ${JSON.stringify(lastError)}`);
  }

  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error('Upload failed: No secure_url returned');
  }
};
