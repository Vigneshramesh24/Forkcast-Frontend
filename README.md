# ForkCast - AI-Powered Restaurant Discovery Platform# Welcome to your Lovable project



ForkCast is an intelligent restaurant discovery platform that uses AI to recognize food from images and recommend the best restaurants in Dallas. The platform features separate interfaces for customers and business owners.## Project info



## Features**URL**: https://lovable.dev/projects/fdd47ded-cfa4-45ef-b012-972345aad8f1



### Customer Features## How can I edit this code?

- 🔍 **AI Food Recognition**: Upload a photo of any dish and get instant identification

- 📍 **Location-Based Search**: Find restaurants near you using geolocationThere are several ways of editing your application.

- 🗺️ **Interactive Maps**: View restaurant locations with embedded Google Maps

- 💰 **Price & Rating Info**: See detailed pricing and ratings for every dish**Use Lovable**

- ⭐ **Popular Dishes**: Discover top-rated dishes at each restaurant

- 🎯 **Smart Recommendations**: Get AI-powered restaurant suggestions based on detected foodSimply visit the [Lovable Project](https://lovable.dev/projects/fdd47ded-cfa4-45ef-b012-972345aad8f1) and start prompting.



### Business FeaturesChanges made via Lovable will be committed automatically to this repo.

- 📊 **Analytics Dashboard**: Track sales, revenue, and customer trends

- 💬 **Customer Chat**: Engage with customers in real-time**Use your preferred IDE**

- 📈 **Financial Insights**: Visualize sales data and performance metrics

- 🍽️ **Menu Management**: Manage your restaurant's menu and offeringsIf you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.



## Tech StackThe only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)



### FrontendFollow these steps:

- **React** with TypeScript

- **Vite** for fast development```sh

- **Tailwind CSS** for styling# Step 1: Clone the repository using the project's Git URL.

- **Shadcn UI** componentsgit clone <YOUR_GIT_URL>

- **React Router** for navigation

- **Supabase** for authentication# Step 2: Navigate to the project directory.

cd <YOUR_PROJECT_NAME>

### Backend

- **Python** with FastAPI# Step 3: Install the necessary dependencies.

- **CLIP** (OpenAI) for image recognitionnpm i

- **Pandas** for data processing

- **Google Gemini AI** for natural language recommendations# Step 4: Start the development server with auto-reloading and an instant preview.

- **PyTorch** for deep learningnpm run dev

```

## Project Structure

**Edit a file directly in GitHub**

```

Forkcast-Frontend/- Navigate to the desired file(s).

├── src/- Click the "Edit" button (pencil icon) at the top right of the file view.

│   ├── customer/          # Customer-facing features- Make your changes and commit the changes.

│   │   ├── components/    # UI components

│   │   ├── pages/         # Page components**Use GitHub Codespaces**

│   │   └── lib/           # Utilities and data

│   ├── business/          # Business dashboard- Navigate to the main page of your repository.

│   └── shared/            # Shared components and utilities- Click on the "Code" button (green button) near the top right.

├── FrontEnd_Backend/      # Python backend- Select the "Codespaces" tab.

│   ├── app.py            # FastAPI server- Click on "New codespace" to launch a new Codespace environment.

│   ├── clip_food_recognizer.py- Edit files directly within the Codespace and commit and push your changes once you're done.

│   ├── restaurant_recommender.py

│   ├── dallas_menu_augmented.csv## What technologies are used for this project?

│   └── requirements.txt

└── public/               # Static assetsThis project is built with:

```

- Vite

## Prerequisites- TypeScript

- React

Before you begin, ensure you have the following installed:- shadcn-ui

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)- Tailwind CSS

- **Python** (v3.9 or higher) - [Download](https://www.python.org/)

- **Git** - [Download](https://git-scm.com/)## How can I deploy this project?



## Getting StartedSimply open [Lovable](https://lovable.dev/projects/fdd47ded-cfa4-45ef-b012-972345aad8f1) and click on Share -> Publish.



### 1. Clone the Repository## Chatbot configuration



```bashThis project proxies chat requests through a server-side function which uses the Lovable-managed API key (stored as `LOVABLE_API_KEY`). To run chat locally or point the frontend to your deployed function, set the following:

git clone https://github.com/Vigneshramesh24/Forkcast-Frontend.git

cd Forkcast-Frontend- In your Supabase project (or whichever platform hosts the Edge Function), set the environment variable `LOVABLE_API_KEY` to the key provided by Lovable.

```- Locally, set `VITE_CHAT_FUNCTION_URL` in your `.env` to the function URL (for example `https://<project>.functions.supabase.co/chat`) so the frontend can call it. The app falls back to `/api/chat` if this isn't set.



### 2. Frontend SetupExample .env entries:



```bash```properties

# Install frontend dependenciesVITE_CHAT_FUNCTION_URL="https://<your-function-host>/chat"

npm install```



# Start the development serverDo NOT store `LOVABLE_API_KEY` in the frontend `.env`; it must remain server-side only.

npm run dev

```## Can I connect a custom domain to my Lovable project?



The frontend will be available at `http://localhost:8081` (or the next available port)Yes, you can!



### 3. Backend SetupTo connect a domain, navigate to Project > Settings > Domains and click Connect Domain.



```bashRead more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

# Navigate to backend directory
cd FrontEnd_Backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

> **Note:** On first run, CLIP will download its model (~350MB). This requires an internet connection and may take a few minutes.

## Installation Guide

### Step-by-Step Backend Installation

1. **Install PyTorch** (required for CLIP):

   **With CUDA GPU support:**
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

   **CPU only (if no NVIDIA GPU):**
   ```bash
   pip install torch torchvision torchaudio
   ```

2. **Install CLIP:**
   ```bash
   pip install git+https://github.com/openai/CLIP.git
   ```

3. **Install remaining dependencies:**
   ```bash
   pip install fastapi uvicorn pandas pillow python-multipart google-generativeai
   ```

   Or simply:
   ```bash
   pip install -r requirements.txt
   ```

### Minimal Installation (If Full Install Fails)

If you encounter issues with the full `requirements.txt`, install only the essentials:

```bash
pip install fastapi uvicorn python-multipart
pip install torch torchvision
pip install git+https://github.com/openai/CLIP.git
pip install pandas pillow google-generativeai
```

## Usage

### Running the Application

1. **Start Backend** (in `FrontEnd_Backend/` directory):
   ```bash
   uvicorn app:app --reload --port 8000
   ```

2. **Start Frontend** (in root directory):
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:8081`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

### Customer Flow

1. Navigate to the customer interface
2. **Upload a food photo**:
   - Click "Upload Photo" in the "Identify Any Dish with AI" section
   - Select an image of food
   - Wait for AI analysis
3. **View results**:
   - See detected food name
   - View recommended restaurants
   - Check prices and ratings for each dish
4. **Explore restaurants**:
   - Click on any restaurant card to view full menu
   - See top 3 popular dishes
   - View location on interactive map
5. **Use "Restaurants Near Me"**:
   - Click "Use My Location" button
   - Allow browser location access
   - See the 8 nearest restaurants with distances

### Business Flow

1. Log in to the business dashboard
2. View analytics and sales data
3. Monitor customer chat messages
4. Track performance metrics

## API Endpoints

### POST `/upload-image/`

Upload a food image for recognition and restaurant recommendations.

**Request:**
```bash
curl -X POST "http://localhost:8000/upload-image/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@food_image.jpg"
```

**Response:**
```json
{
  "success": true,
  "detected_food": "Margherita Pizza",
  "top_recommendation": {
    "restaurant": "Mario's Pizzeria",
    "dish_name": "Margherita Pizza",
    "price": 12.99,
    "rating": 4.7,
    "cuisine": "Italian",
    "latitude": 32.7767,
    "longitude": -96.7970,
    "description": "Classic pizza with tomato and mozzarella",
    "food_type": "entree"
  },
  "all_matches": [...],
  "reason": "Mario's Pizzeria stands out with a 4.7 rating, offering an authentic Margherita Pizza at a great price point of $12.99."
}
```

### POST `/text-description/`

Recognize food from text description.

**Request:**
```bash
curl -X POST "http://localhost:8000/text-description/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "description=delicious cheesy pizza"
```

### GET `/`

Check API status.

**Response:**
```json
{
  "message": "ForkCast Food Recognition API",
  "status": "running"
}
```

## Data

The platform uses the `dallas_menu_augmented.csv` dataset containing:
- **416 dishes** across 50+ restaurants
- Restaurant names and locations (lat/long)
- Dish prices ($3.66 - $67.85)
- Individual dish ratings (0-5 stars)
- Cuisine types (Mexican, BBQ, Italian, Japanese, etc.)
- Food categories (appetizer, entree, dessert, etc.)

## Common Issues & Solutions

### Frontend Issues

**Port Already in Use:**
- Vite will automatically try ports 8081, 8082, etc.
- Or specify a port: `npm run dev -- --port 3000`

**Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**CORS Errors:**
- Ensure backend is running on port 8000
- Check CORS settings in `app.py` include your frontend URL

**CLIP Model Download Fails:**
- Ensure stable internet connection
- Model is ~350MB and downloads automatically on first run
- Try manually: `python -c "import clip; clip.load('ViT-B/32')"`

**Import Errors:**
```bash
# Reinstall specific package
pip uninstall package_name
pip install package_name

# Or reinstall all
pip install -r requirements.txt --force-reinstall
```

**CUDA/GPU Issues:**
- If you don't have an NVIDIA GPU, use CPU-only PyTorch
- Remove CUDA version and install CPU version
- The app will automatically use CPU if CUDA isn't available

### Python Virtual Environment Issues

**Activation Not Working (Windows):**
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then activate
.\venv\Scripts\Activate.ps1
```

## Development

### Frontend Development

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

```bash
# Auto-reload on code changes
uvicorn app:app --reload --port 8000

# With detailed logs
uvicorn app:app --reload --log-level debug

# Test API endpoints
# Visit: http://localhost:8000/docs
```

### Code Structure

**Frontend:**
- `src/customer/components/FoodPhotoUpload.tsx` - AI food recognition UI
- `src/customer/components/NearbyRestaurants.tsx` - Location-based search
- `src/customer/pages/RestaurantDetail.tsx` - Restaurant details page
- `src/customer/lib/csvDataLoader.ts` - Restaurant data processing
- `src/customer/lib/placeholders.ts` - Restaurant data from CSV

**Backend:**
- `FrontEnd_Backend/app.py` - FastAPI endpoints
- `FrontEnd_Backend/clip_food_recognizer.py` - CLIP image recognition
- `FrontEnd_Backend/restaurant_recommender.py` - Restaurant recommendation logic

## Testing

### Test Backend API

```bash
# Test with curl
curl http://localhost:8000/

# Test image upload
curl -X POST "http://localhost:8000/upload-image/" \
  -F "file=@test_image.jpg"
```

### Test Frontend

1. Open browser to `http://localhost:8081`
2. Upload a food image
3. Check browser console for errors (F12)
4. Verify network requests to backend

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Project Team

- Repository Owner: Vigneshramesh24
- Branch: Customer (current)
- Main Branch: main

## Acknowledgments

- **OpenAI CLIP** for state-of-the-art image recognition
- **Google Gemini AI** for intelligent recommendations
- **Dallas Restaurant Data** contributors
- **Shadcn UI** for beautiful components

## License

This project is part of an educational initiative.

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/Vigneshramesh24/Forkcast-Frontend/issues)
- Check the [API documentation](http://localhost:8000/docs) when backend is running
- Review existing issues for solutions

---

## Quick Start Checklist

- [ ] Node.js installed (v18+)
- [ ] Python installed (v3.9+)
- [ ] Repository cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend virtual environment created
- [ ] Python packages installed (`pip install -r requirements.txt`)
- [ ] Backend running (`uvicorn app:app --reload`)
- [ ] Frontend running (`npm run dev`)
- [ ] Tested image upload feature
- [ ] Tested geolocation feature

**Note:** Both frontend and backend servers must be running simultaneously for full functionality!

## Need Help?

1. Check this README thoroughly
2. Review the `/docs` endpoint at `http://localhost:8000/docs`
3. Check browser console (F12) for frontend errors
4. Check terminal output for backend errors
5. Open an issue with error details if problem persists
