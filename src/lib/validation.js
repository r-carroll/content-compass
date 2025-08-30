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
    throw new ValidationError('Invalid JSON data provided');
  }

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new ValidationError('Invalid JSON format. Please check your JSON syntax.');
  }

  return validateTranscriptData(data);
}

export function validateTranscriptData(data) {
  const errors = [];

  // Check if data is an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('JSON must be an object with title and snippets properties');
  }

  // Validate title
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Title is required and must be a non-empty string');
  }

  // Validate snippets array
  if (!data.snippets || !Array.isArray(data.snippets)) {
    errors.push('Snippets must be an array');
  } else if (data.snippets.length === 0) {
    errors.push('At least one snippet is required');
  } else {
    // Validate each snippet
    data.snippets.forEach((snippet, index) => {
      const snippetErrors = validateSnippet(snippet, index + 1);
      errors.push(...snippetErrors);
    });
  }

  if (errors.length > 0) {
    throw new ValidationError(
      errors.length === 1 
        ? errors[0]
        : `Multiple validation errors:\n${errors.map(e => `• ${e}`).join('\n')}`
    );
  }

  return { data, isValid: true };
}

function validateSnippet(snippet, snippetNumber) {
  const errors = [];
  const prefix = `Snippet ${snippetNumber}:`;

  // Check if snippet is an object
  if (!snippet || typeof snippet !== 'object' || Array.isArray(snippet)) {
    errors.push(`${prefix} Must be an object`);
    return errors;
  }

  // Validate required fields
  if (!snippet.text || typeof snippet.text !== 'string' || !snippet.text.trim()) {
    errors.push(`${prefix} Text is required and must be a non-empty string`);
  }

  if (typeof snippet.start !== 'number' || snippet.start < 0) {
    errors.push(`${prefix} Start time must be a non-negative number`);
  }

  if (typeof snippet.end !== 'number' || snippet.end < 0) {
    errors.push(`${prefix} End time must be a non-negative number`);
  }

  if (typeof snippet.start === 'number' && typeof snippet.end === 'number' && snippet.end <= snippet.start) {
    errors.push(`${prefix} End time must be greater than start time`);
  }

  // Validate optional fields
  if (snippet.notes !== undefined && typeof snippet.notes !== 'string') {
    errors.push(`${prefix} Notes must be a string if provided`);
  }

  if (snippet.needs_review !== undefined && typeof snippet.needs_review !== 'boolean') {
    errors.push(`${prefix} needs_review must be a boolean if provided`);
  }

  return errors;
}