import React, { useState, useRef } from 'react';
import { validateVideoFile } from '../lib/validation';
import ValidationErrorModal from './ValidationErrorModal';
import { VideoIcon, SparkleIcon, CompassIcon } from './Icons';

export default function VideoUpload({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleVideoUpload = (file) => {
    try {
      validateVideoFile(file);
      console.log('File validated:', file);
      onUpload(file);
    } catch (error) {
      setValidationError(`Invalid file: ${error.message}`);
      return;
    }
  };

  const handleFileSelect = (e) => {
    console.log('file selected');
    if (e.target.files && e.target.files[0]) {
      handleVideoUpload(e.target.files[0]);
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
        <div 
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={loading}
          />
          
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
                <p>or click to browse and select a video file</p>
                <div className="upload-hint">
                  <span className="file-types">Supports MP4, MOV, AVI, MKV, WebM</span>
                  <span className="file-size">Max size: 500MB</span>
                </div>
                <div className="upload-features">
                  <div className="feature">
                    <SparkleIcon className="feature-icon" />
                    <span>AI-powered transcription</span>
                  </div>
                  <div className="feature">
                    <CompassIcon className="feature-icon" />
                    <span>Smart content analysis</span>
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