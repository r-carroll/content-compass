import { invoke } from '@tauri-apps/api/core';

export async function transcribeVideo(filePath) {
  try {
    const result = await invoke('transcribe', { filePath });
    return result;
  } catch (error) {
    throw new Error(`Transcription failed: ${error}`);
  }
}

export async function selectVideoFile() {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Video Files',
        extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
      }]
    });
    return selected;
  } catch (error) {
    throw new Error(`File selection failed: ${error}`);
  }
}