import { invoke } from '@tauri-apps/api/core';

export async function transcribeVideo(filePath) {
  try {
    console.log('Invoking transcribe command with path:', filePath);
    const result = await invoke('transcribe', { filePath });
    console.log('Transcribe command result:', result);
    return result;
  } catch (error) {
    console.error('Transcribe command error:', error);
    throw new Error(`Transcription failed: ${error}`);
  }
}

export async function selectVideoFile() {
  try {
    console.log('Opening file dialog...');
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Video Files',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
      }]
    });
    console.log('File dialog result:', selected);
    return selected;
  } catch (error) {
    console.error('File dialog error:', error);
    throw new Error(`File selection failed: ${error}`);
  }
}