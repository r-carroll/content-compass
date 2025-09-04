import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { parseAndValidateJSON } from '../lib/validation';

export function useVideoUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadVideo = async (videoFile) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate video processing API call
      // In a real implementation, this would:
      // 1. Upload the video file to a processing service
      // 2. Extract audio from the video
      // 3. Send audio to transcription service (like OpenAI Whisper, AssemblyAI, etc.)
      // 4. Process the transcript into snippets
      // 5. Store the result in the database
      
      //await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
      
      console.log('Video file uploaded:', videoFile.name);
      
      // Transcribe the video
      await invoke('transcribe_video', { videoPath: videoFile.name });
      
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
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    uploadVideo,
    clearError
  };
}