import React, { useState, useEffect } from 'react';
import { SnippetProvider, useSnippetContext } from '../contexts/SnippetContext';
import SnippetViewHeader from './SnippetViewHeader';
import SnippetViewControls from './SnippetViewControls';
import SnippetList from './SnippetList';
import { AlertTriangleIcon, RefreshIcon } from './Icons';

function SnippetViewContent({ transcript, onClose }) {
  const snippetContext = useSnippetContext();
  
  const [filteredSnippets, setFilteredSnippets] = useState([]);

  useEffect(() => {
    snippetContext.loadSnippets();
  }, []);

  useEffect(() => {
    if (snippetContext.searchQuery.trim()) {
      const filtered = snippetContext.snippets.filter(snippet =>
        snippet.text.toLowerCase().includes(snippetContext.searchQuery.toLowerCase())
      );
      setFilteredSnippets(filtered);
      snippetContext.setSelectedSnippetIndex(0);
    } else {
      setFilteredSnippets(snippetContext.snippets);
    }
  }, [snippetContext.snippets, snippetContext.searchQuery, snippetContext.setSelectedSnippetIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle navigation if user is typing in any input field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.classList.contains('search-input') ||
        activeElement.classList.contains('snippet-textarea') ||
        activeElement.classList.contains('notes-textarea') ||
        activeElement.contentEditable === 'true'
      );
      
      if (isTyping) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          snippetContext.setSelectedSnippetIndex(prev => 
            Math.min(prev + 1, filteredSnippets.length - 1)
          );
          break;
        case 'k':
          e.preventDefault();
          snippetContext.setSelectedSnippetIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'escape':
          e.preventDefault();
          onClose();
          break;
        case 'r':
          e.preventDefault();
          if (filteredSnippets[snippetContext.selectedSnippetIndex]) {
            const snippet = filteredSnippets[snippetContext.selectedSnippetIndex];
            snippetContext.handleToggleReview(snippet.id, snippet.needs_review);
          }
          break;
        case 'e':
          e.preventDefault();
          if (filteredSnippets[snippetContext.selectedSnippetIndex] && !snippetContext.editingSnippet) {
            const snippet = filteredSnippets[snippetContext.selectedSnippetIndex];
            snippetContext.startEditingSnippet(snippet);
          }
          break;
        case 'n':
          e.preventDefault();
          if (filteredSnippets[snippetContext.selectedSnippetIndex] && !snippetContext.editingNotes) {
            const snippet = filteredSnippets[snippetContext.selectedSnippetIndex];
            snippetContext.startEditingNotes(snippet);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredSnippets, snippetContext.selectedSnippetIndex, onClose, snippetContext.editingSnippet, snippetContext.editingNotes, snippetContext.setSelectedSnippetIndex, snippetContext.startEditingSnippet, snippetContext.startEditingNotes]);

  // Auto-scroll to selected snippet
  useEffect(() => {
    const selectedElement = document.querySelector('.snippet-item.selected');
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [snippetContext.selectedSnippetIndex]);

  // Reset selection when snippets change
  useEffect(() => {
    snippetContext.setSelectedSnippetIndex(0);
  }, [filteredSnippets.length, snippetContext.setSelectedSnippetIndex]);

  if (snippetContext.loading) {
    return (
      <div className="snippet-view">
        <SnippetViewHeader 
          transcript={transcript}
          filteredCount={0}
          totalCount={0}
          onClose={onClose}
        />
        <div className="snippet-view-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading snippets...</p>
          </div>
        </div>
      </div>
    );
  }

  if (snippetContext.error) {
    return (
      <div className="snippet-view">
        <SnippetViewHeader 
          transcript={transcript}
          filteredCount={0}
          totalCount={0}
          onClose={onClose}
          error={true}
        />
        <div className="snippet-view-content">
          <div className="error-state">
            <AlertTriangleIcon className="error-icon" />
            <h3>Failed to Load Snippets</h3>
            <p>{snippetContext.error}</p>
            <button className="btn btn-primary" onClick={snippetContext.loadSnippets}>
              <RefreshIcon className="btn-icon" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="snippet-view">
      <SnippetViewHeader 
        transcript={transcript}
        filteredCount={filteredSnippets.length}
        totalCount={snippetContext.snippets.length}
        onClose={onClose}
      />

      <SnippetViewControls 
        snippets={filteredSnippets}
      />

      <SnippetList
        snippets={filteredSnippets}
      />
    </div>
  );
}

export default function SnippetView({ transcriptId, transcript, transcriptData, onClose, onTranscriptUpdated }) {
  return (
    <SnippetProvider 
      transcriptId={transcriptId} 
      transcriptData={transcriptData}
      onTranscriptUpdated={onTranscriptUpdated}
    >
      <SnippetViewContent 
        transcript={transcript} 
        onClose={onClose} 
      />
    </SnippetProvider>
  );
}