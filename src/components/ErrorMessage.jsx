import React from 'react';
import { AlertTriangleIcon, AlertCircleIcon, XCircleIcon } from './Icons';

export default function ErrorMessage({ error, onClose, type = 'error' }) {
  if (!error) return null;

  const getErrorIcon = () => {
    switch (type) {
      case 'validation':
        return <AlertTriangleIcon className="error-icon" />;
      case 'network':
        return <AlertCircleIcon className="error-icon" />;
      default:
        return <XCircleIcon className="error-icon" />;
    }
  };

  return (
    <div className={`error-message ${type}`}>
      <div className="error-content">
        {getErrorIcon()}
        <div className="error-text">
          <strong>{type === 'validation' ? 'Validation Error:' : 'Error:'}</strong>
          <span className="error-details">{error}</span>
        </div>
      </div>
      <button onClick={onClose} className="error-close">×</button>
    </div>
  );
}