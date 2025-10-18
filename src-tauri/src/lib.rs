use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

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
fn load_transcript_snippets(transcript_id: String) -> Result<Vec<TranscriptSegment>, String> {
    // For now, we'll read from the static output.json file
    // In a real implementation, this would query a database based on transcript_id
    let output_path = PathBuf::from("src-tauri/output.json");
    
    let file_contents = fs::read_to_string(&output_path)
        .map_err(|e| format!("Failed to read transcript file: {}", e))?;
    
    let transcript_data: TranscriptData = serde_json::from_str(&file_contents)
        .map_err(|e| format!("Failed to parse transcript JSON: {}", e))?;
    
    // Convert segments to include default values for needs_review and notes
    let snippets: Vec<TranscriptSegment> = transcript_data.segments;
    
    Ok(snippets)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, load_transcript_snippets])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
