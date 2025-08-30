import React, { createContext, useContext, useState } from 'react';
import { useSnippets } from '../hooks/useSnippets';

const SnippetContext = createContext();

export function SnippetProvider({ transcriptId, children, onTranscriptUpdated }) {
  const snippetHook = useSnippets(transcriptId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  
  // Editor state
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [editText, setEditText] = useState('');
  const [editingNotes, setEditingNotes] = useState(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [showNotes, setShowNotes] = useState(new Set());

  // Editor actions
  const startEditingSnippet = (snippet) => {
    setEditingSnippet(snippet.id);
    setEditText(snippet.text);
  };

  const startEditingNotes = (snippet) => {
    setEditingNotes(snippet.id);
    setEditNotesText(snippet.notes || '');
  };

  const cancelEditing = () => {
    setEditingSnippet(null);
    setEditText('');
  };

  const cancelNotesEditing = () => {
    setEditingNotes(null);
    setEditNotesText('');
  };

  const toggleNotesVisibility = (snippetId) => {
    const newShowNotes = new Set(showNotes);
    if (newShowNotes.has(snippetId)) {
      newShowNotes.delete(snippetId);
    } else {
      newShowNotes.add(snippetId);
    }
    setShowNotes(newShowNotes);
  };

  // API actions with context updates
  const handleToggleReview = async (snippetId, currentStatus) => {
    try {
      await snippetHook.toggleReviewStatus(snippetId, currentStatus);
      if (onTranscriptUpdated) {
        onTranscriptUpdated(transcriptId);
      }
    } catch (err) {
      console.error('Failed to toggle review status:', err);
    }
  };

  const handleSaveEdit = async (snippetId, text) => {
    if (!text.trim()) {
      alert('Snippet text cannot be empty');
      return;
    }

    try {
      await snippetHook.updateSnippet(snippetId, { text: text.trim() });
      cancelEditing();
      if (onTranscriptUpdated) {
        onTranscriptUpdated(transcriptId);
      }
    } catch (err) {
      console.error('Failed to update snippet:', err);
      alert('Failed to save changes: ' + err.message);
    }
  };

  const handleSaveNotes = async (snippetId, notesText) => {
    try {
      await snippetHook.updateSnippet(snippetId, { notes: notesText.trim() });
      cancelNotesEditing();
      if (onTranscriptUpdated) {
        onTranscriptUpdated(transcriptId);
      }
    } catch (err) {
      console.error('Failed to update snippet notes:', err);
      alert('Failed to save notes: ' + err.message);
    }
  };

  const contextValue = {
    // Data
    ...snippetHook,
    searchQuery,
    setSearchQuery,
    selectedSnippetIndex,
    setSelectedSnippetIndex,
    
    // Editor state
    editingSnippet,
    editText,
    setEditText,
    editingNotes,
    editNotesText,
    setEditNotesText,
    showNotes,
    
    // Editor actions
    startEditingSnippet,
    startEditingNotes,
    cancelEditing,
    cancelNotesEditing,
    toggleNotesVisibility,
    
    // API actions
    handleToggleReview,
    handleSaveEdit,
    handleSaveNotes
  };

  return (
    <SnippetContext.Provider value={contextValue}>
      {children}
    </SnippetContext.Provider>
  );
}

export function useSnippetContext() {
  const context = useContext(SnippetContext);
  if (!context) {
    throw new Error('useSnippetContext must be used within a SnippetProvider');
  }
  return context;
}