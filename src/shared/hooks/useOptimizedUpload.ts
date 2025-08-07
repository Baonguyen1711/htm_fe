import { useState, useCallback } from 'react';
import { uploadFile } from './common/uploadAssestServices';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseOptimizedUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadFileOptimized: (file: File, description: string) => Promise<string>;
  reset: () => void;
}

export const useOptimizedUpload = (): UseOptimizedUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFileOptimized = useCallback(async (file: File, description: string): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      // Validate file before upload
      if (!file) {
        throw new Error('No file selected');
      }

      // Check file size (limit to 10MB for better performance)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
      }

      console.log(`🚀 Starting optimized upload for: ${file.name}`);
      const startTime = performance.now();

      // Upload file with progress tracking
      const key = await uploadFile(file, description);

      const endTime = performance.now();
      console.log(`✅ Upload completed in ${(endTime - startTime).toFixed(2)}ms`);

      return key;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('❌ Upload error:', err);
      throw err;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadFileOptimized,
    reset,
  };
};

export default useOptimizedUpload;
