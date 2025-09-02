import { useState } from 'react';
import { transcribeVideo } from '../lib/tauri';

export function useVideoUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState('');

  const uploadVideo = async (videoFile, filePath = null) => {
    setLoading(true);
    setError(null);
    setProcessingStep('Preparing transcription...');
    
    console.log('uploadVideo called with:', { videoFile, filePath });

    try {
      let pathToTranscribe = filePath;
      
      // If no file path provided (web upload), we need to handle file differently
      if (!pathToTranscribe && videoFile) {
        // For now, show error since we need file path for Tauri command
        throw new Error('File path is required for transcription. Please use the file picker instead.');
      }
      
      console.log('Starting transcription for path:', pathToTranscribe);
      setProcessingStep('Transcribing audio...');
      
      // Call the Tauri transcribe command
      console.log('Calling transcribeVideo...');
      const transcriptionResult = await transcribeVideo(pathToTranscribe);
      console.log('Transcription result:', transcriptionResult);
      
      setProcessingStep('Processing transcript...');
      
      // Process the transcription result into our expected format
      const fileName = videoFile?.name || pathToTranscribe.split('/').pop() || 'Unknown';
      const processedTranscript = {
        id: Date.now().toString(),
        title: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension
        snippet_count: transcriptionResult.snippets?.length || 0,
        total_duration: transcriptionResult.duration || 0,
        needs_review_count: transcriptionResult.snippets?.filter(s => s.needs_review).length || 0,
        created_at: new Date().toISOString(),
        video_file_name: fileName,
        video_file_size: videoFile?.size || 0,
        transcription_data: transcriptionResult
      };

      return processedTranscript;
    } catch (err) {
      const errorMessage = err.message || 'Failed to process video';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    processingStep,
    uploadVideo,
    clearError
  };
}