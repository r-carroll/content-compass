import sys
from extract_audio import extract_audio
from transcribe import transcribe_audio

if __name__ == "__main__":
    video_path = sys.argv[1]
    audio_path = extract_audio(video_path)
    transcribed_text = transcribe_audio(audio_path)
    if transcribed_text:
        print(transcribed_text)
