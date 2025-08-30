import React from 'react';
import { formatDuration } from '../lib/utils';
import { DocumentIcon, ClockIcon, TrashIcon, AlertTriangleIcon } from './Icons';

export default function TranscriptList({ transcripts, onSelect, selectedId, onDelete }) {
  const handleDelete = async (e, transcriptId) => {
    e.stopPropagation(); // Prevent triggering the select action
    
    if (window.confirm('Are you sure you want to delete this transcript? This action cannot be undone.')) {
      try {
        await onDelete(transcriptId);
      } catch (error) {
        alert('Failed to delete transcript: ' + error.message);
      }
    }
  };

  if (!transcripts.length) {
    return (
      <div className="transcript-list empty">
        <div className="empty-state">
          <DocumentIcon className="empty-icon" />
          <h4>No videos processed yet</h4>
          <p>Upload your first video to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transcript-list">
      <div className="list-header">
        <h3>Recent Transcripts</h3>
        <span className="transcript-count">{transcripts.length}</span>
      </div>
      {transcripts.map(transcript => (
        <div 
          key={transcript.id}
          className={`transcript-item ${selectedId === transcript.id ? 'selected' : ''}`}
          onClick={() => onSelect(transcript.id)}
        >
          <div className="transcript-header">
            <h4>{transcript.title}</h4>
            <div className="transcript-header-actions">
              <span className="transcript-date">
                {new Date(transcript.created_at).toLocaleDateString()}
              </span>
              <button 
                className="delete-btn"
                onClick={(e) => handleDelete(e, transcript.id)}
                title="Delete transcript"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
          <div className="transcript-stats">
            <span className="stat">
              <DocumentIcon className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{transcript.snippet_count}</span>
                <span className="stat-label">snippets</span>
              </div>
            </span>
            <span className="stat">
              <ClockIcon className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{formatDuration(transcript.total_duration)}</span>
                <span className="stat-label">duration</span>
              </div>
            </span>
            {transcript.needs_review_count > 0 && (
              <span className="stat review-needed">
                <AlertTriangleIcon className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{transcript.needs_review_count}</span>
                  <span className="stat-label">need review</span>
                </div>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}