import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, DollarSign, MapPin, Star } from "lucide-react";
import { supabase } from "@/shared/integrations/supabase/client";
import PLACEHOLDER_RESTAURANTS from "@/customer/lib/placeholders";
import RestaurantCard from "@/customer/components/RestaurantCard";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";

const STORAGE_KEY = 'forkcast_food_search_results';

const FoodPhotoUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dishData, setDishData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topRecRestaurant, setTopRecRestaurant] = useState<any | null>(null);

  // Load saved search results from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setUploadedImage(data.uploadedImage);
        setDishData(data.dishData);
        setMatches(data.matches || []);
        // restore top recommendation if present
        if (data.topRecRestaurantId) {
          const foundTop = PLACEHOLDER_RESTAURANTS.find(r => r.id === data.topRecRestaurantId);
          if (foundTop) setTopRecRestaurant(foundTop);
        } else if (data.topRecName) {
          const foundTopByName = PLACEHOLDER_RESTAURANTS.find(r => r.name.toLowerCase() === String(data.topRecName).toLowerCase());
          if (foundTopByName) setTopRecRestaurant(foundTopByName);
        }
      }
    } catch (error) {
      console.error('Error loading saved search:', error);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setDishData(null);
    setMatches([]);

    try {
      // Call backend API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload-image/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          title: "Analysis Failed",
          description: data.message || data.error || "Could not analyze the image",
          variant: "destructive",
        });
        setAnalyzing(false);
        return;
      }

      // Extract detected food and recommendations
      const detectedFood = data.detected_food;
  const topRec = data.top_recommendation;
      const allMatches = data.all_matches;

      // Set dish data
      const result = {
        name: detectedFood,
        shortDescription: topRec.description,
        priceRange: `$${Math.min(...allMatches.map((m: any) => m.price)).toFixed(2)} - $${Math.max(...allMatches.map((m: any) => m.price)).toFixed(2)}`,
        locations: [...new Set(allMatches.map((m: any) => m.restaurant))],
        reviews: allMatches.length,
        avgRating: (allMatches.reduce((sum: number, m: any) => sum + m.rating, 0) / allMatches.length).toFixed(1),
        reason: data.reason,
      };

      setDishData(result);

      // Match restaurants from PLACEHOLDER_RESTAURANTS
      const restaurantNames = [...new Set(allMatches.map((m: any) => m.restaurant))];
      const found = PLACEHOLDER_RESTAURANTS.filter((r) =>
        restaurantNames.some((name) => r.name === name)
      ).sort((a, b) => b.rating - a.rating);

      setMatches(found.length > 0 ? found.slice(0, 6) : []);

      // Determine top recommendation restaurant from placeholders (exact, then case-insensitive match)
      let top: any | null = PLACEHOLDER_RESTAURANTS.find(r => r.name === topRec.restaurant) || null;
      if (!top) {
        top = PLACEHOLDER_RESTAURANTS.find(r => r.name.toLowerCase() === String(topRec.restaurant).toLowerCase()) || null;
      }
      setTopRecRestaurant(top || null);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          uploadedImage,
          dishData: result,
          matches: found.length > 0 ? found.slice(0, 6) : [],
          topRecRestaurantId: top?.id || null,
          topRecName: topRec?.restaurant || null
        }));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      toast({
        title: "Analysis Complete!",
        description: `Detected: ${detectedFood}`,
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the AI service. Make sure the backend is running.",
        variant: "destructive",
      });
    }

    setAnalyzing(false);
  };

  // Text/URL analysis input has been removed; this component is now photo-only by design.

  const handleOpenRestaurant = async (id: string) => {
    try {
      const raw = localStorage.getItem('recent_restaurants');
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((rid: string) => rid !== id);
      filtered.unshift(id);
      localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {}
    const { data: { session } } = await supabase.auth.getSession();
    const target = `/restaurants/${id}`;
    if (session) {
      navigate(target);
    } else {
      navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
    }
  };

  const handleChipClick = (name: string) => {
    // find restaurant by name (case-insensitive, partial)
    const found = PLACEHOLDER_RESTAURANTS.find((r) => r.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      handleOpenRestaurant(found.id);
    } else {
      // fallback: go to restaurants search for the name
      navigate(`/restaurants?query=${encodeURIComponent(name)}`);
    }
  };

  

  return (
  <section className="py-16 wood-section wood-bg-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm mb-4">
            Identify Any Dish with AI
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto">
            Take or upload a photo and let AI tell you what it is, where to find it, and what others think
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-8 space-y-6">
          {/* Controls row: photo upload only */}
          <div className="flex items-center justify-center">
            <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-3">
              <Button variant="default" className="relative">
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
            </div>
          </div>

          {/* Optional image preview */}
          {uploadedImage && (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Uploaded food"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setUploadedImage(null);
                  setDishData(null);
                  setMatches([]);
                  setSelectedFile(null);
                  setTopRecRestaurant(null);
                  // Clear localStorage when changing photo
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch (error) {
                    console.error('Error clearing localStorage:', error);
                  }
                }}
                className="absolute top-2 right-2"
              >
                Change Photo
              </Button>
            </div>
          )}

          {analyzing && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-lg font-medium text-foreground">Analyzing your dish...</p>
            </div>
          )}

          {dishData && (
            <div className="space-y-6">
              {/* Header over background only if image present */}
              <div
                className="relative rounded-lg overflow-hidden"
                style={uploadedImage ? { backgroundImage: `url(${uploadedImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {uploadedImage && <div className="absolute inset-0 bg-black/30" />}
                <div className={uploadedImage ? "relative p-6 space-y-4 text-white" : "relative p-0 space-y-4"}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 drop-shadow">{dishData.name}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className={uploadedImage ? "h-4 w-4 text-white/90" : "h-4 w-4"} />
                          <span className="font-medium">{dishData.priceRange}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className={uploadedImage ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 fill-yellow-400 text-yellow-400"} />
                          <span className="font-medium">{dishData.avgRating} ({dishData.reviews} reviews)</span>
                        </span>
                      </div>
                      {dishData.shortDescription && (
                        <p className="mt-3 text-sm {uploadedImage ? 'text-white' : ''}">{dishData.shortDescription}</p>
                      )}
                    </div>
                  </div>

                  {dishData.locations?.length > 0 && (
                    <div>
                      <p className={uploadedImage ? "text-sm font-medium mb-2 flex items-center gap-2" : "text-sm font-medium mb-2 flex items-center gap-2"}>
                        <MapPin className={uploadedImage ? "h-4 w-4 text-white/90" : "h-4 w-4"} />
                        Available at:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dishData.locations.map((location: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleChipClick(location)}
                            className="px-3 py-1 bg-white/90 text-sm rounded-full text-foreground hover:bg-white/100 transition"
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top recommendation (clickable) */}
              {topRecRestaurant && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold">Top recommendation</h4>
                  <div
                    className="bg-card p-2 rounded cursor-pointer ring-1 ring-primary/30 hover:ring-primary transition shadow-sm hover:shadow-md"
                    onClick={() => handleOpenRestaurant(topRecRestaurant.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleOpenRestaurant(topRecRestaurant.id); }}
                    role="button"
                    tabIndex={0}
                  >
                    <RestaurantCard
                      name={topRecRestaurant.name}
                      cuisine={topRecRestaurant.cuisine}
                      rating={topRecRestaurant.rating}
                      reviewCount={topRecRestaurant.reviewCount}
                      priceRange={"$$"}
                      location={topRecRestaurant.location ?? "Nearby"}
                      imageUrl={topRecRestaurant.imageUrl}
                    />
                  </div>
                </div>
              )}

              {/* AI Recommendation Reason */}
              {dishData.reason && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">AI Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{dishData.reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended restaurants (inline) */}
              {matches.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Best matches near you</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matches.map((r) => (
                      <div
                        key={r.id}
                        className="bg-card p-2 rounded cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                        onClick={() => handleOpenRestaurant(r.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleOpenRestaurant(r.id); }}
                        role="button"
                        tabIndex={0}
                      >
                        <RestaurantCard
                          name={r.name}
                          cuisine={r.cuisine}
                          rating={r.rating}
                          reviewCount={r.reviewCount}
                          priceRange={"$$"}
                          location={r.location ?? "Nearby"}
                          imageUrl={r.imageUrl}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default FoodPhotoUpload;

