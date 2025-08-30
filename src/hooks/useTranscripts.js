import { useState } from 'react';

export function useTranscripts() {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTranscripts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to load transcripts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - in real implementation, this would fetch from your database
      const mockTranscripts = [
        {
          id: '1',
          title: 'Marketing Strategy Meeting',
          snippet_count: 15,
          total_duration: 1800, // 30 minutes
          needs_review_count: 3,
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          video_file_name: 'marketing-meeting.mp4'
        },
        {
          id: '2',
          title: 'Product Demo Recording',
          snippet_count: 22,
          total_duration: 2700, // 45 minutes
          needs_review_count: 0,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          video_file_name: 'product-demo.mov'
        }
      ];

      setTranscripts(mockTranscripts);
    } catch (err) {
      setError(err.message || 'Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (transcriptId) => {
    try {
      // Simulate API call to delete transcript
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTranscripts(prev => prev.filter(t => t.id !== transcriptId));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete transcript');
    }
  };

  return {
    transcripts,
    loading,
    error,
    loadTranscripts,
    deleteTranscript
  };
}