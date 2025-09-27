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
          const parsed = parseAndValidateJSON(transcriptOutput);
          transcriptData = parsed.data;
        } catch (parseErr) {
          throw new Error(`Failed to parse transcript output: ${parseErr.message || parseErr}`);
        }

        // Convert whisper segments to our snippet format
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
          total_duration: transcriptData.duration || (snippets.length > 0 ? 
            Math.max(...snippets.map(s => s.end)) : 0),
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