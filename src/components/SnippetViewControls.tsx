import React from 'react';
import { formatDuration, calculateSnippetDuration } from '../lib/utils';
import { useSnippetContext } from '../contexts/SnippetContext';
import { DocumentTextIcon, ClockIcon, AlertTriangleIcon, NoteIcon } from './Icons';

export default function SnippetViewControls({ snippets }) {
  const snippetContext = useSnippetContext();

  const totalDuration = snippets.reduce((total, snippet) => 
    total + calculateSnippetDuration(snippet.start, snippet.end), 0
  );
  
  const reviewCount = snippets.filter(s => s.needs_review).length;
  const notesCount = snippets.filter(s => s.notes && s.notes.trim()).length;

  return (
    <div className="snippet-view-controls">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search snippets..."
          value={snippetContext.searchQuery}
          onChange={(e) => snippetContext.setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="snippet-stats">
        <span className="stat">
          <DocumentTextIcon className="stat-icon" />
          {snippets.length} snippets
        </span>
        <span className="stat">
          <ClockIcon className="stat-icon" />
          {formatDuration(totalDuration)} total
        </span>
        <span className="stat review-needed">
          <AlertTriangleIcon className="stat-icon" />
          {reviewCount} need review
        </span>
        <span className="stat">
          <NoteIcon className="stat-icon" />
          {notesCount} with notes
        </span>
        <div className="keyboard-hint">
          <span>j/k: navigate • r: toggle review • e: edit • n: notes • esc: close</span>
        </div>
      </div>
    </div>
  );
}