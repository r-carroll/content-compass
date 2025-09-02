import React from 'react';
import { useSnippetContext } from '../contexts/SnippetContext';
import { NoteIcon, NotePlusIcon, SaveIcon, XIcon } from './Icons';

export default function SnippetNotesActions({ snippet }) {
  const snippetContext = useSnippetContext();

  // If we're editing notes, show save/cancel actions
  if (snippetContext.editingNotes === snippet.id) {
    return (
      <>
        <button
          className="edit-action save"
          onClick={(e) => {
            e.stopPropagation();
            snippetContext.handleSaveNotes(snippet.id, snippetContext.editNotesText);
          }}
          disabled={snippetContext.isUpdating(snippet.id)}
          title="Save notes (Cmd+Enter)"
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
            snippetContext.cancelNotesEditing();
          }}
          disabled={snippetContext.isUpdating(snippet.id)}
          title="Cancel notes editing (Esc)"
        >
          <XIcon className="action-icon" />
          Cancel
        </button>
      </>
    );
  }

  // Otherwise show the add/edit notes button
  return (
    <button
      className={`edit-action notes ${snippet.notes && snippet.notes.trim() ? 'has-notes' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        snippetContext.startEditingNotes(snippet);
      }}
      title={snippet.notes && snippet.notes.trim() ? "Edit notes" : "Add note"}
    >
      {snippet.notes && snippet.notes.trim() ? (
        <NoteIcon className="action-icon" />
      ) : (
        <NotePlusIcon className="action-icon" />
      )}
      {snippet.notes && snippet.notes.trim() ? 'Edit Notes' : 'Add Note'}
    </button>
  );
}