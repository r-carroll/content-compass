import React from 'react';
import { formatTimeRange, calculateSnippetDuration } from '../lib/utils';
import { useSnippetContext } from '../contexts/SnippetContext';
import SnippetNotes from './SnippetNotes';
import SnippetNotesActions from './SnippetNotesActions';
import SnippetTextEditor from './SnippetTextEditor';
import { 
  ClockIcon, 
  CheckIcon, 
  XIcon, 
  AlertTriangleIcon,
  EditIcon,
  SaveIcon
} from './Icons';

export default function SnippetItem({ snippet, index, isSelected }) {
  const snippetContext = useSnippetContext();

  const highlightSearchTerm = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <div 
      className={`snippet-item ${snippet.needs_review ? 'needs-review' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => snippetContext.setSelectedSnippetIndex(index)}
    >
      <div className="snippet-header">
        <div className="snippet-number">#{index + 1}</div>
        <div className="snippet-time">
          <ClockIcon className="time-icon" />
          <span className="time-range">
            {formatTimeRange(snippet.start, snippet.end)}
          </span>
          <span className="duration">
            ({calculateSnippetDuration(snippet.start, snippet.end).toFixed(1)}s)
          </span>
        </div>
        <div className="snippet-actions">
          {snippetContext.editingSnippet === snippet.id || snippetContext.editingNotes === snippet.id ? (
            // Show save/cancel actions when editing either text or notes
            <>
              <button
                className="edit-action save"
                onClick={(e) => {
                  e.stopPropagation();
                  if (snippetContext.editingSnippet === snippet.id) {
                    snippetContext.handleSaveEdit(snippet.id, snippetContext.editText);
                  } else if (snippetContext.editingNotes === snippet.id) {
                    snippetContext.handleSaveNotes(snippet.id, snippetContext.editNotesText);
                  }
                }}
                disabled={snippetContext.isUpdating(snippet.id)}
                title={snippetContext.editingSnippet === snippet.id ? "Save changes (Cmd+Enter)" : "Save notes (Cmd+Enter)"}
              >
                {snippetContext.isUpdating(snippet.id) ? (
                  <div className="mini-spinner"></div>
                ) : (
                  <SaveIcon className="action-icon" />
                )}
                Save
              </button>
              <button
                className="edit-action cancel"
                onClick={(e) => {
                  e.stopPropagation();
                  if (snippetContext.editingSnippet === snippet.id) {
                    snippetContext.cancelEditing();
                  } else if (snippetContext.editingNotes === snippet.id) {
                    snippetContext.cancelNotesEditing();
                  }
                }}
                disabled={snippetContext.isUpdating(snippet.id)}
                title={snippetContext.editingSnippet === snippet.id ? "Cancel editing (Esc)" : "Cancel notes editing (Esc)"}
              >
                <XIcon className="action-icon" />
                Cancel
              </button>
            </>
          ) : (
            // Show edit and notes actions when not editing
            <>
              <button
                className="edit-action edit"
                onClick={(e) => {
                  e.stopPropagation();
                  snippetContext.startEditingSnippet(snippet);
                }}
                title="Edit snippet text"
              >
                <EditIcon className="action-icon" />
                Edit
              </button>
              <SnippetNotesActions snippet={snippet} />
            </>
          )}
          <button
            className={`review-toggle ${snippet.needs_review ? 'active' : ''}`}
            onClick={() => snippetContext.handleToggleReview(snippet.id, snippet.needs_review)}
            disabled={snippetContext.isUpdating(snippet.id)}
            title={snippet.needs_review ? 'Mark as reviewed' : 'Mark for review'}
          >
            {snippetContext.isUpdating(snippet.id) ? (
              <div className="mini-spinner"></div>
            ) : snippet.needs_review ? (
              <AlertTriangleIcon className="review-icon" />
            ) : (
              <CheckIcon className="review-icon" />
            )}
            {snippet.needs_review ? 'Needs Review' : 'Mark for review'}
          </button>
        </div>
      </div>
      <div className="snippet-content">
        {snippetContext.editingSnippet === snippet.id ? (
          <SnippetTextEditor snippet={snippet} />
        ) : (
          <p 
            className="snippet-text"
            onClick={(e) => {
              e.stopPropagation();
              snippetContext.startEditingSnippet(snippet);
            }}
            title="Click to edit"
          >
            {highlightSearchTerm(snippet.text, snippetContext.searchQuery)}
          </p>
        )}
        
        <SnippetNotes snippet={snippet} />
      </div>
    </div>
  );
}