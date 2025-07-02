import axios from 'axios';

async function getPresignedUrl(extension: string, contentType: string) {
  console.log("extension",extension);
  console.log("contentType",contentType);
  

  
  
  const response = await axios.get(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/s3/presigned-url?content_type=${contentType}&extension=${extension}`, {
    withCredentials: true,
  });

  console.log("url", response.data)
  return response.data; // { preSignedUrl, key }
}

async function uploadFileToS3(preSignedUrl: string, file: File) {
  console.log("file.type",file.type);
  console.log("preSignedUrl",preSignedUrl);
  const response = await axios.put(preSignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },

    withCredentials: false
  });
  if (response.status !== 200 && response.status !== 204) {
    throw new Error('Failed to upload file to S3');
  }
}

async function notifyBackendFileUploaded(key: string, description: string) {
  const response = await axios.post(
    'https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/s3/save-file-key',
    {fileKey: key, description: description },
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  if (response.status !== 200) {
    throw new Error('Failed to notify backend');
  }
}

export async function uploadFile( file: File, description:string) {
  try {
    const { preSignedUrl, Key } = await getPresignedUrl(file.name.split('.').pop() || '', file.type);
    console.log("key", Key);
    
    console.log("preSignedUrl",preSignedUrl)
    await uploadFileToS3(preSignedUrl, file);
    // await notifyBackendFileUploaded( key, description);
    return Key;
  } catch (error) {
    console.error('Upload file failed:', error);
    throw error;
  }
}
