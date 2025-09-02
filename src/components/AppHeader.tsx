import React from 'react';
import { CompassIcon } from './Icons';

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <CompassIcon className="logo-icon" />
          <h1>Content Compass</h1>
        </div>
        <p>Navigate your content with precision and insight</p>
        <div className="brand-attribution">
          <span>Built by</span>
          <strong>CarrollMedia</strong>
        </div>
      </div>
    </header>
  );
}