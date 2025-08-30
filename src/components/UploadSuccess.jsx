import React from 'react';
import { formatDuration } from '../lib/utils';
import { CheckCircleIcon, CompassIcon, ClockIcon, EyeIcon, VideoIcon, SparkleIcon } from './Icons';

export default function UploadSuccess({ transcript, onViewSnippets, onUploadAnother }) {
  return (
    <div className="upload-success">
      <div className="success-animation">
        <div className="success-icon">
          <CheckCircleIcon />
        </div>
        <div className="sparkle-effects">
          <SparkleIcon className="sparkle sparkle-1" />
          <SparkleIcon className="sparkle sparkle-2" />
          <SparkleIcon className="sparkle sparkle-3" />
        </div>
      </div>
      <h2>Content Analysis Complete!</h2>
      <p className="success-subtitle">Your video has been processed and insights are ready to explore</p>
      
      <div className="transcript-summary">
        <h3>{transcript.title}</h3>
        <div className="summary-stats">
          <div className="stat">
            <CompassIcon className="summary-icon" />
            <span className="value">{transcript.snippet_count}</span>
            <span className="label">Insights</span>
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
          <CompassIcon className="btn-icon" />
          Explore Insights
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onUploadAnother}
        >
          <VideoIcon className="btn-icon" />
          Process Another Video
        </button>
      </div>
    </div>
  );
}