import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import UploadSuccess from './UploadSuccess';
import TranscriptList from './TranscriptList';
import SnippetView from './SnippetView';
import { useUpload } from '../hooks/useUpload';

export default function MainContent({ 
  transcripts, 
  onTranscriptAdded, 
  onTranscriptDeleted, 
  selectedTranscript, 
  onTranscriptSelected,
  onRefreshTranscripts
}) {
  const [currentView, setCurrentView] = useState('upload');
  const [uploadedTranscript, setUploadedTranscript] = useState(null);
  const [viewingSnippets, setViewingSnippets] = useState(null);
  const { loading, error, uploadTranscript, clearError } = useUpload();

  const handleUpload = async (fileOrData) => {
    try {
      const result = await uploadTranscript(fileOrData);
      setUploadedTranscript(result);
      setCurrentView('success');
      onTranscriptAdded(result);
    } catch (err) {
      // Handled by hook
      console.error('Upload failed:', err);
    }
  };

  const handleViewSnippets = (transcriptId) => {
    const transcript = transcripts.find(t => t.id === transcriptId);
    setViewingSnippets({ id: transcriptId, transcript });
  };

  const handleUploadAnother = () => {
    setCurrentView('upload');
    setUploadedTranscript(null);
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
              <FileUpload 
                onUpload={handleUpload} 
                loading={loading}
              />
            )}
            
            {currentView === 'success' && uploadedTranscript && (
              <UploadSuccess
                transcript={uploadedTranscript}
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