import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { parseAndValidateJSON } from '../lib/validation';

export function useSnippets(transcriptId, transcriptData = null) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingSnippets, setUpdatingSnippets] = useState(new Set());

  const loadSnippets = async () => {
    if (!transcriptId) {
      setSnippets([]);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let snippetsData = [];
      
      // If we have transcript data passed in (from recent upload), use it
      if (transcriptData && transcriptData.snippets) {
        snippetsData = transcriptData.snippets;
      } else {
        // Otherwise, try to read from the output file
        try {
          const transcriptOutput = await invoke('read_transcript_output');
          const parsedData = JSON.parse(transcriptOutput);
          
          // Convert transcript data to snippet format - handle any structure
          if (parsedData.segments && Array.isArray(parsedData.segments)) {
            snippetsData = parsedData.segments.map((segment, index) => ({
              id: `snippet-${transcriptId}-${index}`,
              text: (segment.text || '').trim(),
              start: segment.start || 0,
              end: segment.end || 0,
              needs_review: false,
              notes: null
            }));
          } else if (Array.isArray(parsedData)) {
            snippetsData = parsedData.map((item, index) => ({
              id: `snippet-${transcriptId}-${index}`,
              text: (item.text || item.content || '').trim(),
              start: item.start || item.startTime || 0,
              end: item.end || item.endTime || 0,
              needs_review: false,
              notes: null
            }));
          }
          
          // Filter out empty snippets
          snippetsData = snippetsData.filter(snippet => snippet.text && snippet.text.length > 0);
          
          snippetsData = parsedData.segments ? parsedData.segments.map((segment, index) => ({
            id: `snippet-${transcriptId}-${index}`,
            text: segment.text.trim(),
            start: segment.start,
            end: segment.end,
            needs_review: false,
            notes: null
          })) : [];
        } catch (readError) {
          console.warn('Could not read transcript output:', readError);
          // Fall back to empty array if file doesn't exist or is invalid
          snippetsData = [];
        }
      }
      
      setSnippets(snippetsData);
    } catch (err) {
      setError(err.message || 'Failed to load snippets');
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