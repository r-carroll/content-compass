import subprocess
import json
import os
import re

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
    # If an output file was written, post-process it to remove undesired keys
    if output_path and os.path.exists(output_path):
        try:
            # Read raw text and sanitize non-standard JSON tokens (NaN, Infinity)
            with open(output_path, 'r', encoding='utf-8') as f:
                raw_text = f.read()

            # Replace standalone NaN/Infinity/-Infinity tokens with null so json loads succeed
            # This uses a word-boundary based regex which is sufficient for numeric tokens
            sanitized = re.sub(r"\bNaN\b", "null", raw_text)
            sanitized = re.sub(r"\bInfinity\b", "null", sanitized)
            sanitized = re.sub(r"\b-Infinity\b", "null", sanitized)

            data = json.loads(sanitized)
        except Exception as e:
            print(f"Warning: failed to read or parse output JSON for post-processing: {e}")
            return result.stdout.strip()

        # Recursively remove the key 'avg_logprob' from any dicts
        def remove_key(obj, key='avg_logprob'):
            if isinstance(obj, dict):
                if key in obj:
                    del obj[key]
                for v in list(obj.values()):
                    remove_key(v, key)
            elif isinstance(obj, list):
                for item in obj:
                    remove_key(item, key)

        remove_key(data, 'avg_logprob')

        try:
            # Write the cleaned JSON back to the same file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Warning: failed to write cleaned output JSON: {e}")

    # Return stdout as a lightweight success indicator
    return result.stdout.strip()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        print("YOOOOOOOOOOOOOOOOOOOOOOOO")
        print("the vars are", sys.argv[1], sys.argv[2])
        transcribed_text = transcribe_audio(sys.argv[1], sys.argv[2])
    elif len(sys.argv) > 1:
        print("the var is", sys.argv[1])
        transcribed_text = transcribe_audio(sys.argv[1], "output.json")
    else:
        print("Usage: transcribe.py <audio_path> [output_path]")
        sys.exit(1)
    if transcribed_text:
        print('Transcription completed successfully.')