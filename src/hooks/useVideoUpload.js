import { invoke, isTauri } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useState, useEffect } from 'react';
import { parseAndValidateJSON } from '../lib/validation';

export function useVideoUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Set up event listener for progress updates
  useEffect(() => {
    let unlisten;
    
    const setupListener = async () => {
      if (isTauri()) {
        unlisten = await listen('transcription-progress', (event) => {
          const { stage, progress: progressValue, message } = event.payload;
          console.log('Progress update:', { stage, progressValue, message });
          setProgress(progressValue);
          setProgressMessage(message);
          
          // When transcription is complete, we don't need to do anything here
          // The uploadVideo function will handle reading the results
        });
      }
    };
    
    setupListener();
    
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
  const uploadVideo = async (videoFile) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage('Preparing video for processing...');

    try {
      console.log('Video file uploaded:', videoFile.name);
      
      if (isTauri()) {
        // Start the async transcription process and wait for completion
        await invoke('transcribe_video_async', { videoPath: videoFile.name });

        // After transcription is complete, read the results
        const transcriptOutput = await invoke('read_transcript_output');

        if (!transcriptOutput || typeof transcriptOutput !== 'string' || transcriptOutput.trim() === '') {
          throw new Error('Transcript output is empty or missing');
        }

        // Parse and validate the JSON output
        let transcriptData;
        try {
          console.log('Raw transcript output:', transcriptOutput);
          transcriptData = JSON.parse(transcriptOutput);
        } catch (parseErr) {
          throw new Error(`Failed to parse transcript: ${parseErr.message || parseErr}`);
        }

        // Convert transcript data to our snippet format - handle any structure
        let snippets = [];
        
        if (transcriptData.segments && Array.isArray(transcriptData.segments)) {
          // Whisper format with segments
          snippets = transcriptData.segments.map((segment, index) => ({
            id: `snippet-${Date.now()}-${index}`,
            text: (segment.text || '').trim(),
            start: segment.start || 0,
            end: segment.end || 0,
            needs_review: false,
            notes: null
          }));
        } else if (Array.isArray(transcriptData)) {
          // Direct array format
          snippets = transcriptData.map((item, index) => ({
            id: `snippet-${Date.now()}-${index}`,
            text: (item.text || item.content || '').trim(),
            start: item.start || item.startTime || 0,
            end: item.end || item.endTime || 0,
            needs_review: false,
            notes: null
          }));
        } else if (transcriptData.text) {
          // Simple text format - create one snippet
          snippets = [{
            id: `snippet-${Date.now()}-0`,
            text: transcriptData.text.trim(),
            start: 0,
            end: transcriptData.duration || 0,
            needs_review: false,
            notes: null
          }];
        }
        
        // Filter out empty snippets
        snippets = snippets.filter(snippet => snippet.text && snippet.text.length > 0);
        
        // Calculate total duration
        const totalDuration = transcriptData.duration || 
          (snippets.length > 0 ? Math.max(...snippets.map(s => s.end)) : 0);
        
        const snippets = transcriptData.segments ? transcriptData.segments.map((segment, index) => ({
          id: `snippet-${Date.now()}-${index}`,
          text: segment.text.trim(),
          start: segment.start,
          end: segment.end,
          needs_review: false,
          notes: null
        })) : [];

        // Create transcript object with metadata
        const processedTranscript = {
          id: Date.now().toString(),
          title: videoFile.name.replace(/\.[^/.]+$/, ''),
          snippet_count: snippets.length,
          total_duration: totalDuration,
          needs_review_count: 0, // Initially no snippets need review
          created_at: new Date().toISOString(),
          video_file_name: videoFile.name,
          video_file_size: videoFile.size,
          snippets: snippets
        };

        return processedTranscript;
      }
      throw new Error('This application requires Tauri to process videos');
    } catch (err) {
      const errorMessage = err.message || err;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    progress,
    progressMessage,
    uploadVideo,
    clearError
  };
}