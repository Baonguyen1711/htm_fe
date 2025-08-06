import axios from 'axios';
import { api } from '../../services/api/client';

async function getPresignedUrl(extension: string, contentType: string) {
  console.log("extension",extension);
  console.log("contentType",contentType);

  const response = await api.get(`/s3/presigned-url?content_type=${encodeURIComponent(contentType)}&extension=${encodeURIComponent(extension)}`);

  console.log("url", response.data)
  return response.data; // { preSignedUrl, key }
}

async function uploadFileToS3(preSignedUrl: string, file: File) {
  console.log("file.type",file.type);
  console.log("preSignedUrl",preSignedUrl);

  // Create a dedicated axios instance for S3 upload without interceptors
  const s3AxiosInstance = axios.create({
    timeout: 60000, // 60 seconds for large files
  });

  const response = await s3AxiosInstance.put(preSignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    withCredentials: false,
    // Add progress tracking for better UX
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    }
  });

  if (response.status !== 200 && response.status !== 204) {
    throw new Error('Failed to upload file to S3');
  }
}

async function notifyBackendFileUploaded(key: string, description: string) {
  const response = await api.post('/s3/save-file-key', {
    fileKey: key,
    description: description
  });

  if (response.status !== 200) {
    throw new Error('Failed to notify backend');
  }
}

export async function uploadFile( file: File, description:string) {
  const startTime = performance.now();

  try {
    console.log(`🚀 Starting upload for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Step 1: Get presigned URL
    const presignedStartTime = performance.now();
    const { preSignedUrl, Key } = await getPresignedUrl(file.name.split('.').pop() || '', file.type);
    const presignedEndTime = performance.now();
    console.log(`✅ Presigned URL obtained in ${(presignedEndTime - presignedStartTime).toFixed(2)}ms`);
    console.log("key", Key);
    console.log("preSignedUrl",preSignedUrl);

    // Step 2: Upload to S3
    const uploadStartTime = performance.now();
    await uploadFileToS3(preSignedUrl, file);
    const uploadEndTime = performance.now();
    console.log(`✅ File uploaded to S3 in ${(uploadEndTime - uploadStartTime).toFixed(2)}ms`);

    // Step 3: Notify backend (currently commented out)
    // await notifyBackendFileUploaded( Key, description);

    const totalTime = performance.now() - startTime;
    console.log(`🎉 Total upload completed in ${(totalTime).toFixed(2)}ms`);

    return Key;
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`❌ Upload failed after ${(totalTime).toFixed(2)}ms:`, error);
    throw error;
  }
}
