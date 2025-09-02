import React from 'react';
import SnippetItem from './SnippetItem';
import { useSnippetContext } from '../contexts/SnippetContext';
import { DocumentTextIcon } from './Icons';

export default function SnippetList({ snippets }) {
  const snippetContext = useSnippetContext();

  if (snippets.length === 0) {
    return (
      <div className="snippet-view-content">
        <div className="empty-state">
          <DocumentTextIcon className="empty-icon" />
          <h3>No snippets found</h3>
          <p>
            {snippetContext.searchQuery.trim() 
              ? `No snippets match "${snippetContext.searchQuery}"`
              : 'This transcript has no snippets'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="snippet-view-content">
      <div className="snippet-list">
        {snippets.map((snippet, index) => (
          <SnippetItem
            key={snippet.id}
            snippet={snippet}
            index={index}
            isSelected={index === snippetContext.selectedSnippetIndex}
          />
        ))}
      </div>
    </div>
  );
}