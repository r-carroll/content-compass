import torch
import whisper
import sys

def transcribe_audio(audio_path):
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = whisper.load_model("large-v3").to(device)
    result = model.transcribe(audio_path, fp16=True)  # fp16 for MPS speed
    return result["text"]

if __name__ == "__main__":
    print(transcribe_audio(sys.argv[1]))