import React from 'react';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { VideoIcon, CheckIcon, SparkleIcon } from './Icons';

export default function VideoProcessing({ fileName, progress }) {
  const { processingStep } = useVideoUpload();

  const steps = [
    { id: 'prepare', label: 'Preparing video file', completed: progress >= 20 },
    { id: 'extract', label: 'Extracting audio track', completed: progress >= 40 },
    { id: 'transcribe', label: 'Transcribing with AI', completed: progress >= 80 },
    { id: 'process', label: 'Creating content snippets', completed: progress >= 100 }
  ];

  return (
    <div className="processing-state">
      <div className="processing-icon">
        <div className="processing-animation">
          <SparkleIcon className="sparkle-icon" />
          <VideoIcon className="video-icon" />
        </div>
      </div>
      <h2>Analyzing Your Content</h2>
      <p className="processing-subtitle">
        {processingStep || `Processing "${fileName}" with local AI transcription`}
      </p>
      
      <div className="processing-steps">
        {steps.map((step) => (
          <div key={step.id} className="processing-step">
            <div className={`step-icon ${step.completed ? 'completed' : progress > steps.findIndex(s => s.id === step.id) * 25 ? 'current' : 'pending'}`}>
              {step.completed ? (
                <CheckIcon />
              ) : progress > steps.findIndex(s => s.id === step.id) * 25 ? (
                <div className="mini-spinner"></div>
              ) : (
                <div className="step-dot"></div>
              )}
            </div>
            <span className={step.completed ? 'completed' : ''}>{step.label}</span>
          </div>
        ))}
      </div>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="progress-text">{Math.round(progress)}% complete</p>
    </div>
  );
}