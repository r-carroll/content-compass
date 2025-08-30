import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  DocumentIcon, 
  XIcon, 
  XCircleIcon, 
  AlertTriangleIcon, 
  AlertCircleIcon,
  GridIcon,
  CheckIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  RefreshIcon
} from './Icons';

export default function ValidationErrorModal({ error, onClose, onRetry }) {
  const [expandedSections, setExpandedSections] = useState(new Set());

  if (!error) return null;

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const parseErrors = (errorMessage) => {
    const lines = errorMessage.split('\n');
    const errors = [];

    for (const line of lines) {
      const trimmed = line.trim().replace(/^[•\-\*]\s*/, '');
      if (!trimmed || trimmed === 'Multiple validation errors:') continue;
      
      let type = 'general';
      let snippetNumber = null;
      
      if (trimmed.includes('Snippet ')) {
        const match = trimmed.match(/Snippet (\d+):/);
        if (match) {
          type = 'snippet';
          snippetNumber = parseInt(match[1]);
        }
      } else if (trimmed.includes('title')) {
        type = 'title';
      } else if (trimmed.includes('snippets')) {
        type = 'structure';
      }

      errors.push({
        type,
        snippetNumber,
        message: trimmed,
        severity: getSeverity(trimmed)
      });
    }

    return errors;
  };

  const getSeverity = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('missing') || lower.includes('required')) return 'critical';
    if (lower.includes('must be') || lower.includes('cannot be')) return 'error';
    return 'warning';
  };

  const groupErrors = (errors) => {
    const groups = {
      title: { name: 'Title Issues', icon: DocumentIcon, errors: [] },
      structure: { name: 'Structure Issues', icon: GridIcon, errors: [] },
      snippet: { name: 'Snippet Issues', icon: CheckIcon, errors: [] },
      general: { name: 'Other Issues', icon: AlertTriangleIcon, errors: [] }
    };

    errors.forEach(error => {
      groups[error.type].errors.push(error);
    });

    return Object.entries(groups).filter(([, group]) => group.errors.length > 0);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircleIcon className="error-severity-icon critical" />;
      case 'warning': return <AlertTriangleIcon className="error-severity-icon warning" />;
      default: return <AlertCircleIcon className="error-severity-icon error" />;
    }
  };

  const errors = parseErrors(error);
  const errorGroups = groupErrors(errors);
  const criticalCount = errors.filter(e => e.severity === 'critical').length;

  const modalContent = (
    <div className="validation-error-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="validation-error-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <DocumentIcon className="modal-icon" />
            <div>
              <h2>JSON Validation Issues</h2>
              <p className="modal-subtitle">
                Found {errors.length} issue{errors.length !== 1 ? 's' : ''} in your transcript data
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Summary Stats */}
          <div className="error-summary">
            <div className="summary-stats">
              {criticalCount > 0 && (
                <div className="stat critical">
                  <span className="stat-number">{criticalCount}</span>
                  <span className="stat-label">Critical</span>
                </div>
              )}
              {errorGroups.map(([type, group]) => (
                <div key={type} className="stat error">
                  <span className="stat-number">{group.errors.length}</span>
                  <span className="stat-label">{type === 'snippet' ? 'Snippet' : type === 'structure' ? 'Structure' : 'Other'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Groups */}
          <div className="error-groups">
            {errorGroups.map(([type, group]) => {
              const isExpanded = expandedSections.has(type);
              const shouldShowExpander = group.errors.length > 2;
              const displayErrors = isExpanded ? group.errors : group.errors.slice(0, 2);
              const IconComponent = group.icon;

              return (
                <div key={type} className="error-group">
                  <div 
                    className="error-group-header"
                    onClick={() => shouldShowExpander && toggleSection(type)}
                    style={{ cursor: shouldShowExpander ? 'pointer' : 'default' }}
                  >
                    <IconComponent className="group-icon" />
                    <span className="error-group-title">{group.name}</span>
                    <span className="error-count">{group.errors.length}</span>
                    {shouldShowExpander && (
                      <ChevronDownIcon className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                    )}
                  </div>
                  
                  <div className={`error-group-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    {displayErrors.map((error, index) => (
                      <div key={index} className="error-item">
                        {getSeverityIcon(error.severity)}
                        <div className="error-message">
                          {error.snippetNumber && (
                            <span className="snippet-number">Snippet {error.snippetNumber}:</span>
                          )}
                          <span className="error-text">{error.message}</span>
                        </div>
                      </div>
                    ))}
                    
                    {!isExpanded && group.errors.length > 2 && (
                      <div className="error-item collapsed-indicator">
                        <span className="more-errors">
                          +{group.errors.length - 2} more error{group.errors.length - 2 !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="help-text">
            <HelpCircleIcon className="help-icon" />
            <span>Fix the issues above and try uploading again</span>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onRetry}>
              <RefreshIcon className="btn-icon" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
}