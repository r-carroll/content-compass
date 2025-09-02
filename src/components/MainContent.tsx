import React, { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import VideoProcessing from './VideoProcessing';
import UploadSuccess from './UploadSuccess';
import TranscriptList from './TranscriptList';
import SnippetView from './SnippetView';
import { useVideoUpload } from '../hooks/useVideoUpload';

export default function MainContent({ 
  transcripts, 
  onTranscriptAdded, 
  onTranscriptDeleted, 
  selectedTranscript, 
  onTranscriptSelected,
  onRefreshTranscripts
}) {
  const [currentView, setCurrentView] = useState('upload');
  const [processedTranscript, setProcessedTranscript] = useState(null);
  const [viewingSnippets, setViewingSnippets] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingFileName, setProcessingFileName] = useState('');
  const { loading, error, uploadVideo, clearError } = useVideoUpload();

  const handleVideoUpload = async (videoFile, filePath = null) => {
    try {
      console.log('MainContent handleVideoUpload called:', { videoFile, filePath });
      setProcessingFileName(videoFile.name);
      setCurrentView('processing');
      
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      const result = await uploadVideo(videoFile, filePath);
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setProcessedTranscript(result);
        setCurrentView('success');
      }, 1000);
      
      onTranscriptAdded(result);
    } catch (err) {
      // Handled by hook
      console.error('Video processing failed:', err);
      setCurrentView('upload');
      setProcessingProgress(0);
    }
  };

  const handleViewSnippets = (transcriptId) => {
    const transcript = transcripts.find(t => t.id === transcriptId);
    setViewingSnippets({ id: transcriptId, transcript });
  };

  const handleUploadAnother = () => {
    setCurrentView('upload');
    setProcessedTranscript(null);
    setProcessingProgress(0);
    setProcessingFileName('');
    clearError();
  };

  const handleSelectTranscript = (transcriptId) => {
    onTranscriptSelected(transcriptId);
    handleViewSnippets(transcriptId);
  };

  const handleDeleteTranscript = async (transcriptId) => {
    try {
      await onTranscriptDeleted(transcriptId);
      
      // Clear selection if the deleted transcript was selected
      if (selectedTranscript === transcriptId) {
        onTranscriptSelected(null);
      }
      
      // Close snippet view if viewing deleted transcript
      if (viewingSnippets?.id === transcriptId) {
        setViewingSnippets(null);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to delete transcript');
    }
  };

  const handleCloseSnippets = () => {
    setViewingSnippets(null);
    onTranscriptSelected(null);
  };

  const handleTranscriptUpdated = async (transcriptId) => {
    // Reload transcripts to get updated needs_review_count
    try {
      if (onRefreshTranscripts) {
        await onRefreshTranscripts();
      }
    } catch (err) {
      console.error('Failed to refresh transcript data:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'upload') {
      clearError();
    }
  }, [currentView, clearError]);

  return (
    <>
      <main className="app-main">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button onClick={clearError} className="error-close">×</button>
          </div>
        )}

        <div className="content-grid">
          <div className="upload-section">
            {currentView === 'upload' && (
              <VideoUpload 
                onUpload={handleVideoUpload} 
                loading={loading}
              />
            )}
            
            {currentView === 'processing' && (
              <VideoProcessing 
                fileName={processingFileName}
                progress={processingProgress}
              />
            )}
            
            {currentView === 'success' && processedTranscript && (
              <UploadSuccess
                transcript={processedTranscript}
                onViewSnippets={handleViewSnippets}
                onUploadAnother={handleUploadAnother}
              />
            )}
          </div>

          <div className="sidebar">
            <TranscriptList
              transcripts={transcripts}
              onSelect={handleSelectTranscript}
              selectedId={selectedTranscript}
              onDelete={handleDeleteTranscript}
            />
          </div>
        </div>
      </main>

      {viewingSnippets && (
        <SnippetView
          transcriptId={viewingSnippets.id}
          transcript={viewingSnippets.transcript}
          onClose={handleCloseSnippets}
          onTranscriptUpdated={handleTranscriptUpdated}
        />
      )}
    </>
  );
}