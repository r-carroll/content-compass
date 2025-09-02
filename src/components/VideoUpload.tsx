import React, { useState, useRef } from 'react';
import { validateVideoFile } from '../lib/validation';
import { selectVideoFile } from '../lib/tauri';
import ValidationErrorModal from './ValidationErrorModal';
import { VideoIcon, SparkleIcon, CompassIcon } from './Icons';

export default function VideoUpload({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const handleSelectFile = async () => {
    try {
      const filePath = await selectVideoFile();
      if (filePath) {
        // Create a mock file object for validation
        const fileName = filePath.split('/').pop() || 'selected-file';
        const mockFile = {
          name: fileName,
          size: 0, // We don't have size info from file path
          type: 'video/' + (fileName.split('.').pop() || 'mp4')
        };
        
        // Skip size validation for selected files since we don't have the info
        onUpload(mockFile, filePath);
      }
    } catch (error) {
      setValidationError(`File selection failed: ${error.message}`);
    }
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (loading) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleVideoUpload(files[0], null);
    }
  };

  const handleVideoUpload = (file, filePath) => {
    try {
      // Only validate file size for actual file objects (not file paths)
      if (!filePath) {
        validateVideoFile(file);
      }
      onUpload(file, filePath);
    } catch (error) {
      setValidationError(`Invalid file: ${error.message}`);
      return;
    }
  };

  const handleFileSelect = (e) => {
    if (loading) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      handleVideoUpload(e.target.files[0], null);
    }
  };

  const handleCloseError = () => {
    setValidationError(null);
  };

  const handleRetryUpload = () => {
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="upload-container">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div 
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (loading) return;
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          
          <div className="drop-zone-content">
            {loading ? (
              <div className="loading-spinner">
                <div className="processing-animation">
                  <SparkleIcon className="sparkle-icon" />
                  <div className="spinner"></div>
                </div>
                <p>Processing video...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <VideoIcon />
                </div>
                <h3>Drop your video file here</h3>
                <p>or click to select a video file from your computer</p>
                <div className="upload-hint">
                  <span className="file-types">Supports MP4, MOV, AVI, MKV, WebM</span>
                  <span className="file-size">Max size: 500MB</span>
                </div>
                <div className="upload-features">
                  <div className="feature">
                    <SparkleIcon className="feature-icon" />
                    <span>Local AI transcription</span>
                  </div>
                  <div className="feature">
                    <CompassIcon className="feature-icon" />
                    <span>Intelligent snippet extraction</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ValidationErrorModal
        error={validationError}
        onClose={handleCloseError}
        onRetry={handleRetryUpload}
      />
    </>
  );
}