import React from 'react';
import { DocumentIcon } from './Icons';

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <DocumentIcon className="logo-icon" />
          <h1>Scriptly</h1>
        </div>
        <p>Professional transcript analysis and editing</p>
        <div className="brand-attribution">
          <span>Built by</span>
          <strong>CarrollMedia</strong>
        </div>
      </div>
    </header>
  );
}