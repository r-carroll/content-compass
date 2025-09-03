import React, { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import { useTranscripts } from './hooks/useTranscripts';
import './styles/App.css';
import MainContent from './components/MainContent';

function App() {
  const { 
    transcripts, 
    loading, 
    error, 
    loadTranscripts, 
    deleteTranscript 
  } = useTranscripts();
  
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  useEffect(() => {
    loadTranscripts();
  }, []);

  const handleTranscriptAdded = (newTranscript) => {
    loadTranscripts(); // Refresh the list
  };

  const handleTranscriptDeleted = async (transcriptId) => {
    await deleteTranscript(transcriptId);
  };

  const handleRefreshTranscripts = async () => {
    await loadTranscripts();
  };

  return (
    <div className="app">
      <AppHeader />
      <MainContent
        transcripts={transcripts}
        onTranscriptAdded={handleTranscriptAdded}
        onTranscriptDeleted={handleTranscriptDeleted}
        selectedTranscript={selectedTranscript}
        onTranscriptSelected={setSelectedTranscript}
        onRefreshTranscripts={handleRefreshTranscripts}
      />
    </div>
  );
}

export default App;