import { useState } from 'react';

export function useSnippets(transcriptId, transcriptData = null) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingSnippets, setUpdatingSnippets] = useState(new Set());

  const loadSnippets = async () => {
    if (!transcriptId && !transcriptData) return;
    
    setLoading(true);
    setError(null);

    try {
      let snippetData;
      
      if (transcriptData?.transcription_data?.snippets) {
        // Use real transcription data
        snippetData = transcriptData.transcription_data.snippets.map((snippet, i) => ({
          id: snippet.id || `snippet-${i + 1}`,
          text: snippet.text || '',
          start: snippet.start || 0,
          end: snippet.end || 0,
          needs_review: snippet.needs_review || false,
          notes: snippet.notes || null
        }));
      } else {
        // Fallback to mock data for existing transcripts
        await new Promise(resolve => setTimeout(resolve, 800));
        
        snippetData = Array.from({ length: 15 }, (_, i) => ({
          id: `snippet-${i + 1}`,
          text: `This is snippet ${i + 1} from the transcript. It contains some sample text that would normally come from the video transcription process.`,
          start: i * 30,
          end: (i + 1) * 30 - 2,
          needs_review: Math.random() > 0.7,
          notes: Math.random() > 0.8 ? `Note for snippet ${i + 1}` : null
        }));
      }

      setSnippets(snippetData);
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