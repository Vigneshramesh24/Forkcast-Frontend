# -*- coding: utf-8 -*-
"""
restaurant_recommender.py
Module to recommend restaurants based on detected food.
"""

import pandas as pd
import os
from google import genai
from clip_food_recognizer import load_actions_from_csv, recognize_zero_shot_image, recognize_zero_shot_text

# Initialize Gemini client
API_KEY = "AIzaSyDA7HBp8Ax8bqRAwpInPDL57VVfycaXRNM"
client = genai.Client(api_key=API_KEY)

# ---------------------------
# Load and normalize dataset (resolve CSV path relative to this file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "dallas_menu_augmented.csv")
df = pd.read_csv(CSV_PATH)
df.columns = df.columns.str.strip()

if "price_normalized" not in df.columns:
    df["price_normalized"] = (df["price"] - df["price"].min()) / (df["price"].max() - df["price"].min()) * 5

# ---------------------------
# Gemini reasoning
def generate_reason_with_gemini(best_row, avg_rating, avg_price, client):
    prompt = f"""
You are a helpful restaurant recommender AI.
Explain why this restaurant is the best choice for the detected food.

Restaurant: {best_row['restaurant']}
Dish: {best_row['dish_name']}
Price: ${best_row['price']:.2f}
Rating: {best_row['rating']}
Average Price: ${avg_price:.2f}
Average Rating: {avg_rating:.2f}

Write 1–2 short, natural sentences explaining *why this restaurant stands out* for the user.
"""
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()

# ---------------------------
# Core function used by FastAPI
def recommend_restaurant(food_name, w_rating=0.7, w_price=0.3):
    """
    Recommend restaurants given a detected food name.
    Returns:
        best: top recommendation (Pandas Series)
        all_matches: all matching restaurants (DataFrame)
        reason: natural language explanation for top recommendation
    """
    # Find all restaurants with the food
    results = df[df['dish_name'].str.contains(food_name, case=False, na=False)].copy()

    if results.empty:
        return None, pd.DataFrame(), f"No restaurants found for '{food_name}'."

    # Compute recommendation score (no normalization needed since rating is already 0-5)
    results["recommend_score"] = (w_rating * results["rating"]) - (w_price * (results["price"] / 100))

    # Top recommendation
    best = results.loc[results["recommend_score"].idxmax()]

    # Gemini explanation for the top restaurant
    avg_rating = results["rating"].mean()
    avg_price = results["price"].mean()
    reason = generate_reason_with_gemini(best, avg_rating, avg_price, client)

    return best, results, reason  # return both top & all matches

# ---------------------------
# Optional: full detection pipeline (standalone)
def run_food_to_restaurant_pipeline(image_path, restaurant_csv="dallas_menu_augmented.csv"):
    # Resolve provided CSV relative to this module if not absolute
    csv_path = restaurant_csv
    if not os.path.isabs(csv_path):
        csv_path = os.path.join(BASE_DIR, restaurant_csv)
    actions = load_actions_from_csv(csv_path)
    detected_food = recognize_zero_shot_image(image_path, actions)
    best, all_matches, reason = recommend_restaurant(detected_food)
    return best, all_matches, reason

# ---------------------------
if __name__ == "__main__":
    test_image = "download.jpeg"
    best, reason = run_food_to_restaurant_pipeline(test_image)
    print(best)
    print(reason)
