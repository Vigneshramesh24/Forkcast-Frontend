import torch
import clip
from PIL import Image
import pandas as pd

device = "cuda" if torch.cuda.is_available() else "cpu"
clip_model, preprocess = clip.load("ViT-B/32", device=device)
clip_model.eval()

def load_actions_from_csv(file_path):
    """Load unique dish names from restaurant dataset CSV"""
    df = pd.read_csv(file_path)
    # Extract unique dish names
    actions = df['dish_name'].dropna().unique().tolist()
    return actions

def recognize_zero_shot_image(image_path, actions):
    """Recognize food from image using CLIP"""
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = clip_model.encode_image(image)
        text_inputs = clip.tokenize(actions).to(device)
        text_features = clip_model.encode_text(text_inputs)
        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        similarity = image_features @ text_features.T
        pred_index = similarity.argmax().item()
        return actions[pred_index]

def recognize_zero_shot_text(description, actions):
    """Recognize food from text using CLIP"""
    with torch.no_grad():
        desc_features = clip_model.encode_text(clip.tokenize([description]).to(device))
        text_inputs = clip.tokenize(actions).to(device)
        text_features = clip_model.encode_text(text_inputs)
        desc_features /= desc_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        similarity = desc_features @ text_features.T
        pred_index = similarity.argmax().item()
        return actions[pred_index]
