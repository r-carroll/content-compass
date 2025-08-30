import React from 'react';
import { useSnippetContext } from '../contexts/SnippetContext';
import { NoteIcon, NotePlusIcon, SaveIcon, XIcon } from './Icons';

export default function SnippetNotes({ snippet }) {
  const snippetContext = useSnippetContext();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      snippetContext.handleSaveNotes(snippet.id, snippetContext.editNotesText);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      snippetContext.cancelNotesEditing();
    }
  };

  // If we're editing notes for this snippet
  if (snippetContext.editingNotes === snippet.id) {
    return (
      <div className="notes-editor">
        <div className="notes-editor-header">
          <NoteIcon className="notes-icon" />
          <span>Edit Notes</span>
        </div>
        <textarea
          value={snippetContext.editNotesText}
          onChange={(e) => snippetContext.setEditNotesText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="notes-textarea"
          placeholder="Add your notes about this snippet..."
          autoFocus
          disabled={snippetContext.isUpdating(snippet.id)}
          maxLength={2000}
        />
        <div className="editor-hint">
          <span>Cmd+Enter to save • Esc to cancel • {2000 - snippetContext.editNotesText.length} characters remaining</span>
        </div>
      </div>
    );
  }

  // If snippet has notes and we're not editing, show the notes display
  if (snippet.notes && snippet.notes.trim()) {
    return (
      <div className="snippet-notes">
        <div 
          className="notes-header"
          onClick={(e) => {
            e.stopPropagation();
            snippetContext.toggleNotesVisibility(snippet.id);
          }}
        >
          <NoteIcon className="notes-icon" />
          <span>Notes</span>
          <button className="notes-toggle">
            {snippetContext.showNotes.has(snippet.id) ? 'Hide' : 'Show'}
          </button>
        </div>
        {snippetContext.showNotes.has(snippet.id) && (
          <div 
            className="notes-content"
            onClick={(e) => {
              e.stopPropagation();
              snippetContext.startEditingNotes(snippet);
            }}
            title="Click to edit notes"
          >
            <p>{snippet.notes}</p>
          </div>
        )}
      </div>
    );
  }

  // No notes to display
  return null;
}