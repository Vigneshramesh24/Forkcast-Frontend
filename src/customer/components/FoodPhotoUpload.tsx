import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Sparkles, DollarSign, MapPin, Star } from "lucide-react";
import { supabase } from "@/shared/integrations/supabase/client";
import PLACEHOLDER_RESTAURANTS from "@/customer/lib/placeholders";
import RestaurantCard from "@/customer/components/RestaurantCard";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";

const FoodPhotoUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dishData, setDishData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const [matches, setMatches] = useState<any[]>([]);

  const analyzeImage = async () => {
    setAnalyzing(true);
    // Placeholder for AI analysis (simulate async call)
    await new Promise((res) => setTimeout(res, 1200));

    const result = {
      name: "Margherita Pizza",
      shortDescription: "Classic Neapolitan pizza with tomato, mozzarella and basil.",
      priceRange: "$12 - $18",
      locations: ["Mario's Pizzeria", "La Bella Pizza", "Pizza Paradise"],
      reviews: 342,
      avgRating: 4.5,
    };

    setDishData(result);
    setAnalyzing(false);

    // Build local matches from placeholder data but do not auto-navigate.
    // Prefer exact name matches from the `locations` returned by the analysis.
    const recommendedNames = (result.locations || []).map((s: string) => s.toLowerCase().trim());
    const found = PLACEHOLDER_RESTAURANTS.filter((r) =>
      recommendedNames.includes(r.name.toLowerCase()) || recommendedNames.some((n) => r.name.toLowerCase().includes(n))
    ).sort((a, b) => b.rating - a.rating);

    // If none match by name, fallback to highest-rated restaurants overall
    setMatches(found.length > 0 ? found : [...PLACEHOLDER_RESTAURANTS].sort((a, b) => b.rating - a.rating).slice(0, 3));
  };

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

        <Card className="max-w-4xl mx-auto p-8">
          {!uploadedImage ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Food Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a photo from your device and let the AI analyze it
                </p>
                <div className="flex gap-4 justify-center">
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
            </div>
          ) : (
            <div className="space-y-6">
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
                  }}
                  className="absolute top-2 right-2"
                >
                  Change Photo
                </Button>
              </div>

              {analyzing ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="text-lg font-medium text-foreground">Analyzing your dish...</p>
                </div>
              ) : dishData ? (
                <div className="space-y-6">
                      <div
                        className="relative rounded-lg overflow-hidden"
                        style={{ backgroundImage: `url(${uploadedImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      >
                    {/* translucent overlay so background doesn't block the text */}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative p-6 space-y-4 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2 drop-shadow">{dishData.name}</h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-white/90" />
                              <span className="font-medium">{dishData.priceRange}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{dishData.avgRating} ({dishData.reviews} reviews)</span>
                            </span>
                          </div>
                          <p className="mt-3 text-sm">{dishData.shortDescription}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-white/90" />
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
                    </div>
                  </div>

                  {/* Recommended restaurants (inline) */}
                  {matches.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Best matches near you</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {matches.map((r) => (
                          <div
                            key={r.id}
                            className="bg-card p-2 rounded cursor-pointer"
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
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default FoodPhotoUpload;

