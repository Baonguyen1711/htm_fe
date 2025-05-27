import React, { useState } from 'react';

interface FileUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
  uploadFile: (file: File, description: string) => Promise<string>;
  expectedType?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  uploadFile,
  expectedType,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if file type matches expected type
      if (expectedType && expectedType !== 'N/A') {
        const fileType = selectedFile.type.split('/')[0]; // Get main type (image, audio, etc)
        
        if (expectedType.toLowerCase() !== fileType.toLowerCase()) {
          alert(`This question expects a ${expectedType} file. You selected a ${fileType} file.`);
          return;
        }
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      const key = await uploadFile(file, description);
      alert("File uploaded successfully");
      onUploadComplete(key);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Upload File</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              File {expectedType && `(${expectedType})`}
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description"
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploader;
