import { MapPin, TrendingUp, Loader2, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import RestaurantCard from "./RestaurantCard";
import { getCuisineImage } from "@/customer/lib/imageUtils";
import LocationDetector from "./LocationDetector";
import { supabase } from "@/shared/integrations/supabase/client";
import PLACEHOLDER_RESTAURANTS from "@/customer/lib/placeholders";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useToast } from "@/shared/hooks/use-toast";
import { getNearestRestaurants, calculateDistance, getRestaurantByName } from "@/customer/lib/csvDataLoader";
import { Button } from "@/shared/components/ui/button";

const NearbyRestaurants = () => {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const navigate = useNavigate();

  const locationHook = useLocation();
  
  // Request user's geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      toast({
        title: "Location unavailable",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        
        // Get nearest 8 restaurants based on user location
        const nearest = getNearestRestaurants(latitude, longitude, 8);
        
        // Map nearest restaurants and find their corresponding IDs from PLACEHOLDER_RESTAURANTS
        setRestaurants(nearest.map((r) => {
          const matchedRestaurant = PLACEHOLDER_RESTAURANTS.find(
            pr => pr.name === r.name && pr.lat === r.latitude && pr.lon === r.longitude
          );
          
          return {
            name: r.name,
            types: [r.cuisine.toLowerCase()],
            rating: r.avgRating,
            user_ratings_total: r.totalReviews,
            price_level: r.priceRange.length,
            vicinity: `${r.distance.toFixed(1)} mi away`,
            place_id: matchedRestaurant?.id || `unknown-${r.name}`,
            restaurantId: matchedRestaurant?.id, // Store the actual ID for navigation
            lat: r.latitude,
            lon: r.longitude,
            distance: r.distance
          };
        }));
        
        setLoading(false);
        toast({
          title: "Location found!",
          description: `Showing restaurants near you`,
        });
      },
      (error) => {
        setLoading(false);
        let errorMessage = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        setLocationError(errorMessage);
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Fallback to showing top 8 restaurants by rating
        const topRestaurants = PLACEHOLDER_RESTAURANTS
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);
        
        setRestaurants(topRestaurants.map((r) => ({
          name: r.name,
          types: [r.cuisine.toLowerCase()],
          rating: r.rating,
          user_ratings_total: r.reviewCount,
          price_level: r.priceRange ? r.priceRange.length : 2,
          vicinity: r.location || "Dallas, TX",
          place_id: r.id, // Use the actual restaurant ID
          restaurantId: r.id, // Store the actual ID for navigation
          lat: r.lat,
          lon: r.lon
        })));
      }
    );
  };
  
  // Load restaurants on mount
  useEffect(() => {
    // Show top restaurants by default
    const topRestaurants = PLACEHOLDER_RESTAURANTS
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
    
    setRestaurants(topRestaurants.map((r) => ({
      name: r.name,
      types: [r.cuisine.toLowerCase()],
      rating: r.rating,
      user_ratings_total: r.reviewCount,
      price_level: r.priceRange ? r.priceRange.length : 2,
      vicinity: r.location || "Dallas, TX",
      place_id: r.id, // Use the actual restaurant ID
      restaurantId: r.id, // Store the actual ID for navigation
      lat: r.lat,
      lon: r.lon
    })));
  }, []);

  // helper: small fuzzy matcher (token overlap) used to pick a best matching placeholder restaurant
  const fuzzyScoreSimple = (a: string, b: string) => {
    if (!a || !b) return 0;
    const ta = a.toLowerCase().split(/\s+/).filter(Boolean);
    const tb = b.toLowerCase().split(/\s+/).filter(Boolean);
    if (ta.length === 0 || tb.length === 0) return 0;
    const setB = new Set(tb);
    let common = 0;
    ta.forEach((t) => { if (setB.has(t)) common += 1; });
    return common / ((ta.length + tb.length) / 2);
  };

  const findBestRestaurant = (nameOrLabel: string) => {
    if (!nameOrLabel) return null;
    // try exact include first
    const exact = PLACEHOLDER_RESTAURANTS.find((r) => r.name.toLowerCase().includes(nameOrLabel.toLowerCase()));
    if (exact) return exact;
    // otherwise pick best fuzzy match by name or cuisine
    let best: any = null;
    let bestScore = 0;
    PLACEHOLDER_RESTAURANTS.forEach((r: any) => {
      const score = Math.max(fuzzyScoreSimple(r.name, nameOrLabel), fuzzyScoreSimple(r.cuisine, nameOrLabel));
      if (score > bestScore) {
        bestScore = score;
        best = r;
      }
    });
    // return best even if score is low to avoid going to search page
    return best;
  };

  // Compute AI-powered suggestions based on what the user searched for.
  // Strategy:
  // - If there's a `query` or `cuisine` query param, find placeholder restaurants that
  //   match that query (by name or cuisine). Use their cuisine types to prefer suggestions
  //   from the same cuisine category.
  // - Otherwise fall back to a small curated set.
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const query = (params.get("query") || "").toLowerCase().trim();
    const cuisineParam = (params.get("cuisine") || "").toLowerCase().trim();
    // tiny fuzzy matcher: token intersection / average token count
    const fuzzyScore = (a: string, b: string) => {
      if (!a || !b) return 0;
      const ta = a.toLowerCase().split(/\s+/).filter(Boolean);
      const tb = b.toLowerCase().split(/\s+/).filter(Boolean);
      if (ta.length === 0 || tb.length === 0) return 0;
      const setB = new Set(tb);
      let common = 0;
      ta.forEach((t) => { if (setB.has(t)) common += 1; });
      return common / ((ta.length + tb.length) / 2);
    };

    // gather matched cuisines using fuzzy matching
    const matchedCuisines = new Set<string>();
    if (query) {
      PLACEHOLDER_RESTAURANTS.forEach((r: any) => {
        const nameScore = fuzzyScore(r.name, query);
        const cuisineScore = fuzzyScore(r.cuisine, query);
        if (nameScore > 0.3 || cuisineScore > 0.3) matchedCuisines.add(r.cuisine.toLowerCase());
      });
    }
    if (cuisineParam) matchedCuisines.add(cuisineParam);

    let newSuggestions: any[] = [];
    if (matchedCuisines.size > 0) {
      const cuisinesArr = Array.from(matchedCuisines);
      // score and sort by rating + fuzzy relevance
      newSuggestions = PLACEHOLDER_RESTAURANTS
        .map((r: any) => {
          const relevance = cuisinesArr.includes(r.cuisine.toLowerCase()) ? 1 : fuzzyScore(r.cuisine, Array.from(cuisinesArr).join(' '));
          return { ...r, relevance };
        })
        .filter((r: any) => r.relevance > 0 || cuisinesArr.includes(r.cuisine.toLowerCase()))
        .sort((a: any, b: any) => {
          // prefer higher relevance, then rating
          if (b.relevance !== a.relevance) return b.relevance - a.relevance;
          return (b.rating || 0) - (a.rating || 0);
        });
    }

    // fallback curated list
    if (newSuggestions.length === 0) {
      newSuggestions = [
        {
          name: "Green Garden Cafe",
          cuisine: "Healthy",
          rating: 4.9,
          reviewCount: 156,
          priceRange: "$$",
          location: "Uptown, 1.2 mi",
          imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
          distance: "1.2 mi",
        },
        {
          name: "Spice Kingdom",
          cuisine: "Indian",
          rating: 4.7,
          reviewCount: 423,
          priceRange: "$$",
          location: "East Side, 2.8 mi",
          imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
          distance: "2.8 mi",
        },
      ];
    }

    // prefer recently viewed restaurants saved in localStorage
    const recentRaw = localStorage.getItem('recent_restaurants');
    const recent: string[] = recentRaw ? JSON.parse(recentRaw) : [];
    if (recent.length > 0) {
      newSuggestions.sort((a: any, b: any) => {
        const ai = a.id ? recent.indexOf(a.id) : -1;
        const bi = b.id ? recent.indexOf(b.id) : -1;
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }

    setSuggestions(newSuggestions.slice(0, 8));
  }, [locationHook.search]);

  return (
  <section className="py-12 wood-section wood-bg-section">
      <div className="container mx-auto px-4 space-y-12">
        {/* Restaurants Near Me */}
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm mb-2 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Restaurants Near You
              </h2>
              {userLocation && (
                <p className="text-white/80 text-sm">
                  Showing restaurants within {restaurants[0]?.distance ? `${restaurants[restaurants.length - 1]?.distance?.toFixed(1)} miles` : 'your area'}
                </p>
              )}
              {locationError && (
                <p className="text-red-300 text-sm">{locationError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={requestLocation} 
                disabled={loading}
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    {userLocation ? 'Update Location' : 'Use My Location'}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-white/85">Finding restaurants near you...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {restaurants.length > 0 ? (
                restaurants.map((restaurant, index) => (
                  <div key={restaurant.place_id || index}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={async () => {
                      // Use the exact restaurant ID we stored
                      const restaurantId = restaurant.restaurantId || restaurant.place_id;
                      
                      if (!restaurantId || restaurantId.startsWith('unknown-')) {
                        // Build a CSV-backed profile and open templated page
                        try {
                          const csv = getRestaurantByName(restaurant.name);
                          if (csv) {
                            const slug = encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'));
                            const profile = {
                              name: csv.name,
                              cuisine: csv.cuisine,
                              lat: csv.latitude,
                              lon: csv.longitude,
                              location: restaurant.vicinity || 'Dallas, TX',
                              rating: csv.avgRating,
                              reviewCount: csv.totalReviews,
                              priceRange: csv.priceRange,
                              description: csv.dishes?.[0]?.description || '',
                              menu: Array.from(new Set(csv.dishes.map(d => d.dish_name))),
                              imageUrl: getCuisineImage(csv.cuisine),
                            };
                            localStorage.setItem(`csv_restaurant_profile:${slug}`, JSON.stringify(profile));
                            const target = `/csv-restaurant/${slug}`;
                            const { data: { session } } = await supabase.auth.getSession();
                            if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                            return;
                          }
                        } catch (e) {}
                        // If CSV profile not found as well, show toast
                        toast({ title: "Restaurant not found", description: "Unable to load restaurant details", variant: "destructive" });
                        return;
                      }
                      
                      const target = `/restaurants/${restaurantId}`;
                      const { data: { session } } = await supabase.auth.getSession();
                      
                      // Save to recent restaurants
                      try {
                        const raw = localStorage.getItem('recent_restaurants');
                        const arr = raw ? JSON.parse(raw) : [];
                        const filtered = arr.filter((id: string) => id !== restaurantId);
                        filtered.unshift(restaurantId);
                        localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                      } catch (e) {}
                      
                      if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                    }}
                    onKeyDown={async (e) => { if (e.key === 'Enter') {
                      // Use the exact restaurant ID we stored
                      const restaurantId = restaurant.restaurantId || restaurant.place_id;
                      
                      if (!restaurantId || restaurantId.startsWith('unknown-')) {
                        try {
                          const csv = getRestaurantByName(restaurant.name);
                          if (csv) {
                            const slug = encodeURIComponent(restaurant.name.toLowerCase().replace(/\s+/g, '-'));
                            const profile = {
                              name: csv.name,
                              cuisine: csv.cuisine,
                              lat: csv.latitude,
                              lon: csv.longitude,
                              location: restaurant.vicinity || 'Dallas, TX',
                              rating: csv.avgRating,
                              reviewCount: csv.totalReviews,
                              priceRange: csv.priceRange,
                              description: csv.dishes?.[0]?.description || '',
                              menu: Array.from(new Set(csv.dishes.map(d => d.dish_name))),
                              imageUrl: getCuisineImage(csv.cuisine),
                            };
                            localStorage.setItem(`csv_restaurant_profile:${slug}`, JSON.stringify(profile));
                            const target = `/csv-restaurant/${slug}`;
                            const { data: { session } } = await supabase.auth.getSession();
                            if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                            return;
                          }
                        } catch (e) {}
                        toast({ title: "Restaurant not found", description: "Unable to load restaurant details", variant: "destructive" });
                        return;
                      }
                      
                      const target = `/restaurants/${restaurantId}`;
                      const { data: { session } } = await supabase.auth.getSession();
                      
                      // Save to recent restaurants
                      try {
                        const raw = localStorage.getItem('recent_restaurants');
                        const arr = raw ? JSON.parse(raw) : [];
                        const filtered = arr.filter((id: string) => id !== restaurantId);
                        filtered.unshift(restaurantId);
                        localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                      } catch (e) {}
                      
                      if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                    } }}
                  >
                    <RestaurantCard
                      name={restaurant.name}
                      cuisine={restaurant.types?.[0]?.replace(/_/g, ' ') || "Restaurant"}
                      rating={restaurant.rating || 0}
                      reviewCount={restaurant.user_ratings_total || 0}
                      priceRange={restaurant.price_level ? "$".repeat(restaurant.price_level) : "$$"}
                      location={restaurant.vicinity || "Nearby"}
                      imageUrl={getCuisineImage(restaurant.types?.[0] || restaurant.name)}
                      distance="Nearby"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-white/85">
                  No restaurants found nearby. Try adjusting your location.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Food Suggestions */}
        <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            AI-Powered Suggestions
          </h2>
          <p className="text-white/80 mb-6">
            Based on your preferences and popular choices
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((restaurant, index) => (
              <div key={index}
                role="button"
                tabIndex={0}
                className="cursor-pointer"
                onClick={async () => {
                  const found = findBestRestaurant(restaurant.name);
                  if (found && found.id) {
                    try {
                      const raw = localStorage.getItem('recent_restaurants');
                      const arr = raw ? JSON.parse(raw) : [];
                      // dedupe and push to front
                      const filtered = arr.filter((id: string) => id !== found.id);
                      filtered.unshift(found.id);
                      localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                    } catch (e) {
                      // ignore localStorage errors
                    }
                    const { data: { session } } = await supabase.auth.getSession();
                    const target = `/restaurants/${found.id}`;
                    if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                    return;
                  }
                  try {
                    const params = new URLSearchParams();
                    if (restaurant.name) params.set('name', restaurant.name);
                    if (restaurant.cuisine) params.set('cuisine', restaurant.cuisine);
                    const image = restaurant.imageUrl || restaurant.image || getCuisineImage(restaurant.cuisine || restaurant.types?.[0] || restaurant.name);
                    if (image) params.set('imageUrl', image);
                    const loc = restaurant.location || restaurant.vicinity || restaurant.location;
                    if (loc) params.set('location', loc);
                    const price = restaurant.priceRange || restaurant.price_range || (restaurant.price_level ? "$".repeat(restaurant.price_level) : undefined);
                    if (price) params.set('priceRange', price);
                    const rating = restaurant.rating || restaurant.avgRating || restaurant.rating;
                    if (rating) params.set('rating', String(rating));
                    const rc = restaurant.reviewCount || restaurant.user_ratings_total || restaurant.reviewCount;
                    if (rc) params.set('reviewCount', String(rc));
                    if (restaurant.phone) params.set('phone', restaurant.phone);
                    const target = `/suggestion?${params.toString()}`;
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                  } catch (e) {
                    // fallback to toast if something goes wrong
                    toast({ title: "Not available", description: "Details not available for this suggestion.", variant: "default" });
                  }
                }}
                onKeyDown={async (e) => { if (e.key === 'Enter') {
                  const found = findBestRestaurant(restaurant.name);
                  if (found && found.id) {
                    try {
                      const raw = localStorage.getItem('recent_restaurants');
                      const arr = raw ? JSON.parse(raw) : [];
                      const filtered = arr.filter((id: string) => id !== found.id);
                      filtered.unshift(found.id);
                      localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                    } catch (e) {}
                    const { data: { session } } = await supabase.auth.getSession();
                    const target = `/restaurants/${found.id}`;
                    if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                    return;
                  }
                  try {
                    const params = new URLSearchParams();
                    if (restaurant.name) params.set('name', restaurant.name);
                    if (restaurant.cuisine) params.set('cuisine', restaurant.cuisine);
                    const image = restaurant.imageUrl || restaurant.image || (restaurant.photos?.[0] ? restaurant.photos[0] : undefined);
                    if (image) params.set('imageUrl', image);
                    const loc = restaurant.location || restaurant.vicinity || restaurant.location;
                    if (loc) params.set('location', loc);
                    const price = restaurant.priceRange || restaurant.price_range || (restaurant.price_level ? "$".repeat(restaurant.price_level) : undefined);
                    if (price) params.set('priceRange', price);
                    const rating = restaurant.rating || restaurant.avgRating || restaurant.rating;
                    if (rating) params.set('rating', String(rating));
                    const rc = restaurant.reviewCount || restaurant.user_ratings_total || restaurant.reviewCount;
                    if (rc) params.set('reviewCount', String(rc));
                    if (restaurant.phone) params.set('phone', restaurant.phone);
                    const target = `/suggestion?${params.toString()}`;
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) navigate(target); else navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                  } catch (e) {
                    toast({ title: "Not available", description: "Details not available for this suggestion.", variant: "default" });
                  }
                } }}
              >
                <RestaurantCard
                  name={restaurant.name || restaurant.title || 'Suggestion'}
                  cuisine={restaurant.cuisine || (restaurant.types?.[0] ? String(restaurant.types[0]) : 'Various')}
                  rating={restaurant.rating || restaurant.avgRating || 0}
                  reviewCount={restaurant.reviewCount || restaurant.user_ratings_total || 0}
                  priceRange={restaurant.priceRange || (restaurant.price_level ? "$".repeat(restaurant.price_level) : "$$")}
                  location={restaurant.location || restaurant.vicinity || 'Nearby'}
                  imageUrl={
                    restaurant.imageUrl || restaurant.image || (restaurant.photos?.[0] ? restaurant.photos[0] : 
                      // fallback by cuisine: pick a simple unsplash link (keeps UI consistent)
                      `https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop`
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyRestaurants;
