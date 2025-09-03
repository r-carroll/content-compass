import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

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
      
      // Mock processed transcript result

      console.log('Video file uploaded:', videoFile.name);
      await invoke('transcribe_video', { videoPath: videoFile.name} );

      const mockTranscript = {
        id: Date.now().toString(),
        title: videoFile.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        snippet_count: Math.floor(Math.random() * 20) + 10,
        total_duration: Math.floor(Math.random() * 3600) + 300, // 5-65 minutes
        needs_review_count: Math.floor(Math.random() * 5),
        created_at: new Date().toISOString(),
        video_file_name: videoFile.name,
        video_file_size: videoFile.size
      };

      return mockTranscript;
    } catch (err) {
      const errorMessage = err;
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