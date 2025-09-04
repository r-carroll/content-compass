import { invoke } from '@tauri-apps/api/core';
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
      unlisten = await listen('transcription-progress', (event) => {
        const { stage, progress: progressValue, message } = event.payload;
        setProgress(progressValue);
        setProgressMessage(message);
      });
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
      
      // Start the async transcription process
      await invoke('transcribe_video_async', { videoPath: videoFile.name });
      
      // Read the transcription output
      const transcriptOutput = await invoke('read_transcript_output');
      
      // Parse and validate the JSON output
      const { data: transcriptData } = parseAndValidateJSON(transcriptOutput);
      
      // Create transcript object with metadata
      const processedTranscript = {
        id: Date.now().toString(),
        title: transcriptData.title || videoFile.name.replace(/\.[^/.]+$/, ''),
        snippet_count: transcriptData.snippets ? transcriptData.snippets.length : 0,
        total_duration: transcriptData.snippets ? 
          transcriptData.snippets.reduce((total, snippet) => 
            Math.max(total, snippet.end || 0), 0
          ) : 0,
        needs_review_count: transcriptData.snippets ? 
          transcriptData.snippets.filter(s => s.needs_review).length : 0,
        created_at: new Date().toISOString(),
        video_file_name: videoFile.name,
        video_file_size: videoFile.size,
        snippets: transcriptData.snippets || []
      };

      return processedTranscript;
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