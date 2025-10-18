use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct TranscriptSegment {
    id: u32,
    text: String,
    start: f64,
    end: f64,
    #[serde(default)]
    needs_review: bool,
    #[serde(default)]
    notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TranscriptData {
    text: String,
    segments: Vec<TranscriptSegment>,
    language: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn load_transcript_snippets(app_handle: tauri::AppHandle, _transcript_id: String) -> Result<Vec<TranscriptSegment>, String> {
    // Get the resource directory path
    let resource_dir = app_handle.path().resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;
    
    // Try multiple possible locations for the output.json file
    // Note: In a full implementation, this would load transcript-specific files based on transcript_id
    let possible_paths = vec![
        resource_dir.join("output.json"),
        PathBuf::from("output.json"),
        PathBuf::from("src-tauri/output.json"),
        PathBuf::from("../src-tauri/output.json"),
    ];
    
    // Find and read the file from the first location that exists
    let file_contents = possible_paths
        .iter()
        .find_map(|path| fs::read_to_string(path).ok())
        .ok_or_else(|| "Could not find output.json file in any expected location".to_string())?;
    
    let transcript_data: TranscriptData = serde_json::from_str(&file_contents)
        .map_err(|e| format!("Failed to parse transcript JSON: {}", e))?;
    
    Ok(transcript_data.segments)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, load_transcript_snippets])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
