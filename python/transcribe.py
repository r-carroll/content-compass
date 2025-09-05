import subprocess

def transcribe_audio(audio_path, output_path):
    # Command to run whisper-mps
    command = [
        "whisper-mps",
        "--file-name", audio_path,
        "--model-name", "large-v3"
    ]
    if output_path:
        command.extend(["--output-file-name", output_path])

    # Execute the command
    result = subprocess.run(command, capture_output=True, text=True)

    # Check for errors
    if result.returncode != 0:
        print(f"Error during transcription: {result.stderr}")
        return None

    # The transcribed text is in the stdout
    return result.stdout.strip()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        transcribed_text = transcribe_audio(sys.argv[1], sys.argv[2])
    elif len(sys.argv) > 1:
        transcribed_text = transcribe_audio(sys.argv[1], "output.json")
    else:
        print("Usage: transcribe.py <audio_path> [output_path]")
        sys.exit(1)
    if transcribed_text:
        print(transcribed_text)