// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use std::fs;
use std::path::Path;

#[tauri::command]
fn transcribe_video(video_path: String) -> Result<String, String> {
    println!("Transcribing video at path: {}", video_path);

    // Use an absolute path for audio.wav in the Rust layer
    // Set audio.wav path to project root (one level up from src-tauri)
    let audio_path = std::path::Path::new("../audio.wav");
    let audio_path_str = audio_path.to_str().ok_or("Failed to convert audio path to string")?.to_string();

    // Extract audio, pass output path explicitly
    let extract_output = Command::new("python3")
        .arg("../python/extract_audio.py")
        .arg(&video_path)
        .arg(&audio_path_str)
        .output()
        .map_err(|e| format!("Failed to run extract_audio.py: {}", e))?;

    if !extract_output.status.success() {
        let err_msg = String::from_utf8_lossy(&extract_output.stderr);
        println!("Audio extraction failed: {}", err_msg);
        return Err(format!("Audio extraction failed: {}", err_msg));
    }

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

    // Save the transcript to output.json
    let output_path = Path::new("output.json");
    match fs::write(output_path, &transcript) {
        Ok(_) => {
            println!("Transcript saved to output.json");
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

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![transcribe_video, read_transcript_output])
        .run(tauri::generate_context!())
        .expect("error while running Tauri");
}
