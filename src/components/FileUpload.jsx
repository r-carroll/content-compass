import React, { useState, useRef } from 'react';
import { parseAndValidateJSON, validateTranscriptFile, ValidationError } from '../lib/validation';
import ValidationErrorModal from './ValidationErrorModal';
import { UploadIcon, PasteIcon, DocumentIcon, CheckIcon } from './Icons';

export default function FileUpload({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [uploadMode, setUploadMode] = useState('file');
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    try {
      validateTranscriptFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = parseAndValidateJSON(e.target.result);
          onUpload(result.data);
        } catch (error) {
          setValidationError(`Error processing file: ${error.message}`);
        }
      };
      
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      
      reader.readAsText(file);
    } catch (error) {
      setValidationError(`Invalid file: ${error.message}`);
      return;
    }
  };

  const handlePasteUpload = () => {
    if (!jsonText.trim()) {
      setValidationError('Please paste some JSON content');
      return;
    }
    
    try {
      const result = parseAndValidateJSON(jsonText);
      onUpload(result.data);
    } catch (error) {
      setValidationError(`Error processing JSON: ${error.message}`);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleCloseError = () => {
    setValidationError(null);
  };

  const handleRetryUpload = () => {
    setValidationError(null);
    if (uploadMode === 'file' && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="upload-container">
      <div className="upload-tabs">
        <button 
          className={`tab ${uploadMode === 'file' ? 'active' : ''}`}
          onClick={() => setUploadMode('file')}
          disabled={loading}
        >
          <UploadIcon className="tab-icon" />
          Upload File
        </button>
        <button 
          className={`tab ${uploadMode === 'paste' ? 'active' : ''}`}
          onClick={() => setUploadMode('paste')}
          disabled={loading}
        >
          <PasteIcon className="tab-icon" />
          Paste JSON
        </button>
      </div>

      {uploadMode === 'file' ? (
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
            accept=".json,application/json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={loading}
          />
          
          <div className="drop-zone-content">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Processing transcript...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <DocumentIcon />
                </div>
                <h3>Drop your transcript file here</h3>
                <p>or click to browse and select a JSON file</p>
                <div className="upload-hint">
                  <span className="file-types">Supports JSON files</span>
                  <span className="file-size">Max size: 10MB</span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="paste-zone">
          <div className="paste-header">
            <PasteIcon className="paste-icon" />
            <span>Paste your transcript JSON</span>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste your transcript JSON here..."
            disabled={loading}
            rows={12}
          />
          <button 
            onClick={handlePasteUpload}
            disabled={loading || !jsonText.trim()}
            className="upload-btn"
          >
            <CheckIcon className="btn-icon" />
            {loading ? 'Processing...' : 'Process JSON'}
          </button>
        </div>
      )}
    </div>

      <ValidationErrorModal
        error={validationError}
        onClose={handleCloseError}
        onRetry={handleRetryUpload}
      />
    </>
  );
}