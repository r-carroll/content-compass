export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateVideoFile(file) {
  if (!file) {
    throw new ValidationError('No file provided');
  }

  // Check file size (500MB limit)
  const maxSize = 500 * 1024 * 1024; // 500MB in bytes
  if (file.size > maxSize) {
    throw new ValidationError(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 500MB limit`);
  }

  // Check file type
  const allowedTypes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-matroska', // .mkv
    'video/webm'
  ];

  const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  
  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidType && !hasValidExtension) {
    throw new ValidationError(
      `Invalid file type. Please upload a video file (MP4, MOV, AVI, MKV, or WebM)`
    );
  }

  return true;
}

export function parseAndValidateJSON(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new ValidationError('No transcript data available');
  }

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new ValidationError('Failed to parse transcript data');
  }

  // Very minimal validation - just check if it's an object
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid transcript format');
  }

  return { data, isValid: true };
}

// Simplified validation that accepts any reasonable transcript structure
export function validateTranscriptData(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid transcript data');
  }

  return { data, isValid: true };
}