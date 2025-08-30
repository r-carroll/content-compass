import React from 'react';
import { formatDuration } from '../lib/utils';
import { CheckCircleIcon, DocumentIcon, ClockIcon, EyeIcon, UploadIcon } from './Icons';

export default function UploadSuccess({ transcript, onViewSnippets, onUploadAnother }) {
  return (
    <div className="upload-success">
      <div className="success-icon">
        <CheckCircleIcon />
      </div>
      <h2>Video Processed Successfully!</h2>
      <p className="success-subtitle">Your video has been transcribed and is ready for analysis</p>
      
      <div className="transcript-summary">
        <h3>{transcript.title}</h3>
        <div className="summary-stats">
          <div className="stat">
            <DocumentIcon className="summary-icon" />
            <span className="value">{transcript.snippet_count}</span>
            <span className="label">Snippets</span>
          </div>
          <div className="stat">
            <ClockIcon className="summary-icon" />
            <span className="value">{formatDuration(transcript.total_duration)}</span>
            <span className="label">Duration</span>
          </div>
        </div>
      </div>
      
      <div className="success-actions">
        <button 
          className="btn btn-primary"
          onClick={() => onViewSnippets(transcript.id)}
        >
          <EyeIcon className="btn-icon" />
          View Snippets
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onUploadAnother}
        >
          <UploadIcon className="btn-icon" />
          Upload Another
        </button>
      </div>
    </div>
  );
}