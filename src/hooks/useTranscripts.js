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
        const transcriptData = JSON.parse(transcriptOutput);
        
        // Convert transcript data to snippets - handle any structure
        let snippets = [];
        
        if (transcriptData.segments && Array.isArray(transcriptData.segments)) {
          snippets = transcriptData.segments.map((segment, index) => ({
            id: `snippet-current-${index}`,
            text: (segment.text || '').trim(),
            start: segment.start || 0,
            end: segment.end || 0,
            needs_review: false,
            notes: null
          }));
        } else if (Array.isArray(transcriptData)) {
          snippets = transcriptData.map((item, index) => ({
            id: `snippet-current-${index}`,
            text: (item.text || item.content || '').trim(),
            start: item.start || item.startTime || 0,
            end: item.end || item.endTime || 0,
            needs_review: false,
            notes: null
          }));
        }
        
        // Filter out empty snippets
        snippets = snippets.filter(snippet => snippet.text && snippet.text.length > 0);
        
        const snippets = transcriptData.segments ? transcriptData.segments.map((segment, index) => ({
          id: `snippet-current-${index}`,
          text: segment.text.trim(),
          start: segment.start,
          end: segment.end,
          needs_review: false,
          notes: null
        })) : [];
        
        // Create a transcript entry from the output data
        const transcript = {
          id: 'current-transcript',
          title: 'Recent Transcript',
          snippet_count: snippets.length,
          total_duration: transcriptData.duration || (snippets.length > 0 ? 
            Math.max(...snippets.map(s => s.end)) : 0),
          needs_review_count: 0,
          created_at: new Date().toISOString(),
          video_file_name: 'processed-video',
          snippets: snippets
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