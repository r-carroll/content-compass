import React from 'react';
import { VideoIcon, CheckIcon, SparkleIcon } from './Icons';

export default function VideoProcessing({ fileName, progress }) {
  const steps = [
    { id: 'upload', label: 'Uploading video', completed: progress >= 25 },
    { id: 'extract', label: 'Extracting audio', completed: progress >= 50 },
    { id: 'transcribe', label: 'Generating transcript', completed: progress >= 75 },
    { id: 'analyze', label: 'Analyzing content', completed: progress >= 100 }
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
        We're extracting insights from "{fileName}" using AI-powered analysis
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