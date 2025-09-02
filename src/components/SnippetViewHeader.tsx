import React from 'react';
import { DocumentTextIcon, XIcon, AlertTriangleIcon } from './Icons';

export default function SnippetViewHeader({ 
  transcript, 
  filteredCount, 
  totalCount, 
  onClose,
  error = false 
}) {
  return (
    <div className="snippet-view-header">
      <div className="header-content">
        <DocumentTextIcon className={`header-icon ${error ? 'error' : ''}`} />
        <div>
          <h2>{transcript?.title || 'Transcript Snippets'}</h2>
          <p>{filteredCount} of {totalCount} snippets</p>
        </div>
      </div>
      <button className="close-btn" onClick={onClose}>
        <XIcon />
      </button>
    </div>
  );
}