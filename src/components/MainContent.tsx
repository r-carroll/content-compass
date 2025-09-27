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
}: any) {
  const [currentView, setCurrentView] = useState('upload');
  const [processedTranscript, setProcessedTranscript] = useState<any>(null);
  const [viewingSnippets, setViewingSnippets] = useState<any>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingFileName, setProcessingFileName] = useState('');
  const { loading, error, uploadVideo, clearError, progress } = useVideoUpload();

  const handleVideoUpload = async (videoFile) => {
    console.log('handleVideoUpload called with:', videoFile);
    try {
      setProcessingFileName(videoFile.name);
      setCurrentView('processing');
      setProcessingProgress(0);
      
      console.log('Starting upload for:', videoFile);
      const result = await uploadVideo(videoFile);
      
      setProcessedTranscript(result);
      setCurrentView('success');
      
      onTranscriptAdded(result);
    } catch (err) {
      // Handled by hook
      console.error('Video processing failed:', err);
      setCurrentView('upload');
      setProcessingProgress(0);
    }
  };

  // Update progress from the upload hook
  React.useEffect(() => {
    setProcessingProgress(progress || 0);
    setProcessingFileName((name) => name || '');
  }, [progress]);

  const handleViewSnippets = (transcriptId: string) => {
    const transcript = transcripts.find((t: any) => t.id === transcriptId);
    setViewingSnippets({ 
      id: transcriptId, 
      transcript,
      transcriptData: transcript // Pass the full transcript data including snippets
    });
  };

  const handleUploadAnother = () => {
    setCurrentView('upload');
    setProcessedTranscript(null);
    setProcessingProgress(0);
    setProcessingFileName('');
    clearError();
  };

  const handleSelectTranscript = (transcriptId: string) => {
    onTranscriptSelected(transcriptId);
    const transcript = transcripts.find((t: any) => t.id === transcriptId);
    setViewingSnippets({ 
      id: transcriptId, 
      transcript,
      transcriptData: transcript
    });
  };

  const handleDeleteTranscript = async (transcriptId: string) => {
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
  const message = (err as any).message || 'Failed to delete transcript';
  throw new Error(message);
    }
  };

  const handleCloseSnippets = () => {
    setViewingSnippets(null);
    onTranscriptSelected(null);
  };

  const handleTranscriptUpdated = async (_transcriptId?: string) => {
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
          transcriptData={viewingSnippets.transcriptData}
          onClose={handleCloseSnippets}
          onTranscriptUpdated={handleTranscriptUpdated}
        />
      )}
    </>
  );
}