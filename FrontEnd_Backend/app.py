from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from clip_food_recognizer import load_actions_from_csv, recognize_zero_shot_image, recognize_zero_shot_text
from video_food_detector import detect_food_from_video
from restaurant_recommender import recommend_restaurant
import os
from fastapi.staticfiles import StaticFiles
from fastapi import BackgroundTasks
import tempfile

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load dish names directly from restaurant CSV (resolve path relative to this file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "dallas_menu_augmented.csv")
ACTIONS = load_actions_from_csv(CSV_PATH)

STATIC_DIR = os.path.join(BASE_DIR, "frontend")
app.mount("/frontend", StaticFiles(directory=STATIC_DIR), name="frontend")

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        temp_dir = tempfile.gettempdir()
        path = os.path.join(temp_dir, file.filename)
        with open(path, "wb") as f:
            f.write(await file.read())

        # Recognize food from image
        food = recognize_zero_shot_image(path, ACTIONS)
        
        # Get restaurant recommendations
        best, all_matches, reason = recommend_restaurant(food)
        
        # Clean up temp file
        os.remove(path)
        
        # Return results
        if best is None:
            return {
                "success": False,
                "detected_food": food,
                "message": f"No restaurants found for '{food}'."
            }
        
        # Convert all matches to list of dicts
        matches_list = []
        for idx, row in all_matches.iterrows():
            matches_list.append({
                "restaurant": row["restaurant"],
                "dish_name": row["dish_name"],
                "price": float(row["price"]),
                "rating": float(row["rating"]),
                "cuisine": row["cuisine"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "description": row["description"],
                "food_type": row["food_type"]
            })
        
        return {
            "success": True,
            "detected_food": food,
            "top_recommendation": {
                "restaurant": best["restaurant"],
                "dish_name": best["dish_name"],
                "price": float(best["price"]),
                "rating": float(best["rating"]),
                "cuisine": best["cuisine"],
                "latitude": float(best["latitude"]),
                "longitude": float(best["longitude"]),
                "description": best["description"],
                "food_type": best["food_type"]
            },
            "all_matches": matches_list,
            "reason": reason
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/text-description/")
async def text_description(description: str = Form(...)):
    try:
        food = recognize_zero_shot_text(description, ACTIONS)
        best, all_matches, reason = recommend_restaurant(food)
        
        if best is None:
            return {
                "success": False,
                "detected_food": food,
                "message": f"No restaurants found for '{food}'."
            }
        
        # Convert all matches to list of dicts
        matches_list = []
        for idx, row in all_matches.iterrows():
            matches_list.append({
                "restaurant": row["restaurant"],
                "dish_name": row["dish_name"],
                "price": float(row["price"]),
                "rating": float(row["rating"]),
                "cuisine": row["cuisine"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "description": row["description"],
                "food_type": row["food_type"]
            })
        
        return {
            "success": True,
            "detected_food": food,
            "top_recommendation": {
                "restaurant": best["restaurant"],
                "dish_name": best["dish_name"],
                "price": float(best["price"]),
                "rating": float(best["rating"]),
                "cuisine": best["cuisine"],
                "latitude": float(best["latitude"]),
                "longitude": float(best["longitude"]),
                "description": best["description"],
                "food_type": best["food_type"]
            },
            "all_matches": matches_list,
            "reason": reason
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/analyze-url/")
async def analyze_url(url: str = Form(...)):
    """
    Accept a YouTube Shorts or TikTok URL, detect the food via Gemini, then
    return restaurant recommendations similar to other endpoints.
    """
    try:
        # Detect food name from the video URL
        food = detect_food_from_video(url, ACTIONS)
        
        # Get restaurant recommendations
        best, all_matches, reason = recommend_restaurant(food)

        if best is None:
            return {
                "success": False,
                "detected_food": food,
                "message": f"No restaurants found for '{food}'."
            }

        # Convert all matches to list of dicts
        matches_list = []
        for idx, row in all_matches.iterrows():
            matches_list.append({
                "restaurant": row["restaurant"],
                "dish_name": row["dish_name"],
                "price": float(row["price"]),
                "rating": float(row["rating"]),
                "cuisine": row["cuisine"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "description": row["description"],
                "food_type": row["food_type"]
            })

        return {
            "success": True,
            "detected_food": food,
            "top_recommendation": {
                "restaurant": best["restaurant"],
                "dish_name": best["dish_name"],
                "price": float(best["price"]),
                "rating": float(best["rating"]),
                "cuisine": best["cuisine"],
                "latitude": float(best["latitude"]),
                "longitude": float(best["longitude"]),
                "description": best["description"],
                "food_type": best["food_type"]
            },
            "all_matches": matches_list,
            "reason": reason
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/")
async def root():
    return {"message": "ForkCast Food Recognition API", "status": "running"}
