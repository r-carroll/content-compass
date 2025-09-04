import React from 'react';
import { VideoIcon, CheckIcon, SparkleIcon } from './Icons';

export default function VideoProcessing({ fileName, progress, progressMessage }) {
  const steps = [
    { id: 'upload', label: 'Preparing video', completed: progress >= 25 },
    { id: 'extract', label: 'Extracting audio', completed: progress >= 25 },
    { id: 'transcribe', label: 'Generating transcript', completed: progress >= 75 },
    { id: 'analyze', label: 'Processing complete', completed: progress >= 100 }
  ];

  const getCurrentStage = () => {
    if (progress >= 100) return 'analyze';
    if (progress >= 75) return 'transcribe';
    if (progress >= 25) return 'extract';
    return 'upload';
  };

  const currentStage = getCurrentStage();

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
        {progressMessage || `Processing "${fileName}" using AI-powered analysis`}
      </p>
      
      <div className="processing-steps">
        {steps.map((step) => {
          const isCurrent = currentStage === step.id && !step.completed;
          return (
          <div key={step.id} className="processing-step">
            <div className={`step-icon ${step.completed ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
              {step.completed ? (
                <CheckIcon />
              ) : isCurrent ? (
                <div className="mini-spinner"></div>
              ) : (
                <div className="step-dot"></div>
              )}
            </div>
            <span className={step.completed ? 'completed' : ''}>{step.label}</span>
          </div>
          );
        })}
      </div>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="progress-text">{Math.round(progress)}% complete</p>
    </div>
  );
}