import subprocess
import sys

def extract_audio(video_path, output_path="audio.wav"):
    subprocess.run([
        "ffmpeg", "-hwaccel", "videotoolbox", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", output_path
    ])
    return output_path

if __name__ == "__main__":
    if len(sys.argv) > 2:
        extract_audio(sys.argv[1], sys.argv[2])
    else:
        extract_audio(sys.argv[1])