import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useSnippets(transcriptId) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingSnippets, setUpdatingSnippets] = useState(new Set());

  const loadSnippets = async () => {
    if (!transcriptId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Load snippets from backend via Tauri command
      const loadedSnippets = await invoke('load_transcript_snippets', { 
        transcriptId: transcriptId 
      });
      
      // Transform the loaded snippets to ensure they have the correct structure
      const transformedSnippets = loadedSnippets.map(segment => ({
        id: segment.id.toString(),
        text: segment.text.trim(),
        start: segment.start,
        end: segment.end,
        needs_review: segment.needs_review || false,
        notes: segment.notes || null
      }));

      setSnippets(transformedSnippets);
    } catch (err) {
      console.error('Failed to load snippets:', err);
      setError(err.message || err.toString() || 'Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const updateSnippet = async (snippetId, updates) => {
    setUpdatingSnippets(prev => new Set([...prev, snippetId]));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSnippets(prev => prev.map(snippet => 
        snippet.id === snippetId 
          ? { ...snippet, ...updates }
          : snippet
      ));
    } catch (err) {
      throw new Error(err.message || 'Failed to update snippet');
    } finally {
      setUpdatingSnippets(prev => {
        const newSet = new Set(prev);
        newSet.delete(snippetId);
        return newSet;
      });
    }
  };

  const toggleReviewStatus = async (snippetId, currentStatus) => {
    await updateSnippet(snippetId, { needs_review: !currentStatus });
  };

  const isUpdating = (snippetId) => {
    return updatingSnippets.has(snippetId);
  };

  return {
    snippets,
    loading,
    error,
    loadSnippets,
    updateSnippet,
    toggleReviewStatus,
    isUpdating
  };
}