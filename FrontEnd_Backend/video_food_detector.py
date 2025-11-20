from google import genai
from google.genai import types
from yt_dlp import YoutubeDL
from clip_food_recognizer import recognize_zero_shot_text
import time

API_KEY = "AIzaSyDA7HBp8Ax8bqRAwpInPDL57VVfycaXRNM"
client = genai.Client(api_key=API_KEY)

def download_video(url):
    ydl_opts = {'outtmpl': '%(title)s.%(ext)s', 'format': 'mp4'}
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return ydl.prepare_filename(info)

def describe_video_with_gemini(video_path):
    uploaded_file = client.files.upload(file=video_path)
    for _ in range(20):
        file_info = client.files.get(name=uploaded_file.name)
        if file_info.state.name == "ACTIVE":
            break
        time.sleep(1)
    else:
        raise RuntimeError("File not active in time.")
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=[
            types.Part(file_data=types.FileData(file_uri=file_info.uri)),
            types.Part(text="Name exactly one food being made in this video. Return only the food name.")
        ]
    )
    return response.text.strip()

def detect_food_from_video(video_url, actions):
    video_path = download_video(video_url)
    description = describe_video_with_gemini(video_path)
    food_name = recognize_zero_shot_text(description, actions)
    return food_name
