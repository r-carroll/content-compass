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
fn load_transcript_snippets(app_handle: tauri::AppHandle, transcript_id: String) -> Result<Vec<TranscriptSegment>, String> {
    // Get the resource directory path
    let resource_dir = app_handle.path().resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;
    
    // Try multiple possible locations for the output.json file
    let possible_paths = vec![
        resource_dir.join("output.json"),
        PathBuf::from("output.json"),
        PathBuf::from("src-tauri/output.json"),
        PathBuf::from("../src-tauri/output.json"),
    ];
    
    let mut file_contents = String::new();
    let mut found_path = None;
    
    for path in possible_paths {
        if let Ok(contents) = fs::read_to_string(&path) {
            file_contents = contents;
            found_path = Some(path);
            break;
        }
    }
    
    if found_path.is_none() {
        return Err("Could not find output.json file in any expected location".to_string());
    }
    
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
