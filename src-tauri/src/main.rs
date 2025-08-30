// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn transcribe_video(video_path: String) -> Result<String, String> {
    // Extract audio first
    Command::new("python3")
        .arg("python/extract_audio.py")
        .arg(&video_path)
        .output()
        .map_err(|e| e.to_string())?;

    // Transcribe
    let output = Command::new("python3")
        .arg("python/transcribe.py")
        .arg("audio.wav")
        .output()
        .map_err(|e| e.to_string())?;

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![transcribe_video])
        .run(tauri::generate_context!())
        .expect("error while running Tauri");
}
