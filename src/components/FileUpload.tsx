import React, { useRef, useState } from 'react';

interface FileUploadProps {
  /**
   * Callback function when a file is selected
   */
  onFileSelected: (file: File) => void;
  
  /**
   * Accept attribute for the file input
   * @default "audio/*"
   */
  accept?: string;
  
  /**
   * Whether a file is currently being processed
   */
  isProcessing?: boolean;
  
  /**
   * Custom CSS class for the component
   */
  className?: string;
  
  /**
   * Button text for the file upload button
   * @default "Upload Audio"
   */
  buttonText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  accept = 'audio/*',
  isProcessing = false,
  className = '',
  buttonText = 'Upload Audio',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      onFileSelected(file);
    }
  };
  
  return (
    <div className={`file-upload ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden"
        disabled={isProcessing}
      />
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : buttonText}
      </button>
      {fileName && (
        <div className="mt-2 text-sm text-gray-600">
          Selected file: {fileName}
        </div>
      )}
    </div>
  );
};
