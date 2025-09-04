import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { parseAndValidateJSON } from '../lib/validation';

export function useTranscripts() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTranscripts = async () => {
    setLoading(true);
    setError(null);

    try {

      // Try to load existing transcript from output.json
      try {
        const transcriptOutput = await invoke('read_transcript_output');
        const { data: transcriptData } = parseAndValidateJSON(transcriptOutput);
        
        // Create a transcript entry from the output data
        const transcript = {
          id: 'current-transcript',
          title: transcriptData.title || 'Recent Transcript',
          snippet_count: transcriptData.snippets ? transcriptData.snippets.length : 0,
          total_duration: transcriptData.snippets ? 
            transcriptData.snippets.reduce((total, snippet) => 
              Math.max(total, snippet.end || 0), 0
            ) : 0,
          needs_review_count: transcriptData.snippets ? 
            transcriptData.snippets.filter(s => s.needs_review).length : 0,
          created_at: new Date().toISOString(),
          video_file_name: 'processed-video',
          snippets: transcriptData.snippets || []
        };
        
        setTranscripts([transcript]);
      } catch (readError) {
        console.log('No existing transcript found or invalid format:', readError);
        setTranscripts([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (transcriptId) => {
    try {
      // Simulate API call to delete transcript
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTranscripts(prev => prev.filter(t => t.id !== transcriptId));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete transcript');
    }
  };

  return {
    transcripts,
    loading,
    error,
    loadTranscripts,
    deleteTranscript
  };
}