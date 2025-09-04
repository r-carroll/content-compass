// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::fs;
use std::path::Path;
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{Manager, Window};
use serde_json::json;

#[derive(Clone, serde::Serialize)]
struct TranscriptionProgress {
    stage: String,
    progress: u8,
    message: String,
}

#[tauri::command]
async fn transcribe_video_async(video_path: String, window: Window) -> Result<String, String> {
    let video_path_clone = video_path.clone();
    let window_clone = window.clone();
    
    // Spawn a background thread for the heavy processing
    let handle = thread::spawn(move || {
        let result = transcribe_video_blocking(&video_path_clone, &window_clone);
        result
    });
    
    // Wait for the thread to complete
    handle.join().map_err(|_| "Thread panicked".to_string())?
}

fn transcribe_video_blocking(video_path: &str, window: &Window) -> Result<String, String> {
    println!("Transcribing video at path: {}", video_path);

    // Emit progress update
    let _ = window.emit("transcription-progress", TranscriptionProgress {
        stage: "extracting".to_string(),
        progress: 25,
        message: "Extracting audio from video...".to_string(),
    });

    // Set audio.wav path to project root (one level up from src-tauri)
    let audio_path = std::path::Path::new("../audio.wav");
    let audio_path_str = audio_path.to_str().ok_or("Failed to convert audio path to string")?.to_string();

    // Extract audio, pass output path explicitly
    let extract_output = Command::new("python3")
        .arg("../python/extract_audio.py")
        .arg(video_path)
        .arg(&audio_path_str)
        .output()
        .map_err(|e| format!("Failed to run extract_audio.py: {}", e))?;

    if !extract_output.status.success() {
        let err_msg = String::from_utf8_lossy(&extract_output.stderr);
        println!("Audio extraction failed: {}", err_msg);
        return Err(format!("Audio extraction failed: {}", err_msg));
    }

    // Emit progress update
    let _ = window.emit("transcription-progress", TranscriptionProgress {
        stage: "transcribing".to_string(),
        progress: 75,
        message: "Generating transcript with AI...".to_string(),
    });

    // Transcribe using the same absolute path
    let transcribe_output = Command::new("python3")
        .arg("../python/transcribe.py")
        .arg(&audio_path_str)
        .output()
        .map_err(|e| format!("Failed to run transcribe.py: {}", e))?;

    if !transcribe_output.status.success() {
        let err_msg = String::from_utf8_lossy(&transcribe_output.stderr);
        println!("Transcription failed: {}", err_msg);
        return Err(format!("Transcription failed: {}", err_msg));
    }

    let transcript = String::from_utf8_lossy(&transcribe_output.stdout).to_string();
    println!("Transcription output: {}", transcript);

    // Emit progress update
    let _ = window.emit("transcription-progress", TranscriptionProgress {
        stage: "saving".to_string(),
        progress: 90,
        message: "Saving transcript...".to_string(),
    });

    // Save the transcript to output.json
    let output_path = Path::new("output.json");
    match fs::write(output_path, &transcript) {
        Ok(_) => {
            println!("Transcript saved to output.json");
            
            // Emit completion
            let _ = window.emit("transcription-progress", TranscriptionProgress {
                stage: "complete".to_string(),
                progress: 100,
                message: "Transcription complete!".to_string(),
            });
            
            Ok(transcript)
        }
        Err(e) => {
            println!("Failed to save transcript: {}", e);
            // Still return the transcript even if saving fails
            Ok(transcript)
        }
    }
}
#[tauri::command]
fn read_transcript_output() -> Result<String, String> {
    let output_path = Path::new("output.json");
    
    if !output_path.exists() {
        return Err("No transcript output file found".to_string());
    }
    
    match fs::read_to_string(output_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read transcript output: {}", e))
    }
}

#[tauri::command]
fn cancel_transcription() -> Result<(), String> {
    // In a real implementation, this would cancel the ongoing transcription
    // For now, we'll just acknowledge the cancellation
    println!("Transcription cancellation requested");
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![transcribe_video_async, read_transcript_output, cancel_transcription])
        .run(tauri::generate_context!())
        .expect("error while running Tauri");
}
