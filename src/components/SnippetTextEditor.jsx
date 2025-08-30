import React from 'react';
import { useSnippetContext } from '../contexts/SnippetContext';

export default function SnippetTextEditor({ snippet }) {
  const snippetContext = useSnippetContext();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      snippetContext.handleSaveEdit(snippet.id, snippetContext.editText);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      snippetContext.cancelEditing();
    }
  };

  return (
    <div className="snippet-editor">
      <textarea
        value={snippetContext.editText}
        onChange={(e) => snippetContext.setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="snippet-textarea"
        placeholder="Enter snippet text..."
        autoFocus
        disabled={snippetContext.isUpdating(snippet.id)}
      />
      <div className="editor-hint">
        <span>Cmd+Enter to save • Esc to cancel</span>
      </div>
    </div>
  );
}